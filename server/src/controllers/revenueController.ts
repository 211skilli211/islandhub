
import { Request, Response } from 'express';
import { pool } from '../config/db';
import { RevenueService } from '../services/revenueService';

// @desc    Get all revenue orders with filtering
// @access  Private (Admin only)
export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const { vendor_id, status, startDate, endDate } = req.query;
        let query = `
            SELECT o.*, v.business_name, u.name as customer_name, l.title as product_title
            FROM revenue_orders o
            JOIN vendors v ON o.vendor_id = v.id
            JOIN users u ON o.user_id = u.user_id
            LEFT JOIN listings l ON o.listing_id = l.id
            WHERE 1=1
        `;
        const params: any[] = [];

        if (vendor_id) {
            query += ` AND o.vendor_id = $${params.length + 1}`;
            params.push(vendor_id);
        }

        if (status) {
            query += ` AND o.status = $${params.length + 1}`;
            params.push(status);
        }

        if (startDate) {
            query += ` AND o.created_at >= $${params.length + 1}`;
            params.push(startDate);
        }

        if (endDate) {
            query += ` AND o.created_at <= $${params.length + 1}`;
            params.push(endDate);
        }

        query += ' ORDER BY o.created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to fetch revenue orders' });
    }
};

// @desc    Get revenue stats for admin
// @access  Private (Admin only)
export const getRevenueStats = async (req: Request, res: Response) => {
    try {
        const stats = await pool.query(`
            SELECT 
                SUM(amount) as gross_volume,
                SUM(commission) as total_commission,
                SUM(net_revenue) as net_platform_revenue,
                COUNT(*) as total_orders
            FROM revenue_orders
            WHERE status = 'paid'
        `);

        const monthlyStats = await pool.query(`
            SELECT 
                DATE_TRUNC('month', created_at) as month,
                SUM(amount) as volume,
                COUNT(*) as count
            FROM revenue_orders
            WHERE status = 'paid'
            AND created_at > NOW() - INTERVAL '12 months'
            GROUP BY 1
            ORDER BY 1 DESC
        `);

        res.json({
            summary: stats.rows[0],
            monthly: monthlyStats.rows
        });
    } catch (error) {
        console.error('Get revenue stats error:', error);
        res.status(500).json({ message: 'Failed to fetch revenue statistics' });
    }
};

// @desc    Get driver earnings
// @access  Private (Driver or Admin)
export const getDriverEarnings = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const { startDate, endDate } = req.query;
        
        // Check authorization - drivers can only see their own earnings
        const currentUserId = (req.user as any)?.id;
        const currentUserRole = (req.user as any)?.role;
        
        if (currentUserRole !== 'admin' && currentUserId !== parseInt(driverId)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        interface DriverEarning {
            amount: string;
            status: string;
        }

        const earnings: DriverEarning[] = await RevenueService.getDriverEarnings(
            parseInt(driverId),
            startDate as string,
            endDate as string
        );

        // Calculate totals
        const totalEarned = earnings.reduce((sum: number, payout: DriverEarning) => sum + parseFloat(payout.amount), 0);
        const paidAmount = earnings
            .filter((p: DriverEarning) => p.status === 'paid')
            .reduce((sum: number, payout: DriverEarning) => sum + parseFloat(payout.amount), 0);
        const pendingAmount = earnings
            .filter((p: DriverEarning) => p.status === 'pending')
            .reduce((sum: number, payout: DriverEarning) => sum + parseFloat(payout.amount), 0);

        res.json({
            earnings,
            summary: {
                totalEarned,
                paidAmount,
                pendingAmount,
                totalDeliveries: earnings.length
            }
        });
    } catch (error) {
        console.error('Get driver earnings error:', error);
        res.status(500).json({ message: 'Failed to fetch driver earnings' });
    }
};

// @desc    Get revenue analytics
// @access  Private (Admin only)
export const getRevenueAnalytics = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;
        
        const stats = await RevenueService.getRevenueStats(
            startDate as string,
            endDate as string
        );

        // Get breakdown by service type
        const serviceTypeBreakdown = await pool.query(`
            SELECT 
                l.service_type,
                COUNT(ro.order_id) as order_count,
                SUM(ro.amount) as revenue,
                SUM(ro.commission) as commission,
                AVG(ro.amount) as avg_amount
            FROM revenue_orders ro
            JOIN listings l ON ro.listing_id = l.id
            WHERE ro.status = 'paid'
            ${startDate ? `AND ro.created_at >= $1` : ''}
            ${endDate ? `AND ro.created_at <= $2` : ''}
            GROUP BY l.service_type
            ORDER BY revenue DESC
        `, [startDate, endDate].filter(Boolean));

        res.json({
            summary: stats,
            serviceTypeBreakdown: serviceTypeBreakdown.rows
        });
    } catch (error) {
        console.error('Get revenue analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch revenue analytics' });
    }
};

// @desc    Process driver payout
// @access  Private (Admin only)
export const processDriverPayout = async (req: Request, res: Response) => {
    try {
        const { payoutId } = req.params;
        
        const result = await pool.query(`
            UPDATE driver_payouts 
            SET status = 'paid', paid_at = NOW() 
            WHERE id = $1 AND status = 'pending'
            RETURNING *
        `, [parseInt(payoutId)]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payout not found or already processed' });
        }

        res.json({
            success: true,
            payout: result.rows[0]
        });
    } catch (error) {
        console.error('Process driver payout error:', error);
        res.status(500).json({ message: 'Failed to process payout' });
    }
};
