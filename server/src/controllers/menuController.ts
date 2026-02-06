import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get consolidated menu for a store (linked via store_id)
export const getMenu = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            return res.status(400).json({ message: 'storeId is required' });
        }

        // Fetch sections
        const sectionsRes = await pool.query(
            'SELECT * FROM menu_sections WHERE store_id = $1 ORDER BY priority ASC, created_at ASC',
            [storeId]
        );
        const sections = sectionsRes.rows;

        if (sections.length === 0) {
            return res.json({ storeId, sections: [] });
        }

        // Fetch items for all sections
        const sectionIds = sections.map(s => s.section_id);
        let items: any[] = [];

        if (sectionIds.length > 0) {
            const itemsRes = await pool.query(
                'SELECT * FROM menu_items WHERE section_id = ANY($1) ORDER BY created_at ASC',
                [sectionIds]
            );
            items = itemsRes.rows;
        }

        // Nest items into sections
        const consolidated = sections.map(section => ({
            ...section,
            id: section.section_id, // Map for frontend compatibility
            name: section.section_name, // Map for frontend compatibility if needed
            items: items.filter(item => item.section_id === section.section_id).map(item => ({
                ...item,
                id: item.item_id, // Map for frontend compatibility
                name: item.item_name // Map for frontend compatibility
            }))
        }));

        res.json({
            storeId,
            sections: consolidated
        });
    } catch (error) {
        console.error('getMenu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Sections ---

export const createSection = async (req: Request, res: Response) => {
    try {
        const { store_id, name, priority } = req.body;

        if (!store_id || !name) {
            return res.status(400).json({ message: 'store_id and name are required' });
        }

        const result = await pool.query(
            'INSERT INTO menu_sections (store_id, section_name, priority) VALUES ($1, $2, $3) RETURNING *',
            [store_id, name, priority || 0]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, priority } = req.body;

        const result = await pool.query(
            'UPDATE menu_sections SET section_name = COALESCE($1, section_name), priority = COALESCE($2, priority) WHERE section_id = $3 RETURNING *',
            [name, priority, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Section not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM menu_sections WHERE section_id = $1', [id]);
        res.json({ message: 'Section deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Items ---

export const createMenuItem = async (req: Request, res: Response) => {
    try {
        const { section_id, listing_id, name, description, price, image_url, badges, addons, donation_suggested, duration, availability, faqs } = req.body;

        if (!section_id || !name || price === undefined) {
            return res.status(400).json({ message: 'section_id, name, and price are required' });
        }

        const result = await pool.query(
            `INSERT INTO menu_items (
                section_id, listing_id, item_name, description, price, 
                image_url, badges, addons, donation_suggested, duration, availability, faqs,
                price_per_week, deposit_amount, rental_period, photos, prep_time
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [
                section_id, listing_id || null, name, description, price,
                image_url, JSON.stringify(badges || []), JSON.stringify(addons || []),
                donation_suggested || false, duration || null,
                JSON.stringify(availability || {}),
                JSON.stringify(faqs || []),
                req.body.price_per_week || null,
                req.body.deposit_amount || null,
                req.body.rental_period || null,
                JSON.stringify(req.body.photos || []),
                req.body.prep_time || null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Map frontend 'name' to database 'item_name'
        if (updates.name) {
            updates.item_name = updates.name;
        }

        // Explicitly allow only valid database columns to be updated
        const allowedColumns = [
            'section_id', 'listing_id', 'item_name', 'description', 'price',
            'image_url', 'donation_suggested', 'duration', 'side_ids',
            'price_per_week', 'deposit_amount', 'rental_period', 'prep_time'
        ];
        const jsonColumns = ['badges', 'addons', 'availability', 'variants', 'faqs', 'photos'];

        const fields = Object.keys(updates).filter(f => allowedColumns.includes(f));
        let values = fields.map(f => updates[f]);
        let setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');

        jsonColumns.forEach(f => {
            if (updates[f] !== undefined) {
                values.push(JSON.stringify(updates[f]));
                setClause += (setClause ? ', ' : '') + `${f} = $${values.length}`;
            }
        });

        if (!setClause) return res.status(400).json({ message: 'No valid fields to update' });

        values.push(id);
        const result = await pool.query(
            `UPDATE menu_items SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE item_id = $${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Menu item not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('updateMenuItem error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM menu_items WHERE item_id = $1', [id]);
        res.json({ message: 'Menu item deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

