import { IsOptional, IsString, IsInt, IsArray, IsUrl, IsNumber, ArrayNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePersonalDto {
    @ApiPropertyOptional({ example: 'Batool' })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional({ example: 'Azzam' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ example: 'Software Engineer' })
    @IsOptional()
    @IsString()
    jobTitle?: string;

    @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @IsInt()
    experienceYears?: number;

    @ApiPropertyOptional({ example: 'BSc Computer Science' })
    @IsOptional()
    @IsString()
    education?: string;

    @ApiPropertyOptional({ example: ['TypeScript', 'NestJS', 'PostgreSQL'], type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skills?: string[];

    @ApiPropertyOptional({ example: 'Lead Developer' })
    @IsOptional()
    @IsString()
    currentPosition?: string;

    @ApiPropertyOptional({ example: 'https://batool.dev' })
    @IsOptional()
    @IsUrl()
    personalWebsite?: string;

    @ApiPropertyOptional({ example: 'https://cdn.com/avatar.jpg' })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string;

    @ApiPropertyOptional({ example: 'https://cdn.com/cv.pdf' })
    @IsOptional()
    @IsUrl()
    cvUrl?: string;
} 