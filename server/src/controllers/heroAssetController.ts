import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';

/**
 * List all hero assets (Admin Overview)
 */
export const getHeroAssets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM hero_assets ORDER BY page_key ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching hero assets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get hero asset for a specific page (Public/Frontend)
 */
export const getHeroAssetByPage = async (req: Request, res: Response) => {
    try {
        const { pageKey } = req.params;
        const result = await pool.query(
            'SELECT asset_url, asset_type, overlay_color, overlay_opacity, title, subtitle, cta_text, cta_link, cta2_text, cta2_link, icon_url, typography, layout_template, style_config FROM hero_assets WHERE page_key = $1',
            [pageKey]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        // Gracefully handle missing tables ( Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Hero assets table not initialized, returning empty response');
            return res.json(null);
        }
        console.error('Error fetching page hero asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create or Update a hero asset (Admin only)
 */
export const updateHeroAsset = async (req: Request, res: Response) => {
    try {
        const {
            page_key, asset_url, asset_type, overlay_color, overlay_opacity,
            title, subtitle, cta_text, cta_link, cta2_text, cta2_link, icon_url, typography,
            layout_template, style_config
        } = req.body;
        const adminId = (req as any).user?.id;

        if (!page_key || !asset_url) {
            return res.status(400).json({ message: 'Page key and asset URL are required' });
        }

        const result = await pool.query(
            `INSERT INTO hero_assets (
                page_key, asset_url, asset_type, overlay_color, overlay_opacity, 
                title, subtitle, cta_text, cta_link, cta2_text, cta2_link, icon_url, typography, 
                layout_template, style_config, updated_at
            )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
             ON CONFLICT (page_key) DO UPDATE SET
                asset_url = EXCLUDED.asset_url,
                asset_type = EXCLUDED.asset_type,
                overlay_color = EXCLUDED.overlay_color,
                overlay_opacity = EXCLUDED.overlay_opacity,
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                cta_text = EXCLUDED.cta_text,
                cta_link = EXCLUDED.cta_link,
                cta2_text = EXCLUDED.cta2_text,
                cta2_link = EXCLUDED.cta2_link,
                icon_url = EXCLUDED.icon_url,
                typography = EXCLUDED.typography,
                layout_template = EXCLUDED.layout_template,
                style_config = EXCLUDED.style_config,
                updated_at = NOW()
             RETURNING *`,
            [
                page_key,
                asset_url,
                asset_type || 'image',
                overlay_color || '#000000',
                overlay_opacity !== undefined ? overlay_opacity : 0.4,
                title || null,
                subtitle || null,
                cta_text || null,
                cta_link || null,
                cta2_text || null,
                cta2_link || null,
                icon_url || null,
                typography ? (typeof typography === 'string' ? typography : JSON.stringify(typography)) : '{}',
                layout_template || 'standard',
                style_config ? (typeof style_config === 'string' ? style_config : JSON.stringify(style_config)) : '{}'
            ]
        );

        // Log admin action
        await logAdminAction(adminId, 'update_hero_asset', undefined, { page_key, asset_type });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating hero asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete a hero asset (Admin only)
 */
export const deleteHeroAsset = async (req: Request, res: Response) => {
    try {
        const { pageKey } = req.params;
        const adminId = (req as any).user?.id;

        await pool.query('DELETE FROM hero_assets WHERE page_key = $1', [pageKey]);

        // Log admin action
        await logAdminAction(adminId, 'delete_hero_asset', undefined, { page_key: pageKey });

        res.json({ message: 'Hero asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting hero asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
