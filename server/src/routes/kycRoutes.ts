import { Router } from 'express';
import { submitKYC, getKYCStatus, reviewKYC, getAllPendingKYC, approveKYC, rejectKYC } from '../controllers/kycController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/kyc/status
// @desc    Get current vendor KYC status
// @access  Private (Vendor)
router.get('/status', authenticateJWT, getKYCStatus);

// @route   POST /api/kyc
// @desc    Submit KYC documents
// @access  Private (Vendor)
router.post('/', authenticateJWT, submitKYC);

// @route   GET /api/kyc/admin/pending
// @desc    Get all pending KYCs
// @access  Private (Admin)
router.get('/admin/pending', authenticateJWT, isAdmin, getAllPendingKYC);

// @route   PATCH /api/kyc/admin/:kycId
// @desc    Review KYC (Approve/Reject) - legacy endpoint
// @access  Private (Admin)
router.patch('/admin/:kycId', authenticateJWT, isAdmin, reviewKYC);

// @route   POST /api/kyc/admin/:kycId/approve
// @desc    Approve KYC submission
// @access  Private (Admin)
router.post('/admin/:kycId/approve', authenticateJWT, isAdmin, approveKYC);

// @route   POST /api/kyc/admin/:kycId/reject
// @desc    Reject KYC submission
// @access  Private (Admin)
router.post('/admin/:kycId/reject', authenticateJWT, isAdmin, rejectKYC);

export default router;
