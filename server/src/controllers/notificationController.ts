import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

interface NotificationData {
    userId: number;
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
}

// Helper function to create notifications (used by other controllers)
export const createNotification = async (notification: NotificationData) => {
    try {
        await pool.query(
            `INSERT INTO notifications (user_id, type, title, body, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [notification.userId, notification.type, notification.title, notification.body, JSON.stringify(notification.data)]
        );
        return true;
    } catch (error) {
        console.error('Create notification error:', error);
        return false;
    }
};

// @desc    Get user notifications
// @access  Private
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { limit = 20, offset = 0, unread_only = false } = req.query;

        let query = `
            SELECT * FROM notifications 
            WHERE user_id = $1
        `;

        if (unread_only === 'true') {
            query += ' AND is_read = FALSE';
        }

        query += ' ORDER BY created_at DESC LIMIT $2 OFFSET $3';

        const result = await pool.query(query, [userId, limit, offset]);

        // Get unread count
        const unreadCount = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.json({
            notifications: result.rows,
            unread_count: parseInt(unreadCount.rows[0].count)
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// @desc    Mark notification as read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE notification_id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Failed to mark notification as read' });
    }
};

// @desc    Mark all notifications as read
// @access  Private
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        await pool.query(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = $1',
            [userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Failed to mark notifications as read' });
    }
};

// @desc    Delete a notification
// @access  Private
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Failed to delete notification' });
    }
};

// @desc    Get unread notification count
// @access  Private
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;

        const result = await pool.query(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
            [userId]
        );

        res.json({ unread_count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
};

