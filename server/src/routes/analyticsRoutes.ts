import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import {
    // Legacy
    getVendorAnalytics,
    // Vendor Analytics
    getVendorDashboardStats,
    getVendorSalesChart,
    getVendorTopProducts,
    getVendorOrderStatusBreakdown,
    getVendorCustomerAnalytics,
    // Admin Analytics
    getAdminPlatformOverview,
    getAdminRevenueTrends,
    getAdminTopStores,
    getAdminUserStats,
    // Shared
    getLiveOrders
} from '../controllers/analyticsController';

const router = express.Router();

// ============================================
// Legacy Analytics Route (Keep for compatibility)
// ============================================
router.get('/vendor', authenticateJWT, getVendorAnalytics);

// ============================================
// Vendor Dashboard Analytics
// ============================================
router.get('/vendor/dashboard', authenticateJWT, getVendorDashboardStats);
router.get('/vendor/sales-chart', authenticateJWT, getVendorSalesChart);
router.get('/vendor/top-products', authenticateJWT, getVendorTopProducts);
router.get('/vendor/order-status', authenticateJWT, getVendorOrderStatusBreakdown);
router.get('/vendor/customers', authenticateJWT, getVendorCustomerAnalytics);

// ============================================
// Admin Platform Analytics
// ============================================
router.get('/admin/overview', authenticateJWT, getAdminPlatformOverview);
router.get('/admin/revenue-trends', authenticateJWT, getAdminRevenueTrends);
router.get('/admin/top-stores', authenticateJWT, getAdminTopStores);
router.get('/admin/user-stats', authenticateJWT, getAdminUserStats);

// ============================================
// Real-time Analytics (Vendor & Admin)
// ============================================
router.get('/live-orders', authenticateJWT, getLiveOrders);

export default router;
