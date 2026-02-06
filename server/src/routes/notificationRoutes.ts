import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { registerClient, getConnectionStats } from '../services/notificationService';
import { authenticateJWT } from '../middleware/authMiddleware';

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
