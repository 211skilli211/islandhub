import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get active promotional banners
// Optional query param: location (e.g. 'marketplace_hero', 'home_hero', 'sidebar')
export const getActiveBanners = async (req: Request, res: Response) => {
    try {
        const { location } = req.query;
        let query = `
            SELECT * FROM promotional_banners 
            WHERE is_active = true
        `;
        const params: any[] = [];

        if (location) {
            const locations = (location as string).split(',');
            query += ` AND location = ANY($1)`;
            params.push(locations);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error: any) {
        // Gracefully handle missing tables (Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Promotional banners table not initialized, returning empty array');
            return res.json([]);
        }
        console.error('Get active banners error:', error);
        res.status(500).json({ message: 'Failed to fetch active banners' });
    }
};
