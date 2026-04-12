import { Router } from 'express';
// refresh
// refresh
// refresh
// refresh
import {
    createComment,
    getCommentsByPost,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    getCommentLikes
} from '../controllers/commentController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get('/post/:postId', optionalAuth, getCommentsByPost);

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post('/', authenticateJWT, createComment);

// @route   PATCH /api/comments/:id
// @desc    Update a comment
// @access  Private (owner only)
router.patch('/:id', authenticateJWT, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private (owner only)
router.delete('/:id', authenticateJWT, deleteComment);

// @route   POST /api/comments/:id/like
// @desc    Like a comment
// @access  Private
router.post('/:id/like', authenticateJWT, likeComment);

// @route   DELETE /api/comments/:id/like
// @desc    Unlike a comment
// @access  Private
router.delete('/:id/like', authenticateJWT, unlikeComment);

// @route   GET /api/comments/:id/likes
// @desc    Get all likes for a comment
// @access  Public
router.get('/:id/likes', getCommentLikes);

export default router;

