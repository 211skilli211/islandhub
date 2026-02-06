-- ============================================
-- Core Commerce Tables Migration
-- Creates orders, order_items, cart, cart_items tables
-- ============================================

-- ============================================
-- 1. Cart Table - Add missing columns
-- ============================================
ALTER TABLE carts 
    ADD COLUMN IF NOT EXISTS session_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup',
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10, 2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON carts(session_id);

-- ============================================
-- 2. Cart Items Table - Add missing columns
-- ============================================
ALTER TABLE cart_items 
    ADD COLUMN IF NOT EXISTS price_snapshot DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS selected_variant JSONB,
    ADD COLUMN IF NOT EXISTS selected_addons JSONB,
    ADD COLUMN IF NOT EXISTS selected_sides JSONB,
    ADD COLUMN IF NOT EXISTS service_package_id INTEGER,
    ADD COLUMN IF NOT EXISTS appointment_slot JSONB,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_listing_id ON cart_items(listing_id);

-- ============================================
-- 3. Orders Table - Add missing columns
-- ============================================
ALTER TABLE orders 
    ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
    ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS guest_phone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS store_id INTEGER,
    ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS service_fee DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(20) DEFAULT 'pickup',
    ADD COLUMN IF NOT EXISTS delivery_address JSONB,
    ADD COLUMN IF NOT EXISTS delivery_instructions TEXT,
    ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8),
    ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8),
    ADD COLUMN IF NOT EXISTS estimated_delivery_time TIMESTAMP,
    ADD COLUMN IF NOT EXISTS actual_delivery_time TIMESTAMP,
    ADD COLUMN IF NOT EXISTS driver_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS driver_picked_up_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS driver_delivered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'product',
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(50),
    ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS refund_reason TEXT,
    ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS refunded_by INTEGER,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS cancelled_by INTEGER,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vendor_payout_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS vendor_payout_status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS vendor_payout_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS vendor_paid_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'web',
    ADD COLUMN IF NOT EXISTS device_info JSONB,
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_driver_id ON orders(assigned_driver_id);

-- ============================================
-- 4. Order Items Table - Create if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
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
    service_provider_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
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

-- Add missing columns to existing order_items table
ALTER TABLE order_items 
    ADD COLUMN IF NOT EXISTS listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS item_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS item_description TEXT,
    ADD COLUMN IF NOT EXISTS item_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
    ADD COLUMN IF NOT EXISTS total_price DECIMAL(12, 2),
    ADD COLUMN IF NOT EXISTS selected_variant JSONB,
    ADD COLUMN IF NOT EXISTS selected_addons JSONB,
    ADD COLUMN IF NOT EXISTS selected_sides JSONB,
    ADD COLUMN IF NOT EXISTS rental_start_date DATE,
    ADD COLUMN IF NOT EXISTS rental_end_date DATE,
    ADD COLUMN IF NOT EXISTS rental_days INTEGER,
    ADD COLUMN IF NOT EXISTS service_date DATE,
    ADD COLUMN IF NOT EXISTS service_time_start TIME,
    ADD COLUMN IF NOT EXISTS service_time_end TIME,
    ADD COLUMN IF NOT EXISTS service_provider_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS ready_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS refund_reason TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_listing_id ON order_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);

-- ============================================
-- 5. Order Status History (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
    history_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    changed_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    changed_by_type VARCHAR(50),
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON order_status_history(created_at DESC);

-- ============================================
-- 6. Triggers for Updated At
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to carts
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON carts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to cart_items
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

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

-- ============================================
-- 7. Order Number Generator Function
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
