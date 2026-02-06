import { Request, Response } from 'express';
import { pool } from '../config/db';

export const createUpdate = async (req: Request, res: Response) => {
    const { listing_id, content, is_public } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify ownership
        const listingResult = await pool.query(
            'SELECT creator_id FROM listings WHERE id = $1',
            [listing_id]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        if (listingResult.rows[0].creator_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const result = await pool.query(
            `INSERT INTO campaign_updates (listing_id, creator_id, content, is_public)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [listing_id, userId, content, is_public]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;

    try {
        const result = await pool.query(
            `SELECT * FROM campaign_updates
             WHERE listing_id = $1 AND is_public = true
             ORDER BY created_at DESC`,
            [listing_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPrivateUpdates = async (req: Request, res: Response) => {
    const { listing_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verify ownership
        const listingResult = await pool.query(
            'SELECT creator_id FROM listings WHERE id = $1',
            [listing_id]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Listing not found' });
        }

        if (listingResult.rows[0].creator_id !== userId) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const result = await pool.query(
            `SELECT * FROM campaign_updates
             WHERE listing_id = $1
             ORDER BY created_at DESC`,
            [listing_id]
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};