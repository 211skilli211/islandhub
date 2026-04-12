/**
 * Site Settings Routes
 * Admin controls for site-wide theme and settings
 */

import { Router } from 'express';
import { getSiteSettings, updateSiteSetting, getThemeSettings } from '../controllers/siteSettingsController';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';

const router = Router();

// Public - get theme for frontend
router.get('/theme', getThemeSettings);

// Admin only - get all settings
router.get('/', authenticateJWT, isAdmin, getSiteSettings);

// Admin only - update setting
router.put('/', authenticateJWT, isAdmin, updateSiteSetting);

export default router;