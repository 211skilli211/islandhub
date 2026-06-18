import { Request, Response } from 'express';
import { CampaignModel } from '../models/Campaign';
import { logAdminAction } from './adminController';
import { pool } from '../config/db';
import { convertToCSV } from '../utils/csvExport';

export const createCampaign = async (req: Request, res: Response) => {
    try {
        // In a real app, user_id would come from the authenticated token (req.user)
        const { user_id, title, description, category, goal_amount, end_date } = req.body;

        const newCampaign = await CampaignModel.create({
            user_id, // Placeholder: ensure this comes from auth middleware in production
            title,
            description,
            category,
            goal_amount,
            end_date: end_date && end_date.trim() !== '' ? end_date : undefined
        });

        res.status(201).json(newCampaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating campaign' });
    }
};

export const getAllCampaigns = async (req: Request, res: Response) => {
    try {
        const { page, limit, sortBy, sortOrder, status, category, search, verified, date, export: exportType } = req.query;
        const isAdmin = req.query.admin === 'true';

        let query = 'SELECT *, campaign_id as id FROM campaigns WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) FROM campaigns WHERE 1=1';
        const params: any[] = [];

        // Access Control
        if (isAdmin) {
            const user = (req as any).user;
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ message: 'Admin access required' });
            }
        } else {
            query += ' AND verified = TRUE';
            countQuery += ' AND verified = TRUE';
        }

        // Filters
        if (status) {
            query += ` AND status = $${params.length + 1}`;
            countQuery += ` AND status = $${params.length + 1}`;
            params.push(status);
        }
        if (category) {
            query += ` AND category = $${params.length + 1}`;
            countQuery += ` AND category = $${params.length + 1}`;
            params.push(category);
        }
        if (verified !== undefined) {
            query += ` AND verified = $${params.length + 1}`;
            countQuery += ` AND verified = $${params.length + 1}`;
            params.push(verified === 'true');
        }
        if (date) {
            let interval = '';
            if (date === 'today') interval = '1 day';
            else if (date === 'week') interval = '7 days';
            else if (date === 'month') interval = '30 days';

            if (interval) {
                query += ` AND created_at >= NOW() - INTERVAL '${interval}'`;
                countQuery += ` AND created_at >= NOW() - INTERVAL '${interval}'`;
            }
        }
        if (search) {
            query += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
            countQuery += ` AND (title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
            params.push(`%${search}%`);
        }

        // Sorting
        const sortColumn = (sortBy as string) || 'created_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
        const allowedSorts = ['created_at', 'goal_amount', 'current_amount', 'title', 'status'];
        const safeSortColumn = allowedSorts.includes(sortColumn) ? sortColumn : 'created_at';

        // CSV Export
        if (exportType === 'csv') {
            query += ` ORDER BY ${safeSortColumn} ${order}`;
            const result = await pool.query(query, params);
            const csv = convertToCSV(result.rows);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=campaigns.csv');
            return res.status(200).send(csv);
        }

        // Pagination vs Legacy
        if (page) {
            const pageNum = parseInt(page as string, 10) || 1;
            const limitNum = parseInt(limit as string, 10) || 10;
            const offset = (pageNum - 1) * limitNum;

            query += ` ORDER BY ${safeSortColumn} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(limitNum, offset);

            const [dataResult, countResult] = await Promise.all([
                pool.query(query, params),
                pool.query(countQuery, params.slice(0, params.length - 2))
            ]);

            const total = parseInt(countResult.rows[0].count, 10);
            const totalPages = Math.ceil(total / limitNum);

            return res.json({
                campaigns: dataResult.rows,
                total,
                page: pageNum,
                limit: limitNum,
                totalPages
            });
        } else {
            query += ` ORDER BY ${safeSortColumn} ${order}`;
            const result = await pool.query(query, params);
            res.json(result.rows);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching campaigns' });
    }
};

export const getCampaignById = async (req: Request, res: Response) => {
    try {
        const campaign = await CampaignModel.findById(parseInt(req.params.id as string));
        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }
        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching campaign' });
    }
};

export const verifyCampaign = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const campaign = await CampaignModel.verify(id);

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Log admin action
        const adminId = (req as any).user?.id;
        if (adminId) {
            await logAdminAction(adminId, 'verify_campaign', id, { title: campaign.title });
        }

        res.json(campaign);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error verifying campaign' });
    }
};

export const searchCampaigns = async (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const campaigns = await CampaignModel.search(query);
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error searching campaigns' });
    }
};
export const getUserCampaigns = async (req: Request, res: Response) => {
    try {
        const user_id = (req as any).user?.id;
        if (!user_id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const campaigns = await CampaignModel.findByUserId(user_id);
        res.json(campaigns);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching user campaigns' });
    }
};

export const donate = async (req: Request, res: Response) => {
    const { campaignId } = req.params;
    const { amount, message, payment_method } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid donation amount' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Verify campaign exists and is active
        const campaignResult = await client.query(
            'SELECT campaign_id, title, status FROM campaigns WHERE campaign_id = $1',
            [campaignId]
        );

        if (campaignResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const campaign = campaignResult.rows[0];
        if (campaign.status !== 'active') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Campaign is not active' });
        }

        // Create donation record
        const donationResult = await client.query(
            `INSERT INTO donations (campaign_id, user_id, amount, message, payment_method, status, created_at)
             VALUES ($1, $2, $3, $4, $5, 'completed', CURRENT_TIMESTAMP)
             RETURNING *`,
            [campaignId, userId, amount, message || null, payment_method || 'card']
        );

        // Update campaign current_amount
        await client.query(
            'UPDATE campaigns SET current_amount = current_amount + $1, updated_at = CURRENT_TIMESTAMP WHERE campaign_id = $2',
            [amount, campaignId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Donation successful',
            donation: donationResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Donation error:', error);
        res.status(500).json({ message: 'Server error processing donation' });
    } finally {
        client.release();
    }
};

export const deleteCampaign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check ownership or admin status
        const current = await pool.query('SELECT user_id FROM campaigns WHERE campaign_id = $1', [id]);
        if (current.rows.length === 0) return res.status(404).json({ message: 'Campaign not found' });

        if (current.rows[0].user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await pool.query('DELETE FROM campaigns WHERE campaign_id = $1', [id]);

        // Log admin action
        if (userRole === 'admin') {
            await logAdminAction(userId, 'delete_campaign', parseInt(id as string), { deleted: true });
        }

        res.json({ message: 'Campaign deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
