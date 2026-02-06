import { Request, Response } from 'express';
import { pool } from '../config/db';
import { notifyUser } from '../services/notificationService';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const senderId = (req.user as any)?.id;
        const { receiver_id, content, attachment_url, order_id } = req.body;

        if (!senderId) return res.status(401).json({ message: 'Unauthorized' });
        if (!content && !attachment_url) return res.status(400).json({ message: 'Message content or attachment is required' });

        const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, content, attachment_url, order_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [senderId, receiver_id, content, attachment_url, order_id]
        );

        const message = result.rows[0];

        // Send real-time notification to receiver
        notifyUser(receiver_id, 'new_message', {
            messageId: message.message_id,
            senderId: senderId,
            content: content?.substring(0, 50) + (content?.length > 50 ? '...' : ''),
            orderId: order_id,
            message: 'New message received'
        });

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// Get messages for a specific delivery/job
export const getDeliveryMessages = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { deliveryId } = req.params;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Verify user is part of this delivery (either customer or driver)
        const delivery = await pool.query(
            `SELECT creator_id, driver_id FROM listings WHERE id = $1`,
            [deliveryId]
        );

        if (delivery.rows.length === 0) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        const { creator_id, driver_id } = delivery.rows[0];
        if (userId !== creator_id && userId !== driver_id) {
            return res.status(403).json({ message: 'Not authorized to view these messages' });
        }

        const messages = await pool.query(
            `SELECT m.*, u.name as sender_name, u.profile_photo_url as sender_avatar
             FROM messages m
             JOIN users u ON m.sender_id = u.user_id
             WHERE m.order_id = $1
             ORDER BY m.created_at ASC`,
            [deliveryId]
        );

        res.json(messages.rows);
    } catch (error) {
        console.error('Get delivery messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

export const getConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { otherUserId } = req.params;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const messages = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1) 
             ORDER BY created_at ASC`,
            [userId, otherUserId]
        );

        res.json(messages.rows);
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

export const getMyConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Get unique users I have chatted with, joining with users table to get names
        const result = await pool.query(
            `SELECT DISTINCT ON (other_user_id) 
                CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as other_user_id,
                u.name as other_user_name,
                m.content as last_message,
                m.created_at as last_message_at
             FROM messages m
             JOIN users u ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END) = u.user_id
             WHERE m.sender_id = $1 OR m.receiver_id = $1
             ORDER BY other_user_id, m.created_at DESC`,
            [userId]
        );

        res.json(result.rows.sort((a: any, b: any) =>
            new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        ));
    } catch (error) {
        console.error('Get my conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};
