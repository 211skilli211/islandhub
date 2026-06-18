import express from 'express';
import {
    submitRating,
    getDeliveryRating,
    getDriverRatings,
    getMyDriverRatings
} from '../controllers/ratingController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// Customer routes
router.post('/delivery/:deliveryId', authenticateJWT, submitRating);
router.get('/delivery/:deliveryId', getDeliveryRating);

// Driver routes
router.get('/driver/me', authenticateJWT, getMyDriverRatings);
router.get('/driver/:driverId', getDriverRatings);

export default router;
