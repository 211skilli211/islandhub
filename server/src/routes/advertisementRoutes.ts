import express from 'express';
import {
    getAdSpaces,
    getActiveAds,
    trackAdEvent,
    getAllAdvertisements,
    createAdvertisement,
    updateAdvertisement,
    toggleAdStatus,
    approveAdvertisement,
    deleteAdvertisement,
    getAdAnalytics,
    getVendorPromotions,
    getStorePromotions,
    createVendorPromotion,
    updateVendorPromotion,
    deleteVendorPromotion,
    trackPromotionView,
    trackPromotionClick,
    approveVendorPromotion,
    rejectVendorPromotion,
    getPendingPromotions
} from '../controllers/advertisementController';
import { authenticateJWT, isAdmin, isVendor } from '../middleware/authMiddleware';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Get active ads for display
router.get('/active', getActiveAds);

// Track ad events (impressions, clicks)
router.post('/:ad_id/track', trackAdEvent);

// Get available ad spaces
router.get('/spaces', getAdSpaces);

// Get store promotions (public)
router.get('/stores/:store_id/promotions', getStorePromotions);

// Track promotion events
router.post('/promotions/:promo_id/view', trackPromotionView);
router.post('/promotions/:promo_id/click', trackPromotionClick);

// ==================== VENDOR ROUTES ====================

// Vendor promotion management
router.get('/vendor/promotions', authenticateJWT, isVendor, getVendorPromotions);
router.post('/vendor/promotions', authenticateJWT, isVendor, createVendorPromotion);
router.patch('/vendor/promotions/:promo_id', authenticateJWT, isVendor, updateVendorPromotion);
router.delete('/vendor/promotions/:promo_id', authenticateJWT, isVendor, deleteVendorPromotion);

// ==================== ADMIN ROUTES ====================

// Advertisement management
router.get('/admin/advertisements', authenticateJWT, isAdmin, getAllAdvertisements);
router.post('/admin/advertisements', authenticateJWT, isAdmin, createAdvertisement);
router.patch('/admin/advertisements/:ad_id', authenticateJWT, isAdmin, updateAdvertisement);
router.patch('/admin/advertisements/:ad_id/toggle', authenticateJWT, isAdmin, toggleAdStatus);
router.patch('/admin/advertisements/:ad_id/approve', authenticateJWT, isAdmin, approveAdvertisement);
router.delete('/admin/advertisements/:ad_id', authenticateJWT, isAdmin, deleteAdvertisement);

// Analytics
router.get('/admin/advertisements/:ad_id/analytics', authenticateJWT, isAdmin, getAdAnalytics);

// Ad space management
router.get('/admin/spaces', authenticateJWT, isAdmin, getAdSpaces);

// Vendor promotion approval (admin)
router.get('/admin/promotions/pending', authenticateJWT, isAdmin, getPendingPromotions);
router.patch('/admin/promotions/:promo_id/approve', authenticateJWT, isAdmin, approveVendorPromotion);
router.patch('/admin/promotions/:promo_id/reject', authenticateJWT, isAdmin, rejectVendorPromotion);

export default router;
