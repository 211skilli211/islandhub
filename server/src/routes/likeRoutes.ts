import { Router } from 'express';
import {
    likePost,
    unlikePost,
    getPostLikes,
    getUserLikedPosts
} from '../controllers/likeController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/likes/post/:postId
// @desc    Like a post
// @access  Private
router.post('/post/:postId', authenticateJWT, likePost);

// @route   DELETE /api/likes/post/:postId
// @desc    Unlike a post
// @access  Private
router.delete('/post/:postId', authenticateJWT, unlikePost);

// @route   GET /api/likes/post/:postId
// @desc    Get all likes for a post
// @access  Public
router.get('/post/:postId', getPostLikes);

// @route   GET /api/likes/user/me
// @desc    Get posts liked by current user
// @access  Private
router.get('/user/me', authenticateJWT, getUserLikedPosts);

export default router;
