-- Migration: Add missing profile fields to users table
-- Adds phone, location, website columns for enhanced profiles

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(500);

-- Update userController RETURNING clause to include new columns
-- Note: The controller already uses COALESCE for updates, so existing PUT /users/update works
