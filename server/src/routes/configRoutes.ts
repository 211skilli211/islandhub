import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// Public: Get subscription tier configuration
router.get('/subscription-tiers', async (_req: Request, res: Response) => {
    try {
        // Return hardcoded tier config (can be moved to DB later)
        res.json({
            tiers: [
                {
                    id: 'free',
                    name: 'Free',
                    price: 0,
                    interval: 'month',
                    features: ['Basic store listing', 'Up to 10 products', 'Community support'],
                    highlighted: false,
                },
                {
                    id: 'starter',
                    name: 'Starter',
                    price: 29,
                    interval: 'month',
                    currency: 'XCD',
                    features: ['Verified badge', 'Up to 100 products', 'Priority support', 'Analytics dashboard'],
                    highlighted: false,
                },
                {
                    id: 'pro',
                    name: 'Professional',
                    price: 79,
                    interval: 'month',
                    currency: 'XCD',
                    features: ['Everything in Starter', 'Unlimited products', 'Custom domain', 'API access', 'Revenue analytics', 'Featured placement'],
                    highlighted: true,
                },
                {
                    id: 'enterprise',
                    name: 'Enterprise',
                    price: 199,
                    interval: 'month',
                    currency: 'XCD',
                    features: ['Everything in Pro', 'Dedicated account manager', 'White-label options', 'Custom integrations', 'SLA guarantee'],
                    highlighted: false,
                },
            ],
        });
    } catch (err) {
        console.error('Error fetching subscription tiers:', err);
        res.status(500).json({ message: 'Failed to fetch subscription tiers' });
    }
});

// Public: Get store category stats for homepage
router.get('/categories', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT
                category,
                COUNT(*) as store_count,
                COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
            FROM stores
            WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY store_count DESC
        `);

        const categories = result.rows.map((row: any) => ({
            name: row.category,
            count: parseInt(row.store_count, 10),
            active: parseInt(row.active_count, 10),
        }));

        // If no data in DB, return defaults
        if (categories.length === 0) {
            return res.json({
                categories: [
                    { name: 'food', count: 3, active: 3 },
                    { name: 'retail', count: 1, active: 1 },
                    { name: 'services', count: 7, active: 7 },
                    { name: 'tours', count: 1, active: 1 },
                ],
            });
        }

        res.json({ categories });
    } catch (err) {
        console.error('Error fetching category stats:', err);
        // Return empty rather than 500 — this is non-critical data
        res.json({ categories: [] });
    }
});

export default router;
