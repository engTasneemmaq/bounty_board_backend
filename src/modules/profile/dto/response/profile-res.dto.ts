import { ApiProperty } from '@nestjs/swagger';
import { Gender, MaritalStatus } from '../../dto/update-profile.dto';

export class ProfileResDto {
    // IDs
    @ApiProperty() id: number;
    @ApiProperty() userId: number;

    // Step‑1 fields
    @ApiProperty() firstName: string;
    @ApiProperty() lastName: string;
    @ApiProperty() jobTitle: string;
    @ApiProperty() experienceYears: number;
    @ApiProperty() education: string;
    @ApiProperty({ type: [String] }) skills: string[];
    @ApiProperty() currentPosition: string;
    @ApiProperty() personalWebsite: string;
    @ApiProperty() avatarUrl: string;
    @ApiProperty() cvUrl: string;

    // Step‑2 fields
    @ApiProperty() nationality: string;
    @ApiProperty() dateOfBirth: Date;
    @ApiProperty({ enum: Gender }) gender: Gender;
    @ApiProperty({ enum: MaritalStatus }) maritalStatus: MaritalStatus;
    @ApiProperty({ type: [String] }) languages: string[];
    @ApiProperty() country: string;
    @ApiProperty() bio: string;
    @ApiProperty() linkedInUrl: string;

    // Step‑3 fields
    @ApiProperty() phoneNumber: string;
    @ApiProperty() primaryEmail: string;
    @ApiProperty() secondaryEmail: string;

    // timestamps
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;
}
