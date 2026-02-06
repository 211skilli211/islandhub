import { Router } from 'express';
import { createCampaign, getAllCampaigns, getCampaignById, verifyCampaign, searchCampaigns, getUserCampaigns, donate, deleteCampaign } from '../controllers/campaignController';
import { authenticateJWT, optionalAuth, isAdmin } from '../middleware/authMiddleware';
import { checkCampaignLimit, applyPlatformFee } from '../middleware/subscriptionMiddleware';

const router = Router();

// ... existing routes ...
// @route   GET /api/campaigns
// @desc    Get all campaigns (filters verified unless admin=true)
// @access  Public (admin=true requires auth + admin role)
router.get('/', optionalAuth, getAllCampaigns);

// @route   GET /api/campaigns/search
// @desc    Search for campaigns by title or description
// @access  Public
router.get('/search', searchCampaigns);

// @route   GET /api/campaigns/me
// @desc    Get campaigns created by authenticated user
// @access  Private
router.get('/me', authenticateJWT, getUserCampaigns);

// @route   GET /api/campaigns/:id
// @desc    Get campaign by ID
// @access  Public
router.get('/:id', getCampaignById);

// @route   POST /api/campaigns
// @desc    Create a new campaign
// @access  Private (Needs Auth Middleware later)
router.post('/', authenticateJWT, checkCampaignLimit, applyPlatformFee, createCampaign);

// @route   PATCH /api/campaigns/:id/verify
// @desc    Verify a campaign (Admin only)
// @access  Private (Admin)
router.patch('/:id/verify', authenticateJWT, isAdmin, verifyCampaign);
router.put('/:id/verify', authenticateJWT, isAdmin, verifyCampaign); // Support both

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign (Owner or Admin)
// @access  Private
router.delete('/:id', authenticateJWT, deleteCampaign);

// @route   POST /api/campaigns/:campaignId/donate
// @desc    Make a donation to a campaign
// @access  Private
router.post('/:campaignId/donate', authenticateJWT, donate);

export default router;
