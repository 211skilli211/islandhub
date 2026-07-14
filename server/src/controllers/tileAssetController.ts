import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';

/**
 * List all tile assets (Admin Overview)
 */
export const getTileAssets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM tile_assets ORDER BY display_order ASC, tile_key ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching tile assets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get tile asset by key (Public/Frontend)
 * Returns image URL for a specific tile
 */
export const getTileAssetByKey = async (req: Request, res: Response) => {
    try {
        const { tileKey } = req.params;
        const result = await pool.query(
            `SELECT tile_key, tile_label, asset_url, asset_type, display_order, is_active
             FROM tile_assets 
             WHERE tile_key = $1 AND is_active = true`,
            [tileKey]
        );

        if (result.rows.length === 0) {
            return res.json(null);
        }

        res.json(result.rows[0]);
    } catch (error: any) {
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Tile assets table not initialized, returning empty response');
            return res.json(null);
        }
        console.error('Error fetching tile asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create or Update a tile asset (Admin only)
 */
export const updateTileAsset = async (req: Request, res: Response) => {
    try {
        const {
            tile_key, tile_label, asset_url, asset_type, display_order, is_active
        } = req.body;
        const adminId = (req as any).user?.id;

        if (!tile_key) {
            return res.status(400).json({ message: 'Tile key is required' });
        }

        const result = await pool.query(
            `INSERT INTO tile_assets (
                tile_key, tile_label, asset_url, asset_type, display_order, is_active, updated_at
            )
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (tile_key) DO UPDATE SET
                tile_label = EXCLUDED.tile_label,
                asset_url = EXCLUDED.asset_url,
                asset_type = EXCLUDED.asset_type,
                display_order = EXCLUDED.display_order,
                is_active = EXCLUDED.is_active,
                updated_at = NOW()
             RETURNING *`,
            [
                tile_key,
                tile_label || tile_key,
                asset_url || null,
                asset_type || 'image',
                display_order || 0,
                is_active !== undefined ? is_active : true
            ]
        );

        // Log admin action
        await logAdminAction(adminId, 'update_tile_asset', undefined, { tile_key, tile_label });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating tile asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Update only the image URL for a tile (Admin only)
 */
export const updateTileImage = async (req: Request, res: Response) => {
    try {
        const { tileKey } = req.params;
        const { asset_url, asset_type } = req.body;
        const adminId = (req as any).user?.id;

        if (!tileKey) {
            return res.status(400).json({ message: 'Tile key is required' });
        }

        const result = await pool.query(
            `UPDATE tile_assets
             SET asset_url = $1, asset_type = $2, updated_at = NOW()
             WHERE tile_key = $3
             RETURNING *`,
            [asset_url || null, asset_type || 'image', tileKey]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tile not found' });
        }

        // Log admin action
        await logAdminAction(adminId, 'update_tile_image', undefined, { tileKey, asset_url });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating tile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete a tile asset (Admin only)
 */
export const deleteTileAsset = async (req: Request, res: Response) => {
    try {
        const { tileKey } = req.params;
        const adminId = (req as any).user?.id;

        await pool.query('DELETE FROM tile_assets WHERE tile_key = $1', [tileKey]);

        // Log admin action
        await logAdminAction(adminId, 'delete_tile_asset', undefined, { tileKey });

        res.json({ message: 'Tile asset deleted successfully' });
    } catch (error) {
        console.error('Error deleting tile asset:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Get all active tile assets for frontend
 */
export const getAllTileAssets = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT tile_key, tile_label, asset_url, asset_type, display_order
             FROM tile_assets 
             WHERE is_active = true
             ORDER BY display_order ASC`
        );
        res.json(result.rows);
    } catch (error: any) {
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Tile assets table not initialized, returning empty response');
            return res.json([]);
        }
        console.error('Error fetching all tile assets:', error);
        res.status(500).json({ message: 'Server error' });
    }
};