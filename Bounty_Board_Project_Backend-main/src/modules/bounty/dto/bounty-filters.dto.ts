import { IsOptional, IsArray, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CATEGORIES, PAGE_SIZES } from '../../../common/constants/bounty.constants';

export enum SortOption { Latest = 'latest', Popular = 'popular' }

export class BountyFiltersDto {
    /* -------- built‑in fields -------- */
    @ApiPropertyOptional() @IsOptional() @IsString() q?: string;            // keyword
    @ApiPropertyOptional({ enum: CATEGORIES }) @IsOptional() @IsString() category?: string;

    @ApiPropertyOptional() @IsOptional() @IsInt() minReward?: number;
    @ApiPropertyOptional() @IsOptional() @IsInt() maxReward?: number;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];

    @ApiPropertyOptional({ enum: ['24h', 'week', 'month'] })
    @IsOptional()
    postedSince?: '24h' | 'week' | 'month';

    @ApiPropertyOptional({ enum: ['lt1w', '1-2w', '1m', 'ongoing'] })
    @IsOptional()
    duration?: 'lt1w' | '1-2w' | '1m' | 'ongoing';

    /* -------- pagination & sorting -------- */
    @ApiPropertyOptional({ enum: PAGE_SIZES, default: 12 })
    @IsOptional() @IsInt() @Min(1) @Max(100)
    limit?: number = 12;

    @ApiPropertyOptional({ minimum: 1, default: 1 })
    @IsOptional() @IsInt() @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ enum: SortOption, default: SortOption.Latest })
    @IsEnum(SortOption)
    sort?: SortOption = SortOption.Latest;
}
