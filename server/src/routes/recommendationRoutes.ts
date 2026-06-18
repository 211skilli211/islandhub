import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
    getRecommendations,
    getSimilarListings,
    getTrending,
    getHomepageSections
} from '../controllers/recommendationController';

const router = Router();

// Get personalized recommendations (works for both authenticated and guest users)
// Authenticated: personalized based on history
// Guest: returns popular/trending items
router.get('/recommendations', getRecommendations);

// Get similar listings (vector-based)
router.get('/similar/:listing_id', getSimilarListings);

// Get trending listings
router.get('/trending', getTrending);

// Get personalized homepage sections
router.get('/homepage', getHomepageSections);

// Legacy endpoints (kept for backward compatibility)
router.get('/personalized', getRecommendations);

export default router;
