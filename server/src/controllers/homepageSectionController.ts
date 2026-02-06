import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get all homepage sections
export const getHomepageSections = async (req: Request, res: Response) => {
    try {
        const { is_active } = req.query;

        let query = 'SELECT * FROM homepage_sections WHERE 1=1';
        const params: any[] = [];

        if (is_active !== undefined) {
            query += ' AND is_active = $1';
            params.push(is_active === 'true');
        }

        query += ' ORDER BY display_order ASC, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get homepage sections error:', error);
        res.status(500).json({ message: 'Failed to fetch homepage sections' });
    }
};

// Create or update homepage section (admin)
export const upsertHomepageSection = async (req: Request, res: Response) => {
    try {
        const {
            name, title, subtitle, body, image_url, asset_type,
            cta_text, cta_link, sponsor_id, style_config, is_active, display_order
        } = req.body;

        const result = await pool.query(
            `INSERT INTO homepage_sections (
                name, title, subtitle, body, image_url, asset_type,
                cta_text, cta_link, sponsor_id, style_config, is_active, display_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (name) DO UPDATE SET
                title = EXCLUDED.title,
                subtitle = EXCLUDED.subtitle,
                body = EXCLUDED.body,
                image_url = EXCLUDED.image_url,
                asset_type = EXCLUDED.asset_type,
                cta_text = EXCLUDED.cta_text,
                cta_link = EXCLUDED.cta_link,
                sponsor_id = EXCLUDED.sponsor_id,
                style_config = EXCLUDED.style_config,
                is_active = EXCLUDED.is_active,
                display_order = EXCLUDED.display_order,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *`,
            [
                name, title, subtitle, body, image_url, asset_type,
                cta_text, cta_link, sponsor_id, style_config, is_active, display_order
            ]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Upsert homepage section error:', error);
        res.status(500).json({ message: 'Failed to save homepage section' });
    }
};

// Delete homepage section (admin)
export const deleteHomepageSection = async (req: Request, res: Response) => {
    try {
        const { name } = req.params;
        await pool.query('DELETE FROM homepage_sections WHERE name = $1', [name]);
        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Delete homepage section error:', error);
        res.status(500).json({ message: 'Failed to delete section' });
    }
};
