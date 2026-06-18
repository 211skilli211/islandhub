import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
    startConversation,
    getConversations,
    getMessages,
    sendMessage,
    deleteConversation,
    getUnreadCount
} from '../controllers/messagingController';

const router = Router();

// Start a new conversation
router.post('/conversations', authenticateJWT, startConversation);

// Get all conversations for user
router.get('/conversations', authenticateJWT, getConversations);

// Get messages in a conversation
router.get('/conversations/:conversation_id/messages', authenticateJWT, getMessages);

// Send a message
router.post('/messages', authenticateJWT, sendMessage);

// Delete a conversation
router.delete('/conversations/:conversation_id', authenticateJWT, deleteConversation);

// Get unread message count
router.get('/messages/unread', authenticateJWT, getUnreadCount);

export default router;