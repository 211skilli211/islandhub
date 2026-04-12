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