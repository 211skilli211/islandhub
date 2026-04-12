import { Request, Response } from 'express';
import { pool } from '../config/db';

// Submit rating for a completed delivery
export const submitRating = async (req: Request, res: Response) => {
    try {
        const customerId = (req.user as any)?.id;
        const { deliveryId } = req.params;
        const { rating, review } = req.body;

        if (!customerId) return res.status(401).json({ message: 'Unauthorized' });
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Verify the delivery is completed and belongs to this customer
        const delivery = await pool.query(
            `SELECT * FROM listings WHERE id = $1 AND creator_id = $2 AND transport_status = 'completed'`,
            [deliveryId, customerId]
        );

        if (delivery.rows.length === 0) {
            return res.status(404).json({ message: 'Completed delivery not found' });
        }

        const driverId = delivery.rows[0].driver_id;
        if (!driverId) {
            return res.status(400).json({ message: 'No driver assigned to this delivery' });
        }

        // Check if already rated
        const existing = await pool.query(
            'SELECT * FROM delivery_ratings WHERE delivery_id = $1 AND customer_id = $2',
            [deliveryId, customerId]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'You have already rated this delivery' });
        }

        // Insert rating
        const result = await pool.query(
            `INSERT INTO delivery_ratings (delivery_id, customer_id, driver_id, rating, review)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [deliveryId, customerId, driverId, rating, review]
        );

        // Update driver's average rating
        await pool.query(`
            UPDATE users SET
                driver_rating = (
                    SELECT COALESCE(AVG(rating), 0) 
                    FROM delivery_ratings 
                    WHERE driver_id = $1
                ),
                driver_rating_count = (
                    SELECT COUNT(*) 
                    FROM delivery_ratings 
                    WHERE driver_id = $1
                )
            WHERE user_id = $1
        `, [driverId]);

        res.status(201).json({
            message: 'Rating submitted successfully',
            rating: result.rows[0]
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ message: 'Failed to submit rating' });
    }
};

// Get rating for a specific delivery
export const getDeliveryRating = async (req: Request, res: Response) => {
    try {
        const { deliveryId } = req.params;

        const result = await pool.query(
            `SELECT dr.*, u.name as customer_name
             FROM delivery_ratings dr
             JOIN users u ON dr.customer_id = u.user_id
             WHERE dr.delivery_id = $1`,
            [deliveryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Rating not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Get rating error:', error);
        res.status(500).json({ message: 'Failed to get rating' });
    }
};

// Get driver's ratings
export const getDriverRatings = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;

        const result = await pool.query(
            `SELECT dr.*, u.name as customer_name, l.title as delivery_title
             FROM delivery_ratings dr
             JOIN users u ON dr.customer_id = u.user_id
             JOIN listings l ON dr.delivery_id = l.id
             WHERE dr.driver_id = $1
             ORDER BY dr.created_at DESC
             LIMIT 50`,
            [driverId]
        );

        // Get aggregate stats
        const stats = await pool.query(
            `SELECT 
                COUNT(*) as total_ratings,
                COALESCE(AVG(rating), 0) as average_rating,
                COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
                COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
                COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
                COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
                COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
             FROM delivery_ratings WHERE driver_id = $1`,
            [driverId]
        );

        res.json({
            ratings: result.rows,
            stats: stats.rows[0]
        });
    } catch (error) {
        console.error('Get driver ratings error:', error);
        res.status(500).json({ message: 'Failed to get driver ratings' });
    }
};

// Get my ratings (as a driver)
export const getMyDriverRatings = async (req: Request, res: Response) => {
    try {
        const driverId = (req.user as any)?.id;
        if (!driverId) return res.status(401).json({ message: 'Unauthorized' });

        // Reuse getDriverRatings logic
        req.params.driverId = driverId;
        return getDriverRatings(req, res);
    } catch (error) {
        console.error('Get my ratings error:', error);
        res.status(500).json({ message: 'Failed to get ratings' });
    }
};
