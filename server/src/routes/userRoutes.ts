import { Router } from 'express';
import { updateProfile, getProfile, getCurrentUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticateJWT, getCurrentUser);

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get('/:id', getProfile);

// @route   PUT /api/users/update
// @desc    Update user profile data
// @access  Private
router.put('/update', authenticateJWT, updateProfile);

export default router;
