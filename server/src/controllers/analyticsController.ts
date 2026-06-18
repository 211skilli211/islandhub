import { Request, Response } from 'express';
import { pool } from '../config/db';
import { sendSuccess, asyncHandler, UnauthorizedError } from '../middleware/errorHandler';

// ============================================
// Legacy Analytics (Keep for compatibility)
// ============================================

export const getVendorAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = (req.user as any)?.id;
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        // Find vendor id
        const vendor = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        if (vendor.rows.length === 0) return res.status(404).json({ message: 'Vendor not found' });

        const vendorId = vendor.rows[0].id;

        // 1. Sales Volume (Total revenue across vendor's listings)
        const sales = await pool.query(
            `SELECT SUM(oi.price * oi.quantity) as total_revenue, COUNT(DISTINCT o.order_id) as total_orders 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.order_id
             JOIN listings l ON oi.item_id = l.id
             WHERE l.creator_id = $1 AND o.status IN ('paid', 'fulfilled')`,
            [userId]
        );

        // 2. Monthly Sales Trend
        const trend = await pool.query(
            `SELECT DATE_TRUNC('month', o.created_at) as month, SUM(oi.price * oi.quantity) as revenue
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.order_id
             JOIN listings l ON oi.item_id = l.id
             WHERE l.creator_id = $1 AND o.status IN ('paid', 'fulfilled')
             GROUP BY month
             ORDER BY month DESC
             LIMIT 6`,
            [userId]
        );

        // 3. Category Breakdown
        const breakdown = await pool.query(
            `SELECT l.type, COUNT(oi.id) as units
             FROM order_items oi
             JOIN listings l ON oi.item_id = l.id
             JOIN orders o ON oi.order_id = o.order_id
             WHERE l.creator_id = $1 AND o.status IN ('paid', 'fulfilled')
             GROUP BY l.type`,
            [userId]
        );

        // 4. Total Views
        const viewsCount = await pool.query(
            `SELECT COUNT(*) as total_views 
             FROM listing_views lv
             JOIN listings l ON lv.listing_id = l.id
             WHERE l.creator_id = $1`,
            [userId]
        );

        // 5. Listing Performance
        const perf = await pool.query(
            `SELECT 
                l.id, 
                l.title, 
                COUNT(DISTINCT lv.id) as views,
                COUNT(DISTINCT oi.id) as sales
             FROM listings l
             LEFT JOIN listing_views lv ON l.id = lv.listing_id
             LEFT JOIN order_items oi ON l.id = oi.item_id
             WHERE l.creator_id = $1
             GROUP BY l.id, l.title
             ORDER BY views DESC
             LIMIT 10`,
            [userId]
        );

        // 6. ROI Breakdown (Organic vs Promoted)
        const roi = await pool.query(
            `SELECT 
                is_promoted,
                COUNT(DISTINCT id) as views,
                (SELECT COUNT(DISTINCT oi.id) 
                 FROM order_items oi 
                 JOIN listings l2 ON oi.item_id = l2.id 
                 JOIN orders o ON oi.order_id = o.order_id
                 WHERE l2.creator_id = $1 AND l2.is_promoted = lv.is_promoted AND o.status IN ('paid', 'fulfilled')
                ) as sales
             FROM listing_views lv
             WHERE listing_id IN (SELECT id FROM listings WHERE creator_id = $1)
             GROUP BY is_promoted`,
            [userId]
        );

        res.json({
            stats: {
                ...sales.rows[0],
                total_views: viewsCount.rows[0].total_views
            },
            trend: trend.rows,
            breakdown: breakdown.rows,
            performance: perf.rows,
            roi: roi.rows
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

// ============================================
// New Comprehensive Analytics (Phase C)
// ============================================

/**
 * Get vendor dashboard overview stats
 * @route GET /api/analytics/vendor/dashboard
 */
export const getVendorDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  // Get vendor's store
  const storeResult = await pool.query(
    'SELECT store_id FROM stores WHERE vendor_id = (SELECT id FROM vendors WHERE user_id = $1) LIMIT 1',
    [user.id]
  );
  
  if (storeResult.rows.length === 0) {
    return sendSuccess(res, {
      total_revenue: 0,
      total_orders: 0,
      total_customers: 0,
      avg_order_value: 0,
      revenue_7d: 0,
      revenue_30d: 0,
      orders_7d: 0,
      orders_30d: 0,
      pending_orders: 0,
      processing_orders: 0,
      completed_orders: 0
    }, 'Dashboard stats retrieved');
  }

  const store_id = storeResult.rows[0].store_id;

  const result = await pool.query(
    'SELECT * FROM get_vendor_dashboard_stats($1)',
    [store_id]
  );

  return sendSuccess(res, result.rows[0], 'Dashboard stats retrieved');
});

/**
 * Get vendor sales chart data
 * @route GET /api/analytics/vendor/sales-chart
 */
export const getVendorSalesChart = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  const storeResult = await pool.query(
    'SELECT store_id FROM stores WHERE vendor_id = (SELECT id FROM vendors WHERE user_id = $1) LIMIT 1',
    [user.id]
  );
  
  if (storeResult.rows.length === 0) {
    return sendSuccess(res, [], 'Sales chart data retrieved');
  }

  const store_id = storeResult.rows[0].store_id;
  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    'SELECT * FROM get_vendor_sales_chart($1, $2)',
    [store_id, days]
  );

  return sendSuccess(res, result.rows, 'Sales chart data retrieved');
});

/**
 * Get vendor top products
 * @route GET /api/analytics/vendor/top-products
 */
export const getVendorTopProducts = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  const storeResult = await pool.query(
    'SELECT store_id FROM stores WHERE vendor_id = (SELECT id FROM vendors WHERE user_id = $1) LIMIT 1',
    [user.id]
  );
  
  if (storeResult.rows.length === 0) {
    return sendSuccess(res, [], 'Top products retrieved');
  }

  const store_id = storeResult.rows[0].store_id;
  const limit = parseInt(req.query.limit as string) || 10;
  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    'SELECT * FROM get_vendor_top_products($1, $2, $3)',
    [store_id, limit, days]
  );

  return sendSuccess(res, result.rows, 'Top products retrieved');
});

/**
 * Get vendor order status breakdown
 * @route GET /api/analytics/vendor/order-status
 */
export const getVendorOrderStatusBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  const storeResult = await pool.query(
    'SELECT store_id FROM stores WHERE vendor_id = (SELECT id FROM vendors WHERE user_id = $1) LIMIT 1',
    [user.id]
  );
  
  if (storeResult.rows.length === 0) {
    return sendSuccess(res, [], 'Order status breakdown retrieved');
  }

  const store_id = storeResult.rows[0].store_id;

  const result = await pool.query(
    'SELECT * FROM analytics_order_status WHERE store_id = $1',
    [store_id]
  );

  return sendSuccess(res, result.rows, 'Order status breakdown retrieved');
});

/**
 * Get vendor customer analytics
 * @route GET /api/analytics/vendor/customers
 */
export const getVendorCustomerAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  const storeResult = await pool.query(
    'SELECT store_id FROM stores WHERE vendor_id = (SELECT id FROM vendors WHERE user_id = $1) LIMIT 1',
    [user.id]
  );
  
  if (storeResult.rows.length === 0) {
    return sendSuccess(res, {
      total_customers: 0,
      new_customers: 0,
      returning_customers: 0,
      avg_customer_value: 0
    }, 'Customer analytics retrieved');
  }

  const store_id = storeResult.rows[0].store_id;
  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    `SELECT 
      COUNT(DISTINCT user_id) as total_customers,
      COUNT(DISTINCT CASE WHEN created_at >= CURRENT_DATE - $2 * INTERVAL '1 day' THEN user_id END) as new_customers,
      COUNT(DISTINCT CASE WHEN created_at < CURRENT_DATE - $2 * INTERVAL '1 day' 
        AND created_at >= CURRENT_DATE - ($2 * 2) * INTERVAL '1 day' THEN user_id END) as returning_customers,
      COALESCE(AVG(total_amount), 0) as avg_customer_value
    FROM orders 
    WHERE store_id = $1 
      AND status NOT IN ('cancelled', 'refunded')
      AND user_id IS NOT NULL`,
    [store_id, days]
  );

  return sendSuccess(res, result.rows[0], 'Customer analytics retrieved');
});

// ============================================
// Admin Platform Analytics
// ============================================

/**
 * Get platform-wide overview stats
 * @route GET /api/analytics/admin/overview
 */
export const getAdminPlatformOverview = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') throw new UnauthorizedError('Admin access required');

  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    `SELECT 
      COUNT(*) as total_orders,
      COUNT(DISTINCT store_id) as active_stores,
      COUNT(DISTINCT user_id) as active_customers,
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COALESCE(SUM(commission_amount), 0) as total_commission,
      COALESCE(AVG(total_amount), 0) as avg_order_value
    FROM orders 
    WHERE created_at >= CURRENT_DATE - $1 * INTERVAL '1 day'
      AND status NOT IN ('cancelled', 'refunded')`,
    [days]
  );

  return sendSuccess(res, result.rows[0], 'Platform overview retrieved');
});

/**
 * Get platform revenue trends
 * @route GET /api/analytics/admin/revenue-trends
 */
export const getAdminRevenueTrends = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') throw new UnauthorizedError('Admin access required');

  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total_amount), 0) as revenue,
      COALESCE(SUM(commission_amount), 0) as commission,
      COUNT(DISTINCT store_id) as stores,
      COUNT(DISTINCT user_id) as customers
    FROM orders 
    WHERE created_at >= CURRENT_DATE - $1 * INTERVAL '1 day'
      AND status NOT IN ('cancelled', 'refunded')
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at)`,
    [days]
  );

  return sendSuccess(res, result.rows, 'Revenue trends retrieved');
});

/**
 * Get top performing stores
 * @route GET /api/analytics/admin/top-stores
 */
export const getAdminTopStores = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') throw new UnauthorizedError('Admin access required');

  const limit = parseInt(req.query.limit as string) || 10;
  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    `SELECT 
      s.store_id,
      s.name as store_name,
      s.logo_url,
      COUNT(o.order_id) as order_count,
      COALESCE(SUM(o.total_amount), 0) as total_revenue,
      COUNT(DISTINCT o.user_id) as unique_customers,
      COALESCE(AVG(o.total_amount), 0) as avg_order_value
    FROM stores s
    LEFT JOIN orders o ON s.store_id = o.store_id 
      AND o.created_at >= CURRENT_DATE - $2 * INTERVAL '1 day'
      AND o.status NOT IN ('cancelled', 'refunded')
    GROUP BY s.store_id, s.name, s.logo_url
    ORDER BY total_revenue DESC NULLS LAST
    LIMIT $1`,
    [limit, days]
  );

  return sendSuccess(res, result.rows, 'Top stores retrieved');
});

/**
 * Get user registration and activity stats
 * @route GET /api/analytics/admin/user-stats
 */
export const getAdminUserStats = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') throw new UnauthorizedError('Admin access required');

  const days = parseInt(req.query.days as string) || 30;

  const result = await pool.query(
    `SELECT 
      (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - $1 * INTERVAL '1 day') as new_users,
      (SELECT COUNT(*) FROM users WHERE is_active = true) as active_users,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(DISTINCT user_id) FROM orders WHERE created_at >= CURRENT_DATE - $1 * INTERVAL '1 day' AND status NOT IN ('cancelled', 'refunded')) as active_buyers`,
    [days]
  );

  return sendSuccess(res, result.rows[0], 'User stats retrieved');
});

/**
 * Get real-time order feed for live dashboard
 * @route GET /api/analytics/live-orders
 */
export const getLiveOrders = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) throw new UnauthorizedError();

  const store_id = req.query.store_id ? parseInt(req.query.store_id as string) : null;
  const limit = parseInt(req.query.limit as string) || 20;

  // If not admin, restrict to user's stores
  let query = `
    SELECT 
      o.order_id,
      o.order_number,
      o.total_amount,
      o.status,
      o.created_at,
      u.name as customer_name,
      s.name as store_name,
      COUNT(oi.order_item_id) as item_count
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.user_id
    JOIN stores s ON o.store_id = s.store_id
    JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
  `;
  
  const params: any[] = [];
  
  if (user.role !== 'admin') {
    // Vendor - only show their stores
    query += ` AND s.vendor_id = (SELECT id FROM vendors WHERE user_id = $${params.length + 1})`;
    params.push(user.id);
  } else if (store_id) {
    // Admin with specific store filter
    query += ` AND o.store_id = $${params.length + 1}`;
    params.push(store_id);
  }
  
  query += ` 
    GROUP BY o.order_id, o.order_number, o.total_amount, o.status, o.created_at, u.name, s.name
    ORDER BY o.created_at DESC 
    LIMIT $${params.length + 1}
  `;
  params.push(limit);

  const result = await pool.query(query, params);

  return sendSuccess(res, result.rows, 'Live orders retrieved');
});
