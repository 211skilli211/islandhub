import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createSubscription = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { tier, provider, transaction_id } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Calculate expiry (1 month from now)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        const userRole = (req.user as any)?.role;
        const isAdmin = userRole === 'admin';

        const query = `
            INSERT INTO subscriptions (user_id, tier, status, expires_at, provider, transaction_id)
            VALUES ($1, $2, 'active', $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE SET
                tier = EXCLUDED.tier,
                status = 'active',
                expires_at = EXCLUDED.expires_at,
                provider = EXCLUDED.provider,
                transaction_id = EXCLUDED.transaction_id,
                updated_at = NOW()
            RETURNING *
        `;

        const finalTransactionId = isAdmin ? `admin_bypass_${Date.now()}` : transaction_id;
        const finalProvider = isAdmin ? 'admin_bypass' : provider;

        const result = await pool.query(query, [userId, tier || 'basic', expiresAt, finalProvider, finalTransactionId]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create subscription error:', error);
        res.status(500).json({ message: 'Failed to create subscription' });
    }
};

export const getMySubscription = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const result = await pool.query('SELECT * FROM subscriptions WHERE user_id = $1 AND status = \'active\'', [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No active subscription found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get subscription error:', error);
        res.status(500).json({ message: 'Failed to fetch subscription' });
    }
};
