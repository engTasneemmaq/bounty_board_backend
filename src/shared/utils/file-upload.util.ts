import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { File as MulterFile } from 'multer';

export async function saveUploadedFile(
    file: MulterFile,
    subfolder = 'general'
): Promise<string> {
    const uploadDir = join(__dirname, '..', '..', 'uploads', subfolder);
    // Ensure directory exists (pseudo-code)
    // await fs.mkdir(uploadDir, { recursive: true });
    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, file.buffer);
    return `/uploads/${subfolder}/${fileName}`;
} 