import { Request, Response } from 'express';
import { pool } from '../config/db';

// ==================== AD SPACES ====================

// Get all ad spaces
export const getAdSpaces = async (req: Request, res: Response) => {
    try {
        const { location, is_active } = req.query;

        let query = 'SELECT * FROM ad_spaces WHERE 1=1';
        const params: any[] = [];
        let paramCount = 1;

        if (location) {
            query += ` AND location = $${paramCount}`;
            params.push(location);
            paramCount++;
        }

        if (is_active !== undefined) {
            query += ` AND is_active = $${paramCount}`;
            params.push(is_active === 'true');
            paramCount++;
        }

        query += ' ORDER BY location, position';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get ad spaces error:', error);
        res.status(500).json({ message: 'Failed to fetch ad spaces' });
    }
};

// ==================== ADVERTISEMENTS ====================

// Get active ads for a specific location/page
export const getActiveAds = async (req: Request, res: Response) => {
    try {
        const { space_name, location, page } = req.query;

        let query = `
            SELECT a.*, s.name as space_name, s.display_name as space_display_name
            FROM advertisements a
            LEFT JOIN ad_spaces s ON a.ad_space_id = s.space_id
            WHERE a.is_active = true 
            AND a.status = 'active'
            AND (a.start_date IS NULL OR a.start_date <= NOW())
            AND (a.end_date IS NULL OR a.end_date >= NOW())
        `;

        const params: any[] = [];
        let paramCount = 1;

        if (space_name) {
            query += ` AND s.name = $${paramCount}`;
            params.push(space_name);
            paramCount++;
        }

        if (location) {
            query += ` AND s.location = $${paramCount}`;
            params.push(location);
            paramCount++;
        }

        if (page) {
            query += ` AND $${paramCount} = ANY(a.target_pages)`;
            params.push(page);
            paramCount++;
        }

        query += ' ORDER BY a.placement_priority DESC, a.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get active ads error:', error);
        res.status(500).json({ message: 'Failed to fetch active ads' });
    }
};

// Track ad event (impression or click)
export const trackAdEvent = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;
        const { event_type, page_url, page_type, device_type, session_id } = req.body;
        const user_id = (req as any).user?.user_id || null;

        // Insert analytics record
        await pool.query(
            `INSERT INTO ad_analytics 
            (ad_id, event_type, user_id, session_id, page_url, page_type, device_type, user_agent, ip_address)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                ad_id,
                event_type,
                user_id,
                session_id,
                page_url,
                page_type,
                device_type,
                req.headers['user-agent'],
                req.ip
            ]
        );

        // Update ad counters
        if (event_type === 'impression') {
            await pool.query(
                'UPDATE advertisements SET impressions = impressions + 1 WHERE ad_id = $1',
                [ad_id]
            );
        } else if (event_type === 'click') {
            await pool.query(
                'UPDATE advertisements SET clicks = clicks + 1 WHERE ad_id = $1',
                [ad_id]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Track ad event error:', error);
        res.status(500).json({ message: 'Failed to track event' });
    }
};

// Get all advertisements (admin)
export const getAllAdvertisements = async (req: Request, res: Response) => {
    try {
        const { status, advertiser_type } = req.query;

        let query = `
            SELECT a.*, s.name as space_name, s.display_name as space_display_name,
                   u.email as creator_email
            FROM advertisements a
            LEFT JOIN ad_spaces s ON a.ad_space_id = s.space_id
            LEFT JOIN users u ON a.created_by = u.user_id
            WHERE 1=1
        `;

        const params: any[] = [];
        let paramCount = 1;

        if (status) {
            query += ` AND a.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (advertiser_type) {
            query += ` AND a.advertiser_type = $${paramCount}`;
            params.push(advertiser_type);
            paramCount++;
        }

        query += ' ORDER BY a.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get all advertisements error:', error);
        res.status(500).json({ message: 'Failed to fetch advertisements' });
    }
};

// Create advertisement
export const createAdvertisement = async (req: Request, res: Response) => {
    try {
        const {
            title, description, advertiser_type, advertiser_id, advertiser_name,
            contact_email, contact_phone, media_type, media_url, media_urls,
            thumbnail_url, ad_space_id, placement_priority, target_pages,
            target_categories, target_locations, click_action, target_url,
            target_store_id, target_listing_id, start_date, end_date,
            schedule_config, pricing_model, budget_amount, status,
            layout_template,
            // Button control fields
            show_button, button_text, button_style, button_text_color, button_bg_color,
            ...additionalStyleConfig
        } = req.body;

        const created_by = (req as any).user.user_id;

        // Merge button fields into style_config
        const buttonStyleConfig = {
            ...additionalStyleConfig,
            show_button,
            button_text,
            button_style,
            button_text_color,
            button_bg_color
        };

        const result = await pool.query(
            `INSERT INTO advertisements (
                title, description, advertiser_type, advertiser_id, advertiser_name,
                contact_email, contact_phone, media_type, media_url, media_urls,
                thumbnail_url, ad_space_id, placement_priority, target_pages,
                target_categories, target_locations, click_action, target_url,
                target_store_id, target_listing_id, start_date, end_date,
                schedule_config, pricing_model, budget_amount, status, created_by,
                style_config, layout_template
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
            ) RETURNING *`,
            [
                title, description, advertiser_type, advertiser_id, advertiser_name,
                contact_email, contact_phone, media_type, media_url, media_urls,
                thumbnail_url, ad_space_id, placement_priority, target_pages,
                target_categories, target_locations, click_action, target_url,
                target_store_id, target_listing_id, start_date, end_date,
                schedule_config, pricing_model, budget_amount, status || 'draft', created_by,
                JSON.stringify(buttonStyleConfig), layout_template || 'standard'
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Create advertisement error:', error);
        res.status(500).json({ message: 'Failed to create advertisement' });
    }
};

// Update advertisement
export const updateAdvertisement = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;
        const updates = req.body;

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

        const result = await pool.query(
            `UPDATE advertisements SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE ad_id = $${fields.length + 1} RETURNING *`,
            [...values, ad_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update advertisement error:', error);
        res.status(500).json({ message: 'Failed to update advertisement' });
    }
};

// Toggle ad active status
export const toggleAdStatus = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;

        const result = await pool.query(
            `UPDATE advertisements 
             SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP 
             WHERE ad_id = $1 RETURNING *`,
            [ad_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Toggle ad status error:', error);
        res.status(500).json({ message: 'Failed to toggle ad status' });
    }
};

// Approve advertisement
export const approveAdvertisement = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;
        const approved_by = (req as any).user.user_id;

        const result = await pool.query(
            `UPDATE advertisements 
             SET status = 'active', is_active = true, approved_by = $1, approved_at = CURRENT_TIMESTAMP 
             WHERE ad_id = $2 RETURNING *`,
            [approved_by, ad_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Advertisement not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Approve advertisement error:', error);
        res.status(500).json({ message: 'Failed to approve advertisement' });
    }
};

// Delete advertisement
export const deleteAdvertisement = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;

        await pool.query('DELETE FROM advertisements WHERE ad_id = $1', [ad_id]);
        res.json({ message: 'Advertisement deleted successfully' });
    } catch (error) {
        console.error('Delete advertisement error:', error);
        res.status(500).json({ message: 'Failed to delete advertisement' });
    }
};

// Get ad analytics
export const getAdAnalytics = async (req: Request, res: Response) => {
    try {
        const { ad_id } = req.params;
        const { start_date, end_date } = req.query;

        let query = `
            SELECT 
                event_type,
                COUNT(*) as count,
                DATE(event_timestamp) as date
            FROM ad_analytics
            WHERE ad_id = $1
        `;

        const params: any[] = [ad_id];
        let paramCount = 2;

        if (start_date) {
            query += ` AND event_timestamp >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND event_timestamp <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        query += ' GROUP BY event_type, DATE(event_timestamp) ORDER BY date DESC';

        const result = await pool.query(query, params);

        // Also get summary
        const summaryResult = await pool.query(
            'SELECT impressions, clicks FROM advertisements WHERE ad_id = $1',
            [ad_id]
        );

        res.json({
            summary: summaryResult.rows[0],
            details: result.rows
        });
    } catch (error) {
        console.error('Get ad analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

// ==================== VENDOR PROMOTIONS ====================

// Get vendor promotions
export const getVendorPromotions = async (req: Request, res: Response) => {
    try {
        const vendor_id = (req as any).user.user_id;
        const { store_id, is_active } = req.query;

        let query = 'SELECT * FROM vendor_promotions WHERE vendor_id = $1';
        const params: any[] = [vendor_id];
        let paramCount = 2;

        if (store_id) {
            query += ` AND store_id = $${paramCount}`;
            params.push(store_id);
            paramCount++;
        }

        if (is_active !== undefined) {
            query += ` AND is_active = $${paramCount}`;
            params.push(is_active === 'true');
            paramCount++;
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get vendor promotions error:', error);
        res.status(500).json({ message: 'Failed to fetch promotions' });
    }
};

// Get active promotions for a store (public)
export const getStorePromotions = async (req: Request, res: Response) => {
    try {
        const { store_id } = req.params;
        const { placement } = req.query;

        let query = `
            SELECT * FROM vendor_promotions 
            WHERE store_id = $1 
            AND is_active = true
            AND (start_date IS NULL OR start_date <= NOW())
            AND (end_date IS NULL OR end_date >= NOW())
        `;

        const params: any[] = [store_id];

        if (placement) {
            query += ' AND placement = $2';
            params.push(placement);
        }

        query += ' ORDER BY display_order ASC, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get store promotions error:', error);
        res.status(500).json({ message: 'Failed to fetch store promotions' });
    }
};

// Create vendor promotion
export const createVendorPromotion = async (req: Request, res: Response) => {
    try {
        const vendor_id = (req as any).user.user_id;
        const {
            store_id, title, subtitle, promo_type, media_type, media_url,
            background_color, text_color, placement, display_order,
            discount_type, discount_value, promo_code, target_products,
            target_categories, start_date, end_date, is_recurring,
            recurrence_pattern
        } = req.body;

        // Check vendor subscription and promotion limits
        const subscriptionCheck = await pool.query(
            `SELECT vs.tier, vs.status,
                    CASE 
                        WHEN vs.tier = 'free' THEN 0
                        WHEN vs.tier = 'basic' THEN 2
                        WHEN vs.tier = 'pro' THEN 5
                        WHEN vs.tier = 'enterprise' THEN 999
                        ELSE 0
                    END as max_promotions,
                    COUNT(vp.promo_id) as current_promotions
             FROM vendor_subscriptions vs
             LEFT JOIN vendor_promotions vp ON vs.vendor_id = vp.vendor_id 
                AND vp.is_active = true
                AND (vp.end_date IS NULL OR vp.end_date >= NOW())
             WHERE vs.vendor_id = $1 AND vs.status = 'active'
             GROUP BY vs.tier, vs.status`,
            [vendor_id]
        );

        if (subscriptionCheck.rows.length === 0) {
            return res.status(403).json({
                message: 'No active subscription found. Please upgrade to create promotions.'
            });
        }

        const { tier, max_promotions, current_promotions } = subscriptionCheck.rows[0];

        if (current_promotions >= max_promotions) {
            return res.status(403).json({
                message: `Promotion limit reached. Your ${tier} tier allows ${max_promotions} active promotions. Upgrade for more.`,
                current: current_promotions,
                max: max_promotions,
                tier
            });
        }

        // Determine if approval is required based on tier
        const requiresApproval = tier === 'free' || tier === 'basic';
        const approvalStatus = requiresApproval ? 'pending' : 'approved';
        const isActive = !requiresApproval; // Auto-activate for pro/enterprise

        const result = await pool.query(
            `INSERT INTO vendor_promotions (
                vendor_id, store_id, title, subtitle, promo_type, media_type,
                media_url, background_color, text_color, placement, display_order,
                discount_type, discount_value, promo_code, target_products,
                target_categories, start_date, end_date, is_recurring, recurrence_pattern,
                requires_approval, approval_status, is_active
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                $21, $22, $23
            ) RETURNING *`,
            [
                vendor_id, store_id, title, subtitle, promo_type, media_type,
                media_url, background_color, text_color, placement, display_order,
                discount_type, discount_value, promo_code, target_products,
                target_categories, start_date, end_date, is_recurring, recurrence_pattern,
                requiresApproval, approvalStatus, isActive
            ]
        );

        res.status(201).json({
            ...result.rows[0],
            message: requiresApproval
                ? 'Promotion created and pending admin approval'
                : 'Promotion created and activated'
        });
    } catch (error) {
        console.error('Create vendor promotion error:', error);
        res.status(500).json({ message: 'Failed to create promotion' });
    }
};

// Update vendor promotion
export const updateVendorPromotion = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;
        const vendor_id = (req as any).user.user_id;
        const updates = req.body;

        // Verify ownership
        const check = await pool.query(
            'SELECT vendor_id FROM vendor_promotions WHERE promo_id = $1',
            [promo_id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        if (check.rows[0].vendor_id !== vendor_id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

        const result = await pool.query(
            `UPDATE vendor_promotions SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
             WHERE promo_id = $${fields.length + 1} RETURNING *`,
            [...values, promo_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Update vendor promotion error:', error);
        res.status(500).json({ message: 'Failed to update promotion' });
    }
};

// Delete vendor promotion
export const deleteVendorPromotion = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;
        const vendor_id = (req as any).user.user_id;

        // Verify ownership
        const check = await pool.query(
            'SELECT vendor_id FROM vendor_promotions WHERE promo_id = $1',
            [promo_id]
        );

        if (check.rows.length === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        if (check.rows[0].vendor_id !== vendor_id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM vendor_promotions WHERE promo_id = $1', [promo_id]);
        res.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Delete vendor promotion error:', error);
        res.status(500).json({ message: 'Failed to delete promotion' });
    }
};

// Track promotion view
export const trackPromotionView = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;

        await pool.query(
            'UPDATE vendor_promotions SET views = views + 1 WHERE promo_id = $1',
            [promo_id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Track promotion view error:', error);
        res.status(500).json({ message: 'Failed to track view' });
    }
};

// Track promotion click
export const trackPromotionClick = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;

        await pool.query(
            'UPDATE vendor_promotions SET clicks = clicks + 1 WHERE promo_id = $1',
            [promo_id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Track promotion click error:', error);
        res.status(500).json({ message: 'Failed to track click' });
    }
};

// ==================== ADMIN PROMOTION MANAGEMENT ====================

// Approve vendor promotion (admin only)
export const approveVendorPromotion = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;
        const approved_by = (req as any).user.user_id;

        const result = await pool.query(
            `UPDATE vendor_promotions 
             SET approval_status = 'approved', 
                 is_active = true,
                 approved_by = $1,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE promo_id = $2 
             RETURNING *`,
            [approved_by, promo_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Approve vendor promotion error:', error);
        res.status(500).json({ message: 'Failed to approve promotion' });
    }
};

// Reject vendor promotion (admin only)
export const rejectVendorPromotion = async (req: Request, res: Response) => {
    try {
        const { promo_id } = req.params;
        const { rejection_reason } = req.body;
        const approved_by = (req as any).user.user_id;

        const result = await pool.query(
            `UPDATE vendor_promotions 
             SET approval_status = 'rejected',
                 is_active = false,
                 rejection_reason = $1,
                 approved_by = $2,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE promo_id = $3 
             RETURNING *`,
            [rejection_reason, approved_by, promo_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Promotion not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Reject vendor promotion error:', error);
        res.status(500).json({ message: 'Failed to reject promotion' });
    }
};

// Get pending promotions (admin only)
export const getPendingPromotions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT vp.*, u.email as vendor_email, s.name as store_name
             FROM vendor_promotions vp
             LEFT JOIN users u ON vp.vendor_id = u.user_id
             LEFT JOIN stores s ON vp.store_id = s.store_id
             WHERE vp.approval_status = 'pending'
             ORDER BY vp.created_at ASC`
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Get pending promotions error:', error);
        res.status(500).json({ message: 'Failed to fetch pending promotions' });
    }
};
