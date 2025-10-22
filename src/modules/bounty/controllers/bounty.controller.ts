// src/modules/bounty/controllers/bounty.controller.ts
import {
    Controller, Post, UseGuards, UseInterceptors,
    UploadedFiles, Body, Request,
    Param,
    ParseIntPipe,
    Query,
    Get
} from '@nestjs/common';
import {
    ApiOperation, ApiConsumes, ApiBearerAuth, ApiTags,
    ApiCreatedResponse,
    ApiConflictResponse,
    ApiOkResponse,
    ApiBody, ApiQuery
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { BountyService } from '../services/bounty.service';
import { CreateBountyDto } from '../dto/create-bounty.dto';
import { BountyResDto } from '../dto/response/bounty-res.dto';
import { File as MulterFile } from 'multer';
import { BountyFiltersDto } from '../dto/bounty-filters.dto';
import { MultipartBodyDto } from '../../../shared/dto/multipart-body.dto';
import { ApiArrayQuery } from '../../../common/swagger.utils';

@ApiTags('Bounty')
@Controller('bounties')
export class BountyController {
    constructor(private readonly bountyService: BountyService) { }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'thumbnail', maxCount: 1 },
            { name: 'bountyBrief', maxCount: 1 },
        ])
    )
    @ApiBody({ type: MultipartBodyDto })
    @ApiOperation({ summary: 'Create new bounty' })
    @ApiConsumes('multipart/form-data')
    @ApiCreatedResponse({
        description: 'Bounty created',
        type: BountyResDto,
    })
    async createBounty(
        @Request() req,
        @Body() dto: CreateBountyDto,
        @UploadedFiles()
        files: { thumbnail?: MulterFile[]; bountyBrief?: MulterFile[] },
    ): Promise<BountyResDto> {
        const bounty = await this.bountyService.createBounty(
            req.user.id,
            dto,
            {
                thumbnail: files.thumbnail?.[0],
                bountyBrief: files.bountyBrief?.[0],
            },
        );

        // Convert the Sequelize model to the response DTO so
        // the runtime JSON exactly matches the Swagger schema.
        return plainToInstance(
            BountyResDto,
            bounty.get({ plain: true }),
        );
    }
    @Post(':id/apply')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiCreatedResponse({ description: 'Application submitted' })
    @ApiConflictResponse({ description: 'Already applied' })
    async apply(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        return this.bountyService.apply(req.user.id, id);
    }
    @Get()
    @ApiOperation({
        summary: 'Explore active bounties',
        description: `Public endpoint used on the landing page.\nSupports full‑text search (q), category, reward range, languages[],\npostedSince, duration, sorting (latest | popular), limit & page.`
    })
    @ApiArrayQuery('languages', 'Filter by tech languages', false)
    @ApiQuery({ name: 'minReward', required: false, type: Number })
    @ApiQuery({ name: 'maxReward', required: false, type: Number })
    @ApiQuery({ name: 'postedSince', required: false, enum: ['24h', 'week', 'month'] })
    @ApiQuery({ name: 'duration', required: false, enum: ['lt1w', '1-2w', '1m', 'ongoing'] })
    @ApiOkResponse({ description: 'Paginated list of bounties', type: BountyResDto })
    async list(@Query() filters: BountyFiltersDto) {
        return this.bountyService.findActiveBounties(filters);
    }

    /* ---------- single bounty ---------- */
    @Get(':id')
    @ApiOperation({
        summary: 'Get bounty details',
        description: 'Public endpoint shown when a visitor clicks "View Details" on the landing page.'
    })
    @ApiOkResponse({ type: BountyResDto })
    async getOne(@Param('id', ParseIntPipe) id: number) {
        return this.bountyService.findById(id);   // write a simple method
    }

}
