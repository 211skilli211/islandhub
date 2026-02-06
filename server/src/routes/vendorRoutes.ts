import { Router } from 'express';
import { getAllVendors, getVendorProfile, updateVendorProfile, getVendorListings, getVendorBySlug, getMyVendorProfile } from '../controllers/vendorController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

// Protected routes (Must be above parameterized public routes)
router.get('/me', authenticateJWT, getMyVendorProfile);
router.put('/me', authenticateJWT, updateVendorProfile);
router.post('/', authenticateJWT, updateVendorProfile);
router.put('/', authenticateJWT, updateVendorProfile);

// Public routes
router.get('/', getAllVendors);
router.get('/slug/:slug', getVendorBySlug);
router.get('/:id', getVendorProfile);
router.get('/:id/listings', getVendorListings);

export default router;
