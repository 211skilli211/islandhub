import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getPulseFeed = async (req: Request, res: Response) => {
    try {
        const { limit = 10 } = req.query;

        // Fetch different types of events and combine them
        const [stores, donations, campaigns] = await Promise.all([
            // Recent verified stores
            pool.query(`
                SELECT 'store' as type, store_id as id, name as title, 
                       'New partner joined the island!' as subtype, 
                       created_at as timestamp, logo_url as image
                FROM stores 
                WHERE status = 'active'
                ORDER BY created_at DESC LIMIT 5
            `),
            // Large donations
            pool.query(`
                SELECT 'donation' as type, t.transaction_id as id, c.title as title,
                       'Significant contribution received!' as subtype,
                       t.created_at as timestamp, NULL as image,
                       t.amount as value
                FROM transactions t
                JOIN campaigns c ON t.campaign_id = c.campaign_id
                WHERE t.amount >= 100 AND t.status = 'completed'
                ORDER BY t.created_at DESC LIMIT 5
            `),
            // Campaign updates
            pool.query(`
                SELECT 'milestone' as type, cu.update_id as id, c.title as title,
                       cu.content as subtype,
                       cu.created_at as timestamp, NULL as image
                FROM campaign_updates cu
                JOIN campaigns c ON cu.listing_id = c.campaign_id
                ORDER BY cu.created_at DESC LIMIT 5
            `)
        ]);

        const feed = [
            ...stores.rows,
            ...donations.rows,
            ...campaigns.rows
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, Number(limit));

        res.json(feed);
    } catch (error: any) {
        // Gracefully handle missing tables (Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Discovery tables not initialized, returning empty pulse feed');
            return res.json([]);
        }
        console.error('Get pulse feed error:', error);
        res.status(500).json({ message: 'Failed to fetch pulse feed' });
    }
};
