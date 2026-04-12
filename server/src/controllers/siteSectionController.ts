import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';

/**
 * Get site sections by type or store
 */
export const getSiteSections = async (req: Request, res: Response) => {
    try {
        const { type, store_id, storeId } = req.query;
        const targetStoreId = store_id || storeId;
        let query = 'SELECT * FROM site_sections WHERE is_active = true';
        const params: any[] = [];

        if (type) {
            params.push(type);
            query += ` AND section_type = $${params.length}`;
        }

        if (targetStoreId) {
            params.push(targetStoreId);
            query += ` AND store_id = $${params.length}`;
        } else if (type === 'homepage') {
            query += ' AND store_id IS NULL';
        }

        query += ' ORDER BY created_at ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error: any) {
        // Gracefully handle missing tables (Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Site sections table not initialized, returning empty array');
            return res.json([]);
        }
        console.error('Error fetching site sections:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Create or Update a site section (Admin only)
 */
export const saveSiteSection = async (req: Request, res: Response) => {
    try {
        const {
            id, store_id, name, section_type, title, body,
            cta_text, cta_link, image_url, list_items, style_config, is_active
        } = req.body;
        const adminId = (req as any).user?.id;

        if (!name) {
            return res.status(400).json({ message: 'Section name is required' });
        }

        let result;
        if (id) {
            // Update
            result = await pool.query(
                `UPDATE site_sections SET
                    store_id = $1, name = $2, section_type = $3, title = $4, body = $5,
                    cta_text = $6, cta_link = $7, image_url = $8, list_items = $9,
                    style_config = $10, is_active = $11, updated_at = NOW()
                 WHERE id = $12 RETURNING *`,
                [
                    store_id || null, name, section_type || 'standard', title, body,
                    cta_text, cta_link, image_url,
                    list_items ? (typeof list_items === 'string' ? list_items : JSON.stringify(list_items)) : '[]',
                    style_config ? (typeof style_config === 'string' ? style_config : JSON.stringify(style_config)) : '{}',
                    is_active !== undefined ? is_active : true,
                    id
                ]
            );
        } else {
            // Insert
            result = await pool.query(
                `INSERT INTO site_sections (
                    store_id, name, section_type, title, body,
                    cta_text, cta_link, image_url, list_items, style_config, is_active
                )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                 ON CONFLICT (store_id, name) DO UPDATE SET
                    section_type = EXCLUDED.section_type,
                    title = EXCLUDED.title,
                    body = EXCLUDED.body,
                    cta_text = EXCLUDED.cta_text,
                    cta_link = EXCLUDED.cta_link,
                    image_url = EXCLUDED.image_url,
                    list_items = EXCLUDED.list_items,
                    style_config = EXCLUDED.style_config,
                    is_active = EXCLUDED.is_active,
                    updated_at = NOW()
                 RETURNING *`,
                [
                    store_id || null, name, section_type || 'standard', title, body,
                    cta_text, cta_link, image_url,
                    list_items ? (typeof list_items === 'string' ? list_items : JSON.stringify(list_items)) : '[]',
                    style_config ? (typeof style_config === 'string' ? style_config : JSON.stringify(style_config)) : '{}',
                    is_active !== undefined ? is_active : true
                ]
            );
        }

        // Log admin action
        await logAdminAction(adminId, 'save_site_section', result.rows[0].id, { name, section_type });

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving site section:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Delete a site section (Admin only)
 */
export const deleteSiteSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.id;

        await pool.query('DELETE FROM site_sections WHERE id = $1', [id]);

        // Log admin action
        await logAdminAction(adminId, 'delete_site_section', parseInt(id as string));

        res.json({ message: 'Site section deleted successfully' });
    } catch (error) {
        console.error('Error deleting site section:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
