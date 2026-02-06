import { Router } from 'express';
import {
    getDashboardStats, createUser, requestChanges, getChangeRequests, exportData, getAuditLogs, updateUser,
    getAllSubscriptions, updateSubscriptionManual, getUsers, deleteUser, getDrivers,
    getMarqueeTemplates, saveMarqueeTemplate, updateMarqueeTemplate, deleteMarqueeTemplate,
    getPromotionalBanners, createPromotionalBanner, updatePromotionalBanner, deletePromotionalBanner, togglePromotionalBanner,
    getOrders, dispatchOrder, updateCampaign
} from '../controllers/adminController';
import { adminGlobalSearch } from '../controllers/searchController';
import { getAdminSettings, updateAdminSettings } from '../controllers/adminSettingsController';
import {
    getPendingVendors, approveVendor, rejectVendor, toggleVendorStatus
} from '../controllers/vendorVerificationController';
import {
    getPendingCustomTypes, approveCustomType, rejectCustomType, getPendingCustomTypesCount
} from '../controllers/customTypeController';
import {
    getHeroAssets, getHeroAssetByPage, updateHeroAsset, deleteHeroAsset
} from '../controllers/heroAssetController';
import { categoryController } from '../controllers/categoryController';
import { getAllStores } from '../controllers/storeController';
import { getAllCampaigns } from '../controllers/campaignController';
import { getAllMedia } from '../controllers/uploadController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Dashboard stats
router.get('/stats', authenticateJWT, isAdmin, getDashboardStats);

// Global search (Admins only)
router.get('/search', authenticateJWT, isAdmin, adminGlobalSearch);

// Audit logs
router.get('/audit-logs', authenticateJWT, isAdmin, getAuditLogs);

// Admin settings
router.get('/settings', authenticateJWT, isAdmin, getAdminSettings);
router.put('/settings', authenticateJWT, isAdmin, updateAdminSettings);

// Exports
router.get('/export/users', authenticateJWT, isAdmin, (req, res, next) => { (req as any).exportType = 'users'; next(); }, exportData);
router.get('/export/stores', authenticateJWT, isAdmin, (req, res, next) => { (req as any).exportType = 'stores'; next(); }, exportData);

// Campaign change requests
router.post('/campaigns/:listingId/request-changes', authenticateJWT, isAdmin, requestChanges);
router.get('/campaigns/:listingId/change-requests', authenticateJWT, isAdmin, getChangeRequests);

// User management
router.get('/users', authenticateJWT, isAdmin, getUsers);
router.get('/drivers', authenticateJWT, isAdmin, getDrivers);
router.patch('/users/:userId', authenticateJWT, isAdmin, updateUser);
router.delete('/users/:userId', authenticateJWT, isAdmin, deleteUser);

// Subscriptions management
router.get('/subscriptions', authenticateJWT, isAdmin, getAllSubscriptions);
router.put('/subscriptions', authenticateJWT, isAdmin, updateSubscriptionManual);

// Marquee Templates
router.get('/marquee/templates', authenticateJWT, isAdmin, getMarqueeTemplates);
router.post('/marquee/templates', authenticateJWT, isAdmin, saveMarqueeTemplate);
router.patch('/marquee/templates/:id', authenticateJWT, isAdmin, updateMarqueeTemplate);
router.delete('/marquee/templates/:id', authenticateJWT, isAdmin, deleteMarqueeTemplate);

// Promotional Banners
router.get('/promotions/banners', authenticateJWT, isAdmin, getPromotionalBanners);
router.post('/promotions/banners', authenticateJWT, isAdmin, createPromotionalBanner);
router.patch('/promotions/banners/:id', authenticateJWT, isAdmin, updatePromotionalBanner);
router.patch('/promotions/banners/:id/toggle', authenticateJWT, isAdmin, togglePromotionalBanner);
router.delete('/promotions/banners/:id', authenticateJWT, isAdmin, deletePromotionalBanner);

// Hero Background Assets
router.get('/hero-assets', authenticateJWT, isAdmin, getHeroAssets);
router.get('/hero-assets/:pageKey', getHeroAssetByPage);
router.post('/hero-assets', authenticateJWT, isAdmin, updateHeroAsset);
router.delete('/hero-assets/:pageKey', authenticateJWT, isAdmin, deleteHeroAsset);

// Stores management
router.get('/stores', authenticateJWT, isAdmin, getAllStores);

// Campaigns management
router.get('/campaigns', authenticateJWT, isAdmin, (req, res, next) => {
    req.query.admin = 'true';
    next();
}, getAllCampaigns);
router.patch('/campaigns/:id', authenticateJWT, isAdmin, updateCampaign);

// Asset management
router.get('/assets', authenticateJWT, isAdmin, getAllMedia);

// Custom Product Type Verification
router.get('/custom-types/pending', authenticateJWT, isAdmin, getPendingCustomTypes);
router.get('/custom-types/pending/count', authenticateJWT, isAdmin, getPendingCustomTypesCount);
router.patch('/custom-types/:id/approve', authenticateJWT, isAdmin, approveCustomType);
router.patch('/custom-types/:id/reject', authenticateJWT, isAdmin, rejectCustomType);

// Vendor KYB Verification
router.get('/vendors/pending', authenticateJWT, isAdmin, getPendingVendors);
router.patch('/vendors/:vendorId/approve', authenticateJWT, isAdmin, approveVendor);
router.patch('/vendors/:vendorId/reject', authenticateJWT, isAdmin, rejectVendor);
router.patch('/vendors/:vendorId/toggle', authenticateJWT, isAdmin, toggleVendorStatus);

// Order management
router.get('/orders', authenticateJWT, isAdmin, getOrders);
router.post('/orders/dispatch', authenticateJWT, isAdmin, dispatchOrder);

// Category Management (Admin)
router.post('/categories', authenticateJWT, isAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticateJWT, isAdmin, categoryController.updateCategory);
router.post('/subtypes', authenticateJWT, isAdmin, categoryController.createSubtype);
router.put('/subtypes/:id', authenticateJWT, isAdmin, categoryController.updateSubtype);
router.post('/form-fields', authenticateJWT, isAdmin, categoryController.createFormField);
router.get('/subtypes/:id/form-config', categoryController.getFormConfig);

export default router;
