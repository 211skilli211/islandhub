import { Router } from 'express';
// refresh
// refresh
import {
    getConversations,
    getConversation,
    createConversation,
    sendMessage,
    markAsRead,
    archiveConversation,
    deleteConversation
} from '../controllers/conversationController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/conversations
// @desc    Get user's conversations
// @access  Private
router.get('/', authenticateJWT, getConversations);

// @route   GET /api/conversations/:id
// @desc    Get conversation details and messages
// @access  Private
router.get('/:id', authenticateJWT, getConversation);

// @route   POST /api/conversations
// @desc    Create or get direct conversation
// @access  Private
router.post('/', authenticateJWT, createConversation);

// @route   POST /api/conversations/:id/messages
// @desc    Send message to conversation
// @access  Private
router.post('/:id/messages', authenticateJWT, sendMessage);

// @route   PATCH /api/conversations/:id/read
// @desc    Mark conversation as read
// @access  Private
router.patch('/:id/read', authenticateJWT, markAsRead);

// @route   POST /api/conversations/:id/archive
// @desc    Archive conversation
// @access  Private
router.post('/:id/archive', authenticateJWT, archiveConversation);

// @route   DELETE /api/conversations/:id
// @desc    Delete conversation
// @access  Private
router.delete('/:id', authenticateJWT, deleteConversation);

export default router;

