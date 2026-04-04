import { Request, Response } from 'express';
import { pool } from '../config/db';

interface ModerationResult {
    flagged: boolean;
    categories: {
        hate: boolean;
        harassment: boolean;
        violence: boolean;
        sexual: boolean;
        selfHarm: boolean;
        spam: boolean;
        misinformation: boolean;
    };
    categoryScores: {
        hate: number;
        harassment: number;
        violence: number;
        sexual: number;
        selfHarm: number;
        spam: number;
        misinformation: number;
    };
}

export const moderateContent = async (content: string): Promise<ModerationResult> => {
    const lowerContent = content.toLowerCase();
    
    const spamKeywords = ['buy now', 'click here', 'free money', 'winner', 'congratulations', 'act now'];
    const violenceKeywords = ['kill', 'attack', 'bomb', 'weapon', 'gun'];
    const hateKeywords = ['hate', 'stupid', 'idiot', 'die'];
    
    const flaggedCategories = {
        hate: hateKeywords.some(k => lowerContent.includes(k)),
        harassment: false,
        violence: violenceKeywords.some(k => lowerContent.includes(k)),
        sexual: false,
        selfHarm: false,
        spam: spamKeywords.some(k => lowerContent.includes(k)),
        misinformation: false
    };

    return {
        flagged: Object.values(flaggedCategories).some(v => v),
        categories: flaggedCategories,
        categoryScores: {
            hate: flaggedCategories.hate ? 0.9 : 0.1,
            harassment: 0.1,
            violence: flaggedCategories.violence ? 0.9 : 0.1,
            sexual: 0.1,
            selfHarm: 0.1,
            spam: flaggedCategories.spam ? 0.8 : 0.1,
            misinformation: 0.1
        }
    };
};

export const checkTextContent = async (req: Request, res: Response) => {
    try {
        const { content, type, referenceId } = req.body;
        const userId = req.user?.id;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const result = await moderateContent(content);

        await pool.query(
            `INSERT INTO content_moderation_logs (user_id, content_type, reference_id, content, is_flagged, categories, scores)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userId, type || 'text', referenceId || null, content.substring(0, 500), 
             result.flagged, JSON.stringify(result.categories), JSON.stringify(result.categoryScores)]
        );

        res.json({
            success: true,
            flagged: result.flagged,
            categories: result.categories,
            scores: result.categoryScores,
            action: result.flagged ? 'review' : 'approved'
        });
    } catch (error) {
        console.error('Content moderation error:', error);
        res.status(500).json({ message: 'Moderation check failed' });
    }
};

export const moderateListing = async (req: Request, res: Response) => {
    try {
        const { listingId } = req.params;
        
        const listingResult = await pool.query(
            'SELECT title, description, images FROM listings WHERE id = $1',
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingResult.rows[0];
        
        const titleResult = await moderateContent(listing.title);
        const descResult = await moderateContent(listing.description || '');

        const isFlagged = titleResult.flagged || descResult.flagged;

        await pool.query(
            `UPDATE listings 
             SET moderation_status = $1, 
                 moderation_notes = $2,
                 moderated_at = NOW()
             WHERE id = $3`,
            [isFlagged ? 'flagged' : 'approved', 
             isFlagged ? `Title: ${titleResult.flagged ? 'flagged' : 'ok'}, Description: ${descResult.flagged ? 'flagged' : 'ok'}` : null,
             listingId]
        );

        res.json({
            success: true,
            listingId: parseInt(listingId),
            flagged: isFlagged,
            issues: [
                ...(titleResult.flagged ? [{ field: 'title', categories: titleResult.categories }] : []),
                ...(descResult.flagged ? [{ field: 'description', categories: descResult.categories }] : [])
            ]
        });
    } catch (error) {
        console.error('Listing moderation error:', error);
        res.status(500).json({ message: 'Failed to moderate listing' });
    }
};

export const autoModerateListings = async (req: Request, res: Response) => {
    try {
        const limit = parseInt(req.query.limit as string) || 50;
        
        const listings = await pool.query(
            `SELECT id, title, description FROM listings 
             WHERE moderation_status IS NULL OR moderation_status = 'pending'
             LIMIT $1`,
            [limit]
        );

        const results = [];
        
        for (const listing of listings.rows) {
            const result = await moderateContent(`${listing.title} ${listing.description || ''}`);
            
            await pool.query(
                `UPDATE listings 
                 SET moderation_status = $1, moderated_at = NOW()
                 WHERE id = $2`,
                [result.flagged ? 'flagged' : 'approved', listing.id]
            );

            results.push({ listingId: listing.id, flagged: result.flagged });
        }

        res.json({
            success: true,
            processed: results.length,
            flagged: results.filter(r => r.flagged).length,
            results
        });
    } catch (error) {
        console.error('Auto-moderation error:', error);
        res.status(500).json({ message: 'Auto-moderation failed' });
    }
};

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

