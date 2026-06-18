-- ============================================
-- Analytics Infrastructure Migration
-- Creates views and functions for analytics queries
-- ============================================

-- Fix missing columns in order_items table
ALTER TABLE order_items 
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS item_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS item_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(12, 2);

-- ============================================
-- 1. Sales Overview View (Vendor & Admin)
-- ============================================
CREATE OR REPLACE VIEW analytics_sales_overview AS
SELECT 
    DATE(created_at) as date,
    store_id,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    SUM(subtotal) as total_subtotal,
    SUM(tax_amount) as total_tax,
    SUM(service_fee) as total_fees,
    SUM(delivery_fee) as total_delivery_fees,
    SUM(discount_amount) as total_discounts,
    AVG(total_amount) as avg_order_value,
    COUNT(DISTINCT user_id) as unique_customers
FROM orders
WHERE status NOT IN ('cancelled')
GROUP BY DATE(created_at), store_id;

-- ============================================
-- 2. Order Status Breakdown View
-- ============================================
CREATE OR REPLACE VIEW analytics_order_status AS
SELECT 
    store_id,
    status,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order
FROM orders
GROUP BY store_id, status;

-- ============================================
-- 3. Product Performance View
-- ============================================
CREATE OR REPLACE VIEW analytics_product_performance AS
SELECT 
    oi.listing_id,
    l.title as product_name,
    l.store_id,
    COUNT(DISTINCT oi.order_id) as order_count,
    SUM(oi.quantity) as units_sold,
    SUM(oi.total_price) as total_revenue,
    AVG(oi.unit_price) as avg_price,
    MIN(oi.created_at) as first_sale,
    MAX(oi.created_at) as last_sale
FROM order_items oi
JOIN listings l ON oi.listing_id = l.id
JOIN orders o ON oi.order_id = o.order_id
WHERE o.status NOT IN ('cancelled')
GROUP BY oi.listing_id, l.title, l.store_id;

-- ============================================
-- 4. Customer Analytics View
-- ============================================
CREATE OR REPLACE VIEW analytics_customers AS
SELECT 
    user_id,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_spent,
    AVG(total_amount) as avg_order_value,
    MIN(created_at) as first_order,
    MAX(created_at) as last_order,
    MAX(created_at) - MIN(created_at) as customer_lifetime_days,
    CASE 
        WHEN MAX(created_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 'active'
        WHEN MAX(created_at) >= CURRENT_DATE - INTERVAL '90 days' THEN 'recent'
        ELSE 'inactive'
    END as customer_status
FROM orders
WHERE status NOT IN ('cancelled')
  AND user_id IS NOT NULL
GROUP BY user_id;

-- ============================================
-- 5. Hourly/Daily Sales Pattern View
-- ============================================
CREATE OR REPLACE VIEW analytics_sales_patterns AS
SELECT 
    store_id,
    EXTRACT(HOUR FROM created_at) as hour_of_day,
    EXTRACT(DOW FROM created_at) as day_of_week,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE status NOT IN ('cancelled')
  AND created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY store_id, EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at);

-- ============================================
-- 6. Payment Method Analytics View
-- ============================================
CREATE OR REPLACE VIEW analytics_payment_methods AS
SELECT 
    store_id,
    payment_method,
    payment_provider,
    COUNT(*) as transaction_count,
    SUM(total_amount) as total_amount,
    AVG(total_amount) as avg_amount,
    COUNT(CASE WHEN status::text = 'completed' THEN 1 END) as successful_count,
    COUNT(CASE WHEN status::text = 'failed' THEN 1 END) as failed_count
FROM orders
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY store_id, payment_method, payment_provider;

-- ============================================
-- 7. Revenue Trends View (30/60/90 days)
-- ============================================
CREATE OR REPLACE VIEW analytics_revenue_trends AS
WITH daily_revenue AS (
    SELECT 
        store_id,
        DATE(created_at) as date,
        SUM(total_amount) as daily_revenue,
        COUNT(*) as daily_orders
    FROM orders
    WHERE status NOT IN ('cancelled')
      AND created_at >= CURRENT_DATE - INTERVAL '90 days'
    GROUP BY store_id, DATE(created_at)
),
rolling_averages AS (
    SELECT 
        store_id,
        date,
        daily_revenue,
        daily_orders,
        AVG(daily_revenue) OVER (
            PARTITION BY store_id 
            ORDER BY date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as revenue_7d_avg,
        AVG(daily_revenue) OVER (
            PARTITION BY store_id 
            ORDER BY date 
            ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) as revenue_30d_avg,
        SUM(daily_revenue) OVER (
            PARTITION BY store_id 
            ORDER BY date 
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) as revenue_7d_total,
        SUM(daily_revenue) OVER (
            PARTITION BY store_id 
            ORDER BY date 
            ROWS BETWEEN 29 PRECEDING AND CURRENT ROW
        ) as revenue_30d_total
    FROM daily_revenue
)
SELECT * FROM rolling_averages;

-- ============================================
-- 8. Function: Get Vendor Dashboard Stats
-- ============================================
CREATE OR REPLACE FUNCTION get_vendor_dashboard_stats(p_store_id INTEGER)
RETURNS TABLE (
    total_revenue DECIMAL,
    total_orders BIGINT,
    total_customers BIGINT,
    avg_order_value DECIMAL,
    revenue_7d DECIMAL,
    revenue_30d DECIMAL,
    orders_7d BIGINT,
    orders_30d BIGINT,
    pending_orders BIGINT,
    processing_orders BIGINT,
    completed_orders BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') THEN o.total_amount ELSE 0 END), 0) as total_revenue,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') THEN 1 END) as total_orders,
        COUNT(DISTINCT CASE WHEN o.status NOT IN ('cancelled') THEN o.user_id END) as total_customers,
        COALESCE(AVG(CASE WHEN o.status NOT IN ('cancelled') THEN o.total_amount END), 0) as avg_order_value,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN o.total_amount ELSE 0 END), 0) as revenue_7d,
        COALESCE(SUM(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN o.total_amount ELSE 0 END), 0) as revenue_30d,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as orders_7d,
        COUNT(CASE WHEN o.status NOT IN ('cancelled') AND o.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_30d,
        COUNT(CASE WHEN o.status::text = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN o.status IN ('paid', 'processing') THEN 1 END) as processing_orders,
        COUNT(CASE WHEN o.status::text = 'completed' THEN 1 END) as completed_orders
    FROM orders o
    WHERE o.store_id = p_store_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. Function: Get Vendor Sales Chart Data
-- ============================================
CREATE OR REPLACE FUNCTION get_vendor_sales_chart(
    p_store_id INTEGER,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    revenue DECIMAL,
    orders BIGINT,
    customers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(o.created_at) as date,
        COALESCE(SUM(o.total_amount), 0) as revenue,
        COUNT(*) as orders,
        COUNT(DISTINCT o.user_id) as customers
    FROM orders o
    WHERE o.store_id = p_store_id
      AND o.status NOT IN ('cancelled')
      AND o.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY DATE(o.created_at)
    ORDER BY DATE(o.created_at);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. Function: Get Top Products
-- ============================================
CREATE OR REPLACE FUNCTION get_vendor_top_products(
    p_store_id INTEGER,
    p_limit INTEGER DEFAULT 10,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    listing_id INTEGER,
    product_name VARCHAR,
    units_sold BIGINT,
    revenue DECIMAL,
    avg_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oi.listing_id,
        l.title as product_name,
        SUM(oi.quantity) as units_sold,
        SUM(oi.total_price) as revenue,
        COALESCE(AVG(r.rating), 0) as avg_rating
    FROM order_items oi
    JOIN listings l ON oi.listing_id = l.id
    JOIN orders o ON oi.order_id = o.order_id
    LEFT JOIN reviews r ON l.id = r.listing_id
    WHERE l.store_id = p_store_id
      AND o.status NOT IN ('cancelled')
      AND o.created_at >= CURRENT_DATE - (p_days || ' days')::INTERVAL
    GROUP BY oi.listing_id, l.title
    ORDER BY SUM(oi.total_price) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 11. Admin Platform-wide Analytics View
-- ============================================
CREATE OR REPLACE VIEW analytics_platform_overview AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_orders,
    COUNT(DISTINCT store_id) as active_stores,
    COUNT(DISTINCT user_id) as active_customers,
    SUM(total_amount) as total_revenue,
    SUM(commission_amount) as total_commission,
    SUM(vendor_payout_amount) as total_vendor_payouts,
    AVG(total_amount) as avg_order_value
FROM orders
WHERE status NOT IN ('cancelled')
GROUP BY DATE(created_at);

-- ============================================
-- 12. Index for Analytics Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_analytics ON orders(created_at, store_id, status) 
WHERE status NOT IN ('cancelled');

CREATE INDEX IF NOT EXISTS idx_order_items_analytics ON order_items(listing_id, order_id);

-- ============================================
-- Migration Complete
-- ============================================
