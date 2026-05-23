import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

// @route   GET /api/media/file/:filename
// @desc    Serve a file from database storage
// @access  Public
router.get('/file/:filename', async (req, res) => {
    try {
        const result = await pool.query('SELECT data, file_type FROM media WHERE filename = $1', [req.params.filename]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'File not found' });
        const { data, file_type } = result.rows[0];
        if (!data) return res.status(404).json({ message: 'File data not available' });

        // Parse data URI
        const match = data.match(/^data:([^;]+);base64,(.+)$/);
        if (!match) return res.status(500).json({ message: 'Invalid file data' });

        const buffer = Buffer.from(match[2], 'base64');
        res.setHeader('Content-Type', match[1]);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: 'Failed to serve file' });
    }
});

export default router;
