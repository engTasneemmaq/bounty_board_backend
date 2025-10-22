import { ApiProperty } from '@nestjs/swagger';
import { BountyRole } from '../../entities/bounty-role.entity';

export class BountyRoleResDto implements Partial<BountyRole> {
    @ApiProperty() id: number;
    @ApiProperty() roleName: string;
    @ApiProperty({ type: [String] }) technologies: string[];

    @ApiProperty() createdAt: Date;
    @ApiProperty() updatedAt: Date;
}
