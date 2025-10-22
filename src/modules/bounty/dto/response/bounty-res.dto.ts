import { ApiProperty } from '@nestjs/swagger';
import { Bounty, BountyStatus } from '../../entities/bounty.entity';
import { BountyRoleResDto } from './bounty-role-res.dto';
import { BountyResourceResDto } from './bounty-resource-res.dto';

export class BountyResDto {
    @ApiProperty() id: number;
    @ApiProperty() posterId: number;
    @ApiProperty() title: string;
    @ApiProperty() description: string;
    @ApiProperty() reward: string;          // Sequelize DECIMAL(10,2) → string
    @ApiProperty() deadline: Date;
    @ApiProperty() thumbnailUrl: string;

    // optional scalars
    @ApiProperty({ required: false }) category?: string;
    @ApiProperty({ required: false }) currency?: string;
    @ApiProperty({ required: false }) languages?: string[];
    @ApiProperty({ required: false }) requirements?: string;
    @ApiProperty({ required: false }) technicalDetails?: string;
    @ApiProperty({ required: false }) contactEmail?: string;
    @ApiProperty({ required: false }) website?: string;
    @ApiProperty({ required: false }) skills?: string[];

    @ApiProperty({ enum: BountyStatus }) status: BountyStatus;

    // timestamps
    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;

    // relations
    @ApiProperty({ type: () => [BountyRoleResDto] })
    roles: BountyRoleResDto[];

    @ApiProperty({ type: () => [BountyResourceResDto] })
    resources: BountyResourceResDto[];
}
