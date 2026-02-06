
import { Router } from 'express';
import { getAllOrders, getRevenueStats, getDriverEarnings, getRevenueAnalytics, processDriverPayout } from '../controllers/revenueController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// @route   GET /api/revenue/orders
// @desc    Get all revenue orders
// @access  Private (Admin)
router.get('/orders', authenticateJWT, isAdmin, getAllOrders);

// @route   GET /api/revenue/stats
// @desc    Get revenue statistics
// @access  Private (Admin)
router.get('/stats', authenticateJWT, isAdmin, getRevenueStats);

// @route   GET /api/revenue/analytics
// @desc    Get revenue analytics
// @access  Private (Admin)
router.get('/analytics', authenticateJWT, isAdmin, getRevenueAnalytics);

// @route   GET /api/revenue/driver/:driverId/earnings
// @desc    Get driver earnings
// @access  Private (Driver or Admin)
router.get('/driver/:driverId/earnings', authenticateJWT, getDriverEarnings);

// @route   POST /api/revenue/payout/:payoutId/process
// @desc    Process driver payout
// @access  Private (Admin)
router.post('/payout/:payoutId/process', authenticateJWT, isAdmin, processDriverPayout);

export default router;
