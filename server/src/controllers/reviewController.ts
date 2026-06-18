import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createReview = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { vendor_id, listing_id, order_id, rating, comment } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Invalid rating' });

        // Verified Purchase Check: Cross-reference orders/order_items
        const orderCheck = await pool.query(
            `SELECT 1 FROM orders o
             JOIN order_items oi ON o.order_id = oi.order_id
             WHERE o.user_id = $1 AND oi.item_id = $2 AND o.status IN ('paid', 'fulfilled')
             LIMIT 1`,
            [userId, listing_id]
        );

        const isVerified = (orderCheck.rowCount ?? 0) > 0;

        const result = await pool.query(
            `INSERT INTO reviews (user_id, vendor_id, listing_id, order_id, rating, comment, verified)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, vendor_id, listing_id, order_id, rating, comment, isVerified]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

export const getReviewsByVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const reviews = await pool.query(
            `SELECT r.*, u.name as reviewer_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.user_id 
             WHERE r.vendor_id = $1 
             ORDER BY r.created_at DESC`,
            [vendorId]
        );
        res.json(reviews.rows);
    } catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

export const getVendorRating = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const result = await pool.query(
            'SELECT ROUND(AVG(rating), 1) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE vendor_id = $1',
            [vendorId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get rating error:', error);
        res.status(500).json({ message: 'Failed to fetch rating' });
    }
};

export const getReviewsByStore = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.params;
        const result = await pool.query(
            `SELECT r.*, u.name as reviewer_name, l.title as product_name
             FROM reviews r
             JOIN users u ON r.user_id = u.user_id
             LEFT JOIN listings l ON r.listing_id = l.id
             JOIN stores s ON r.vendor_id = s.user_id -- Assuming vendor_id in reviews is store owner user_id
             WHERE s.store_id = $1
             ORDER BY r.created_at DESC`,
            [storeId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get store reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch store reviews' });
    }
};

export const replyToReview = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reply_text } = req.body;
        const userId = (req.user as any)?.user_id || (req.user as any)?.id;

        // Verify that the user owns the store/review recipient
        const reviewCheck = await pool.query(
            'SELECT vendor_id FROM reviews WHERE id = $1',
            [id]
        );

        if (reviewCheck.rows.length === 0) return res.status(404).json({ message: 'Review not found' });

        // Simple check: user_id of requester must match vendor_id of review
        // In this system, vendor_id usually refers to the owner's user_id
        if (reviewCheck.rows[0].vendor_id !== userId) {
            return res.status(403).json({ message: 'You can only reply to reviews for your own items' });
        }

        const result = await pool.query(
            `UPDATE reviews 
             SET reply_text = $1, replied_at = CURRENT_TIMESTAMP, replied_by = $2
             WHERE id = $3 RETURNING *`,
            [reply_text, userId, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Reply to review error:', error);
        res.status(500).json({ message: 'Failed to save reply' });
    }
};
