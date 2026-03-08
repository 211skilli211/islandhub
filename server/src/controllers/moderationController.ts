import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

// @desc    Report content
// @access  Private
export const reportContent = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { content_type, content_id, reason, description } = req.body;

        if (!content_type || !content_id || !reason) {
            return res.status(400).json({ message: 'content_type, content_id, and reason are required' });
        }

        const result = await pool.query(
            `INSERT INTO content_reports (reporter_id, content_type, content_id, reason, description)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, content_type, content_id, reason, description]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Report content error:', error);
        res.status(500).json({ message: 'Failed to submit report' });
    }
};

// @desc    Block a user
// @access  Private
export const blockUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { userId: blockedUserId } = req.params;
        const { reason } = req.body;

        // Can't block yourself
        if (parseInt(blockedUserId) === userId) {
            return res.status(400).json({ message: 'Cannot block yourself' });
        }

        await pool.query(
            'INSERT INTO user_blocks (blocker_id, blocked_id, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [userId, blockedUserId, reason]
        );

        res.json({ success: true, message: 'User blocked' });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: 'Failed to block user' });
    }
};

// @desc    Unblock a user
// @access  Private
export const unblockUser = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { userId: blockedUserId } = req.params;

        await pool.query(
            'DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2',
            [userId, blockedUserId]
        );

        res.json({ success: true, message: 'User unblocked' });
    } catch (error) {
        console.error('Unblock user error:', error);
        res.status(500).json({ message: 'Failed to unblock user' });
    }
};

// @desc    Get blocked users
// @access  Private
export const getBlockedUsers = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            `SELECT ub.*, u.name as blocked_name, u.profile_photo_url as blocked_photo
             FROM user_blocks ub
             JOIN users u ON ub.blocked_id = u.user_id
             WHERE ub.blocker_id = $1
             ORDER BY ub.created_at DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get blocked users error:', error);
        res.status(500).json({ message: 'Failed to fetch blocked users' });
    }
};

// @desc    Get reports (admin only)
// @access  Private (admin)
export const getReports = async (req: Request, res: Response) => {
    try {
        const userRole = (req.user as any)?.role;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { status, limit = 20, offset = 0 } = req.query;

        let query = `
            SELECT cr.*, u.name as reporter_name
            FROM content_reports cr
            JOIN users u ON cr.reporter_id = u.user_id
        `;

        const params: any[] = [];

        if (status) {
            query += ' WHERE cr.status = $1';
            params.push(status);
        }

        query += ' ORDER BY cr.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get counts
        const countResult = await pool.query(
            'SELECT status, COUNT(*) as count FROM content_reports GROUP BY status'
        );

        res.json({
            reports: result.rows,
            counts: countResult.rows
        });
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: 'Failed to fetch reports' });
    }
};

// @desc    Review a report
// @access  Private (admin)
export const reviewReport = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role;
        const { id } = req.params;
        const { status, review_notes } = req.body;

        if (userRole !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await pool.query(
            `UPDATE content_reports 
             SET status = $1, reviewed_by = $2, review_notes = $3, updated_at = CURRENT_TIMESTAMP
             WHERE report_id = $4 RETURNING *`,
            [status, userId, review_notes, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Log moderation action
        await pool.query(
            `INSERT INTO moderation_logs (moderator_id, action, content_type, content_id, reason, details)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, 'review_report', result.rows[0].content_type, result.rows[0].content_id, status, JSON.stringify(review_notes)]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Review report error:', error);
        res.status(500).json({ message: 'Failed to review report' });
    }
};

