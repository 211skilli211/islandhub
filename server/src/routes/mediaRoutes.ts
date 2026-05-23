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
        if (result.rows.length === 0) return res.status(404).json({ message: 'File not found' });

        const { data, file_type, url, storage_type } = result.rows[0];

        // New DB-stored file
        if (data && storage_type === 'database') {
            const match = data.match(/^data:([^;]+);base64,(.+)$/);
            if (!match) return res.status(500).json({ message: 'Invalid file data' });
            const buffer = Buffer.from(match[2], 'base64');
            res.setHeader('Content-Type', match[1]);
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(buffer);
        }

        // Old local file — try to serve from disk
        if (url && url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'src', url);
            if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', file_type || 'application/octet-stream');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.sendFile(filePath);
            }
        }

        // Fallback: if URL is a data URI (old DB entries)
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

        return res.status(404).json({ message: 'File data not available' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to serve file' });
    }
});

export default router;
