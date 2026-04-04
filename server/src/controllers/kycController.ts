import { Request, Response } from 'express';
import { pool } from '../config/db';
import { notifyUser } from '../services/notificationService';
import { EmailService } from '../services/emailService';

export const submitKYC = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { documents } = req.body; // Expecting { permission_slip: url, id_card: url, etc. }

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Get vendor ID from user ID
        const vendorResult = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }
        const vendorId = vendorResult.rows[0].id;

        // Check if pending submission exists
        const pending = await pool.query('SELECT kyc_id FROM vendor_kyc WHERE vendor_id = $1 AND status = $2', [vendorId, 'pending']);
        if (pending.rows.length > 0) {
            return res.status(400).json({ message: 'A KYC submission is already pending review.' });
        }

        // Create submission
        const result = await pool.query(
            `INSERT INTO vendor_kyc (vendor_id, documents, status)
             VALUES ($1, $2, 'pending')
             RETURNING *`,
            [vendorId, JSON.stringify(documents)]
        );

        // Update vendor status
        await pool.query("UPDATE vendors SET kyc_status = 'pending' WHERE id = $1", [vendorId]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Submit KYC error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getKYCStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const vendorResult = await pool.query('SELECT id, kyc_status FROM vendors WHERE user_id = $1', [userId]);
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }
        const vendor = vendorResult.rows[0];

        // Get latest submission details
        const kycResult = await pool.query(
            'SELECT * FROM vendor_kyc WHERE vendor_id = $1 ORDER BY submitted_at DESC LIMIT 1',
            [vendor.id]
        );

        res.json({
            vendorId: vendor.id,
            status: vendor.kyc_status,
            submission: kycResult.rows[0] || null
        });
    } catch (error) {
        console.error('Get KYC Status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const reviewKYC = async (req: Request, res: Response) => {
    try {
        const { kycId } = req.params;
        const { status, notes } = req.body; // status: 'approved' | 'rejected'
        const adminId = req.user?.id; // Assuming only admins hit this

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const kycResult = await pool.query('SELECT * FROM vendor_kyc WHERE kyc_id = $1', [kycId]);
        if (kycResult.rows.length === 0) {
            return res.status(404).json({ message: 'KYC submission not found' });
        }
        const kyc = kycResult.rows[0];

        // Update KYC record
        await pool.query(
            `UPDATE vendor_kyc 
             SET status = $1, reviewed_at = NOW()
             WHERE kyc_id = $2`,
            [status, kycId]
        );

        // Update Vendor Status
        await pool.query(
            `UPDATE vendors SET kyc_status = $1 WHERE id = $2`,
            [status, kyc.vendor_id]
        );

        // If approved, maybe notify vendor? (Hook into EmailService later)

        res.json({ message: `KYC submission ${status}` });
    } catch (error) {
        console.error('Review KYC error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllPendingKYC = async (req: Request, res: Response) => {
    try {
        // Join with vendors and users to get names
        const result = await pool.query(`
            SELECT k.*, v.business_name, u.name as owner_name, u.email
            FROM vendor_kyc k
            JOIN vendors v ON k.vendor_id = v.id
            JOIN users u ON v.user_id = u.user_id
            WHERE k.status = 'pending'
            ORDER BY k.submitted_at ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error('Get all pending KYC error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const approveKYC = async (req: Request, res: Response) => {
    try {
        const { kycId } = req.params;
        const adminId = req.user?.id;

        const kycResult = await pool.query('SELECT * FROM vendor_kyc WHERE kyc_id = $1', [kycId]);
        if (kycResult.rows.length === 0) {
            return res.status(404).json({ message: 'KYC submission not found' });
        }
        const kyc = kycResult.rows[0];

        // Update KYC record to approved
        await pool.query(
            `UPDATE vendor_kyc 
             SET status = 'approved', reviewed_at = NOW(), reviewed_by = $1
             WHERE kyc_id = $2`,
            [adminId, kycId]
        );

        // Update vendor KYC status and activate vendor
        await pool.query(
            `UPDATE vendors SET 
                kyc_status = 'approved', 
                status = 'active',
                kyb_verified = TRUE,
                verified_at = NOW(),
                verified_by = $1
             WHERE id = $2`,
            [adminId, kyc.vendor_id]
        );

        // Get user info for notifications
        const userResult = await pool.query(
            'SELECT u.email, u.name, u.user_id FROM users u JOIN vendors v ON v.user_id = u.user_id WHERE v.id = $1',
            [kyc.vendor_id]
        );

        // Send real-time notification
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            notifyUser(user.user_id, 'kyc_approved', {
                message: 'Your KYC has been verified! You now have full vendor access.',
                timestamp: new Date().toISOString()
            });
            
            // Send email notification
            await EmailService.sendKYCApprovedEmail(user.email, user.name);
        }

        res.json({ message: 'KYC approved successfully' });
    } catch (error) {
        console.error('Approve KYC error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const rejectKYC = async (req: Request, res: Response) => {
    try {
        const { kycId } = req.params;
        const { reason } = req.body;
        const adminId = req.user?.id;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const kycResult = await pool.query('SELECT * FROM vendor_kyc WHERE kyc_id = $1', [kycId]);
        if (kycResult.rows.length === 0) {
            return res.status(404).json({ message: 'KYC submission not found' });
        }
        const kyc = kycResult.rows[0];

        // Update KYC record to rejected
        await pool.query(
            `UPDATE vendor_kyc 
             SET status = 'rejected', reviewed_at = NOW(), reviewed_by = $1, rejection_reason = $2
             WHERE kyc_id = $3`,
            [adminId, reason, kycId]
        );

        // Update vendor KYC status
        await pool.query(
            `UPDATE vendors SET 
                kyc_status = 'rejected',
                status = 'rejected'
             WHERE id = $1`,
            [kyc.vendor_id]
        );

        // Get user info for notifications
        const userResult = await pool.query(
            'SELECT u.email, u.name, u.user_id FROM users u JOIN vendors v ON v.user_id = u.user_id WHERE v.id = $1',
            [kyc.vendor_id]
        );

        // Send real-time notification
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            notifyUser(user.user_id, 'kyc_rejected', {
                message: `Your KYC was rejected. Reason: ${reason}`,
                timestamp: new Date().toISOString()
            });
            
            // Send email notification
            await EmailService.sendKYCRejectedEmail(user.email, user.name, reason);
        }

        res.json({ message: 'KYC rejected' });
    } catch (error) {
        console.error('Reject KYC error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
