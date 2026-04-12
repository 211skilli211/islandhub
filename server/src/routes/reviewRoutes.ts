import express from 'express';
import { createReview, getReviewsByVendor, getVendorRating, getReviewsByStore, replyToReview } from '../controllers/reviewController';
import { authenticateJWT, isVendor } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authenticateJWT, createReview);
router.get('/vendor/:vendorId', getReviewsByVendor);
router.get('/vendor/:vendorId/rating', getVendorRating);

// Vendor/Internal routes
router.get('/store/:storeId', authenticateJWT, getReviewsByStore);
router.post('/:id/reply', authenticateJWT, isVendor, replyToReview);

export default router;
