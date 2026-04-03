import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getComplianceRequirements = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM compliance_requirements ORDER BY display_order'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Get requirements error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getVendorCompliance = async (req: Request, res: Response) => {
    try {
        const vendorId = parseInt(req.params.vendorId);
        
        // Get vendor's compliance status
        const result = await pool.query(
            `SELECT vc.*, cr.name, cr.description, cr.category, cr.is_required
             FROM vendor_compliance vc
             JOIN compliance_requirements cr ON vc.requirement_id = cr.id
             WHERE vc.vendor_id = $1
             ORDER BY cr.display_order`,
            [vendorId]
        );

        // Get requirements that haven't been started yet
        const notStarted = await pool.query(
            `SELECT cr.* FROM compliance_requirements cr
             WHERE cr.id NOT IN (
                 SELECT requirement_id FROM vendor_compliance WHERE vendor_id = $1
             )
             ORDER BY cr.display_order`,
            [vendorId]
        );

        res.json({
            inProgress: result.rows,
            notStarted: notStarted.rows
        });
    } catch (error) {
        console.error('Get vendor compliance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const submitComplianceDocument = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { requirementId, documentUrl } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get vendor ID from user
        const vendorResult = await pool.query(
            'SELECT id FROM vendors WHERE user_id = $1',
            [userId]
        );
        
        if (vendorResult.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        const vendorId = vendorResult.rows[0].id;

        // Upsert compliance record
        await pool.query(
            `INSERT INTO vendor_compliance (vendor_id, requirement_id, status, document_url, submitted_at)
             VALUES ($1, $2, 'submitted', $3, NOW())
             ON CONFLICT (vendor_id, requirement_id) 
             DO UPDATE SET status = 'submitted', document_url = $3, submitted_at = NOW(), updated_at = NOW()`,
            [vendorId, requirementId, documentUrl]
        );

        // Log the action
        await pool.query(
            `INSERT INTO compliance_audit_log (vendor_id, action, requirement_id, user_id)
             VALUES ($1, 'submitted', $2, $3)`,
            [vendorId, requirementId, userId]
        );

        res.json({ success: true, message: 'Document submitted' });
    } catch (error) {
        console.error('Submit compliance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const reviewCompliance = async (req: Request, res: Response) => {
    try {
        const { complianceId } = req.params;
        const { status, rejectionReason, notes } = req.body;
        const adminId = req.user?.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE vendor_compliance 
             SET status = $1, reviewed_at = NOW(), reviewed_by = $2, 
                 rejection_reason = $3, notes = $4, updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [status, adminId, rejectionReason, notes, complianceId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compliance record not found' });
        }

        // Log the action
        await pool.query(
            `INSERT INTO compliance_audit_log (vendor_id, action, requirement_id, user_id, details)
             VALUES ($1, $2, $3, $4, $5)`,
            [result.rows[0].vendor_id, status, result.rows[0].requirement_id, adminId, notes]
        );

        res.json({ success: true, message: `Compliance ${status}` });
    } catch (error) {
        console.error('Review compliance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPendingComplianceReview = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT vc.*, v.business_name, u.name as owner_name, u.email, cr.name as requirement_name
             FROM vendor_compliance vc
             JOIN vendors v ON vc.vendor_id = v.id
             JOIN users u ON v.user_id = u.user_id
             JOIN compliance_requirements cr ON vc.requirement_id = cr.id
             WHERE vc.status = 'submitted'
             ORDER BY vc.submitted_at ASC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get pending compliance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getVendorComplianceSummary = async (req: Request, res: Response) => {
    try {
        const vendorId = parseInt(req.params.vendorId);

        const stats = await pool.query(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as not_started
             FROM vendor_compliance 
             WHERE vendor_id = $1`,
            [vendorId]
        );

        const requiredCount = await pool.query(
            `SELECT COUNT(*) FROM compliance_requirements WHERE is_required = TRUE`
        );

        const row = stats.rows[0];
        const total = parseInt(row.total) + parseInt(row.not_started || 0);
        const approved = parseInt(row.approved);
        const required = parseInt(requiredCount.rows[0].count);
        const isCompliant = approved >= required;

        res.json({
            total,
            approved,
            pending: parseInt(row.pending),
            rejected: parseInt(row.rejected),
            notStarted: parseInt(row.not_started || 0),
            required,
            isCompliant,
            percentage: total > 0 ? Math.round((approved / total) * 100) : 0
        });
    } catch (error) {
        console.error('Get compliance summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
