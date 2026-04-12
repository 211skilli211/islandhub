-- ============================================
-- Store Templates & Category System Migration
-- Defines templates for different business types
-- ============================================

-- ============================================
-- 1. Store Template Types Table
-- ============================================
CREATE TABLE IF NOT EXISTS store_template_types (
    template_id SERIAL PRIMARY KEY,
    template_key VARCHAR(50) UNIQUE NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'host', 'food', 'retail', 'service', 'rental'
    icon VARCHAR(50),
    color_theme VARCHAR(20) DEFAULT 'teal',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Store Template Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS store_template_features (
    feature_id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES store_template_types(template_id) ON DELETE CASCADE,
    feature_key VARCHAR(50) NOT NULL,
    feature_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    configuration JSONB DEFAULT '{}',
    UNIQUE(template_id, feature_key)
);

-- ============================================
-- 3. Store Template Configuration Table
-- ============================================
CREATE TABLE IF NOT EXISTS store_template_configs (
    config_id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(store_id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES store_template_types(template_id),
    configuration JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    enabled_features JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id)
);

-- ============================================
-- 4. Insert Template Types
-- ============================================
INSERT INTO store_template_types (template_key, template_name, description, category, icon, color_theme) VALUES
-- Host/Venue Templates
('tour_operator', 'Tour Operator', 'For tour guides and experience hosts', 'host', 'compass', 'teal'),
('event_venue', 'Event Venue', 'For event spaces and venues', 'host', 'calendar', 'purple'),
('activity_host', 'Activity Host', 'For activity and adventure providers', 'host', 'mountain', 'orange'),

-- Food & Beverage Templates
('restaurant', 'Restaurant', 'Full-service restaurant with menu', 'food', 'utensils', 'red'),
('cafe', 'Cafe', 'Coffee shop and light dining', 'food', 'coffee', 'amber'),
('food_truck', 'Food Truck', 'Mobile food vendor', 'food', 'truck', 'yellow'),
('bakery', 'Bakery', 'Bakery and pastry shop', 'food', 'cake', 'pink'),
('bar', 'Bar & Lounge', 'Bar and nightlife venue', 'food', 'wine', 'indigo'),

-- Retail Templates
('grocery_store', 'Grocery Store', 'Supermarket and grocery', 'retail', 'shopping-cart', 'green'),
('farmers_market', 'Farmers Market', 'Fresh produce and local goods', 'retail', 'leaf', 'emerald'),
('boutique', 'Boutique', 'Fashion and accessories', 'retail', 'shopping-bag', 'rose'),
('electronics', 'Electronics Store', 'Tech and gadgets', 'retail', 'smartphone', 'blue'),
('handmade', 'Handmade Goods', 'Artisan and craft products', 'retail', 'palette', 'violet'),

-- Service Templates
('mechanic', 'Auto Mechanic', 'Vehicle repair and maintenance', 'service', 'wrench', 'slate'),
('salon', 'Beauty Salon', 'Hair and beauty services', 'service', 'scissors', 'fuchsia'),
('consultant', 'Consultant', 'Professional consulting', 'service', 'briefcase', 'cyan'),
('repair', 'Repair Service', 'General repair services', 'service', 'tool', 'zinc'),

-- Rental Templates
('vehicle_rental', 'Vehicle Rental', 'Car, bike, boat rentals', 'rental', 'car', 'sky'),
('equipment_rental', 'Equipment Rental', 'Tools and equipment', 'rental', 'hammer', 'stone'),
('property_rental', 'Property Rental', 'Vacation rentals', 'rental', 'home', 'lime')
ON CONFLICT (template_key) DO NOTHING;

-- ============================================
-- 5. Insert Template Features
-- ============================================

-- Tour Operator Features
INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'itinerary_builder', 'Itinerary Builder', 'Build multi-day tour itineraries', true, '{"max_days": 14}'
FROM store_template_types WHERE template_key = 'tour_operator';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'group_booking', 'Group Booking', 'Manage group sizes and availability', true, '{"max_group_size": 50}'
FROM store_template_types WHERE template_key = 'tour_operator';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'pickup_locations', 'Pickup Locations', 'Multiple pickup points', false, '{}'
FROM store_template_types WHERE template_key = 'tour_operator';

-- Restaurant Features
INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'menu_management', 'Menu Management', 'Full menu with categories and items', true, '{"max_categories": 20}'
FROM store_template_types WHERE template_key = 'restaurant';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'table_reservation', 'Table Reservation', 'Book tables and manage seating', true, '{"max_tables": 100}'
FROM store_template_types WHERE template_key = 'restaurant';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'online_ordering', 'Online Ordering', 'Takeout and delivery orders', false, '{"delivery_radius": 10}'
FROM store_template_types WHERE template_key = 'restaurant';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'dietary_options', 'Dietary Options', 'Mark vegan, gluten-free, etc.', false, '{}'
FROM store_template_types WHERE template_key = 'restaurant';

-- Vehicle Rental Features
INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'fleet_management', 'Fleet Management', 'Manage vehicle inventory', true, '{"max_vehicles": 100}'
FROM store_template_types WHERE template_key = 'vehicle_rental';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'booking_calendar', 'Booking Calendar', 'Date-based availability', true, '{}'
FROM store_template_types WHERE template_key = 'vehicle_rental';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'driver_requirements', 'Driver Requirements', 'License and age verification', true, '{}'
FROM store_template_types WHERE template_key = 'vehicle_rental';

-- Salon/Service Features
INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'appointment_booking', 'Appointment Booking', 'Time-slot booking system', true, '{"time_slots": "30min"}'
FROM store_template_types WHERE template_key = 'salon';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'staff_scheduling', 'Staff Scheduling', 'Manage staff availability', true, '{}'
FROM store_template_types WHERE template_key = 'salon';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'service_packages', 'Service Packages', 'Bundle multiple services', false, '{}'
FROM store_template_types WHERE template_key = 'salon';

-- Retail Features
INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'inventory_management', 'Inventory Management', 'Track stock levels', true, '{"low_stock_alert": 10}'
FROM store_template_types WHERE template_key = 'grocery_store';

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'product_variants', 'Product Variants', 'Size, color options', true, '{}'
FROM store_template_types WHERE template_key IN ('grocery_store', 'boutique', 'electronics');

INSERT INTO store_template_features (template_id, feature_key, feature_name, description, is_required, configuration) 
SELECT template_id, 'expiry_tracking', 'Expiry Tracking', 'Track product expiration dates', false, '{}'
FROM store_template_types WHERE template_key = 'grocery_store';

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_store_template_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_store_template_config_timestamp ON store_template_configs;
CREATE TRIGGER update_store_template_config_timestamp
    BEFORE UPDATE ON store_template_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_store_template_config_timestamp();

-- ============================================
-- Migration Complete
-- ============================================
