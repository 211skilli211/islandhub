import express from 'express';
import { pool } from '../config/db';

const router = express.Router();

// Basic trending recommendations (featured listings)
router.get('/trending', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        const result = await pool.query(
            "SELECT l.*, s.name as shop_name, s.slug as shop_slug, s.logo_url as shop_logo, s.banner_url as shop_banner FROM listings l LEFT JOIN stores s ON l.store_id = s.store_id WHERE l.status = 'active' AND l.featured = true AND l.type IN ('product', 'service') ORDER BY l.created_at DESC LIMIT $1",
            [limit]
        );
        res.json({ recommendations: result.rows });
    } catch (error) {
        console.error('Error fetching trending recommendations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Basic personalized recommendations (random for now, or match user interests)
router.get('/personalized', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 10;
        // For now, just return random active products/services
        const result = await pool.query(
            "SELECT l.*, s.name as shop_name, s.slug as shop_slug FROM listings l LEFT JOIN stores s ON l.store_id = s.store_id WHERE l.status = 'active' AND l.type IN ('product', 'service') ORDER BY RANDOM() LIMIT $1",
            [limit]
        );
        res.json({ recommendations: result.rows });
    } catch (error) {
        console.error('Error fetching personalized recommendations:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export default router;
