-- Driver Dispatch System Tables
-- Migration: 049_driver_dispatch.sql

-- Driver locations (real-time tracking)
CREATE TABLE IF NOT EXISTS driver_locations (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_online BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT FALSE,
    vehicle_type VARCHAR(50),
    vehicle_plate VARCHAR(20),
    vehicle_model VARCHAR(100),
    current_address TEXT,
    city VARCHAR(100),
    country VARCHAR(50) DEFAULT 'Saint Kitts and Nevis',
    last_location_update TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_online ON driver_locations(is_online, is_available);
CREATE INDEX idx_driver_locations_coords ON driver_locations(latitude, longitude);

-- Driver earnings tracking
CREATE TABLE IF NOT EXISTS driver_earnings (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    trip_id INTEGER REFERENCES trips(id),
    amount DECIMAL(10, 2) NOT NULL,
    platform_fee DECIMAL(10, 2) DEFAULT 0,
    net_earnings DECIMAL(10, 2) NOT NULL,
    fare_base DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    paid_at TIMESTAMP
);

CREATE INDEX idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX idx_driver_earnings_status ON driver_earnings(status);
CREATE INDEX idx_driver_earnings_date ON driver_earnings(created_at DESC);

-- Driver ratings
CREATE TABLE IF NOT EXISTS driver_ratings (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER NOT NULL REFERENCES trips(id),
    driver_id INTEGER NOT NULL REFERENCES users(user_id),
    rider_id INTEGER NOT NULL REFERENCES users(user_id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_ratings_driver ON driver_ratings(driver_id);
CREATE INDEX idx_driver_ratings_trip ON driver_ratings(trip_id);

-- Dispatch requests (queue)
CREATE TABLE IF NOT EXISTS dispatch_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    rider_id INTEGER NOT NULL REFERENCES users(user_id),
    driver_type VARCHAR(50) NOT NULL,
    offered_driver_ids INTEGER[],
    assigned_driver_id INTEGER REFERENCES users(user_id),
    status VARCHAR(30) DEFAULT 'pending',
    pickup_location JSONB NOT NULL,
    dropoff_location JSONB NOT NULL,
    pickup_address TEXT,
    dropoff_address TEXT,
    estimated_fare DECIMAL(10, 2),
    actual_fare DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    accepted_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT
);

CREATE INDEX idx_dispatch_status ON dispatch_requests(status);
CREATE INDEX idx_dispatch_rider ON dispatch_requests(rider_id);
CREATE INDEX idx_dispatch_driver ON dispatch_requests(assigned_driver_id);
CREATE INDEX idx_dispatch_created ON dispatch_requests(created_at DESC);

-- Trips
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(100) UNIQUE NOT NULL,
    dispatch_request_id INTEGER REFERENCES dispatch_requests(id),
    driver_id INTEGER NOT NULL REFERENCES users(user_id),
    rider_id INTEGER NOT NULL REFERENCES users(user_id),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    pickup_lat DECIMAL(10, 8),
    pickup_lng DECIMAL(11, 8),
    dropoff_lat DECIMAL(10, 8),
    dropoff_lng DECIMAL(11, 8),
    status VARCHAR(30) DEFAULT 'assigned',
    fare_amount DECIMAL(10, 2),
    base_fare DECIMAL(10, 2),
    distance_fare DECIMAL(10, 2),
    time_fare DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    driver_earnings DECIMAL(10, 2),
    distance_km DECIMAL(10, 2),
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,
    arrived_at TIMESTAMP,
    picked_up_at TIMESTAMP,
    in_transit_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_reason TEXT,
    rating_id INTEGER REFERENCES driver_ratings(id)
);

CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_rider ON trips(rider_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_date ON trips(created_at DESC);

-- Driver verification documents
CREATE TABLE IF NOT EXISTS driver_documents (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_driver_documents_driver ON driver_documents(driver_id);
CREATE INDEX idx_driver_documents_status ON driver_documents(status);

-- Driver settings/preferences
CREATE TABLE IF NOT EXISTS driver_settings (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
    auto_accept_enabled BOOLEAN DEFAULT FALSE,
    max_distance_km INTEGER DEFAULT 50,
    preferred_areas JSONB DEFAULT '[]',
    notification_sound BOOLEAN DEFAULT TRUE,
    vibration BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- AI fare analysis (for dynamic pricing)
CREATE TABLE IF NOT EXISTS fare_analytics (
    id SERIAL PRIMARY KEY,
    location_start VARCHAR(100),
    location_end VARCHAR(100),
    base_fare DECIMAL(10, 2),
    avg_distance_km DECIMAL(10, 2),
    avg_duration_minutes INTEGER,
    avg_earnings DECIMAL(10, 2),
    trip_count INTEGER DEFAULT 0,
    peak_multiplier DECIMAL(3, 2) DEFAULT 1.0,
    last_analyzed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fare_analytics_route ON fare_analytics(location_start, location_end);

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_driver_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.last_location_update = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_driver_locations
    BEFORE UPDATE ON driver_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_location_timestamp();

-- Insert default driver settings for existing drivers
INSERT INTO driver_settings (driver_id)
SELECT user_id FROM users WHERE role LIKE 'driver_%'
ON CONFLICT (driver_id) DO NOTHING;

COMMENT ON TABLE driver_locations IS 'Real-time driver location tracking';
COMMENT ON TABLE dispatch_requests IS 'Dispatch queue and offer management';
COMMENT ON TABLE trips IS 'Trip lifecycle and fare tracking';
COMMENT ON TABLE driver_earnings IS 'Driver earnings and payouts';
COMMENT ON TABLE fare_analytics IS 'AI-powered fare analysis for dynamic pricing';