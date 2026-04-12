import { Router } from 'express';
import {
    createJob, getAvailableJobs, acceptJob, updateJobStatus,
    getPricingRules, updatePricingRule, adminCancelJob, adminAssignDriver,
    toggleDriverStatus, updateLiveLocation, getDriverStats, submitDriverKYC, getDriverProfile,
    getOnlineDrivers
} from '../controllers/logisticsController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Base route: /api/logistics

// Vendor/Rider: Create a transport request
router.post('/jobs', authenticateJWT, createJob);

// Admin: Dispatch & Tracking
router.get('/drivers/online', authenticateJWT, isAdmin, getOnlineDrivers);

// Driver: Management & Stats
router.post('/status', authenticateJWT, toggleDriverStatus);
router.post('/location', authenticateJWT, updateLiveLocation);
router.get('/stats', authenticateJWT, getDriverStats);
router.get('/profile', authenticateJWT, getDriverProfile);
router.post('/kyc', authenticateJWT, submitDriverKYC);

// Driver: Job Operations
router.get('/jobs', authenticateJWT, getAvailableJobs);
router.post('/jobs/:jobId/accept', authenticateJWT, acceptJob);
router.patch('/jobs/:jobId/status', authenticateJWT, updateJobStatus);

// Admin: Pricing Rules Management
router.get('/pricing', authenticateJWT, isAdmin, getPricingRules);
router.put('/pricing/:id', authenticateJWT, isAdmin, updatePricingRule);

// Admin: Job Management
router.post('/jobs/:jobId/cancel', authenticateJWT, isAdmin, adminCancelJob);
router.post('/jobs/:jobId/assign', authenticateJWT, isAdmin, adminAssignDriver);

export default router;

