/**
 * Site Settings Controller
 * Admin controls for site-wide theme and settings
 */

import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get all site settings
export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT setting_key, setting_value, setting_type, description FROM site_settings ORDER BY setting_key'
        );
        
        const settings: Record<string, any> = {};
        result.rows.forEach(row => {
            if (row.setting_type === 'boolean') {
                settings[row.setting_key] = row.setting_value === 'true';
            } else if (row.setting_type === 'number') {
                settings[row.setting_key] = parseFloat(row.setting_value);
            } else if (row.setting_type === 'json') {
                try { settings[row.setting_key] = JSON.parse(row.setting_value); }
                catch { settings[row.setting_key] = row.setting_value; }
            } else {
                settings[row.setting_key] = row.setting_value;
            }
        });
        
        res.json({ settings });
    } catch (error) {
        console.error('Get site settings error:', error);
        res.status(500).json({ message: 'Failed to fetch settings' });
    }
};

// Update a site setting
export const updateSiteSetting = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const { setting_key, setting_value } = req.body;

        if (!setting_key || setting_value === undefined) {
            return res.status(400).json({ message: 'Setting key and value required' });
        }

        // Determine type
        let type = 'string';
        let value = setting_value;
        
        if (typeof setting_value === 'boolean') type = 'boolean';
        else if (typeof setting_value === 'number') type = 'number';
        else if (typeof setting_value === 'object') { type = 'json'; value = JSON.stringify(setting_value); }
        else value = String(setting_value);

        await pool.query(
            `INSERT INTO site_settings (setting_key, setting_value, setting_type, updated_at, updated_by)
             VALUES ($1, $2, $3, NOW(), $4)
             ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, setting_type = $3, updated_at = NOW(), updated_by = $4`,
            [setting_key, value, type, userId]
        );

        res.json({ success: true, message: 'Setting updated' });
    } catch (error) {
        console.error('Update site setting error:', error);
        res.status(500).json({ message: 'Failed to update setting' });
    }
};

// Get theme settings for frontend
export const getThemeSettings = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN ('theme', 'primary_color', 'accent_color', 'toast_style')"
        );
        
        const theme = result.rows.find(r => r.setting_key === 'theme')?.setting_value || 'system';
        const primaryColor = result.rows.find(r => r.setting_key === 'primary_color')?.setting_value || '#0d9488';
        const accentColor = result.rows.find(r => r.setting_key === 'accent_color')?.setting_value || '#14b8a6';
        const toastStyle = result.rows.find(r => r.setting_key === 'toast_style')?.setting_value || 'modern-dark';
        
        res.json({ theme, primaryColor, accentColor, toastStyle });
    } catch (error) {
        res.json({ theme: 'system', primaryColor: '#0d9488', accentColor: '#14b8a6', toastStyle: 'modern-dark' });
    }
};