import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get all coops with optional sector filter
export const getCoops = async (req: Request, res: Response) => {
    try {
        const { sector, island, featured } = req.query;
        let query = `
            SELECT c.*, s.sector_key, s.display_name as sector_name, s.icon as sector_icon, s.color as sector_color
            FROM coops c
            JOIN coop_sectors s ON c.sector_id = s.sector_id
            WHERE c.is_active = true
        `;
        const params: any[] = [];
        let paramIdx = 1;

        if (sector) {
            query += ` AND s.sector_key = $${paramIdx++}`;
            params.push(sector);
        }
        if (island) {
            query += ` AND c.island = $${paramIdx++}`;
            params.push(island);
        }
        if (featured === 'true') {
            query += ` AND c.is_featured = true`;
        }

        query += ` ORDER BY s.sort_order ASC, c.is_featured DESC, c.name ASC`;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching coops:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get coop sectors
export const getCoopSectors = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM coop_sectors WHERE is_active = true ORDER BY sort_order ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching coop sectors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get single coop by slug
export const getCoopBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            `SELECT c.*, s.sector_key, s.display_name as sector_name, s.icon as sector_icon, s.color as sector_color
             FROM coops c
             JOIN coop_sectors s ON c.sector_id = s.sector_id
             WHERE c.slug = $1 AND c.is_active = true`,
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Co-op not found' });
        }

        // Get services
        const servicesRes = await pool.query(
            'SELECT * FROM coop_services WHERE coop_id = $1 AND is_active = true ORDER BY service_name ASC',
            [result.rows[0].coop_id]
        );

        // Get member count
        const membersRes = await pool.query(
            'SELECT COUNT(*) as member_count FROM coop_members WHERE coop_id = $1',
            [result.rows[0].coop_id]
        );

        res.json({
            ...result.rows[0],
            services: servicesRes.rows,
            member_count: parseInt(membersRes.rows[0].member_count),
        });
    } catch (error) {
        console.error('Error fetching coop:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get IBT store services (from listings)
export const getIBTServices = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT l.id, l.title, l.description, l.price, l.metadata, l.slug, l.service_type
             FROM listings l
             JOIN stores s ON l.store_id = s.store_id
             WHERE s.slug = 'ibt-solutions' AND l.is_active = true AND l.status = 'active'
             ORDER BY l.price DESC`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching IBT services:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Submit service inquiry
export const submitServiceInquiry = async (req: Request, res: Response) => {
    try {
        const { service_type, name, email, phone, company, website, message, budget_range } = req.body;

        if (!service_type || !name || !email) {
            return res.status(400).json({ error: 'Service type, name, and email are required' });
        }

        const result = await pool.query(
            `INSERT INTO service_inquiries (service_type, name, email, phone, company, website, message, budget_range, source)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'ibt_store')
             RETURNING *`,
            [service_type, name, email, phone, company, website, message, budget_range]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
