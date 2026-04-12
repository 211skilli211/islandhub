import { Router } from 'express';
import {
    getComplianceRequirements,
    getVendorCompliance,
    submitComplianceDocument,
    reviewCompliance,
    getPendingComplianceReview,
    getVendorComplianceSummary
} from '../controllers/complianceController';
import { authenticateJWT, isAdmin, isVendor } from '../middleware/authMiddleware';

const router = Router();

// Public - Get all compliance requirements (for display)
router.get('/requirements', getComplianceRequirements);

// Vendor - Get own compliance status
router.get('/vendor/:vendorId', authenticateJWT, isVendor, getVendorCompliance);

// Vendor - Submit compliance document
router.post('/submit', authenticateJWT, isVendor, submitComplianceDocument);

// Vendor - Get compliance summary
router.get('/vendor/:vendorId/summary', authenticateJWT, isVendor, getVendorComplianceSummary);

// Admin - Get all pending compliance reviews
router.get('/admin/pending', authenticateJWT, isAdmin, getPendingComplianceReview);

// Admin - Review a compliance submission
router.post('/admin/review/:complianceId', authenticateJWT, isAdmin, reviewCompliance);

export default router;
