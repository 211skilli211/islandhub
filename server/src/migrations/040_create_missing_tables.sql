-- Migration 040: Create Missing Tables
-- Creates all tables that are referenced but don't exist (without FK constraints to avoid issues)

-- ============================================
-- 1. Orders Table - Add missing columns if table exists
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Add missing columns to orders
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_driver_id INTEGER;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id INTEGER;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_fee DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address JSONB;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_instructions TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_accepted_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_picked_up_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'product';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_reason TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_payout_amount DECIMAL(12, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_payout_status VARCHAR(50) DEFAULT 'pending';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_payout_id VARCHAR(255);
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_paid_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS device_info JSONB;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS ip_address INET;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_agent TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ELSE
        -- Create orders table if it doesn't exist
        CREATE TABLE orders (
            order_id SERIAL PRIMARY KEY,
            user_id INTEGER,
            assigned_driver_id INTEGER,
            order_number VARCHAR(50),
            guest_email VARCHAR(255),
            guest_phone VARCHAR(50),
            store_id INTEGER,
            status VARCHAR(50) DEFAULT 'pending',
            subtotal DECIMAL(12, 2) DEFAULT 0,
            tax_amount DECIMAL(12, 2) DEFAULT 0,
            service_fee DECIMAL(12, 2) DEFAULT 0,
            discount_amount DECIMAL(12, 2) DEFAULT 0,
            delivery_type VARCHAR(20) DEFAULT 'pickup',
            delivery_address JSONB,
            delivery_instructions TEXT,
            delivery_lat DECIMAL(10, 8),
            delivery_lng DECIMAL(11, 8),
            estimated_delivery_time TIMESTAMP,
            actual_delivery_time TIMESTAMP,
            driver_accepted_at TIMESTAMP,
            driver_picked_up_at TIMESTAMP,
            driver_delivered_at TIMESTAMP,
            order_type VARCHAR(50) DEFAULT 'product',
            payment_status VARCHAR(50) DEFAULT 'pending',
            payment_method VARCHAR(50),
            payment_provider VARCHAR(50),
            payment_intent_id VARCHAR(255),
            payment_confirmed_at TIMESTAMP,
            total_amount DECIMAL(12, 2) DEFAULT 0,
            refund_amount DECIMAL(12, 2) DEFAULT 0,
            refund_reason TEXT,
            refunded_at TIMESTAMP,
            cancelled_at TIMESTAMP,
            cancellation_reason TEXT,
            commission_amount DECIMAL(12, 2) DEFAULT 0,
            commission_rate DECIMAL(5, 2) DEFAULT 0,
            vendor_payout_amount DECIMAL(12, 2) DEFAULT 0,
            vendor_payout_status VARCHAR(50) DEFAULT 'pending',
            vendor_payout_id VARCHAR(255),
            vendor_paid_at TIMESTAMP,
            source VARCHAR(50) DEFAULT 'web',
            device_info JSONB,
            ip_address INET,
            user_agent TEXT,
            paid_at TIMESTAMP,
            processed_at TIMESTAMP,
            completed_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- ============================================
-- 2. Order Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER,
    listing_id INTEGER,
    item_name VARCHAR(255) NOT NULL,
    item_description TEXT,
    item_type VARCHAR(50),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(12, 2),
    selected_variant JSONB,
    selected_addons JSONB,
    selected_sides JSONB,
    rental_start_date DATE,
    rental_end_date DATE,
    rental_days INTEGER,
    service_date DATE,
    service_time_start TIME,
    service_time_end TIME,
    service_provider_id INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    prepared_at TIMESTAMP,
    ready_at TIMESTAMP,
    delivered_at TIMESTAMP,
    refund_amount DECIMAL(12, 2) DEFAULT 0,
    refund_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Audit Logs Table (for Admin Activity)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    record_id INTEGER,
    record_type VARCHAR(50),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Donations Table
-- ============================================
CREATE TABLE IF NOT EXISTS donations (
    donation_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    campaign_id INTEGER,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    is_anonymous BOOLEAN DEFAULT FALSE,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Payouts Table (for Vendor/Driver Payouts)
-- ============================================
CREATE TABLE IF NOT EXISTS payouts (
    payout_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    store_id INTEGER,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payout_method VARCHAR(50) NOT NULL,
    payout_details JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Revenue Orders Table
-- ============================================
CREATE TABLE IF NOT EXISTS revenue_orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    vendor_id INTEGER,
    listing_id INTEGER,
    amount NUMERIC(10, 2) NOT NULL,
    commission NUMERIC(10, 2) DEFAULT 0,
    net_revenue NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    transaction_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. Order Status History (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id SERIAL PRIMARY KEY,
    order_id INTEGER,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    changed_by INTEGER,
    changed_by_type VARCHAR(50),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. Create Indexes
-- ============================================
-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_driver_id ON orders(assigned_driver_id);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON order_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Donations indexes
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Payouts indexes
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_store_id ON payouts(store_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- Revenue orders indexes
CREATE INDEX IF NOT EXISTS idx_revenue_orders_vendor ON revenue_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_orders_user ON revenue_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_orders_status ON revenue_orders(status);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- ============================================
-- 9. Triggers for Updated At
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to order_items
DROP TRIGGER IF EXISTS update_order_items_updated_at ON order_items;
CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to donations
DROP TRIGGER IF EXISTS update_donations_updated_at ON donations;
CREATE TRIGGER update_donations_updated_at
    BEFORE UPDATE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to payouts
DROP TRIGGER IF EXISTS update_payouts_updated_at ON payouts;
CREATE TRIGGER update_payouts_updated_at
    BEFORE UPDATE ON payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to revenue_orders
DROP TRIGGER IF EXISTS update_revenue_orders_updated_at ON revenue_orders;
CREATE TRIGGER update_revenue_orders_updated_at
    BEFORE UPDATE ON revenue_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. Order Number Generator Function
-- ============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_order_number VARCHAR(50);
    year_str VARCHAR(4);
    sequence_num INTEGER;
BEGIN
    year_str := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;

    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_str || '-%';

    new_order_number := 'ORD-' || year_str || '-' || LPAD(sequence_num::TEXT, 6, '0');

    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;
