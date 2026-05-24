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
        const mimeType = file.mimetype;
        const dataUri = `data:${mimeType};base64,${base64Data}`;

        // Try DB storage first, fall back to disk if DB fails
        try {
            await pool.query(
                'INSERT INTO media (user_id, filename, url, file_type, file_size, data, storage_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId || null, file.filename, `/api/media/file/${file.filename}`, mimeType, file.size, dataUri, 'database']
            );
            return `/api/media/file/${file.filename}`;
        } catch (dbError: any) {
            console.warn('DB storage failed, falling back to disk:', dbError.message);
            // Fallback: save to disk
            const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, file.filename);
            fs.writeFileSync(filePath, file.buffer);
            return `/uploads/${file.filename}`;
        }
    }

    async deleteFile(filename: string): Promise<void> {
        try {
            await pool.query('DELETE FROM media WHERE filename = $1', [filename]);
        } catch (e) {
            console.warn('DB delete failed:', e);
        }
        // Also try disk
        const filePath = path.join(process.cwd(), 'src', 'uploads', filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
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
