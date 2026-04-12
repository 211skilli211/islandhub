import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Get current customer subscription details (VIP status)
 */
export const getMyCustomerSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const subResult = await pool.query(
            "SELECT * FROM customer_subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
            [userId]
        );

        if (subResult.rows.length === 0) {
            return res.status(200).json({
                is_vip: false,
                tier: 'general',
                message: 'No active VIP subscription found.'
            });
        }

        res.json({
            is_vip: subResult.rows[0].tier === 'vip',
            ...subResult.rows[0]
        });
    } catch (error) {
        console.error('Get customer subscription error:', error);
        res.status(500).json({ message: 'Failed to fetch subscription details.' });
    }
};
