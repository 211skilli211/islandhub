import fs from 'fs';
import path from 'path';
import { pool } from '../config/db';

export interface StorageProvider {
    uploadFile(file: Express.Multer.File, userId?: number): Promise<string>;
    deleteFile(filename: string): Promise<void>;
}

function generateFilename(originalname: string): string {
    const ext = path.extname(originalname) || '.bin';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    return `file-${timestamp}-${random}${ext}`;
}

export class DatabaseStorageProvider implements StorageProvider {
    async uploadFile(file: Express.Multer.File, userId?: number): Promise<string> {
        const filename = generateFilename(file.originalname);
        const base64Data = file.buffer.toString('base64');
        const mimeType = file.mimetype;
        const dataUri = `data:${mimeType};base64,${base64Data}`;

        // Try DB storage first, fall back to disk if DB fails
        try {
            await pool.query(
                'INSERT INTO media (user_id, filename, url, file_type, file_size, data, storage_type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId || null, filename, `/api/media/file/${filename}`, mimeType, file.size, dataUri, 'database']
            );
            return `/api/media/file/${filename}`;
        } catch (dbError: any) {
            console.warn('DB storage failed, falling back to disk:', dbError.message);
            // Fallback: save to disk
            const uploadsDir = path.join(process.cwd(), 'src', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, file.buffer);
            return `/uploads/${filename}`;
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
        const filename = generateFilename(file.originalname);
        const filePath = path.join(this.uploadsDir, filename);
        fs.writeFileSync(filePath, file.buffer);
        return `/uploads/${filename}`;
    }
    async deleteFile(filename: string): Promise<void> {
        const filePath = path.join(this.uploadsDir, filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
}
