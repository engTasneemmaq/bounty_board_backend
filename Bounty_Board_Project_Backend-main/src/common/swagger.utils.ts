import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/** Handy decorator for array query params shown as languages[]=Java&languages[]=Python */
export function ApiArrayQuery(name: string, description = '', required = false) {
    return applyDecorators(
        ApiQuery({ name, type: String, required, isArray: true, description }),
    );
} 