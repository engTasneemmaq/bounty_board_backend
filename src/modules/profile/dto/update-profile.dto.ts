import { IsOptional, IsString, IsDate, IsEnum, IsArray, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum Gender {
    Male = 'male',
    Female = 'female',
}

export enum MaritalStatus {
    Single = 'single',
    Married = 'married',
    Divorced = 'divorced',
    Widowed = 'widowed',
    Other = 'other',
}

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'Palestinian' })
    @IsOptional()
    @IsString()
    nationality?: string;

    @ApiPropertyOptional({ example: '2001-02-15', type: Date })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    dateOfBirth?: Date;

    @ApiPropertyOptional({ enum: Gender, example: Gender.Female })
    @IsOptional()
    @IsEnum(Gender)
    gender?: Gender;

    @ApiPropertyOptional({ enum: MaritalStatus, example: MaritalStatus.Single })
    @IsOptional()
    @IsEnum(MaritalStatus)
    maritalStatus?: MaritalStatus;

    @ApiPropertyOptional({ example: ['Arabic', 'English'], type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    languages?: string[];

    @ApiPropertyOptional({ example: 'Palestine' })
    @IsOptional()
    @IsString()
    country?: string;

    @ApiPropertyOptional({ example: 'Experienced backend developer with 5+ years in TypeScript and NestJS. Passionate about clean code and scalable architecture.' })
    @IsOptional()
    @IsString()
    bio?: string;

    @ApiPropertyOptional({ example: 'https://linkedin.com/in/batool' })
    @IsOptional()
    @IsUrl()
    linkedInUrl?: string;
} 