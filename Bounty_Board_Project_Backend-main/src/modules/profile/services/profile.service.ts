import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserProfile } from '../entities/user-profile.entity';
import { UpdatePersonalDto } from '../dto/update-personal.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectModel(UserProfile)
        private readonly userProfileModel: typeof UserProfile,
    ) { }

    async updatePersonal(userId: number, dto: UpdatePersonalDto): Promise<UserProfile> {
        let profile = await this.userProfileModel.findOne({ where: { userId } });
        if (!profile) {
            profile = await this.userProfileModel.create({ userId, ...dto } as any);
        } else {
            await profile.update(dto as any);
        }
        return profile;
    }

    async updateProfile(userId: number, dto: UpdateProfileDto): Promise<UserProfile> {
        let profile = await this.userProfileModel.findOne({ where: { userId } });
        if (!profile) {
            throw new NotFoundException('User profile not found. Complete personal info first.');
        }

        await profile.update(dto as any);
        return profile;
    }

    async updateContact(userId: number, dto: UpdateContactDto): Promise<UserProfile> {
        let profile = await this.userProfileModel.findOne({ where: { userId } });
        if (!profile) {
            profile = await this.userProfileModel.create({ userId, ...dto } as any);
        } else {
            const updateData: Partial<UpdateContactDto> = {};
            if (dto.primaryEmail !== undefined) updateData.primaryEmail = dto.primaryEmail;
            if (dto.secondaryEmail !== undefined) updateData.secondaryEmail = dto.secondaryEmail;
            if (dto.phoneNumber !== undefined) updateData.phoneNumber = dto.phoneNumber;
            await profile.update(updateData);
        }
        return profile;
    }
} 