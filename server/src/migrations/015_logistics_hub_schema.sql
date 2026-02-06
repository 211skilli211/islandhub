-- ============================================
-- Logistics & Mobility Hub Schema
-- Phase 1: User Roles, Driver Attributes, Transport Listings
-- ============================================

-- 1. Extend Users Table for Driver/Rider Roles & KYC
-- Note: 'role' is likely an ENUM or Check constraint. If it's a VARCHAR, we just add logic.
-- If it's a hard ENUM type in Postgres, we might need to ALTER TYPE.
-- Assuming VARCHAR based on previous User.ts model.

ALTER TABLE users
ADD COLUMN IF NOT EXISTS license_number VARCHAR(50),      -- Driver's License
ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(50),        -- 'car', 'suv', 'truck', 'scooter'
ADD COLUMN IF NOT EXISTS vehicle_plate VARCHAR(20),       -- License Plate
ADD COLUMN IF NOT EXISTS is_verified_driver BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_location POINT;          -- For real-time tracking (Lat, Long)

-- 2. Extend Listings Table for Jobs/Requests
-- "Ride Request" or "Delivery Job" is a Listing with service_type = 'transport' etc.

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS service_type VARCHAR(50),        -- 'pickup', 'delivery', 'taxi'
ADD COLUMN IF NOT EXISTS pickup_location TEXT,            -- User entered address/coords
ADD COLUMN IF NOT EXISTS dropoff_location TEXT,           -- User entered address/coords
ADD COLUMN IF NOT EXISTS driver_id INT REFERENCES users(user_id), -- Assigned Driver
ADD COLUMN IF NOT EXISTS vehicle_category VARCHAR(50),    -- Requirement: 'truck', 'suv'
ADD COLUMN IF NOT EXISTS schedule_time TIMESTAMP,         -- Future booking
ADD COLUMN IF NOT EXISTS transport_status VARCHAR(50) DEFAULT 'pending'; 
-- Statuses: 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_listings_service_type ON listings(service_type);
CREATE INDEX IF NOT EXISTS idx_listings_transport_status ON listings(transport_status);
CREATE INDEX IF NOT EXISTS idx_listings_driver_id ON listings(driver_id);
CREATE INDEX IF NOT EXISTS idx_users_is_verified_driver ON users(is_verified_driver);
