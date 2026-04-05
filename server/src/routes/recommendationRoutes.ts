import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
    getRecommendations,
    getSimilarListings,
    getTrending,
    getHomepageSections
} from '../controllers/recommendationController';

const router = Router();

// Get personalized recommendations (AI-powered)
router.get('/recommendations', authenticateJWT, getRecommendations);

// Get similar listings (vector-based)
router.get('/similar/:listing_id', getSimilarListings);

// Get trending listings
router.get('/trending', getTrending);

// Get personalized homepage sections
router.get('/homepage', authenticateJWT, getHomepageSections);

// Legacy endpoints (kept for backward compatibility)
router.get('/trending', getTrending);

router.get('/personalized', authenticateJWT, getRecommendations);

export default router;