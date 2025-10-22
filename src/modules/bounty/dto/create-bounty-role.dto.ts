import { IsString, IsArray, ArrayNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBountyRoleDto {
    @ApiProperty({ example: 'Frontend' })
    @IsString()
    roleName: string;

    @ApiProperty({ example: ['React', 'TypeScript'], type: [String] })
    @IsArray({ message: 'Technologies must be an array' })
    @ArrayNotEmpty({ message: 'At least one technology is required' })
    @IsString({ each: true, message: 'Each technology must be a string' })
    @Type(() => String)
    technologies: string[];
}