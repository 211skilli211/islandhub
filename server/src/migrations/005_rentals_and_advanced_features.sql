-- ============================================
-- Rentals Refinement Schema
-- Categories: Housing, Vehicles, Special
-- Availability Calendar Fix + Price Ranging
-- ============================================

-- 1. Rental Categories
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS rental_category VARCHAR(50);
-- Values: 'housing', 'vehicle', 'special'

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS rental_subtype VARCHAR(50);
-- Housing: 'apartment', 'studio', 'airbnb'
-- Vehicles: 'small_car', 'sedan', 'suv', 'vip_car', 'bike', 'boat', 'atv', 'jet_ski', 'scooter'
-- Special: 'tools', 'equipment', 'miscellaneous'

-- 2. Availability Calendar (fix)
CREATE TABLE IF NOT EXISTS rental_availability (
    availability_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_rental_availability_listing ON rental_availability(listing_id);

-- 3. Price Ranging / Types
CREATE TABLE IF NOT EXISTS rental_pricing (
    pricing_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50), -- e.g. 'small_car', 'suv', 'vip_car', 'bike', 'boat', etc.
    base_price DECIMAL(12,2) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_rental_pricing_listing ON rental_pricing(listing_id);

-- 4. Optional: Seasonal Pricing for Rentals
CREATE TABLE IF NOT EXISTS rental_seasonal_rates (
    seasonal_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    adjusted_price DECIMAL(12,2) NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_rental_seasonal_rates_listing ON rental_seasonal_rates(listing_id);

-- ============================================
-- IslandHub Advanced Listing Features Schema
-- Phase 8: Variants, Calendars, Seasonal Rates, Menus
-- ============================================

-- 1. Product Variants (Retail/Boutiques)
-- Store variant definitions (e.g., Size, Color) and inventory counts
CREATE TABLE IF NOT EXISTS product_variants (
    variant_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    variant_key VARCHAR(50) NOT NULL,   -- e.g. "Size"
    variant_value VARCHAR(50) NOT NULL, -- e.g. "Medium"
    sku VARCHAR(100),                   -- optional SKU code
    inventory_count INT DEFAULT 0,
    price_adjustment DECIMAL(12,2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_product_variants_listing ON product_variants(listing_id);

-- 2. Service Calendars (Tours, Professionals)
-- Define availability schedules with time slots
CREATE TABLE IF NOT EXISTS service_calendars (
    calendar_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,   -- e.g. "Monday"
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_min INT DEFAULT 60         -- default slot length in minutes
);

CREATE INDEX IF NOT EXISTS idx_service_calendars_listing ON service_calendars(listing_id);

-- 3. Seasonal Rental Rates (Cars, Stays)
CREATE TABLE IF NOT EXISTS seasonal_rates (
    rate_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_seasonal_rates_listing ON seasonal_rates(listing_id);

-- 4. Complex Menus (Restaurants)
-- Nested structure: Menu Sections -> Items -> Add-ons
CREATE TABLE IF NOT EXISTS menu_sections (
    section_id SERIAL PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    item_id SERIAL PRIMARY KEY,
    section_id INT NOT NULL REFERENCES menu_sections(section_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_addons (
    addon_id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES menu_items(item_id) ON DELETE CASCADE,
    addon_name VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) DEFAULT 0.00
);

CREATE INDEX IF NOT EXISTS idx_menu_sections_listing ON menu_sections(listing_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_section ON menu_items(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_addons_item ON menu_addons(item_id);
