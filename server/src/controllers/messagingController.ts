/**
 * Buyer-Seller Messaging System
 * Enables direct communication between buyers and vendors
 */

import { Request, Response } from 'express';
import { pool } from '../config/db';

// Start a conversation between buyer and seller
export const startConversation = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { recipient_id, listing_id, initial_message } = req.body;

        if (!recipient_id || !initial_message) {
            return res.status(400).json({ error: 'recipient_id and initial_message required' });
        }

        // Check if conversation already exists
        const existing = await pool.query(
            `SELECT id FROM conversations 
             WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)
             ORDER BY updated_at DESC LIMIT 1`,
            [user.id, recipient_id]
        );

        let conversationId;

        if (existing.rows.length > 0) {
            conversationId = existing.rows[0].id;
        } else {
            const result = await pool.query(
                `INSERT INTO conversations (user1_id, user2_id, listing_id)
                 VALUES ($1, $2, $3) RETURNING id`,
                [user.id, recipient_id, listing_id || null]
            );
            conversationId = result.rows[0].id;
        }

        // Add the initial message
        const messageResult = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content, is_read)
             VALUES ($1, $2, $3, FALSE) RETURNING *`,
            [conversationId, user.id, initial_message]
        );

        // Update conversation timestamp
        await pool.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
            [conversationId]
        );

        res.json({ 
            success: true, 
            conversation_id: conversationId,
            message: messageResult.rows[0]
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: 'Failed to start conversation' });
    }
};

// Get user's conversations
export const getConversations = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT 
                c.id, c.listing_id, c.created_at, c.updated_at,
                u.user_id as other_user_id, u.name as other_user_name, u.avatar_url as other_user_avatar,
                l.title as listing_title,
                (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != $1 AND is_read = FALSE) as unread_count
             FROM conversations c
             JOIN users u ON (CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END) = u.user_id
             LEFT JOIN listings l ON l.id = c.listing_id
             WHERE c.user1_id = $1 OR c.user2_id = $1
             ORDER BY c.updated_at DESC`,
            [user.id]
        );

        res.json({ conversations: result.rows });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ error: 'Failed to get conversations' });
    }
};

// Get messages in a conversation
export const getMessages = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { conversation_id } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        // Verify user is part of conversation
        const conversation = await pool.query(
            `SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [conversation_id, user.id]
        );

        if (conversation.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Mark messages as read
        await pool.query(
            `UPDATE messages SET is_read = TRUE 
             WHERE conversation_id = $1 AND sender_id != $2 AND is_read = FALSE`,
            [conversation_id, user.id]
        );

        const result = await pool.query(
            `SELECT m.*, u.name as sender_name, u.avatar_url as sender_avatar
             FROM messages m
             JOIN users u ON u.user_id = m.sender_id
             WHERE m.conversation_id = $1
             ORDER BY m.created_at DESC
             LIMIT $2 OFFSET $3`,
            [conversation_id, limit, offset]
        );

        res.json({ messages: result.rows.reverse() });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { conversation_id, content } = req.body;

        if (!conversation_id || !content) {
            return res.status(400).json({ error: 'conversation_id and content required' });
        }

        // Verify user is part of conversation
        const conversation = await pool.query(
            `SELECT * FROM conversations WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
            [conversation_id, user.id]
        );

        if (conversation.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const result = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content, is_read)
             VALUES ($1, $2, $3, FALSE) RETURNING *`,
            [conversation_id, user.id, content]
        );

        // Update conversation timestamp
        await pool.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = $1`,
            [conversation_id]
        );

        // Get recipient info for notification
        const recipientId = conversation.rows[0].user1_id === user.id 
            ? conversation.rows[0].user2_id 
            : conversation.rows[0].user1_id;

        // Send notification
        try {
            const { sendTemplatedPushNotification } = await import('../services/pushNotificationService');
            await sendTemplatedPushNotification(recipientId, 'new_message', {
                sender: user.name,
                message: content.substring(0, 50) + (content.length > 50 ? '...' : '')
            });
        } catch (e) { /* Push not available */ }

        // AI Auto-Reply: Check if recipient has AI auto-reply enabled
        try {
            const prefsResult = await pool.query(
                `SELECT preferences->'notifications'->'ai_auto_reply' as auto_reply 
                 FROM users WHERE user_id = $1`,
                [recipientId]
            );
            
            const autoReplyEnabled = prefsResult.rows[0]?.auto_reply === true;
            
            if (autoReplyEnabled && recipientId !== user.id) {
                // Trigger AI auto-reply (async, don't block response)
                setImmediate(async () => {
                    try {
                        const { chatWithAgent } = await import('../services/llmService');
                        const autoResponse = await chatWithAgent(
                            'customer_service',
                            `Auto-reply to: "${content}"`,
                            `auto-${conversation_id}-${Date.now()}`,
                            recipientId,
                            { role: 'system', source: 'auto_reply' }
                        );
                        
                        // Send auto-reply as message
                        await pool.query(
                            `INSERT INTO messages (conversation_id, sender_id, content, is_read, metadata)
                             VALUES ($1, $2, $3, FALSE, $4)`,
                            [conversation_id, recipientId, autoResponse.reply, { is_auto_reply: true }]
                        );
                        
                        console.log('[AI Auto-Reply] Sent response to user', recipientId);
                    } catch (err) {
                        console.error('[AI Auto-Reply] Failed:', err);
                    }
                });
            }
        } catch (e) { /* Ignore auto-reply errors */ }

        res.json({ success: true, message: result.rows[0] });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Delete conversation
export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { conversation_id } = req.params;

        const result = await pool.query(
            `DELETE FROM conversations 
             WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
             RETURNING id`,
            [conversation_id, user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Delete associated messages
        await pool.query(
            `DELETE FROM messages WHERE conversation_id = $1`,
            [conversation_id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ error: 'Failed to delete conversation' });
    }
};

// Get unread message count
export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;

        const result = await pool.query(
            `SELECT COUNT(*) as count FROM messages m
             JOIN conversations c ON c.id = m.conversation_id
             WHERE (c.user1_id = $1 OR c.user2_id = $1)
             AND m.sender_id != $1 AND m.is_read = FALSE`,
            [user.id]
        );

        res.json({ unread: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Failed to get unread count' });
    }
};

export default {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    deleteConversation,
    getUnreadCount
};