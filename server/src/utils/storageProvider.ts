import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

export interface StorageProvider {
    uploadFile(file: Express.Multer.File, userId?: number): Promise<string>;
    deleteFile(filename: string): Promise<void>;
}

export class DatabaseStorageProvider implements StorageProvider {
    async uploadFile(file: Express.Multer.File, userId?: number): Promise<string> {
        const base64Data = file.buffer.toString('base64');
        const dataUri = `data:${file.mimetype};base64,${base64Data}`;
        await pool.query(
            'INSERT INTO media (user_id, filename, url, file_type, file_size, data, storage_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [userId || null, file.filename, `/api/media/file/${file.filename}`, file.mimetype, file.size, dataUri, 'database']
        );
        return `/api/media/file/${file.filename}`;
    }
    async deleteFile(filename: string): Promise<void> {
        await pool.query('DELETE FROM media WHERE filename = $1', [filename]);
    }
}

export class LocalStorageProvider implements StorageProvider {
    private uploadsDir: string;
    constructor(uploadsDir: string) {
        this.uploadsDir = uploadsDir;
        if (!fs.existsSync(this.uploadsDir)) fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    async uploadFile(file: Express.Multer.File, userId?: number): Promise<string> {
        return `/uploads/${file.filename}`;
    }
    async deleteFile(filename: string): Promise<void> {
        const filePath = path.join(this.uploadsDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}
