import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';

// Get all listings with pending custom type verification
export const getPendingCustomTypes = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(`
            SELECT 
                l.id, l.title, l.type, l.category, l.metadata, l.created_at,
                l.store_id, s.name as store_name,
                u.user_id, u.name as vendor_name, u.email as vendor_email
            FROM listings l
            LEFT JOIN stores s ON l.store_id = s.store_id
            LEFT JOIN users u ON l.creator_id = u.user_id
            WHERE l.metadata->>'custom_type_status' = 'pending_verification'
            OR l.type = 'custom'
            ORDER BY l.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching pending custom types:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve a custom product type
export const approveCustomType = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const adminId = req.user?.id as number;

        // Get the listing first
        const listingRes = await pool.query(
            'SELECT id, metadata, type, category FROM listings WHERE id = $1',
            [id]
        );

        if (listingRes.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingRes.rows[0];
        const metadata = listing.metadata || {};
        const customTypeName = metadata.custom_product_type || listing.type;

        // Update listing to approved status
        await pool.query(
            `UPDATE listings 
             SET status = 'active',
                 metadata = metadata || $1
             WHERE id = $2`,
            [
                JSON.stringify({
                    custom_type_status: 'approved',
                    custom_type_approved_by: adminId,
                    custom_type_approved_at: new Date().toISOString()
                }),
                id
            ]
        );

        // Log admin action
        await logAdminAction(adminId, 'approve_custom_type', Number(id), {
            custom_type: customTypeName,
            previous_status: 'pending_verification',
            new_status: 'active'
        });

        res.json({
            message: 'Custom type approved successfully',
            listing_id: id,
            custom_type: customTypeName
        });
    } catch (error) {
        console.error('Error approving custom type:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reject a custom product type
export const rejectCustomType = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user?.id as number;

        // Get the listing first
        const listingRes = await pool.query(
            'SELECT id, metadata, type FROM listings WHERE id = $1',
            [id]
        );

        if (listingRes.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingRes.rows[0];
        const metadata = listing.metadata || {};
        const customTypeName = metadata.custom_product_type || listing.type;

        // Update listing to rejected status
        await pool.query(
            `UPDATE listings 
             SET status = 'rejected',
                 metadata = metadata || $1
             WHERE id = $2`,
            [
                JSON.stringify({
                    custom_type_status: 'rejected',
                    custom_type_rejected_by: adminId,
                    custom_type_rejected_at: new Date().toISOString(),
                    custom_type_rejection_reason: reason || 'Does not meet category requirements'
                }),
                id
            ]
        );

        // Log admin action
        await logAdminAction(adminId, 'reject_custom_type', Number(id), {
            custom_type: customTypeName,
            reason: reason || 'Does not meet category requirements'
        });

        res.json({
            message: 'Custom type rejected',
            listing_id: id,
            custom_type: customTypeName,
            reason: reason || 'Does not meet category requirements'
        });
    } catch (error) {
        console.error('Error rejecting custom type:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pending custom types count for admin dashboard
export const getPendingCustomTypesCount = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const result = await pool.query(`
            SELECT COUNT(*) as count
            FROM listings 
            WHERE metadata->>'custom_type_status' = 'pending_verification'
            OR (type = 'custom' AND status = 'pending_verification')
        `);

        res.json({ count: parseInt(result.rows[0].count, 10) });
    } catch (error) {
        console.error('Error fetching pending custom types count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
