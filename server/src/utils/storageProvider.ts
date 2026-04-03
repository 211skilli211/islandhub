import fs from 'fs';
import path from 'path';

export interface StorageProvider {
    uploadFile(file: Express.Multer.File): Promise<string>;
    deleteFile(filename: string): Promise<void>;
}

export class LocalStorageProvider implements StorageProvider {
    private uploadsDir: string;

    constructor(uploadsDir: string) {
        this.uploadsDir = uploadsDir;
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        return `/uploads/${file.filename}`;
    }

    async deleteFile(filename: string): Promise<void> {
        const filePath = path.join(this.uploadsDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
