import {
    IsString, IsNumber, IsArray, IsDate, IsEnum,
    IsOptional, IsUrl, IsEmail, ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { BountyStatus } from '../entities/bounty.entity';
import { CreateBountyRoleDto } from './create-bounty-role.dto';
import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

export class CreateBountyDto {
    // ---------- BASIC FIELDS ----------
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    reward: number;

    @ApiProperty()
    @IsDate()
    @Type(() => Date)
    deadline: Date;

    // ---------- OPTIONAL SCALARS ----------
    @ApiPropertyOptional()
    @IsString() @IsOptional()
    category?: string;

    @ApiPropertyOptional()
    @IsString() @IsOptional()
    currency?: string;

    @ApiPropertyOptional()
    @IsString() @IsOptional()
    requirements?: string;

    @ApiPropertyOptional()
    @IsString() @IsOptional()
    technicalDetails?: string;

    @ApiPropertyOptional()
    @IsEmail() @IsOptional()
    contactEmail?: string;

    @ApiPropertyOptional()
    @IsUrl() @IsOptional()
    website?: string;

    @ApiPropertyOptional()
    @IsUrl() @IsOptional()
    projectLink?: string;

    // ---------- ARRAYS ----------
    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value, { toClassOnly: true })
    languages?: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Type(() => String)
    @Transform(({ value }) =>
        typeof value === 'string' ? JSON.parse(value) : value, { toClassOnly: true })
    skills?: string[];


    @ApiProperty({ type: [CreateBountyRoleDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateBountyRoleDto)
    @Transform(({ value }) => {
        //  Parse if it’s a string (multipart form-data)
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;

        //  Ensure it’s an array
        if (!Array.isArray(parsed)) {
            throw new BadRequestException(
                'Roles must be a JSON array. Example: [{"roleName":"Developer","technologies":["Node.js"]}]'
            );
        }

        // Convert each element into a CreateBountyRoleDto instance
        return plainToInstance(CreateBountyRoleDto, parsed);
    }, { toClassOnly: true })
    roles: CreateBountyRoleDto[];
    // ---------- ENUM ----------
    @IsEnum(BountyStatus) @IsOptional()
    status?: BountyStatus = BountyStatus.Draft;

}
