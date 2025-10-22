import { IsOptional, IsString, IsEmail } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateContactDto {
    @ApiPropertyOptional({ example: 'primary@email.com' })
    @IsOptional()
    @IsEmail()
    primaryEmail?: string;

    @ApiPropertyOptional({ example: 'secondary@email.com' })
    @IsOptional()
    @IsEmail()
    secondaryEmail?: string;

    @ApiPropertyOptional({ example: '+1234567890' })
    @IsOptional()
    @IsString()
    phoneNumber?: string;
} 