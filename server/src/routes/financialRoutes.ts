import express from 'express';
import {
    getWallet,
    getTransactions,
    requestPayout,
    getMyPayoutRequests,
    getAllPayoutRequests,
    processPayout
} from '../controllers/financialController';
import { authenticateJWT, isAdmin, isVendor, isDriver } from '../middleware/authMiddleware';

const router = express.Router();

// ==================== PARTNER ROUTES ====================

// Get my wallet and transactions
router.get('/wallet', authenticateJWT, getWallet);
router.get('/transactions', authenticateJWT, getTransactions);

// Payout management
router.post('/payouts/request', authenticateJWT, requestPayout);
router.get('/payouts/my', authenticateJWT, getMyPayoutRequests);

// ==================== ADMIN ROUTES ====================

// Admin payout management
router.get('/admin/payouts', authenticateJWT, isAdmin, getAllPayoutRequests);
router.patch('/admin/payouts/:request_id', authenticateJWT, isAdmin, processPayout);

export default router;
