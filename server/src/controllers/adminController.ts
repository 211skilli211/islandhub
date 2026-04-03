import { Request, Response } from 'express';
import { pool } from '../config/db';
import bcrypt from 'bcryptjs';
import { EmailService } from '../services/emailService';
import { OrderModel } from '../models/Order';
import { CampaignModel } from '../models/Campaign';

export const logAdminAction = async (adminId: number, action: string, targetId?: number, details?: any) => {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, record_id, new_values, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [adminId, action, targetId, details ? JSON.stringify(details) : null, null, null]
        );
    } catch (error) {
        console.error('Failed to log admin action:', error);
        // Don't throw, just log the error
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { name, email, password, role, country } = req.body;

        // Check if user exists
        const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, country, email_verified, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING user_id, name, email, role`,
            [name, email, password_hash, role || 'buyer', country, true, true]
        );

        const newUser = result.rows[0];

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'create_user', newUser.user_id, { name, email, role });
        }

        res.status(201).json(newUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Parallel queries for efficiency
        const [
            userStats,
            listingStats,
            storeStats,
            recentTransactions,
            recentActivity,
            campaignCount,
            totalRevenue
        ] = await Promise.all([
            // User counts
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN is_active = false THEN 1 ELSE 0 END) as suspended
                FROM users
            `),
            // Listing counts by type
            pool.query(`
                SELECT type, COUNT(*) as count 
                FROM listings 
                GROUP BY type
            `),
            // Store counts
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                    SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) as suspended
                FROM stores
            `),
            // Recent transactions (Merged Donations + Orders)
            pool.query(`
                SELECT 
                    DATE(created_at) as date, 
                    COUNT(*) as count, 
                    SUM(amount) as volume 
                FROM (
                    SELECT created_at, amount FROM donations
                    UNION ALL
                    SELECT created_at, total_amount as amount FROM orders WHERE status = 'paid' OR status = 'fulfilled'
                ) as combined_transactions
                WHERE created_at > NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at)
            `).catch(() => ({ rows: [] })),
            // Recent Activity (last 10)
            pool.query(`
                SELECT 
                    a.id, a.action, a.record_id, a.new_values, a.created_at,
                    u.name as admin_name
                FROM audit_logs a
                JOIN users u ON a.user_id = u.user_id
                ORDER BY a.created_at DESC
                LIMIT 10
            `).catch(() => ({ rows: [] })),
            // Campaign Count (Direct from campaigns table)
            pool.query('SELECT COUNT(*) as count FROM campaigns'),
            // Total Platform Revenue
            pool.query(`
                SELECT 
                    (SELECT COALESCE(SUM(amount), 0) FROM donations) + 
                    (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status IN ('paid', 'fulfilled')) 
                as total_revenue
            `)
        ]);

        res.json({
            users: {
                total: parseInt(userStats.rows[0].total),
                active: parseInt(userStats.rows[0].active),
                suspended: parseInt(userStats.rows[0].suspended)
            },
            stores: {
                total: parseInt(storeStats.rows[0].total),
                active: parseInt(storeStats.rows[0].active),
                suspended: parseInt(storeStats.rows[0].suspended)
            },
            listings: listingStats.rows,
            transactions: recentTransactions.rows,
            activity: recentActivity.rows,
            campaigns_count: parseInt(campaignCount.rows[0].count),
            total_revenue: parseFloat(totalRevenue.rows[0].total_revenue || '0')
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const requestChanges = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { listingId, feedback } = req.body;

        if (!listingId || !feedback) {
            return res.status(400).json({ message: 'Listing ID and feedback are required' });
        }

        const adminId = (req as any).user?.id;

        // Insert change request
        const result = await pool.query(
            `INSERT INTO campaign_change_requests (listing_id, admin_id, feedback)
             VALUES ($1, $2, $3) RETURNING id`,
            [listingId, adminId, feedback]
        );

        // Get campaign details and creator email
        const campaignQuery = await pool.query(
            `SELECT l.title, u.email FROM listings l
             JOIN users u ON l.creator_id = u.user_id
             WHERE l.id = $1`,
            [listingId]
        );

        if (campaignQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const { title, email } = campaignQuery.rows[0];

        // Send email
        await EmailService.sendChangeRequestEmail(email, title, feedback);

        // Log admin action
        await logAdminAction(adminId, 'request_campaign_changes', listingId, { feedback });

        res.json({ message: 'Change request sent successfully', requestId: result.rows[0].id });
    } catch (error) {
        console.error('Error requesting changes:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getChangeRequests = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { listingId } = req.params;

        const result = await pool.query(
            `SELECT ccr.id, ccr.feedback, ccr.status, ccr.created_at,
                    u.name as admin_name
             FROM campaign_change_requests ccr
             JOIN users u ON ccr.admin_id = u.user_id
             WHERE ccr.listing_id = $1
             ORDER BY ccr.created_at DESC`,
            [listingId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching change requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
import { convertToCSV } from '../utils/csvExport';

export const exportData = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const type = (req as any).exportType;
        let result;

        if (type === 'users') {
            result = await pool.query('SELECT user_id, name, email, role, country, created_at, is_active FROM users ORDER BY created_at DESC');
        } else if (type === 'stores') {
            result = await pool.query(`
                SELECT s.id, s.business_name, s.contact_email, s.contact_phone, s.location, s.status, s.created_at, u.name as owner_name 
                FROM stores s
                JOIN users u ON s.user_id = u.user_id
                ORDER BY s.created_at DESC
            `);
        } else {
            return res.status(400).json({ message: 'Invalid export type' });
        }

        const csv = convertToCSV(result.rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=export_${type}_${new Date().toISOString().split('T')[0]}.csv`);
        res.status(200).send(csv);

        // Log export action
        await logAdminAction((req as any).user.id, `export_${type}`, undefined, { count: result.rows.length });

    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = (page - 1) * limit;

        const result = await pool.query(`
            SELECT a.*, u.name as admin_name 
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.user_id
            ORDER BY a.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const countResult = await pool.query('SELECT COUNT(*) FROM audit_logs');
        const total = parseInt(countResult.rows[0].count);

        res.json({
            audit_logs: result.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const updateUser = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { userId } = req.params;
        const { name, email, role, is_active, bio, email_verified } = req.body;

        const result = await pool.query(
            `UPDATE users 
             SET name = COALESCE($1, name), 
                 email = COALESCE($2, email), 
                 role = COALESCE($3, role), 
                 is_active = COALESCE($4, is_active),
                 bio = COALESCE($5, bio),
                 email_verified = COALESCE($6, email_verified),
                 updated_at = NOW()
             WHERE user_id = $7 RETURNING user_id, name, email, role, is_active, bio, email_verified`,
            [name, email, role, is_active, bio, email_verified, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = result.rows[0];

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'update_user', parseInt(userId as string), { name, email, role, is_active, bio });
        }

        res.json(updatedUser);
    } catch (error: any) {
        console.error('Error updating user:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};

export const getAllSubscriptions = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const type = req.query.type as string; // 'vendor', 'customer', 'creator'
        let query = '';

        if (type === 'vendor') {
            query = `
                SELECT vs.*, v.business_name, u.name as owner_name, u.email 
                FROM vendor_subscriptions vs
                JOIN vendors v ON vs.vendor_id = v.id
                JOIN users u ON v.user_id = u.user_id
                ORDER BY vs.created_at DESC
            `;
        } else if (type === 'customer') {
            query = `
                SELECT cs.*, u.name, u.email 
                FROM customer_subscriptions cs
                JOIN users u ON cs.user_id = u.user_id
                ORDER BY cs.created_at DESC
            `;
        } else if (type === 'creator') {
            query = `
                SELECT ccs.*, u.name, u.email 
                FROM campaign_creator_subscriptions ccs
                JOIN users u ON ccs.user_id = u.user_id
                ORDER BY ccs.created_at DESC
            `;
        } else {
            return res.status(400).json({ message: 'Invalid subscription type' });
        }

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSubscriptionManual = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id, type, tier, status, overrideEndDate, overrideReason } = req.body;
        console.log('Admin Manual Update:', { id, type, tier, status, overrideEndDate, overrideReason });

        let table = '';
        if (type === 'vendor') table = 'vendor_subscriptions';
        else if (type === 'customer') table = 'customer_subscriptions';
        else if (type === 'creator') table = 'campaign_creator_subscriptions';
        else return res.status(400).json({ message: 'Invalid type' });

        console.log('Target Table:', table);

        // Build dynamic update query for override fields
        let updateFields = 'tier = $1, status = $2, updated_at = NOW()';
        let queryParams = [tier, status, parseInt(id as string)];
        let paramIndex = 4;

        // Add override end date if provided
        if (overrideEndDate) {
            updateFields += `, subscription_override_end_date = $${paramIndex}`;
            queryParams.push(overrideEndDate);
            paramIndex++;
        }

        // Add override reason if provided
        if (overrideReason) {
            updateFields += `, override_reason = $${paramIndex}`;
            queryParams.push(overrideReason);
            paramIndex++;
        }

        // Add override by admin user ID if override fields are being set
        if (overrideEndDate || overrideReason) {
            updateFields += `, override_by_user_id = $${paramIndex}`;
            queryParams.push((req as any).user.id);
        }

        const result = await pool.query(
            `UPDATE ${table} SET ${updateFields} WHERE id = $${paramIndex - 1} RETURNING *`,
            queryParams
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        // Log admin action with override details
        await logAdminAction(
            (req as any).user.id, 
            `manual_subscription_update_${type}`, 
            id, 
            { tier, status, overrideEndDate, overrideReason }
        );

        res.json({
            ...result.rows[0],
            overrideApplied: !!(overrideEndDate || overrideReason)
        });
    } catch (error) {
        console.error('Error updating subscription:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search as string;
        const status = req.query.status as string;
        const role = req.query.role as string;

        let query = `
            SELECT user_id as id, name, email, role, country, is_active, created_at, avatar_url, is_verified_driver
            FROM users
            WHERE 1=1
        `;
        const params: any[] = [];

        if (search) {
            query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        if (status) {
            query += ` AND is_active = $${params.length + 1}`;
            params.push(status === 'active');
        }

        if (role) {
            query += ` AND role = $${params.length + 1}`;
            params.push(role);
        }

        const countQuery = `SELECT COUNT(*) FROM (${query}) as sub`;
        const totalResult = await pool.query(countQuery, params);

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            users: result.rows,
            total: parseInt(totalResult.rows[0].count),
            page,
            limit,
            totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / limit)
        });

    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDrivers = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search as string;

        // Fetch drivers with aggregate stats
        let query = `
            SELECT 
                u.user_id as id, 
                u.name, 
                u.email, 
                u.role, 
                u.is_active, 
                u.created_at, 
                u.vehicle_type, 
                u.is_verified_driver,
                dp.verification_status,
                dp.license_number,
                dp.license_expiry,
                dp.documents as kyc_documents,
                v.make as v_make,
                v.model as v_model,
                v.plate_number as v_plate,
                v.category as v_category,
                COUNT(l.id) FILTER (WHERE l.transport_status = 'completed') as total_jobs,
                SUM(CASE WHEN l.transport_status = 'completed' THEN l.price ELSE 0 END) as total_earnings,
                COUNT(l.id) FILTER (WHERE l.transport_status IN ('accepted', 'in_progress')) as active_jobs
            FROM users u
            LEFT JOIN listings l ON u.user_id = l.driver_id
            LEFT JOIN driver_profiles dp ON u.user_id = dp.user_id
            LEFT JOIN vehicles v ON u.user_id = v.driver_id AND v.is_active = TRUE
            WHERE u.role IN ('driver', 'admin', 'rider') OR dp.user_id IS NOT NULL
        `;

        const params: any[] = [];

        if (search) {
            query += ` AND (u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        query += ` GROUP BY u.user_id, dp.verification_status, dp.license_number, dp.license_expiry, dp.documents, v.make, v.model, v.plate_number, v.category, u.vehicle_type, u.is_verified_driver`;

        const countQuery = `SELECT COUNT(*) FROM (${query}) as sub`;
        const totalResult = await pool.query(countQuery, params);

        query += ` ORDER BY u.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        res.json({
            drivers: result.rows,
            total: parseInt(totalResult.rows[0].count),
            page,
            limit,
            totalPages: Math.ceil(parseInt(totalResult.rows[0].count) / limit)
        });
    } catch (error) {
        console.error('Error fetching admin drivers:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { userId } = req.params;

        // Safety check: Cannot delete yourself
        if (parseInt(userId as string) === req.user?.id) {
            return res.status(400).json({ message: 'Cannot delete your own admin account' });
        }

        await pool.query('DELETE FROM users WHERE user_id = $1', [userId]);

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'delete_user', parseInt(userId as string), { deleted_user_id: userId });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// --- Marquee Templates ---

export const getMarqueeTemplates = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM marquee_templates ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching marquee templates:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const saveMarqueeTemplate = async (req: Request, res: Response) => {
    try {
        const { name, content, priority } = req.body;
        const result = await pool.query(
            'INSERT INTO marquee_templates (name, content, priority) VALUES ($1, $2, $3) RETURNING *',
            [name, content, priority || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error saving marquee template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateMarqueeTemplate = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, content, priority } = req.body;
        const result = await pool.query(
            `UPDATE marquee_templates SET 
                name = COALESCE($1, name),
                content = COALESCE($2, content),
                priority = COALESCE($3, priority),
                updated_at = NOW()
            WHERE template_id = $4 RETURNING *`,
            [name, content, priority, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Template not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating marquee template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteMarqueeTemplate = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM marquee_templates WHERE template_id = $1', [req.params.id]);
        res.json({ message: 'Template deleted' });
    } catch (error) {
        console.error('Error deleting marquee template:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Promotional Banners ---

export const getPromotionalBanners = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM promotional_banners ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching promotional banners:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createPromotionalBanner = async (req: Request, res: Response) => {
    try {
        const { title, subtitle, image_url, target_url, location, color_theme, mobile_mode, url_pattern, match_type } = req.body;
        console.log('[CREATE BANNER] Request body:', req.body);
        console.log('[CREATE BANNER] Inserting with values:', {
            title,
            subtitle,
            image_url,
            target_url,
            location: location || 'marketplace_hero',
            color_theme: color_theme || 'teal',
            mobile_mode: mobile_mode || 'hero',
            url_pattern: url_pattern || null,
            match_type: match_type || 'exact',
            is_active: false
        });

        const result = await pool.query(
            'INSERT INTO promotional_banners (title, subtitle, image_url, target_url, location, color_theme, mobile_mode, url_pattern, match_type, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [title, subtitle, image_url, target_url, location || 'marketplace_hero', color_theme || 'teal', mobile_mode || 'hero', url_pattern || null, match_type || 'exact', false]
        );
        console.log('[CREATE BANNER] Success:', result.rows[0]);
        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('[CREATE BANNER] Error:', error);
        console.error('[CREATE BANNER] Error message:', error.message);
        console.error('[CREATE BANNER] Error detail:', error.detail);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePromotionalBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, subtitle, image_url, target_url, location, color_theme } = req.body;
        const result = await pool.query(
            `UPDATE promotional_banners SET 
                title = COALESCE($1, title),
                subtitle = COALESCE($2, subtitle),
                image_url = COALESCE($3, image_url),
                target_url = COALESCE($4, target_url),
                location = COALESCE($5, location),
                color_theme = COALESCE($6, color_theme),
                updated_at = NOW()
            WHERE banner_id = $7 RETURNING *`,
            [title, subtitle, image_url, target_url, location, color_theme, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Banner not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating promotional banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deletePromotionalBanner = async (req: Request, res: Response) => {
    try {
        await pool.query('DELETE FROM promotional_banners WHERE banner_id = $1', [req.params.id]);
        res.json({ message: 'Banner deleted' });
    } catch (error) {
        console.error('Error deleting promotional banner:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const togglePromotionalBanner = async (req: Request, res: Response) => {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const { id } = req.params;
        const is_active = req.body.is_active === true;

        console.log(`[BANNER TOGGLE] Starting toggle for banner ID: ${id}, new state: ${is_active}`);

        // Validate banner exists and get its location
        const bannerRes = await client.query(
            'SELECT banner_id, location, is_active FROM promotional_banners WHERE banner_id = $1',
            [id]
        );

        if (bannerRes.rows.length === 0) {
            await client.query('ROLLBACK');
            console.log(`[BANNER TOGGLE] Banner ${id} not found`);
            return res.status(404).json({ message: 'Banner not found' });
        }

        const banner = bannerRes.rows[0];
        console.log(`[BANNER TOGGLE] Found banner:`, banner);

        // If activating and location exists, deactivate others in same location
        if (is_active && banner.location) {
            console.log(`[BANNER TOGGLE] Deactivating other banners in location: ${banner.location}`);
            await client.query(
                'UPDATE promotional_banners SET is_active = false WHERE location = $1 AND banner_id != $2',
                [banner.location, id]
            );
        }

        // Update target banner
        console.log(`[BANNER TOGGLE] Updating banner ${id} to is_active = ${is_active}`);
        const result = await client.query(
            'UPDATE promotional_banners SET is_active = $1 WHERE banner_id = $2 RETURNING *',
            [is_active, id]
        );

        await client.query('COMMIT');
        console.log(`[BANNER TOGGLE] Successfully toggled banner ${id}`);
        res.json(result.rows[0]);
    } catch (error: any) {
        if (client) {
            await client.query('ROLLBACK');
        }
        console.error('[BANNER TOGGLE] Error:', error);
        console.error('[BANNER TOGGLE] Error stack:', error.stack);
        res.status(500).json({
            message: 'Server error toggling banner',
            error: error.message
        });
    } finally {
        if (client) {
            client.release();
        }
    }
}; export const getOrders = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status as string;
        const store_id = req.query.store_id ? parseInt(req.query.store_id as string) : undefined;

        const orders = await OrderModel.findAll({
            status,
            store_id,
            limit,
            offset
        });

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) FROM orders WHERE 1=1';
        const countParams: any[] = [];
        if (status) {
            countParams.push(status);
            countQuery += ` AND status = $${countParams.length}`;
        }
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const dispatchOrder = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { orderId, driverId } = req.body;

        if (!orderId || !driverId) {
            return res.status(400).json({ message: 'Order ID and Driver ID are required' });
        }

        // Update order status and driver
        const result = await pool.query(
            `UPDATE orders 
             SET status = 'dispatched', 
                 assigned_driver_id = $1,
                 updated_at = NOW() 
             WHERE order_id = $2 
             RETURNING *`,
            [driverId, orderId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = result.rows[0];

        // NEW: Sync with logistics listings if this is a delivery
        try {
            // Find if there's an associated listing for this order
            // We search for listings where extra_details contains the order_id (if we stored it)
            // Or more reliably, if we can find a listing by the same creator and approximate timing/price
            // For now, let's look for a job with 'pending' status that matches the service_type
            await pool.query(
                `UPDATE listings 
                 SET transport_status = 'accepted', 
                     driver_id = $1,
                     updated_at = NOW()
                 WHERE id IN (
                    SELECT l.id FROM listings l
                    JOIN order_items oi ON l.id = (l.extra_details->>'listing_id')::int
                    WHERE oi.order_id = $2
                    LIMIT 1
                 ) OR (
                    service_type = 'delivery' 
                    AND transport_status = 'pending' 
                    AND creator_id = $3
                 )`,
                [driverId, orderId, updatedOrder.user_id]
            );
        } catch (syncError) {
            console.error('Failed to sync logistics listing:', syncError);
            // Don't fail the whole request, but log it
        }

        // Log admin action
        const adminId = (req as any).user?.id;
        await logAdminAction(adminId, 'dispatch_order', orderId, { driverId });

        res.json({ message: 'Order dispatched successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error dispatching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCampaign = async (req: Request, res: Response) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const updates = req.body;

        const updatedCampaign = await CampaignModel.update(parseInt(id), updates);

        if (!updatedCampaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Log admin action
        await logAdminAction((req as any).user.id, 'update_campaign', parseInt(id), updates);

        res.json(updatedCampaign);
    } catch (error) {
        console.error('Error updating campaign:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
