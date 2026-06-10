import { Router } from 'express';
import { pool } from '../config/db';

const router = Router();

/**
 * GET /api/brands
 * Public endpoint — returns active brand logos for the marquee
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, image_url, link_url, sort_order FROM brand_logos WHERE is_active = true ORDER BY sort_order ASC, created_at ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching brand logos:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
