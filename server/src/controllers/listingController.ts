import { Request, Response } from 'express';
import { pool } from '../config/db';
import { logAdminAction } from './adminController';
import { convertToCSV } from '../utils/csvExport';
import { slugify } from '../utils/slugify';

export const createListing = async (req: Request, res: Response) => {
    try {
        let {
            title, description, price, type, category, sub_category,
            goal_amount, start_date, end_date, images, photos,
            currency, badges, metadata, duration, capacity, location, addons, tour_category,
            category_id, subtype_id, slug
        } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Handle custom product type with verification status
        let customProductType = null;
        let customTypeStatus = null;
        if (metadata && metadata.custom_product_type) {
            customProductType = metadata.custom_product_type;
            customTypeStatus = metadata.custom_type_status || 'pending_verification';
        }

        // Hydrate legacy fields from IDs if provided
        if (category_id) {
            const catResult = await pool.query('SELECT display_name, layout_type, category_key FROM vendor_categories WHERE category_id = $1', [category_id]);
            if (catResult.rows.length > 0) {
                const catData = catResult.rows[0];
                if (!category) category = catData.category_key;
                if (!type) type = catData.layout_type;
            }
        }

        if (subtype_id) {
            const subResult = await pool.query('SELECT display_name FROM vendor_subtypes WHERE subtype_id = $1', [subtype_id]);
            if (subResult.rows.length > 0) {
                if (!sub_category) sub_category = subResult.rows[0].display_name;
            }
        }

        // Base validation - allow custom type listings to be created
        if (!title || !description) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Determine status based on custom type verification
        let listingStatus = 'active';
        if (type === 'custom' || customTypeStatus === 'pending_verification') {
            listingStatus = 'pending_verification';
        }

        // Validate Category Integrity and Determine store_id
        let target_store_id: number | null = null;
        let storeInfo: any = null;

        // If explicit store_id is provided, check permissions
        if (req.body.store_id) {
            const userRole = (req.user as any)?.role;
            const specifiedStore = await pool.query('SELECT store_id, category, vendor_id FROM stores WHERE store_id = $1', [req.body.store_id]);

            if (specifiedStore.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid store_id' });
            }

            // Check ownership or admin
            if (userRole !== 'admin' && specifiedStore.rows[0].vendor_id !== userId) {
                return res.status(403).json({ message: 'You do not own this store' });
            }

            storeInfo = specifiedStore.rows[0];
            target_store_id = storeInfo.store_id;
        } else {
            // Fallback: Try to find a store owned by the user
            const storeRes = await pool.query('SELECT store_id FROM stores WHERE vendor_id = $1 ORDER BY created_at ASC', [userId]);

            if (storeRes.rows.length === 1) {
                // If only one store, default to it
                target_store_id = storeRes.rows[0].store_id;
            } else if (storeRes.rows.length > 1) {
                // If multiple stores, we MUST require a store_id selection to prevent pollution
                return res.status(400).json({
                    message: 'Multiple stores found. Please specify a store_id for this listing.',
                    stores: storeRes.rows
                });
            } else if (req.user && (req.user as any).vendor_id) {
                // Legacy support for vendors table if stores table is empty for them
                target_store_id = (req.user as any).vendor_id;
            }
        }

        // Handle Slug Generation
        let finalSlug = slug ? slugify(slug) : slugify(title);
        const slugCheck = await pool.query('SELECT id FROM listings WHERE slug = $1', [finalSlug]);
        if (slugCheck.rows.length > 0) {
            finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }

        // Validate and Process Photos
        let validPhotos = photos || [];
        // If legacy images array is provided but no photos, convert it
        if ((!validPhotos || validPhotos.length === 0) && images && Array.isArray(images)) {
            validPhotos = images.map((img: string, idx: number) => ({
                id: crypto.randomUUID(),
                url: img,
                is_primary: idx === 0,
                order_index: idx
            }));
        } else if (validPhotos && Array.isArray(validPhotos)) {
            // Ensure only one primary
            const hasPrimary = validPhotos.some((p: any) => p.is_primary);
            if (!hasPrimary && validPhotos.length > 0) {
                validPhotos[0].is_primary = true;
            } else if (hasPrimary) {
                // If multiple primary, enforce only the first one found
                let primaryFound = false;
                validPhotos = validPhotos.map((p: any) => {
                    if (p.is_primary) {
                        if (!primaryFound) {
                            primaryFound = true;
                            return p;
                        } else {
                            return { ...p, is_primary: false };
                        }
                    }
                    return p;
                });
            }
        }

        const result = await pool.query(
            `INSERT INTO listings (
                title, description, price, type, category, sub_category,
                goal_amount, start_date, end_date, creator_id,
                store_id, images, photos, currency, status, badges,
                duration, capacity, location, addons, tour_category, metadata,
                category_id, subtype_id, slug
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING *`,
            [
                title, description, price, customProductType || type, category, sub_category || null,
                goal_amount || null, start_date || null, end_date || null,
                userId, target_store_id, images || [], JSON.stringify(validPhotos), currency || 'USD',
                listingStatus, badges || [], duration || null, capacity || null, location || null,
                addons || [], tour_category || null, JSON.stringify(metadata || {}),
                category_id || null, subtype_id || null, finalSlug
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Create Listing Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getListings = async (req: Request, res: Response) => {
    try {
        const { type, category, status, page, limit, sortBy, sortOrder, search, date, export: exportType, ids } = req.query;

        // Base query setup
        let whereClauses = ["1=1"];
        const params: any[] = [];

        // Logistics filtering: exclude on-demand jobs from regular browse
        if (!req.query.service_type) {
            whereClauses.push("(l.service_type NOT IN ('taxi', 'delivery', 'pickup') OR l.service_type IS NULL)");
        } else if (['taxi', 'delivery', 'pickup'].includes(req.query.service_type as string)) {
            whereClauses.push(`l.service_type = $${params.length + 1}`);
            params.push(req.query.service_type);
        }

        // ID Filtering
        if (ids) {
            const idList = (ids as string).split(',');
            if (idList.length > 0) {
                whereClauses.push(`l.id = ANY($${params.length + 1})`);
                params.push(idList);
            }
        }

        let query = `
            SELECT l.*, s.name as shop_name, s.logo_url as shop_logo, s.slug as shop_slug,
                   u.name as owner_name,
                   d.name as driver_name,
                   EXISTS(SELECT 1 FROM delivery_ratings dr WHERE dr.delivery_id = l.id) as is_rated,
                   (
                       SELECT url 
                       FROM jsonb_to_recordset(l.photos) AS x(url text, is_primary boolean) 
                       WHERE is_primary = true 
                       LIMIT 1
                   ) as image_url
            FROM listings l
            LEFT JOIN stores s ON l.store_id = s.store_id
            LEFT JOIN users u ON l.creator_id = u.user_id
            LEFT JOIN users d ON l.driver_id = d.user_id
            WHERE ${whereClauses.join(' AND ')}
        `;
        let countQuery = `
            SELECT COUNT(*) 
            FROM listings l
            LEFT JOIN stores s ON l.store_id = s.store_id
            LEFT JOIN users u ON l.creator_id = u.user_id
            WHERE ${whereClauses.join(' AND ')}
        `;

        // Filter Builders

        // Filter Builders
        if (type) {
            query += ` AND l.type = $${params.length + 1}`;
            countQuery += ` AND l.type = $${params.length + 1}`;
            params.push(type);
        }
        if (category) {
            const categoryMap: Record<string, string[]> = {
                'food': ['Food', 'Food & Dining', 'Restaurant', 'food', 'Cafe', 'Dining'],
                'product': ['Retail', 'Retail & Shopping', 'E-Commerce', 'Shopping', 'product', 'products', 'Products', 'Boutique'],
                'service': ['Service', 'Professional Services', 'service', 'services', 'Services', 'Tours', 'Experiences'],
                'tour': ['Service', 'Tours', 'tour', 'experience', 'Experience'],
                'experience': ['Service', 'Tours', 'tour', 'experience', 'Experience'],
                'rental': ['Rental', 'Rentals & Property', 'rental', 'rentals', 'Rentals', 'Accommodation', 'Transport'],
                'campaign': ['Campaign', 'Fundraiser', 'Donation', 'campaign']
            };
            const dbCategories = categoryMap[category as string] || [category];
            query += ` AND l.category = ANY($${params.length + 1})`;
            countQuery += ` AND l.category = ANY($${params.length + 1})`;
            params.push(dbCategories);
        }
        if (status) {
            query += ` AND l.status = $${params.length + 1}`;
            countQuery += ` AND l.status = $${params.length + 1}`;
            params.push(status);
        }
        if (date) {
            let interval = '';
            if (date === 'today') interval = '1 day';
            else if (date === 'week') interval = '7 days';
            else if (date === 'month') interval = '30 days';

            if (interval) {
                query += ` AND l.created_at >= NOW() - INTERVAL '${interval}'`;
                countQuery += ` AND l.created_at >= NOW() - INTERVAL '${interval}'`;
            }
        }
        if (req.query.featured === 'true') {
            query += ` AND l.featured = TRUE`;
            countQuery += ` AND l.featured = TRUE`;
        }
        if (req.query.min_price) {
            query += ` AND (COALESCE(l.price, 0) >= $${params.length + 1} OR COALESCE(l.goal_amount, 0) >= $${params.length + 1})`;
            countQuery += ` AND (COALESCE(l.price, 0) >= $${params.length + 1} OR COALESCE(l.goal_amount, 0) >= $${params.length + 1})`;
            params.push(req.query.min_price);
        }
        if (req.query.max_price) {
            query += ` AND (COALESCE(l.price, 0) <= $${params.length + 1} OR COALESCE(l.goal_amount, 0) <= $${params.length + 1})`;
            countQuery += ` AND (COALESCE(l.price, 0) <= $${params.length + 1} OR COALESCE(l.goal_amount, 0) <= $${params.length + 1})`;
            params.push(req.query.max_price);
        }
        if (req.query.creator_id) {
            query += ` AND l.creator_id = $${params.length + 1}`;
            countQuery += ` AND l.creator_id = $${params.length + 1}`;
            params.push(req.query.creator_id);
        }
        if (req.query.store_id) {
            query += ` AND l.store_id = $${params.length + 1}`;
            countQuery += ` AND l.store_id = $${params.length + 1}`;
            params.push(req.query.store_id);
        }
        if (req.query.sub_category) {
            query += ` AND l.sub_category = $${params.length + 1}`;
            countQuery += ` AND l.sub_category = $${params.length + 1}`;
            params.push(req.query.sub_category);
        }
        if (req.query.tour_category) {
            query += ` AND l.tour_category = $${params.length + 1}`;
            countQuery += ` AND l.tour_category = $${params.length + 1}`;
            params.push(req.query.tour_category);
        }
        if (search) {
            query += ` AND (l.title ILIKE $${params.length + 1} OR l.description ILIKE $${params.length + 1})`;
            countQuery += ` AND (l.title ILIKE $${params.length + 1} OR l.description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }
        if (req.query.driver_id) {
            let driverId: any = req.query.driver_id;
            if (driverId === 'me') {
                if (!req.user?.id) {
                    return res.status(401).json({ message: 'Authentication required for driver_id=me' });
                }
                driverId = req.user.id;
            }
            query += ` AND l.driver_id = $${params.length + 1}`;
            countQuery += ` AND l.driver_id = $${params.length + 1}`;
            params.push(driverId);
        }
        if (req.query.service_type) {
            const serviceTypes = (req.query.service_type as string).split(',');
            query += ` AND l.service_type = ANY($${params.length + 1})`;
            countQuery += ` AND l.service_type = ANY($${params.length + 1})`;
            params.push(serviceTypes);
        }

        // Sorting
        const sortColumn = (sortBy as string) || 'created_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
        // Allow-list for sort columns to prevent SQL injection
        const allowedSorts = ['created_at', 'price', 'title', 'goal_amount', 'is_promoted', 'status', 'type', 'sub_category', 'duration', 'capacity', 'tour_category'];
        const safeSortColumn = allowedSorts.includes(sortColumn) ? sortColumn : 'created_at';

        // CSV Export (Full data for current filters, no pagination)
        if (exportType === 'csv') {
            query += ` ORDER BY l.is_promoted DESC, l.${safeSortColumn} ${order}`;
            const result = await pool.query(query, params);
            const csv = convertToCSV(result.rows);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=listings.csv');
            return res.status(200).send(csv);
        }

        // Handling Pagination vs Legacy
        if (page) {
            const pageNum = parseInt(page as string, 10) || 1;
            const limitNum = parseInt(limit as string, 10) || 10;
            const offset = (pageNum - 1) * limitNum;

            // Add Sort, Limit, Offset to main query
            query += ` ORDER BY l.is_promoted DESC, l.${safeSortColumn} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limitNum, offset);

            const [dataResult, countResult] = await Promise.all([
                pool.query(query, params),
                pool.query(countQuery, params.slice(0, params.length - 2)) // Exclude limit/offset for count
            ]);

            const total = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(total / limitNum);

            return res.json({
                listings: dataResult.rows,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            });
        } else {
            // Legacy Response: Return Array
            query += ` ORDER BY l.is_promoted DESC, l.created_at DESC`;
            const result = await pool.query(query, params);
            return res.json(result.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getListingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT l.*, 
                    v.id as vendor_id, v.business_name as vendor_name, v.bio as vendor_bio, v.logo_url as vendor_logo, 
                    v.branding_color, v.secondary_color,
                    s.slug as store_slug, s.name as store_name,
                    u.name as owner_name 
             FROM listings l 
             LEFT JOIN vendors v ON l.creator_id = v.user_id 
             LEFT JOIN stores s ON l.store_id = s.store_id
             JOIN users u ON l.creator_id = u.user_id
             WHERE l.slug = $1 OR (l.id::text = $1 AND $1 ~ '^[0-9]+$')`,
            [id]
        );

        const listing = result.rows[0];
        if (!listing) return res.status(404).json({ message: 'Listing not found' });

        // Ensure metadata is an object
        if (!listing.metadata) listing.metadata = {};

        // Ensure image_url fallback if photos exist but image_url is missing
        if (!listing.image_url && listing.photos && listing.photos.length > 0) {
            listing.image_url = listing.photos[0];
        }

        // Fetch structured menu if it's a food/product listing
        const menuSections = await pool.query(
            `SELECT * FROM menu_sections WHERE listing_id = $1 ORDER BY priority ASC`,
            [listing.id]
        );

        if (menuSections.rows.length > 0) {
            const sections = [];
            for (const section of menuSections.rows) {
                const items = await pool.query(
                    `SELECT * FROM menu_items WHERE section_id = $1 ORDER BY item_id ASC`,
                    [section.section_id]
                );
                sections.push({
                    ...section,
                    items: items.rows
                });
            }
            listing.metadata = {
                ...listing.metadata,
                menu_sections: sections
            };
        }

        res.json(listing);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const recordListingView = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user?.id || null;
        const ipAddress = req.ip || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Get listing promotion status
        const listing = await pool.query('SELECT is_promoted FROM listings WHERE id = $1', [id]);
        const isPromoted = listing.rows[0]?.is_promoted || false;

        // Optional: Implement simple debouncing/deduplication here if needed
        await pool.query(
            `INSERT INTO listing_views (listing_id, user_id, ip_address, user_agent, is_promoted)
             VALUES ($1, $2, $3, $4, $5)`,
            [id, userId, ipAddress, userAgent, isPromoted]
        );

        res.status(200).json({ message: 'View recorded' });
    } catch (error) {
        console.error('Record view error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateListing = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check ownership or admin status
        const current = await pool.query('SELECT creator_id, type FROM listings WHERE id = $1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });

        const listing = current.rows[0];
        // Allow ONLY admins or the owner
        if (userRole !== 'admin' && listing.creator_id !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validate metadata if present (simplified update validation for now)
        // Ideally reuse create validation logic here

        // Process slug if provided
        if (updates.slug) {
            updates.slug = slugify(updates.slug);
            const slugCheck = await pool.query('SELECT id FROM listings WHERE slug = $1 AND id != $2', [updates.slug, id]);
            if (slugCheck.rows.length > 0) {
                return res.status(409).json({ message: 'This slug is already taken. Please choose another one.' });
            }
        }

        // Build dynamic update query
        const fields = Object.keys(updates).filter(f => !['metadata', 'id', 'creator_id'].includes(f));
        let values = fields.map(f => updates[f]);

        let setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');

        // Handle Metadata specifically for deep merging (optional but safer)
        if (updates.metadata) {
            // If we want to fully replace, we keep as is. 
            // If we want to merge, we use the || operator in Postgres
            const metaIndex = values.length + 1;
            setClause += `, metadata = metadata || $${metaIndex}`;
            values.push(updates.metadata);
        }

        // Handle Photos Update
        if (updates.photos) {
            let validPhotos = updates.photos;
            if (validPhotos && Array.isArray(validPhotos)) {
                // Ensure only one primary
                const hasPrimary = validPhotos.some((p: any) => p.is_primary);
                if (!hasPrimary && validPhotos.length > 0) {
                    validPhotos[0].is_primary = true;
                } else if (hasPrimary) {
                    // Deduplicate logic
                    let primaryFound = false;
                    validPhotos = validPhotos.map((p: any) => {
                        if (p.is_primary) {
                            if (!primaryFound) {
                                primaryFound = true;
                                return p;
                            } else {
                                return { ...p, is_primary: false };
                            }
                        }
                        return p;
                    });
                }
            }

            const photosIndex = values.length + 1;
            setClause += `, photos = $${photosIndex}::jsonb`;
            values.push(JSON.stringify(validPhotos));
        }

        values.push(id);
        const idIndex = values.length;

        const result = await pool.query(
            `UPDATE listings SET ${setClause}, updated_at = CURRENT_TIMESTAMP
             WHERE id = $${idIndex} RETURNING *`,
            values
        );

        // Sync with Menu System if exists
        await pool.query(
            `UPDATE menu_items 
             SET item_name = COALESCE($1, item_name), 
                 description = COALESCE($2, description), 
                 price = COALESCE($3, price) 
             WHERE listing_id = $4`,
            [updates.title, updates.description, updates.price, id]
        );

        // If this is a campaign update by the creator, mark any pending change requests as addressed
        if (listing.type === 'campaign' && listing.creator_id === userId) {
            await pool.query(
                `UPDATE campaign_change_requests
                 SET status = 'addressed', updated_at = CURRENT_TIMESTAMP
                 WHERE listing_id = $1 AND status = 'requested'`,
                [id]
            );
        }

        // Log admin action if admin edited
        if (userRole === 'admin') {
            await logAdminAction(userId, 'edit_listing', parseInt(id as string), updates);
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteListing = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check ownership or admin status
        const current = await pool.query('SELECT creator_id FROM listings WHERE id = $1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Listing not found' });

        if (current.rows[0].creator_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM listings WHERE id = $1', [id]);

        res.json({ message: 'Listing deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getStoreListings = async (req: Request, res: Response) => {
    try {
        const { id } = req.params; // Store ID
        const result = await pool.query(
            `SELECT * FROM listings 
             WHERE store_id = $1 AND status = 'active'
             ORDER BY created_at DESC`,
            [id]
        );
        res.json({ listings: result.rows });
    } catch (error) {
        console.error('getStoreListings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};