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

// Public - get founder photo, logo, and visual toggles for frontend display
router.get('/public', async (req, res) => {
    try {
        const { pool } = await import('../config/db');
        const result = await pool.query(
            "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('founder_photo_url', 'ibt_logo_url', 'site_name', 'site_description', 'particles_enabled')"
        );
        const settings: Record<string, string> = {};
        result.rows.forEach((row: any) => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        console.error('Get public site settings error:', error);
        res.json({});
    }
});

// Admin only - get all settings
router.get('/', authenticateJWT, isAdmin, getSiteSettings);

// Admin only - update setting
router.put('/', authenticateJWT, isAdmin, updateSiteSetting);

export default router;