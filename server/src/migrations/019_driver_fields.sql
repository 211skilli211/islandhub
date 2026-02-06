-- Add vehicle_color and vehicle_seating to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_color VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vehicle_seating INTEGER;

COMMENT ON COLUMN users.vehicle_color IS 'The color of the driver vehicle';
COMMENT ON COLUMN users.vehicle_seating IS 'Number of passenger seats available in the vehicle';
