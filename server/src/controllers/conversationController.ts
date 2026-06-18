import { Request, Response } from 'express';
// sync ts server
import { pool } from '../config/db';

// @desc    Get user's conversations
// @access  Private
export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { limit = 20, offset = 0 } = req.query;

        const result = await pool.query(
            `SELECT c.*, 
                    cp.role as user_role,
                    u.name as other_user_name,
                    u.profile_photo_url as other_user_photo,
                    (SELECT content FROM messages WHERE conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message,
                    (SELECT created_at FROM messages WHERE conversation_id = c.conversation_id ORDER BY created_at DESC LIMIT 1) as last_message_at,
                    (SELECT COUNT(*) FROM messages m JOIN conversation_participants cp2 ON m.conversation_id = cp2.conversation_id WHERE cp2.user_id = $1 AND m.conversation_id = c.conversation_id AND (m.is_read = FALSE OR m.user_id != $1) AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')) as unread_count
             FROM conversations c
             JOIN conversation_participants cp ON c.conversation_id = cp.conversation_id AND cp.user_id = $1
             LEFT JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id AND cp2.user_id != $1
             LEFT JOIN users u ON cp2.user_id = u.user_id
             WHERE c.is_archived = FALSE
             ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

// @desc    Get conversation details and messages
// @access  Private
export const getConversation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { limit = 50, before } = req.query;

        // Check if user is participant
        const participantCheck = await pool.query(
            'SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized to view this conversation' });
        }

        // Get conversation details
        const conversationResult = await pool.query(
            'SELECT * FROM conversations WHERE conversation_id = $1',
            [id]
        );

        // Get messages
        let messagesQuery = `
            SELECT m.*, u.name as sender_name, u.profile_photo_url as sender_photo
            FROM messages m
            JOIN users u ON m.sender_id = u.user_id
            WHERE m.conversation_id = $1
        `;

        const params: any[] = [id];

        if (before) {
            messagesQuery += ' AND m.created_at < $2';
            params.push(before);
        }

        messagesQuery += ' ORDER BY m.created_at DESC LIMIT $' + (params.length + 1);
        params.push(limit);

        const messagesResult = await pool.query(messagesQuery, params);

        // Get participants
        const participantsResult = await pool.query(
            `SELECT cp.*, u.name, u.profile_photo_url
             FROM conversation_participants cp
             JOIN users u ON cp.user_id = u.user_id
             WHERE cp.conversation_id = $1`,
            [id]
        );

        res.json({
            conversation: conversationResult.rows[0],
            messages: messagesResult.rows,
            participants: participantsResult.rows
        });
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ message: 'Failed to fetch conversation' });
    }
};

// @desc    Create or get direct conversation
// @access  Private
export const createConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { recipient_id, group_name } = req.body;

        if (recipient_id) {
            // Check if conversation already exists
            const existingResult = await pool.query(
                `SELECT c.conversation_id FROM conversations c
                 JOIN conversation_participants cp1 ON c.conversation_id = cp1.conversation_id
                 JOIN conversation_participants cp2 ON c.conversation_id = cp2.conversation_id
                 WHERE c.type = 'direct' AND cp1.user_id = $1 AND cp2.user_id = $2`,
                [userId, recipient_id]
            );

            if (existingResult.rows.length > 0) {
                return res.json({ conversation_id: existingResult.rows[0].conversation_id, existing: true });
            }

            // Create new direct conversation
            const newConvResult = await pool.query(
                'INSERT INTO conversations (type, created_by) VALUES ($1, $2) RETURNING *',
                ['direct', userId]
            );
            const conversationId = newConvResult.rows[0].conversation_id;

            // Add participants
            await pool.query(
                'INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2), ($1, $3)',
                [conversationId, userId, recipient_id]
            );

            return res.status(201).json({ conversation_id: conversationId, existing: false });
        } else if (group_name) {
            // Create group conversation
            const newConvResult = await pool.query(
                'INSERT INTO conversations (type, name, created_by) VALUES ($1, $2, $3) RETURNING *',
                ['group', group_name, userId]
            );
            const conversationId = newConvResult.rows[0].conversation_id;

            // Add creator as admin
            await pool.query(
                'INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES ($1, $2, $3)',
                [conversationId, userId, 'admin']
            );

            return res.status(201).json({ conversation_id: conversationId });
        }

        res.status(400).json({ message: 'recipient_id or group_name required' });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ message: 'Failed to create conversation' });
    }
};

// @desc    Send message to conversation
// @access  Private
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;
        const { content, media_url } = req.body;

        if (!content && !media_url) {
            return res.status(400).json({ message: 'Content or media_url required' });
        }

        // Check if user is participant
        const participantCheck = await pool.query(
            'SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [id, userId]
        );

        if (participantCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Not authorized to send to this conversation' });
        }

        // Create message
        const result = await pool.query(
            'INSERT INTO messages (conversation_id, sender_id, content, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, userId, content, media_url]
        );

        // Update conversation last_message_at
        await pool.query(
            'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE conversation_id = $1',
            [id]
        );

        // Get sender info
        const senderResult = await pool.query(
            'SELECT name, profile_photo_url FROM users WHERE user_id = $1',
            [userId]
        );

        const message = {
            ...result.rows[0],
            sender_name: senderResult.rows[0]?.name,
            sender_photo: senderResult.rows[0]?.profile_photo_url
        };

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
};

// @desc    Mark conversation as read
// @access  Private
export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2',
            [id, userId]
        );

        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Failed to mark as read' });
    }
};

// @desc    Archive conversation
// @access  Private
export const archiveConversation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        await pool.query(
            'UPDATE conversations SET is_archived = TRUE WHERE conversation_id = $1 AND EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2)',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Archive conversation error:', error);
        res.status(500).json({ message: 'Failed to archive conversation' });
    }
};

// @desc    Delete conversation
// @access  Private
export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req.user as any)?.id;

        // Remove user from conversation
        await pool.query(
            'DELETE FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
            [id, userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ message: 'Failed to delete conversation' });
    }
};

