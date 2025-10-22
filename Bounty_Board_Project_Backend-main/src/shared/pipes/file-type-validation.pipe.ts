import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { File as MulterFile } from 'multer';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
    constructor(
        private readonly allowedTypes: string[],
        private readonly errorMessage = 'Invalid file type'
    ) { }

    transform(file: MulterFile) {
        if (!this.allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(this.errorMessage);
        }
        return file;
    }
} 