import { Request, Response } from 'express';
import { pool } from '../config/db';

const verifyOwnership = async (listingId: string | number, userId: string | number, userRole: string): Promise<boolean> => {
    if (userRole === 'admin') return true;
    const result = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [listingId]);
    if (result.rows.length === 0) return false;
    // Ensure both are treated as numbers/strings for comparison
    return String(result.rows[0].creator_id) === String(userId);
};

// --- Product Variants ---

export const getVariants = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM product_variants WHERE listing_id = $1 ORDER BY variant_key, variant_value', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get variants error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addVariant = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { variant_key, variant_value, sku, inventory_count, price_adjustment } = req.body;

        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role || '';

        if (!userId || !await verifyOwnership(String(id), userId, userRole)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO product_variants (listing_id, variant_key, variant_value, sku, inventory_count, price_adjustment) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [id, variant_key, variant_value, sku, inventory_count || 0, price_adjustment || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add variant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteVariant = async (req: Request, res: Response) => {
    try {
        const { id, variantId } = req.params;
        const userId = (req.user as any)?.id;

        // Verify via join
        const check = await pool.query(
            'SELECT l.creator_id FROM product_variants pv JOIN listings l ON pv.listing_id = l.id WHERE pv.variant_id = $1 AND l.id = $2',
            [variantId, id]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Variant not found' });

        const isOwner = String(check.rows[0].creator_id) === String(userId);
        const isAdmin = (req.user as any)?.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query('DELETE FROM product_variants WHERE variant_id = $1', [variantId]);
        res.json({ message: 'Variant deleted' });
    } catch (error) {
        console.error('Delete variant error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Service Calendars ---

export const getCalendar = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM service_calendars WHERE listing_id = $1 ORDER BY day_of_week, start_time', [id]);
        res.json(result.rows);
    } catch (error) {
        console.error('Get calendar error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addCalendarSlot = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { day_of_week, start_time, end_time, duration_min } = req.body;

        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role || '';

        if (!userId || !await verifyOwnership(String(id), userId, userRole)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO service_calendars (listing_id, day_of_week, start_time, end_time, duration_min) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [id, day_of_week, start_time, end_time, duration_min || 60]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add calendar slot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCalendarSlot = async (req: Request, res: Response) => {
    try {
        const { id, calendarId } = req.params;
        const userId = (req.user as any)?.id;

        const check = await pool.query(
            'SELECT l.creator_id FROM service_calendars sc JOIN listings l ON sc.listing_id = l.id WHERE sc.calendar_id = $1 AND l.id = $2',
            [calendarId, id]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Slot not found' });

        const isOwner = String(check.rows[0].creator_id) === String(userId);
        const isAdmin = (req.user as any)?.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query('DELETE FROM service_calendars WHERE calendar_id = $1', [calendarId]);
        res.json({ message: 'Calendar slot deleted' });
    } catch (error) {
        console.error('Delete calendar slot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Menus (Deeply Nested) ---

// Get full menu hierarchy
export const getMenu = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Fetch sections
        const sectionsRes = await pool.query('SELECT * FROM menu_sections WHERE listing_id = $1 ORDER BY section_id', [id]);
        const sections = sectionsRes.rows;

        // Fetch items for these sections
        if (sections.length === 0) return res.json([]);

        const sectionIds = sections.map(s => s.section_id);
        const itemsRes = await pool.query('SELECT * FROM menu_items WHERE section_id = ANY($1) ORDER BY item_id', [sectionIds]);
        const items = itemsRes.rows;

        // Fetch addons for these items
        if (items.length === 0) {
            // Attach empty items to sections
            const result = sections.map(s => ({ ...s, items: [] }));
            return res.json(result);
        }

        const itemIds = items.map(i => i.item_id);
        const addonsRes = await pool.query('SELECT * FROM menu_addons WHERE item_id = ANY($1) ORDER BY addon_id', [itemIds]);
        const addons = addonsRes.rows;

        // Reconstruct hierarchy
        const result = sections.map(section => {
            const sectionItems = items.filter(item => item.section_id === section.section_id).map(item => {
                const itemAddons = addons.filter(addon => addon.item_id === item.item_id);
                return { ...item, addons: itemAddons };
            });
            return { ...section, items: sectionItems };
        });

        res.json(result);
    } catch (error) {
        console.error('Get menu error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addMenuSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { section_name } = req.body;

        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role || '';

        if (!userId || !await verifyOwnership(String(id), userId, userRole)) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const result = await pool.query(
            'INSERT INTO menu_sections (listing_id, section_name) VALUES ($1, $2) RETURNING *',
            [id, section_name]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add menu section error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addMenuItem = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params; // Note: URL param is sectionId, but we need to verify listing ownership
        const { item_name, description, price } = req.body;
        const userId = (req.user as any)?.id;

        // Verify section ownership via join
        const check = await pool.query(
            'SELECT l.creator_id FROM menu_sections ms JOIN listings l ON ms.listing_id = l.id WHERE ms.section_id = $1',
            [sectionId]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Section not found' });

        const isOwner = String(check.rows[0].creator_id) === String(userId);
        const isAdmin = (req.user as any)?.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        const result = await pool.query(
            'INSERT INTO menu_items (section_id, item_name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
            [sectionId, item_name, description, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add menu item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const addMenuAddon = async (req: Request, res: Response) => {
    try {
        const { itemId } = req.params;
        const { addon_name, price } = req.body;
        const userId = (req.user as any)?.id;

        // Verify item ownership via join (item -> section -> listing)
        const check = await pool.query(
            'SELECT l.creator_id FROM menu_items mi JOIN menu_sections ms ON mi.section_id = ms.section_id JOIN listings l ON ms.listing_id = l.id WHERE mi.item_id = $1',
            [itemId]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Item not found' });

        const isOwner = String(check.rows[0].creator_id) === String(userId);
        const isAdmin = (req.user as any)?.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        const result = await pool.query(
            'INSERT INTO menu_addons (item_id, addon_name, price) VALUES ($1, $2, $3) RETURNING *',
            [itemId, addon_name, price]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Add menu addon error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Simplification: We need delete endpoints for menus too, maintaining hierarchy
export const deleteMenuSection = async (req: Request, res: Response) => {
    try {
        const { sectionId } = req.params;
        const userId = (req.user as any)?.id;

        const check = await pool.query(
            'SELECT l.creator_id FROM menu_sections ms JOIN listings l ON ms.listing_id = l.id WHERE ms.section_id = $1',
            [sectionId]
        );
        if (check.rows.length === 0) return res.status(404).json({ message: 'Section not found' });

        const isOwner = String(check.rows[0].creator_id) === String(userId);
        const isAdmin = (req.user as any)?.role === 'admin';

        if (!isOwner && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

        await pool.query('DELETE FROM menu_sections WHERE section_id = $1', [sectionId]); // Cascade deletes items/addons
        res.json({ message: 'Menu section deleted' });
    } catch (error) {
        console.error('Delete menu section error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
