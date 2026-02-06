import { Request, Response } from 'express';
import { pool } from '../config/db';

// Log admin action helper
const logAdminAction = async (adminId: number, action: string, targetId?: number | string, details?: any) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, record_id, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [adminId, action, targetId, details ? JSON.stringify(details) : null, null, null]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
    }
};

// Get pending vendors for admin verification
export const getPendingVendors = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status as string || 'pending';

        // Get vendors with status filter
        const query = `
            SELECT v.*, u.name as owner_name, u.email as owner_email, 
                   s.name as store_name, s.category as store_category, s.logo_url as store_logo
            FROM vendors v
            LEFT JOIN users u ON v.user_id = u.user_id
            LEFT JOIN stores s ON v.user_id = s.vendor_id
            WHERE v.status = $1
            ORDER BY v.created_at DESC
            LIMIT $2 OFFSET $3
        `;

        const countQuery = 'SELECT COUNT(*) FROM vendors WHERE status = $1';

        const result = await pool.query(query, [status, limit, offset]);
        const countResult = await pool.query(countQuery, [status]);

        res.json({
            vendors: result.rows,
            pagination: {
                page,
                limit,
                total: parseInt(countResult.rows[0].count),
                totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching pending vendors:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Approve vendor (activate vendor and store)
export const approveVendor = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { vendorId } = req.params;
        const { notes } = req.body;
        const adminId = (req as any).user?.id;

        await client.query('BEGIN');

        // Get vendor info
        const vendorRes = await client.query(
            'SELECT v.*, s.store_id FROM vendors v LEFT JOIN stores s ON v.user_id = s.vendor_id WHERE v.id = $1',
            [vendorId]
        );

        if (vendorRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const vendor = vendorRes.rows[0];

        // Update vendor status to active and mark KYB verified
        await client.query(
            `UPDATE vendors SET 
                status = 'active', 
                kyb_verified = TRUE, 
                admin_notes = COALESCE($1, admin_notes),
                verified_at = NOW(),
                verified_by = $2
            WHERE id = $3`,
            [notes, adminId, vendorId]
        );

        // Update store status to active
        if (vendor.store_id) {
            await client.query(
                'UPDATE stores SET status = $1 WHERE store_id = $2',
                ['active', vendor.store_id]
            );
        }

        // Log admin action
        await logAdminAction(adminId, 'vendor_approved', vendorId, {
            vendor_name: vendor.business_name,
            store_id: vendor.store_id,
            notes
        });

        await client.query('COMMIT');

        res.json({
            message: 'Vendor approved successfully',
            vendor: {
                id: vendorId,
                status: 'active',
                kyb_verified: true
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error approving vendor:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// Reject vendor
export const rejectVendor = async (req: Request, res: Response) => {
    const client = await pool.connect();
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { vendorId } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?.id;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        await client.query('BEGIN');

        // Get vendor info
        const vendorRes = await client.query(
            'SELECT v.*, s.store_id FROM vendors v LEFT JOIN stores s ON v.user_id = s.vendor_id WHERE v.id = $1',
            [vendorId]
        );

        if (vendorRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const vendor = vendorRes.rows[0];

        // Update vendor status to rejected
        await client.query(
            `UPDATE vendors SET 
                status = 'rejected', 
                admin_notes = $1,
                rejected_at = NOW(),
                rejected_by = $2
            WHERE id = $3`,
            [reason, adminId, vendorId]
        );

        // Log admin action
        await logAdminAction(adminId, 'vendor_rejected', vendorId, {
            vendor_name: vendor.business_name,
            reason,
            store_id: vendor.store_id
        });

        await client.query('COMMIT');

        res.json({
            message: 'Vendor rejected',
            vendor: {
                id: vendorId,
                status: 'rejected'
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error rejecting vendor:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        client.release();
    }
};

// Toggle vendor active status
export const toggleVendorStatus = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { vendorId } = req.params;
        const { status } = req.body; // 'active' or 'suspended'
        const adminId = (req as any).user?.id;

        if (!['active', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Update vendor status
        const result = await pool.query(
            'UPDATE vendors SET status = $1 WHERE id = $2 RETURNING *',
            [status, vendorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Also update store status
        await pool.query(
            'UPDATE stores SET status = $1 WHERE vendor_id = (SELECT user_id FROM vendors WHERE id = $2)',
            [status, vendorId]
        );

        // Log admin action
        await logAdminAction(adminId, `vendor_${status}`, vendorId, { status });

        res.json({
            message: `Vendor ${status}`,
            vendor: result.rows[0]
        });
    } catch (error) {
        console.error('Error toggling vendor status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
