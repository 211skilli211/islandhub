import { Request, Response } from 'express';
import { pool } from '../config/db';
import { convertToCSV } from '../utils/csvExport';
import { slugify } from '../utils/slugify';

export const getAllStores = async (req: Request, res: Response) => {
    try {
        const { page, limit, category, subscription_type, status, sortBy, sortOrder, search, date, export: exportType, ids, is_featured, is_promoted } = req.query;

        // JOIN vendors to get admin_rating and badges
        let query = `
            SELECT s.*, s.store_id as id, v.admin_rating, v.admin_rating as rating, v.badges, v.is_featured,
                   u.name as owner_name,
                   COALESCE(s.logo_url, v.logo_url) as logo_url,
                   COALESCE(s.banner_url, v.banner_url) as banner_url,
                   COALESCE(s.branding_color, v.branding_color, '#14b8a6') as branding_color,
                   v.secondary_color
            FROM stores s
            LEFT JOIN vendors v ON s.vendor_id = v.user_id
            LEFT JOIN users u ON s.vendor_id = u.user_id
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) 
            FROM stores s
            LEFT JOIN vendors v ON s.vendor_id = v.user_id
            WHERE 1=1
        `;
        const params: any[] = [];

        // ID Filtering (for selective export)
        if (ids) {
            const idList = (ids as string).split(',');
            if (idList.length > 0) {
                query += ` AND s.store_id = ANY($${params.length + 1})`;
                countQuery += ` AND s.store_id = ANY($${params.length + 1})`;
                params.push(idList);
            }
        }

        // Map frontend category names to database category names
        const categoryMap: Record<string, string[]> = {
            'food': ['Food', 'Food & Dining', 'Restaurant', 'food', 'Cafe', 'Dining'],
            'product': ['Retail', 'Retail & Shopping', 'E-Commerce', 'Shopping', 'product', 'products', 'Products', 'Boutique'],
            'service': ['Service', 'Professional Services', 'service', 'services', 'Services', 'Tours', 'Experiences'],
            'rental': ['Rental', 'Rentals & Property', 'rental', 'rentals', 'Rentals', 'Accommodation', 'Transport']
        };

        if (category) {
            const dbCategories = categoryMap[category as string] || [category];
            query += ` AND s.category = ANY($${params.length + 1})`;
            countQuery += ` AND s.category = ANY($${params.length + 1})`;
            params.push(dbCategories);
        }
        if (subscription_type) {
            query += ` AND s.subscription_type = $${params.length + 1}`;
            countQuery += ` AND s.subscription_type = $${params.length + 1}`;
            params.push(subscription_type);
        }
        if (status) {
            query += ` AND s.status = $${params.length + 1}`;
            countQuery += ` AND s.status = $${params.length + 1}`;
            params.push(status);
        }
        if (date) {
            let interval = '';
            if (date === 'today') interval = '1 day';
            else if (date === 'week') interval = '7 days';
            else if (date === 'month') interval = '30 days';

            if (interval) {
                query += ` AND s.created_at >= NOW() - INTERVAL '${interval}'`;
                countQuery += ` AND s.created_at >= NOW() - INTERVAL '${interval}'`;
            }
        }
        if (is_featured !== undefined) {
            query += ` AND v.is_featured = $${params.length + 1}`;
            countQuery += ` AND v.is_featured = $${params.length + 1}`;
            params.push(is_featured === 'true');
        }
        if (is_promoted !== undefined) {
            query += ` AND s.is_promoted = $${params.length + 1}`;
            countQuery += ` AND s.is_promoted = $${params.length + 1}`;
            params.push(is_promoted === 'true');
        }
        if (search) {
            query += ` AND (s.name ILIKE $${params.length + 1} OR s.subtype ILIKE $${params.length + 1})`;
            countQuery += ` AND (s.name ILIKE $${params.length + 1} OR s.subtype ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        const sortColumn = (sortBy as string) || 'created_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
        // Prefix ambiguous columns with table alias
        const safeSortColumn = ['name', 'category', 'subscription_type', 'status'].includes(sortColumn) ? `s.${sortColumn}` : sortColumn === 'rating' ? 'v.admin_rating' : 's.created_at';

        if (exportType === 'csv') {
            query += ` ORDER BY ${safeSortColumn} ${order}`;
            const result = await pool.query(query, params);
            const csv = convertToCSV(result.rows);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=stores.csv');
            return res.status(200).send(csv);
        }

        if (page) {
            const pageNum = parseInt(page as string) || 1;
            const limitNum = parseInt(limit as string) || 10;
            const offset = (pageNum - 1) * limitNum;

            query += ` ORDER BY ${safeSortColumn} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limitNum, offset);

            const [dataResult, countResult] = await Promise.all([
                pool.query(query, params),
                pool.query(countQuery, params.slice(0, params.length - 2))
            ]);

            const total = parseInt(countResult.rows[0].count);
            return res.json({
                stores: dataResult.rows,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            });
        } else {
            query += ` ORDER BY ${safeSortColumn} ${order}`;
            const result = await pool.query(query, params);
            res.json(result.rows);
        }
    } catch (error: any) {
        // Gracefully handle missing tables (Neon fresh database)
        if (error.code === '42P01' || error.code === '42703') {
            console.warn('Stores table not initialized, returning empty array');
            return res.json({ stores: [], total: 0, page: 1, limit: 10, totalPages: 0 });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Separate store updates from vendor updates (rating, badges)
        const { admin_rating, badges, template_id, template_config, rating, subtype_id, subtype, category, ...storeUpdates } = updates;

        // Map frontend fields to database fields
        if (subtype_id) storeUpdates.subtype_id = subtype_id;
        if (subtype) storeUpdates.subtype = subtype;
        if (category) storeUpdates.category = category;

        if (template_id) storeUpdates.template_id = template_id;
        if (template_config) storeUpdates.template_config = typeof template_config === 'string' ? template_config : JSON.stringify(template_config);

        // Process slug if provided
        if (storeUpdates.slug) {
            storeUpdates.slug = slugify(storeUpdates.slug);
            const slugCheck = await pool.query('SELECT store_id FROM stores WHERE slug = $1 AND store_id != $2', [storeUpdates.slug, id]);
            if (slugCheck.rows.length > 0) {
                return res.status(409).json({ message: 'This slug is already taken. Please choose another one.' });
            }
        }

        // Update Vendor-level fields if provided
        if (admin_rating !== undefined || badges !== undefined) {
            // Get vendor_id from store first
            const storeRes = await pool.query('SELECT vendor_id FROM stores WHERE store_id = $1', [id]);
            if (storeRes.rows.length > 0) {
                const vendorId = storeRes.rows[0].vendor_id;
                const vendorFields: string[] = [];
                const vendorValues: any[] = [];

                if (admin_rating !== undefined) {
                    vendorFields.push(`admin_rating = $${vendorValues.length + 1}`);
                    vendorValues.push(admin_rating);
                }
                if (badges !== undefined) {
                    vendorFields.push(`badges = $${vendorValues.length + 1}`);
                    vendorValues.push(JSON.stringify(badges));
                }

                if (vendorFields.length > 0) {
                    vendorValues.push(vendorId);
                    await pool.query(`UPDATE vendors SET ${vendorFields.join(', ')} WHERE id = $${vendorValues.length}`, vendorValues);
                }
            }
        }

        const fields = Object.keys(storeUpdates);
        const values = Object.values(storeUpdates);

        if (fields.length > 0) {
            const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
            values.push(id);

            const result = await pool.query(
                `UPDATE stores SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE store_id = $${values.length} RETURNING *`,
                values
            );
            return res.json(result.rows[0]);
        }

        // If only rating/badges was updated
        res.json({ message: 'Store updated successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteStore = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM stores WHERE store_id = $1', [id]);
        res.json({ message: 'Store deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyStores = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const result = await pool.query(
            `SELECT s.*, s.store_id as id, 
                    (SELECT id FROM listings WHERE store_id = s.store_id LIMIT 1) as primary_listing_id 
             FROM stores s 
             WHERE s.vendor_id = $1 
             ORDER BY s.created_at DESC`,
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('getMyStores error:', error);
        res.status(500).json({ message: 'Server error retrieving stores' });
    }
};

export const updateMyStore = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { storeId: bodyStoreId, template_id, template_config, ...updates } = req.body;

        if (template_id) updates.template_id = template_id;
        if (template_config) updates.template_config = typeof template_config === 'string' ? template_config : JSON.stringify(template_config);

        // Find store by user ownership
        let query = 'SELECT store_id FROM stores WHERE vendor_id = $1';
        let params: any[] = [userId];

        if (bodyStoreId) {
            query += ' AND store_id = $2';
            params.push(bodyStoreId);
        }

        const storeRes = await pool.query(query, params);
        if (storeRes.rows.length === 0) return res.status(404).json({ message: 'Store not found or unauthorized' });

        const storeId = storeRes.rows[0].store_id;

        // Process slug if provided
        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const slugCheck = await pool.query('SELECT store_id FROM stores WHERE slug = $1 AND store_id != $2', [updates.slug, storeId]);
            if (slugCheck.rows.length > 0) {
                return res.status(409).json({ message: 'This slug is already taken. Please choose another one.' });
            }
        }

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length > 0) {
            const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
            values.push(storeId);

            const result = await pool.query(
                `UPDATE stores SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE store_id = $${values.length} RETURNING *`,
                values
            );
            return res.json(result.rows[0]);
        }
        res.status(400).json({ message: 'No updates provided' });
    } catch (error) {
        console.error('updateMyStore error:', error);
        res.status(500).json({ message: 'Server error updating store' });
    }
};

export const getStoreBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const result = await pool.query(
            `SELECT s.*, v.business_name as vendor_name, v.id as vendor_primary_id, v.contact_email, v.contact_phone, v.location, v.bio, v.badges, v.admin_rating as rating,
                    COALESCE(s.logo_url, v.logo_url) as logo_url,
                    COALESCE(s.banner_url, v.banner_url) as banner_url,
                    COALESCE(s.branding_color, v.branding_color, '#14b8a6') as branding_color,
                    s.hero_title, s.show_hero_title, s.hero_subtitle, s.hero_cta_text, s.hero_cta_link, s.hero_icon_url, s.typography, s.branding_icon_url,
                    s.aims, s.objectives, s.website_url, s.business_address, s.business_hours, s.service_mode
             FROM stores s
             LEFT JOIN vendors v ON s.vendor_id = v.user_id
             WHERE s.slug = $1 OR (s.store_id::text = $1 AND $1 ~ '^[0-9]+$')`,
            [slug]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Map fields to match what the frontend expects for a "vendor" profile
        const store = result.rows[0];
        const mappedStore = {
            ...store,
            id: store.store_id, // Use store_id as the primary identifier
            business_name: store.name,
            description: store.description,
            // Fallback to vendor bio if store description is missing
            bio: store.description || store.bio,
            logo_url: store.logo_url,
            banner_url: store.banner_url,
            branding_color: store.branding_color,
            hero_title: store.hero_title,
            show_hero_title: store.show_hero_title
        };

        res.json(mappedStore);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createStore = async (req: Request, res: Response) => {
    try {
        const { vendor_id, name, slug, description, category, category_type, subtype, status, subscription_type, logo_url, banner_url, branding_color, template_id, template_config } = req.body;

        if (!vendor_id || !name) {
            return res.status(400).json({ message: 'Vendor ID and Store Name are required.' });
        }

        // 1. Process Slug
        let finalSlug = slug ? slugify(slug) : slugify(name);
        const slugCheck = await pool.query('SELECT store_id FROM stores WHERE slug = $1', [finalSlug]);
        if (slugCheck.rows.length > 0) {
            finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // 2. Insert into stores
        // Default template_id based on category if not provided
        let finalTemplateId = template_id;
        if (!finalTemplateId && category) {
            const cat = category.toLowerCase();
            if (cat.includes('food')) finalTemplateId = 'food_vendor';
            else if (cat.includes('rental') || cat.includes('host')) finalTemplateId = 'host_rental';
            else if (cat.includes('service')) finalTemplateId = 'service_provider';
            else if (cat.includes('product') || cat.includes('retail')) finalTemplateId = 'retail_produce';
        }

        const result = await pool.query(
            `INSERT INTO stores (
                vendor_id, name, slug, description, category, category_type, subtype, status, subscription_type, logo_url, banner_url, branding_color, template_id, template_config
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
            RETURNING *`,
            [
                vendor_id, name, finalSlug, description, category, category_type, subtype,
                status || 'active', subscription_type || 'basic', logo_url, banner_url,
                branding_color || '#14b8a6', finalTemplateId,
                template_config ? (typeof template_config === 'string' ? template_config : JSON.stringify(template_config)) : '{}'
            ]
        );

        // 3. Update user role if they are just a 'user'
        await pool.query(
            "UPDATE users SET role = 'vendor' WHERE user_id = $1 AND role = 'user'",
            [vendor_id]
        );

        // 4. Ensure vendor profile exists
        const vendorCheck = await pool.query('SELECT user_id FROM vendors WHERE user_id = $1', [vendor_id]);
        if (vendorCheck.rows.length === 0) {
            await pool.query(
                `INSERT INTO vendors (user_id, business_name, slug, description, logo_url, banner_url, branding_color, sub_type)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [vendor_id, name, finalSlug, description, logo_url, banner_url, branding_color, subtype]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Server error creating store' });
    }
};

// Get store templates for vendor category
export const getStoreTemplates = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        // Get vendor's store category
        const storeRes = await pool.query('SELECT category FROM stores WHERE vendor_id = $1 LIMIT 1', [userId]);
        const category = storeRes.rows[0]?.category;

        // Default templates by category
        const defaultTemplates: Record<string, any[]> = {
            'Food': [
                { template_id: 1, template_key: 'restaurant', template_name: 'Restaurant', description: 'Full-service restaurant layout with menu sections', icon: '🍽️', category: 'Food' },
                { template_id: 2, template_key: 'cafe', template_name: 'Cafe', description: 'Coffee shop layout with beverage menu', icon: '☕', category: 'Food' },
                { template_id: 3, template_key: 'fast_food', template_name: 'Fast Food', description: 'Quick service layout with online ordering', icon: '🍔', category: 'Food' },
                { template_id: 4, template_key: 'ghost_kitchen', template_name: 'Ghost Kitchen', description: 'Delivery-only kitchen layout', icon: '📦', category: 'Food' }
            ],
            'Retail': [
                { template_id: 5, template_key: 'boutique', template_name: 'Boutique', description: 'Elegant shop layout for fashion & accessories', icon: '👗', category: 'Retail' },
                { template_id: 6, template_key: 'marketplace', template_name: 'Marketplace', description: 'Multi-vendor marketplace layout', icon: '🏪', category: 'Retail' },
                { template_id: 7, template_key: 'popup_shop', template_name: 'Popup Shop', description: 'Pop-up store layout for events', icon: '🎪', category: 'Retail' }
            ],
            'Service': [
                { template_id: 8, template_key: 'professional', template_name: 'Professional', description: 'Consulting & professional services layout', icon: '💼', category: 'Service' },
                { template_id: 9, template_key: 'booking', template_name: 'Booking', description: 'Service booking layout with appointments', icon: '📅', category: 'Service' }
            ],
            'Rental': [
                { template_id: 10, template_key: 'property', template_name: 'Property', description: 'Property rental layout', icon: '🏠', category: 'Rental' },
                { template_id: 11, template_key: 'vehicle', template_name: 'Vehicle', description: 'Vehicle rental layout', icon: '🚗', category: 'Rental' },
                { template_id: 12, template_key: 'equipment', template_name: 'Equipment', description: 'Equipment rental layout', icon: '🔧', category: 'Rental' }
            ]
        };

        // Try to get from database first
        const dbTemplates = await pool.query('SELECT * FROM store_template_types WHERE is_active = true ORDER BY category, template_name');

        if (dbTemplates.rows.length > 0) {
            res.json(dbTemplates.rows);
        } else {
            // Return default templates based on category
            const categoryTemplates = defaultTemplates[category] || defaultTemplates['Retail'];
            res.json(categoryTemplates);
        }
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ message: 'Server error fetching templates' });
    }
};

// Update store template
export const updateMyStoreTemplate = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const { templateId } = req.params;

        // Get user's store
        const storeRes = await pool.query('SELECT store_id FROM stores WHERE vendor_id = $1 LIMIT 1', [userId]);
        if (storeRes.rows.length === 0) {
            return res.status(404).json({ message: 'Store not found' });
        }
        const storeId = storeRes.rows[0].store_id;

        // Update store template
        await pool.query('UPDATE stores SET template_id = $1, updated_at = NOW() WHERE store_id = $2', [templateId, storeId]);

        res.json({ success: true, message: 'Template updated successfully' });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ message: 'Server error updating template' });
    }
};

