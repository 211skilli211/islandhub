import { Router } from 'express';
import { createDonationIntent, confirmDonation, getUserDonations } from '../controllers/donationController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/donations/me
// @desc    Get donations made by the authenticated user
// @access  Private
router.get('/me', authenticateJWT, getUserDonations);

// @route   POST /api/donations/create-intent
// @desc    Create a payment intent for a donation
// @access  Public (or Optional Auth)
router.post('/create-intent', authenticateJWT, createDonationIntent);

// @route   POST /api/donations/confirm
// @desc    Confirm a donation payment
// @access  Public
router.post('/confirm', confirmDonation);

export default router;
