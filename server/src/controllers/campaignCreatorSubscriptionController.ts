import { Request, Response } from 'express';
import { pool } from '../config/db';

/**
 * Get current campaign creator subscription details
 */
export const getMyCampaignCreatorSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const subResult = await pool.query(
            "SELECT * FROM campaign_creator_subscriptions WHERE user_id = $1 AND status = 'active' LIMIT 1",
            [userId]
        );

        if (subResult.rows.length === 0) {
            return res.status(200).json({
                has_subscription: false,
                message: 'No active campaign creator subscription found.'
            });
        }

        res.json({
            has_subscription: true,
            ...subResult.rows[0]
        });
    } catch (error) {
        console.error('Get campaign creator subscription error:', error);
        res.status(500).json({ message: 'Failed to fetch subscription details.' });
    }
};

/**
 * Submit nonprofit verification documents
 */
export const submitNonprofitVerification = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { document_urls } = req.body;

        if (!document_urls || !Array.isArray(document_urls) || document_urls.length === 0) {
            return res.status(400).json({ message: 'Nonprofit documentation is required.' });
        }

        // Log the request for admin review
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, new_values) 
             VALUES ($1, $2, $3)`,
            [userId, 'NONPROFIT_VERIFICATION_SUBMITTED', JSON.stringify({ document_urls })]
        );

        res.json({
            message: 'Nonprofit verification submitted. Application is under review.',
            status: 'under_review'
        });
    } catch (error) {
        console.error('Submit nonprofit verification error:', error);
        res.status(500).json({ message: 'Failed to submit verification.' });
    }
};
