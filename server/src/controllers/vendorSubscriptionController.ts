import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Get current vendor subscription details
 */
export const getMyVendorSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get vendor_id first
        const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor profile not found.' });
        }
        const vendorId = vendorResult.rows[0].id;

        const subResult = await pool.query(
            "SELECT * FROM vendor_subscriptions WHERE vendor_id = $1 AND status = 'active' LIMIT 1",
            [vendorId]
        );

        if (subResult.rows.length === 0) {
            return res.status(200).json({
                has_subscription: false,
                message: 'No active vendor subscription found.'
            });
        }

        res.json({
            has_subscription: true,
            ...subResult.rows[0]
        });
    } catch (error) {
        console.error('Get vendor subscription error:', error);
        res.status(500).json({ message: 'Failed to fetch subscription details.' });
    }
};

/**
 * Handle subscription upgrade/downgrade (triggered by frontend after Dodo check-out)
 * Note: Real sync happens via webhooks, this is for immediate UI feedback/manual sync.
 */
export const syncVendorSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { dodo_subscription_id } = req.body;

        if (!dodo_subscription_id) {
            return res.status(400).json({ message: 'dodo_subscription_id is required.' });
        }

        // In a real app, we'd fetch latest data from Dodo API here
        // For now, we return 200 and wait for the webhook to populate the DB
        res.json({
            message: 'Subscription sync initiated. It will be active shortly.',
            status: 'pending'
        });
    } catch (error) {
        console.error('Sync vendor subscription error:', error);
        res.status(500).json({ message: 'Failed to sync subscription.' });
    }
};

/**
 * Cancel current vendor subscription at the end of the period
 */
export const cancelVendorSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor profile not found.' });
        }
        const vendorId = vendorResult.rows[0].id;

        const result = await pool.query(
            "UPDATE vendor_subscriptions SET cancel_at_period_end = true, updated_at = NOW() WHERE vendor_id = $1 AND status = 'active' RETURNING *",
            [vendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No active subscription to cancel.' });
        }

        // Ideally call Dodo API here to set cancel_at_period_end on their side as well
        // But for our mock-first approach, we'll mark it locally.

        res.json({
            message: 'Subscription will be cancelled at the end of the current period.',
            ...result.rows[0]
        });
    } catch (error) {
        console.error('Cancel vendor subscription error:', error);
        res.status(500).json({ message: 'Failed to cancel subscription.' });
    }
};
