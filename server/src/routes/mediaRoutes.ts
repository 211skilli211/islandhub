import { Router } from 'express';
import { pool } from '../config/db';
import path from 'path';
import fs from 'fs';

const router = Router();

// @route   GET /api/media/file/:filename
// @desc    Serve a file from database storage or disk fallback
// @access  Public
router.get('/file/:filename', async (req, res) => {
    try {
        const result = await pool.query('SELECT data, file_type, url, storage_type FROM media WHERE filename = $1', [req.params.filename]);
        if (result.rows.length === 0) {
            // Try serving from disk directly as last resort
            const diskPath = path.join(process.cwd(), 'src', 'uploads', req.params.filename);
            if (fs.existsSync(diskPath)) {
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.sendFile(diskPath);
            }
            return res.status(404).json({ message: 'File not found' });
        }

        const { data, file_type, url, storage_type } = result.rows[0];

        // New DB-stored file
        if (data && (storage_type === 'database' || storage_type === 'local')) {
            const match = data.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
                const buffer = Buffer.from(match[2], 'base64');
                res.setHeader('Content-Type', match[1]);
                res.setHeader('Content-Length', buffer.length);
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.send(buffer);
            }
        }

        // Old local file — try to serve from disk
        if (url) {
            let diskPath: string;
            if (url.startsWith('/uploads/')) {
                diskPath = path.join(process.cwd(), 'src', url);
            } else if (url.startsWith('/api/media/file/')) {
                diskPath = path.join(process.cwd(), 'src', 'uploads', req.params.filename);
            } else {
                diskPath = '';
            }
            if (diskPath && fs.existsSync(diskPath)) {
                res.setHeader('Content-Type', file_type || 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.sendFile(diskPath);
            }
        }

        // If URL is a data URI (old DB entries without data column)
        if (url && url.startsWith('data:')) {
            const match = url.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
                const buffer = Buffer.from(match[2], 'base64');
                res.setHeader('Content-Type', match[1]);
                res.setHeader('Content-Length', buffer.length);
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.send(buffer);
            }
        }

        // Try disk as last resort
        const diskPath = path.join(process.cwd(), 'src', 'uploads', req.params.filename);
        if (fs.existsSync(diskPath)) {
            res.setHeader('Content-Type', file_type || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(diskPath);
        }

        return res.status(404).json({ message: 'File data not available' });
    } catch (error: any) {
        console.error('Media serve error:', error.message);
        res.status(500).json({ message: 'Failed to serve file' });
    }
});

export default router;
