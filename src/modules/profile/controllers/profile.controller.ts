// src/modules/profile/controllers/profile.controller.ts
import { Controller, Patch, Body, UseGuards, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';
import { UpdatePersonalDto } from '../dto/update-personal.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdateContactDto } from '../dto/update-contact.dto';
import { ProfileResDto } from '../dto/response/profile-res.dto';
import { plainToInstance } from 'class-transformer';

@ApiTags('Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    private readonly pipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    /* ---------- STEP 1 ---------- */
    @Patch('personal')
    @ApiOperation({ summary: 'Update personal information (step 1)' })
    @ApiOkResponse({ type: ProfileResDto })
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }))
    async updatePersonal(
        @Request() req,
        @Body() dto: UpdatePersonalDto,
    ): Promise<ProfileResDto> {
        const profile = await this.profileService.updatePersonal(req.user.id, dto);
        return plainToInstance(ProfileResDto, profile.get({ plain: true }));
    }

    /* ---------- STEP 2 ---------- */
    @Patch('profile')
    @ApiOperation({ summary: 'Update profile information (step 2)' })
    @ApiOkResponse({ type: ProfileResDto })
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }))
    async updateProfile(
        @Request() req,
        @Body() dto: UpdateProfileDto,
    ): Promise<ProfileResDto> {
        const profile = await this.profileService.updateProfile(req.user.id, dto);
        return plainToInstance(ProfileResDto, profile.get({ plain: true }));
    }

    /* ---------- STEP 3 ---------- */
    @Patch('contact')
    @ApiOperation({ summary: 'Update contact information (step 3)' })
    @ApiOkResponse({ type: ProfileResDto })
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }))
    async updateContact(
        @Request() req,
        @Body() dto: UpdateContactDto,
    ): Promise<ProfileResDto> {
        const profile = await this.profileService.updateContact(req.user.id, dto);
        return plainToInstance(ProfileResDto, profile.get({ plain: true }));
    }
}
