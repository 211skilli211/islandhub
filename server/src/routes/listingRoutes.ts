import { Router } from 'express';
import { createListing, getListings, getListingById, updateListing, deleteListing, recordListingView } from '../controllers/listingController';
import { authenticateJWT, optionalAuth } from '../middleware/authMiddleware';
import { checkListingLimit } from '../middleware/subscriptionMiddleware';

const router = Router();

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post('/', authenticateJWT, checkListingLimit, createListing);

// @route   GET /api/listings
// @desc    Get all listings with optional filters
// @access  Public (optionalAuth for driver_id=me)
router.get('/', optionalAuth, getListings);

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get('/:id', getListingById);

// @route   POST /api/listings/:id/view
// @desc    Record a listing view
// @access  Public
router.post('/:id/view', recordListingView);

// @route   PUT /api/listings/:id
// @desc    Update a listing (owner only)
// @access  Private
router.put('/:id', authenticateJWT, updateListing);

// @route   DELETE /api/listings/:id
// @desc    Delete a listing (owner only)
// @access  Private
router.delete('/:id', authenticateJWT, deleteListing);

export default router;