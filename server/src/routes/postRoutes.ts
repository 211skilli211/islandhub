
import { Router } from 'express';
import { createPost, getPosts, deletePost } from '../controllers/postController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/posts
// @desc    Get all user posts
// @access  Public
router.get('/', getPosts);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateJWT, createPost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', authenticateJWT, deletePost);

export default router;
