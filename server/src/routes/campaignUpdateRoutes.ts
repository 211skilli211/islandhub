import { Router } from 'express';
import { createUpdate, getUpdates, getPrivateUpdates } from '../controllers/campaignUpdateController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// @route   POST /api/campaign-updates
// @desc    Create a new campaign update
// @access  Private (owner only)
router.post('/', authenticateJWT, createUpdate);

// @route   GET /api/campaign-updates/:listing_id
// @desc    Get public updates for a listing
// @access  Public
router.get('/:listing_id', getUpdates);

// @route   GET /api/campaign-updates/:listing_id/private
// @desc    Get all updates for a listing (owner only)
// @access  Private (owner only)
router.get('/:listing_id/private', authenticateJWT, getPrivateUpdates);

export default router;