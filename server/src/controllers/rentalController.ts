import { Request, Response } from 'express';
import { pool } from '../config/db';

// --- Categories & Subtypes ---

export const updateRentalCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rental_category, rental_subtype } = req.body;
        const userId = (req.user as any)?.id;

        // Verify ownership
        const ownershipCheck = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [id]);
        if (ownershipCheck.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (ownershipCheck.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'UPDATE listings SET rental_category = $1, rental_subtype = $2 WHERE id = $3 RETURNING id, rental_category, rental_subtype',
            [rental_category, rental_subtype, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update rental category error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Availability Calendar ---

export const getAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM rental_availability WHERE listing_id = $1 ORDER BY start_date ASC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addAvailability = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { start_date, end_date, is_available } = req.body;
        const userId = (req.user as any)?.id;

        // Verify ownership
        const ownershipCheck = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [id]);
        if (ownershipCheck.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (ownershipCheck.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO rental_availability (listing_id, start_date, end_date, is_available) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, start_date, end_date, is_available]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteAvailability = async (req: Request, res: Response) => {
    try {
        const { id, availabilityId } = req.params;
        const userId = (req.user as any)?.id;

        // Verify ownership of the LISTING (via join)
        const check = await pool.query(
            'SELECT l.creator_id FROM rental_availability ra JOIN listings l ON ra.listing_id = l.id WHERE ra.availability_id = $1 AND l.id = $2',
            [availabilityId, id]
        );

        if (check.rows.length === 0) return res.status(404).json({ message: 'Availability slot not found or mismatch' });
        if (check.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM rental_availability WHERE availability_id = $1', [availabilityId]);
        res.json({ message: 'Availability slot deleted' });
    } catch (error) {
        console.error('Delete availability error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Pricing Tiers ---

export const getPricingTiers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM rental_pricing WHERE listing_id = $1 ORDER BY base_price ASC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get pricing tiers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addPricingTier = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vehicle_type, base_price, notes } = req.body;
        const userId = (req.user as any)?.id;

        const ownershipCheck = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [id]);
        if (ownershipCheck.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (ownershipCheck.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO rental_pricing (listing_id, vehicle_type, base_price, notes) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, vehicle_type, base_price, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add pricing tier error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePricingTier = async (req: Request, res: Response) => {
    try {
        const { id, pricingId } = req.params;
        const userId = (req.user as any)?.id;

        const check = await pool.query(
            'SELECT l.creator_id FROM rental_pricing rp JOIN listings l ON rp.listing_id = l.id WHERE rp.pricing_id = $1 AND l.id = $2',
            [pricingId, id]
        );

        if (check.rows.length === 0) return res.status(404).json({ message: 'Pricing tier not found or mismatch' });
        if (check.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM rental_pricing WHERE pricing_id = $1', [pricingId]);
        res.json({ message: 'Pricing tier deleted' });
    } catch (error) {
        console.error('Delete pricing tier error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Seasonal Rates ---

export const getSeasonalRates = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM seasonal_rates WHERE listing_id = $1 ORDER BY start_date ASC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get seasonal rates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addSeasonalRate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { start_date, end_date, price, notes } = req.body;
        const userId = (req.user as any)?.id;

        const ownershipCheck = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [id]);
        if (ownershipCheck.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });
        if (ownershipCheck.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO seasonal_rates (listing_id, start_date, end_date, price, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, start_date, end_date, price, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add seasonal rate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSeasonalRate = async (req: Request, res: Response) => {
    try {
        const { id, rateId } = req.params;
        const userId = (req.user as any)?.id;

        const check = await pool.query(
            'SELECT l.creator_id FROM seasonal_rates sr JOIN listings l ON sr.listing_id = l.id WHERE sr.rate_id = $1 AND l.id = $2',
            [rateId, id]
        );

        if (check.rows.length === 0) return res.status(404).json({ message: 'Rate not found or mismatch' });
        if (check.rows[0].creator_id !== userId && (req.user as any)?.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await pool.query('DELETE FROM seasonal_rates WHERE rate_id = $1', [rateId]);
        res.json({ message: 'Seasonal rate deleted' });
    } catch (error) {
        console.error('Delete seasonal rate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Rental Search ---

export const getRentals = async (req: Request, res: Response) => {
    try {
        const { category, subtype, minPrice, maxPrice } = req.query;
        let query = `
            SELECT l.* 
            FROM listings l
            WHERE l.type = 'rental' AND l.verified = TRUE
        `;
        const params: any[] = [];

        if (category) {
            query += ` AND l.rental_category = $${params.length + 1}`;
            params.push(category);
        }
        if (subtype) {
            query += ` AND l.rental_subtype = $${params.length + 1}`;
            params.push(subtype);
        }

        query += ` ORDER BY l.created_at DESC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get rentals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
