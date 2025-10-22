import { ApiProperty } from '@nestjs/swagger';
import { BountyResource, BountyResourceType } from '../../entities/bounty-resource.entity';

export class BountyResourceResDto implements Partial<BountyResource> {
    @ApiProperty() id: number;
    @ApiProperty({ enum: BountyResourceType }) type: BountyResourceType;
    @ApiProperty() url: string;
    @ApiProperty() name: string;

    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;
}
