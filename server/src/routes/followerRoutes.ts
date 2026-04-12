import { Router } from 'express';
import {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getFollowStatus
} from '../controllers/followerController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/followers/:userId
// @desc    Follow a user
// @access  Private
router.post('/:userId', authenticateJWT, followUser);

// @route   DELETE /api/followers/:userId
// @desc    Unfollow a user
// @access  Private
router.delete('/:userId', authenticateJWT, unfollowUser);

// @route   GET /api/followers/:userId
// @desc    Get followers of a user
// @access  Public
router.get('/:userId/followers', getFollowers);

// @route   GET /api/following/:userId
// @desc    Get users that a user follows
// @access  Public
router.get('/:userId/following', getFollowing);

// @route   GET /api/followers/:userId/status
// @desc    Get follow status between current user and target user
// @access  Private
router.get('/:userId/status', authenticateJWT, getFollowStatus);

export default router;

