import express from 'express';
// refresh
import {
    submitApplication,
    getMyApplication,
    getAllApplications,
    reviewApplication
} from '../controllers/driverApplicationController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// User routes
router.post('/apply', authenticateJWT, submitApplication);
router.get('/my', authenticateJWT, getMyApplication);

// Admin routes
router.get('/all', authenticateJWT, getAllApplications);
router.patch('/:applicationId/review', authenticateJWT, reviewApplication);

export default router;
