import { Router } from 'express';
// refresh
// refresh
import {
    getStoriesFeed,
    createStory,
    deleteStory,
    viewStory,
    getUserStories,
    createHighlight,
    getHighlights
} from '../controllers/storyController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/stories/feed
// @desc    Get stories feed
// @access  Public
router.get('/feed', getStoriesFeed);

// @route   GET /api/stories/user/:userId
// @desc    Get user's stories
// @access  Public
router.get('/user/:userId', getUserStories);

// @route   GET /api/stories/highlights
// @desc    Get user's highlights
// @access  Private
router.get('/highlights', authenticateJWT, getHighlights);

// @route   POST /api/stories
// @desc    Create a story
// @access  Private
router.post('/', authenticateJWT, createStory);

// @route   DELETE /api/stories/:id
// @desc    Delete a story
// @access  Private (owner only)
router.delete('/:id', authenticateJWT, deleteStory);

// @route   POST /api/stories/:id/view
// @desc    Record story view
// @access  Private
router.post('/:id/view', authenticateJWT, viewStory);

// @route   POST /api/stories/highlights
// @desc    Create a highlight
// @access  Private
router.post('/highlights', authenticateJWT, createHighlight);

export default router;

