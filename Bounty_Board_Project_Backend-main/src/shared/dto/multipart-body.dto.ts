// src/shared/dto/multipart-body.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBountyDto } from '../../modules/bounty/dto/create-bounty.dto';

export class MultipartBodyDto extends CreateBountyDto {
    /** optional JPG/PNG thumbnail */
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false,
    })
    thumbnail?: any;

    /** optional PDF brief */
    @ApiProperty({
        type: 'string',
        format: 'binary',
        required: false,
    })
    bountyBrief?: any;
}
