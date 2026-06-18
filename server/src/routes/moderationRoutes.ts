import { Router } from 'express';
import {
    reportContent,
    blockUser,
    unblockUser,
    getBlockedUsers,
    getReports,
    reviewReport,
    checkTextContent,
    moderateListing,
    autoModerateListings
} from '../controllers/moderationController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/moderation/report
// @desc    Report content
// @access  Private
router.post('/report', authenticateJWT, reportContent);

// @route   POST /api/moderation/block/:userId
// @desc    Block a user
// @access  Private
router.post('/block/:userId', authenticateJWT, blockUser);

// @route   DELETE /api/moderation/block/:userId
// @desc    Unblock a user
// @access  Private
router.delete('/block/:userId', authenticateJWT, unblockUser);

// @route   GET /api/moderation/blocked
// @desc    Get blocked users
// @access  Private
router.get('/blocked', authenticateJWT, getBlockedUsers);

// @route   GET /api/moderation/reports
// @desc    Get reports (admin only)
// @access  Private (admin)
router.get('/reports', authenticateJWT, getReports);

// @route   PATCH /api/moderation/reports/:id
// @desc    Review a report
// @access  Private (admin)
router.patch('/reports/:id', authenticateJWT, reviewReport);

// @route   POST /api/moderation/check-text
// @desc    Check text content for moderation
// @access  Private
router.post('/check-text', authenticateJWT, checkTextContent);

// @route   POST /api/moderation/listing/:listingId/moderate
// @desc    Moderate a specific listing
// @access  Admin
router.post('/listing/:listingId/moderate', authenticateJWT, isAdmin, moderateListing);

// @route   POST /api/moderation/auto-moderate
// @desc    Auto-moderate pending listings
// @access  Admin
router.post('/auto-moderate', authenticateJWT, isAdmin, autoModerateListings);

export default router;

