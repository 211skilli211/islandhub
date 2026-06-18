import { Request, Response } from 'express';
import { pool } from '../config/db';

// Get all vendors with optional category filtering
export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const { category } = req.query;
        let query = `SELECT v.*, u.name as owner_name, u.email as owner_email 
                     FROM vendors v 
                     JOIN users u ON v.user_id = u.user_id 
                     WHERE 1=1`;
        const params: any[] = [];

        if (category && category !== 'All') {
            query += ` AND v.sub_type = $${params.length + 1}`;
            params.push(category);
        }

        query += ' ORDER BY v.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all vendors error:', error);
        res.status(500).json({ message: 'Failed to fetch vendors' });
    }
};

// Get vendor profile by user ID or vendor ID
export const getVendorProfile = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        let query = 'SELECT v.*, u.name as owner_name, u.email as owner_email FROM vendors v JOIN users u ON v.user_id = u.user_id WHERE v.id::text = $1';
        const params: any[] = [id];

        // If numeric, also check user_id
        if (id && /^\d+$/.test(id as string)) {
            query += ' OR v.user_id = $1::integer';
        }

        const vendor = await pool.query(query, params);

        if (vendor.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(vendor.rows[0]);
    } catch (error) {
        console.error('Get vendor profile error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor profile' });
    }
};

// Get current user's vendor profile
export const getMyVendorProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        const userRole = (req.user as any)?.role;

        let vendorRes = await pool.query(
            'SELECT v.*, u.name as owner_name, u.email as owner_email FROM vendors v JOIN users u ON v.user_id = u.user_id WHERE v.user_id = $1',
            [userId]
        );

        if (vendorRes.rows.length === 0) {
            // Auto-create profile if vendor or admin
            if (userRole === 'vendor' || userRole === 'admin') {
                const userRes = await pool.query('SELECT name FROM users WHERE user_id = $1', [userId]);
                const userName = userRes.rows[0]?.name || 'New Vendor';
                const businessName = `${userName}'s Store`;
                const slug = `store-${userId}-${Math.random().toString(36).substr(2, 5)}`;

                const newVendor = await pool.query(
                    `INSERT INTO vendors (user_id, business_name, slug) 
                     VALUES ($1, $2, $3) 
                     RETURNING *`,
                    [userId, businessName, slug]
                );

                // Provision default store
                await pool.query(
                    `INSERT INTO stores (vendor_id, name, slug, status)
                     VALUES ($1, $2, $3, 'active')
                     ON CONFLICT DO NOTHING`,
                    [userId, businessName, slug]
                );

                // Provision default subscription
                const expiresAt = new Date();
                expiresAt.setMonth(expiresAt.getMonth() + 1);
                await pool.query(
                    `INSERT INTO vendor_subscriptions (vendor_id, tier, vendor_type, status, current_period_start, current_period_end)
                     VALUES ($1, $2, 'product', 'active', NOW(), $3)
                     ON CONFLICT DO NOTHING`,
                    [newVendor.rows[0].id, 'basic', expiresAt]
                );

                // Fetch again to get joined user info
                vendorRes = await pool.query(
                    'SELECT v.*, u.name as owner_name, u.email as owner_email FROM vendors v JOIN users u ON v.user_id = u.user_id WHERE v.user_id = $1',
                    [userId]
                );
            } else {
                return res.status(404).json({ message: 'Vendor profile not found' });
            }
        }

        res.json(vendorRes.rows[0]);
    } catch (error) {
        console.error('Get my vendor profile error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor profile' });
    }
};

// Create or update vendor profile
export const updateVendorProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { business_name, description, logo_url, banner_url, contact_email, contact_phone, location, bio, theme_color, slug, sub_type, branding_color, secondary_color, promo_video_url, audio_intro_url, type, country } = req.body;

        const existingVendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);

        // Auto-generate slug if missing
        let finalSlug = slug;
        if ((!finalSlug || finalSlug.trim() === '') && business_name) {
            finalSlug = business_name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }
        const slugToUse = (slug && slug.trim() !== '') ? slug : finalSlug;

        if (existingVendor.rows.length > 0) {
            // Update
            const updated = await pool.query(
                `UPDATE vendors SET 
                    business_name = COALESCE($1, business_name),
                    description = COALESCE($2, description),
                    logo_url = COALESCE($3, logo_url),
                    banner_url = COALESCE($4, banner_url),
                    contact_email = COALESCE($5, contact_email),
                    contact_phone = COALESCE($6, contact_phone),
                    location = COALESCE($7, location),
                    bio = COALESCE($8, bio),
                    theme_color = COALESCE($9, theme_color),
                    slug = COALESCE($10, slug, $11),
                    sub_type = COALESCE($12, sub_type),
                    branding_color = COALESCE($13, branding_color),
                    secondary_color = COALESCE($14, secondary_color),
                    promo_video_url = COALESCE($15, promo_video_url),
                    audio_intro_url = COALESCE($16, audio_intro_url)
                WHERE user_id = $17 RETURNING *`,
                [business_name, description, logo_url, banner_url, contact_email, contact_phone, location, bio, theme_color, (slugToUse || null), finalSlug, sub_type, branding_color, secondary_color, promo_video_url, audio_intro_url, userId]
            );

            // Also sync to store if it exists
            await pool.query(
                `UPDATE stores SET 
                    name = COALESCE($1, name),
                    description = COALESCE($2, description),
                    logo_url = COALESCE($3, logo_url),
                    banner_url = COALESCE($4, banner_url),
                    slug = COALESCE($5, slug, $6),
                    branding_color = COALESCE($7, branding_color)
                WHERE vendor_id = $8`,
                [business_name, description, logo_url, banner_url, slug, finalSlug, branding_color, userId]
            );

            res.json(updated.rows[0]);
        } else {
            // Create Vendor - set status to pending for KYB verification
            const created = await pool.query(
                `INSERT INTO vendors (user_id, business_name, description, logo_url, banner_url, contact_email, contact_phone, location, bio, theme_color, slug, sub_type, branding_color, secondary_color, promo_video_url, audio_intro_url, status, kyb_verified)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'pending', FALSE) RETURNING *`,
                [userId, business_name, description, logo_url, banner_url, contact_email, contact_phone, location, bio, theme_color, finalSlug || slug, sub_type, branding_color, secondary_color, promo_video_url, audio_intro_url]
            );

            // Create Default Store for this vendor - pending until KYB verified
            const fullLocation = country ? `${location || ''}, ${country}`.trim() : location;
            await pool.query(
                `INSERT INTO stores (vendor_id, name, slug, description, category, subtype, logo_url, banner_url, branding_color, location, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
                ON CONFLICT (slug) DO NOTHING`,
                [userId, business_name, finalSlug || slug, description, 'Boutique', sub_type || 'Artisan', logo_url, banner_url, branding_color || '#14b8a6', fullLocation]
            );

            // Create Default Subscription (Trial/Basic)
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            await pool.query(
                `INSERT INTO vendor_subscriptions (vendor_id, tier, vendor_type, status, current_period_start, current_period_end)
                VALUES ($1, $2, $3, 'active', NOW(), $4)
                ON CONFLICT DO NOTHING`,
                [created.rows[0].id, 'basic', type || 'product', expiresAt]
            );

            // Update user role
            const roleUpdate = await pool.query('UPDATE users SET role = $1 WHERE user_id = $2 RETURNING *', ['vendor', userId]);
            console.log('User role updated:', roleUpdate.rows[0]);

            res.status(201).json(created.rows[0]);
        }
    } catch (error) {
        console.error('Update vendor profile error:', error);
        res.status(500).json({ message: 'Failed to update vendor profile' });
    }
};

// Get vendor listings
export const getVendorListings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Find user_id for this vendor (ID could be vendor ID or User ID)
        const vendor = await pool.query('SELECT user_id FROM vendors WHERE id::text = $1 OR user_id::text = $1', [id]);
        if (vendor.rows.length === 0) {
            // Check if user exists even if not in vendors table (e.g. creators)
            const userCheck = await pool.query('SELECT user_id FROM users WHERE user_id::text = $1', [id]);
            if (userCheck.rows.length === 0) {
                return res.status(404).json({ message: 'Vendor or User not found' });
            }
            const userId = userCheck.rows[0].user_id;
            const listings = await pool.query(
                'SELECT * FROM listings WHERE creator_id = $1 ORDER BY created_at DESC',
                [userId]
            );
            return res.json(listings.rows);
        }

        const userId = vendor.rows[0].user_id;

        const listings = await pool.query(
            'SELECT * FROM listings WHERE creator_id = $1 ORDER BY created_at DESC',
            [userId]
        );

        res.json(listings.rows);
    } catch (error) {
        console.error('Get vendor listings error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor listings' });
    }
};

// Get vendor profile by slug
export const getVendorBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const vendor = await pool.query(
            'SELECT v.*, u.name as owner_name, u.email as owner_email FROM vendors v JOIN users u ON v.user_id = u.user_id WHERE v.slug = $1',
            [slug]
        );

        if (vendor.rows.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        res.json(vendor.rows[0]);
    } catch (error) {
        console.error('Get vendor by slug error:', error);
        res.status(500).json({ message: 'Failed to fetch vendor profile' });
    }
};
