import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { registerClient, getConnectionStats } from '../services/notificationService';
import { authenticateJWT } from '../middleware/authMiddleware';
import { pool } from '../config/db';

const router = Router();

// Custom auth for SSE (supports token in query param)
const sseAuth = (req: Request, res: Response, next: NextFunction) => {
    // Try header first
    let token = req.headers.authorization?.split(' ')[1];

    // Fall back to query param (for EventSource which can't set headers)
    if (!token && req.query.token) {
        token = req.query.token as string;
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = user as { id: number; role: string };
        next();
    });
};

/**
 * GET /api/notifications/stream
 * SSE endpoint for real-time notifications
 */
router.get('/stream', sseAuth, (req: Request, res: Response) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Determine if user is a driver
    const isDriver = userRole === 'driver' || req.query.mode === 'driver';

    // Register this client for SSE
    registerClient(userId, res, isDriver);

    // Keep connection alive with heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
        try {
            res.write(`: heartbeat\n\n`);
        } catch (error) {
            clearInterval(heartbeat);
        }
    }, 30000);

    // Clean up on close
    res.on('close', () => {
        clearInterval(heartbeat);
    });
});

/**
 * GET /api/notifications
 * Get paginated notification history for the authenticated user
 */
router.get('/', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        const unreadCount = await pool.query(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        res.json({
            notifications: result.rows,
            unread_count: parseInt(unreadCount.rows[0].count),
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
});

/**
 * GET /api/notifications/unread-count
 * Quick endpoint to get just the unread badge count
 */
router.get('/unread-count', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await pool.query(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        // Table may not exist yet - return 0 gracefully
        res.json({ count: 0 });
    }
});

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read
 */
router.patch('/:id/read', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
});

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read for the user
 */
router.patch('/read-all', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        await pool.query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`,
            [userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({ message: 'Failed to mark all as read' });
    }
});

/**
 * GET /api/notifications/stats
 * Get connection statistics (admin only)
 */
router.get('/stats', authenticateJWT, (req: Request, res: Response) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }

    res.json(getConnectionStats());
});

export default router;
