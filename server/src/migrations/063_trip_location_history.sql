-- Migration: Trip location history for live tracking polyline
-- Creates table to store driver location points during active trips

CREATE TABLE IF NOT EXISTS trip_location_history (
    id SERIAL PRIMARY KEY,
    trip_id VARCHAR(100) NOT NULL,
    driver_id INTEGER NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups by trip
CREATE INDEX IF NOT EXISTS idx_trip_location_history_trip_id ON trip_location_history(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_location_history_recorded ON trip_location_history(trip_id, recorded_at ASC);

-- Add vehicle_plate to driver_locations if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'driver_locations' AND column_name = 'vehicle_plate') THEN
        ALTER TABLE driver_locations ADD COLUMN vehicle_plate VARCHAR(20);
    END IF;
END $$;
