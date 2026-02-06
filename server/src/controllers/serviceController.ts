import { Request, Response } from 'express';
import { pool } from '../config/db';

export const getServicesByStore = async (req: Request, res: Response) => {
    try {
        const { storeId } = req.query;
        if (!storeId) {
            return res.status(400).json({ error: 'Store ID is required' });
        }

        // Get the service listings for this store
        const listingsRes = await pool.query(
            'SELECT id FROM listings WHERE store_id = $1 AND type = \'service\'',
            [storeId]
        );

        if (listingsRes.rows.length === 0) {
            return res.json([]);
        }

        const listingIds = listingsRes.rows.map(r => r.id);

        // Fetch sections and their services (using unified menu tables)
        const sectionsRes = await pool.query(
            `SELECT 
                ms.section_id,
                ms.section_name,
                ms.priority,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'service_id', mi.item_id,
                            'listing_id', mi.listing_id,
                            'service_name', mi.item_name,
                            'description', mi.description,
                            'price', mi.price,
                            'duration', mi.duration,
                            'image_url', mi.image_url,
                            'badges', mi.badges,
                            'addons', mi.addons,
                            'availability', mi.availability,
                            'faqs', mi.faqs
                        )
                    ) FILTER (WHERE mi.item_id IS NOT NULL),
                    '[]'
                ) as items
            FROM menu_sections ms
            LEFT JOIN menu_items mi ON ms.section_id = mi.section_id
            WHERE ms.listing_id = ANY($1)
            GROUP BY ms.section_id
            ORDER BY ms.priority ASC`,
            [listingIds]
        );

        res.json(sectionsRes.rows);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getServiceDetails = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const serviceRes = await pool.query(
            'SELECT *, item_id as service_id, item_name as service_name FROM menu_items WHERE item_id = $1',
            [id]
        );

        if (serviceRes.rows.length === 0) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(serviceRes.rows[0]);
    } catch (error) {
        console.error('Error fetching service details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
