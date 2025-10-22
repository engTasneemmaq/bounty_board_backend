import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Bounty, BountyStatus } from '../entities/bounty.entity';
import { BountyRole } from '../entities/bounty-role.entity';
import { BountyResource, BountyResourceType } from '../entities/bounty-resource.entity';
import { CreateBountyDto } from '../dto/create-bounty.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { File as MulterFile } from 'multer';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_PDF_TYPES } from '../../../common/constants/file.constants';
import { BountyFiltersDto } from '../dto/bounty-filters.dto';
import { Op, col, fn, literal, WhereOptions } from 'sequelize';
import { ApplicationService } from '../../application/services/application.service';

@Injectable()
export class BountyService {
    constructor(
        @InjectModel(Bounty)
        private readonly bountyModel: typeof Bounty,
        @InjectModel(BountyRole)
        private readonly bountyRoleModel: typeof BountyRole,
        @InjectModel(BountyResource)
        private readonly bountyResourceModel: typeof BountyResource,
        private readonly sequelize: Sequelize,
        private readonly applicationService: ApplicationService, // Inject ApplicationService
    ) { }

    async createBounty(
        userId: number,
        dto: CreateBountyDto,
        files: { thumbnail?: MulterFile; bountyBrief?: MulterFile }
    ): Promise<Bounty> {
        // console.log('Reward type:', typeof dto.reward, dto.reward);
        // console.log('Deadline type:', typeof dto.deadline, dto.deadline);
        // console.log('Roles type:', Array.isArray(dto.roles), dto.roles);

        // Validate files before transaction
        if (files?.thumbnail) this.validateFile(files.thumbnail, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE);
        if (files?.bountyBrief) this.validateFile(files.bountyBrief, ALLOWED_PDF_TYPES, MAX_FILE_SIZE);

        return await this.sequelize.transaction(async (t) => {
            // Upload files async
            const [thumbnailUrl, bountyBriefUrl] = await Promise.all([
                files?.thumbnail ? this.uploadFile(files.thumbnail, 'thumbnails') : Promise.resolve(undefined),
                files?.bountyBrief ? this.uploadFile(files.bountyBrief, 'briefs') : Promise.resolve(undefined),
            ]);

            // Create bounty
            const bounty = await this.bountyModel.create(
                {
                    posterId: userId,
                    title: dto.title,
                    description: dto.description,
                    reward: dto.reward,
                    deadline: dto.deadline,
                    thumbnailUrl,
                    category: dto.category,
                    currency: dto.currency,
                    languages: dto.languages,
                    requirements: dto.requirements,
                    technicalDetails: dto.technicalDetails,
                    contactEmail: dto.contactEmail,
                    website: dto.website,
                    skills: dto.skills,
                    status: dto.status,
                },
                { transaction: t }
            );

            // Create roles
            const roles = dto.roles.map(role => ({
                bountyId: bounty.id,
                roleName: role.roleName,
                technologies: role.technologies,
            }));
            await this.bountyRoleModel.bulkCreate(roles as any, { transaction: t });

            // Create resources
            const resources: Partial<BountyResource>[] = [];

            if (dto.projectLink) {
                resources.push({
                    bountyId: bounty.id,
                    type: BountyResourceType.Link,
                    url: dto.projectLink,
                    name: 'Project Link',
                });
            }

            if (bountyBriefUrl) {
                resources.push({
                    bountyId: bounty.id,
                    type: BountyResourceType.PDF,
                    url: bountyBriefUrl,
                    name: 'Bounty Brief',
                });
            }

            if (resources.length > 0) {
                await this.bountyResourceModel.bulkCreate(resources as any, { transaction: t });
            }

            return bounty.reload({ include: [BountyRole, BountyResource], transaction: t });
        });
    }

    async findById(id: number) {
        return this.bountyModel.findByPk(id, {
            include: [BountyRole, BountyResource],
        });
    }

    async findActiveBounties(filters: BountyFiltersDto) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 12;
        const sort = (filters.sort ?? 'latest').trim() as 'latest' | 'popular';

        /* ---------- WHERE ---------- */
        const where: WhereOptions = { status: BountyStatus.Active };

        if (filters.category) {
            where.category = filters.category;
        }

        // reward range
        if (filters.minReward != null || filters.maxReward != null) {
            where['reward' as any] = {};
            if (filters.minReward != null) (where as any).reward[Op.gte] = filters.minReward;
            if (filters.maxReward != null) (where as any).reward[Op.lte] = filters.maxReward;
        }

        // languages overlap
        if (filters.languages?.length) {
            (where as any).languages = { [Op.overlap]: filters.languages };
        }

        // keyword search
        if (filters.q) {
            (where as any)[Op.or] = [
                { title: { [Op.iLike]: `%${filters.q}%` } },
                { description: { [Op.iLike]: `%${filters.q}%` } },
            ];
        }

        // postedSince filter
        if (filters.postedSince) {
            let interval: string;
            switch (filters.postedSince) {
                case '24h': interval = '1 day'; break;
                case 'week': interval = '7 days'; break;
                case 'month': interval = '1 month'; break;
                default: interval = '';
            }
            if (interval) {
                (where as any).createdAt = { [Op.gte]: this.sequelize.literal(`NOW() - INTERVAL '${interval}'`) };
            }
        }

        // duration filter (deadline - now <= window)
        if (filters.duration) {
            let interval: string;
            switch (filters.duration) {
                case 'lt1w': interval = '7 days'; break;
                case '1-2w': interval = '14 days'; break;
                case '1m': interval = '1 month'; break;
                case 'ongoing': interval = '1 year'; break;
                default: interval = '';
            }
            if (interval) {
                (where as any).deadline = { [Op.lte]: this.sequelize.literal(`NOW() + INTERVAL '${interval}'`) };
            } else if (filters.duration === 'ongoing') {
                // Ongoing: deadline is null or far in the future (e.g., > 1 year from now)
                (where as any).deadline = { [Op.gte]: this.sequelize.literal(`NOW() + INTERVAL '1 year'`) };
            }
        }

        /* ---------- attributes: scalar sub-query for applicationCount ---------- */
        const applicationCountLiteral = literal(
            `(SELECT COUNT(*)::INT FROM "applications" a WHERE a."bountyId" = "Bounty"."id")`
        );

        /* ---------- order ---------- */
        const order =
            sort === 'popular'
                ? [[applicationCountLiteral, 'DESC']] as any
                : [['createdAt', 'DESC']] as any;

        /* ---------- query ---------- */
        const { count, rows } = await this.bountyModel.findAndCountAll({
            where,
            include: [
                { model: BountyRole },
                { model: BountyResource },
            ],
            attributes: {
                include: [[applicationCountLiteral, 'applicationCount']],
            },
            distinct: true,               // makes count correct when include has 1-many
            order,
            limit,
            offset: (page - 1) * limit,
        });

        // with distinct:true + no group, count is a number
        const total = Array.isArray(count) ? count.length : (count as number);

        return { total, results: rows };
    }
    async apply(userId: number, bountyId: number) {
        return this.applicationService.apply(userId, bountyId);
    }


    private validateFile(file: MulterFile, allowedTypes: string[], maxSize: number): void {
        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
        }

        if (file.size > maxSize) {
            throw new BadRequestException(`File too large. Max size: ${maxSize / 1024 / 1024}MB`);
        }
    }


    private async uploadFile(file: MulterFile, subfolder: string): Promise<string> {
        try {
            const uploadsDir = path.join(process.env.UPLOAD_PATH || path.join(process.cwd(), 'uploads'), subfolder);
            await fs.mkdir(uploadsDir, { recursive: true });

            const fileName = `${Date.now()}-${file.originalname}`;
            const filePath = path.join(uploadsDir, fileName);

            await fs.writeFile(filePath, file.buffer);
            return `/uploads/${subfolder}/${fileName}`;
        } catch (error) {
            throw new InternalServerErrorException('Failed to upload file');
        }
    }
}