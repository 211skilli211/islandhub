/**
 * Vendor Bulk Operations Controller
 * Handles bulk listing management for vendors
 */

import { Request, Response } from 'express';
import { pool } from '../config/db';

// Bulk update listings status
export const bulkUpdateStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { listing_ids, status, reason } = req.body;

        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return res.status(400).json({ error: 'listing_ids array required' });
        }

        if (!status || !['active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        // Verify ownership
        const listings = await pool.query(
            `SELECT id FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.id = ANY($1) AND s.user_id = $2`,
            [listing_ids, user.id]
        );

        const validIds = listings.rows.map((l: any) => l.id);

        if (validIds.length === 0) {
            return res.status(403).json({ error: 'No valid listings found' });
        }

        await pool.query(
            `UPDATE listings SET status = $1, updated_at = NOW() WHERE id = ANY($2)`,
            [status, validIds]
        );

        res.json({ 
            success: true, 
            updated_count: validIds.length,
            status 
        });
    } catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ error: 'Failed to update listings' });
    }
};

// Bulk update prices
export const bulkUpdatePrices = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { listing_ids, price_adjustment, adjustment_type, percentage } = req.body;

        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return res.status(400).json({ error: 'listing_ids array required' });
        }

        if (!adjustment_type || !['fixed', 'percentage', 'increase', 'decrease'].includes(adjustment_type)) {
            return res.status(400).json({ error: 'Invalid adjustment_type' });
        }

        // Verify ownership
        const listings = await pool.query(
            `SELECT id, price FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.id = ANY($1) AND s.user_id = $2`,
            [listing_ids, user.id]
        );

        const validIds = listings.rows.map((l: any) => l.id);

        if (validIds.length === 0) {
            return res.status(403).json({ error: 'No valid listings found' });
        }

        let newPrice: any;
        
        if (adjustment_type === 'fixed') {
            newPrice = price_adjustment;
        } else if (adjustment_type === 'percentage') {
            // Apply same percentage to all
            const multiplier = 1 + (parseFloat(percentage || '0') / 100);
            await pool.query(
                `UPDATE listings SET price = ROUND(price * $1, 2), updated_at = NOW() WHERE id = ANY($2)`,
                [multiplier, validIds]
            );
            return res.json({ success: true, updated_count: validIds.length, adjustment: `${percentage}%` });
        } else if (adjustment_type === 'increase') {
            const multiplier = 1 + (parseFloat(price_adjustment || '0') / 100);
            await pool.query(
                `UPDATE listings SET price = ROUND(price * $1, 2), updated_at = NOW() WHERE id = ANY($2)`,
                [multiplier, validIds]
            );
            return res.json({ success: true, updated_count: validIds.length, adjustment: `+${price_adjustment}%` });
        } else if (adjustment_type === 'decrease') {
            const multiplier = 1 - (parseFloat(price_adjustment || '0') / 100);
            await pool.query(
                `UPDATE listings SET price = GREATEST(ROUND(price * $1, 2), 0.01), updated_at = NOW() WHERE id = ANY($2)`,
                [multiplier, validIds]
            );
            return res.json({ success: true, updated_count: validIds.length, adjustment: `-${price_adjustment}%` });
        }

        if (newPrice !== undefined) {
            await pool.query(
                `UPDATE listings SET price = $1, updated_at = NOW() WHERE id = ANY($2)`,
                [newPrice, validIds]
            );
        }

        res.json({ success: true, updated_count: validIds.length });
    } catch (error) {
        console.error('Bulk price update error:', error);
        res.status(500).json({ error: 'Failed to update prices' });
    }
};

// Bulk delete listings
export const bulkDelete = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { listing_ids, delete_type = 'soft' } = req.body;

        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return res.status(400).json({ error: 'listing_ids array required' });
        }

        // Verify ownership
        const listings = await pool.query(
            `SELECT id FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.id = ANY($1) AND s.user_id = $2`,
            [listing_ids, user.id]
        );

        const validIds = listings.rows.map((l: any) => l.id);

        if (validIds.length === 0) {
            return res.status(403).json({ error: 'No valid listings found' });
        }

        if (delete_type === 'hard') {
            await pool.query(`DELETE FROM listings WHERE id = ANY($1)`, [validIds]);
        } else {
            await pool.query(
                `UPDATE listings SET status = 'deleted', updated_at = NOW() WHERE id = ANY($1)`,
                [validIds]
            );
        }

        res.json({ 
            success: true, 
            deleted_count: validIds.length,
            delete_type 
        });
    } catch (error) {
        console.error('Bulk delete error:', error);
        res.status(500).json({ error: 'Failed to delete listings' });
    }
};

// Bulk add to category
export const bulkAddToCategory = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { listing_ids, category_id } = req.body;

        if (!listing_ids || !Array.isArray(listing_ids) || listing_ids.length === 0) {
            return res.status(400).json({ error: 'listing_ids array required' });
        }

        if (!category_id) {
            return res.status(400).json({ error: 'category_id required' });
        }

        // Verify ownership
        const listings = await pool.query(
            `SELECT id FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE l.id = ANY($1) AND s.user_id = $2`,
            [listing_ids, user.id]
        );

        const validIds = listings.rows.map((l: any) => l.id);

        if (validIds.length === 0) {
            return res.status(403).json({ error: 'No valid listings found' });
        }

        await pool.query(
            `UPDATE listings SET category_id = $1, updated_at = NOW() WHERE id = ANY($2)`,
            [category_id, validIds]
        );

        res.json({ success: true, updated_count: validIds.length, category_id });
    } catch (error) {
        console.error('Bulk category update error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
};

// Get bulk operation stats
export const getBulkStats = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'active') as active,
                COUNT(*) FILTER (WHERE status = 'inactive') as inactive,
                COUNT(*) FILTER (WHERE status = 'draft') as draft,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_30d
             FROM listings l
             JOIN stores s ON s.id = l.store_id
             WHERE s.user_id = $1`,
            [user.id]
        );

        res.json({ stats: result.rows[0] });
    } catch (error) {
        console.error('Get bulk stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
};

export default {
    bulkUpdateStatus,
    bulkUpdatePrices,
    bulkDelete,
    bulkAddToCategory,
    getBulkStats
};