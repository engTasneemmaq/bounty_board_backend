import { ApiProperty } from '@nestjs/swagger';

export class LandingStatsDto {
    @ApiProperty() totalBounties: number;
    @ApiProperty() totalApplicants: number;
    @ApiProperty() activeHunters: number;
    @ApiProperty() completedProjects: number;
} 