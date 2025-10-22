import { Cron } from '@nestjs/schedule';
import { join } from 'path';
import { readdir, unlink } from 'fs/promises';

export class FileCleanupCron {
    @Cron('0 3 * * *') // Daily at 3AM
    async cleanTempFiles() {
        const uploadDir = join(__dirname, '..', '..', 'uploads');
        // Logic to delete files older than 30 days
    }
} 