-- Fix Database Schema for Logistics Hub
-- This migration removes the role CHECK constraint and fixes column names

-- 1. Drop the existing CHECK constraint on users.role
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Verify the change
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND contype = 'c';

-- 3. Now update the admin user to driver role
UPDATE users 
SET role = 'driver', 
    vehicle_type = 'car', 
    is_verified_driver = TRUE 
WHERE email = 'skilli211beng@gmail.com';

-- 4. Verify the update
SELECT email, role, vehicle_type, is_verified_driver 
FROM users 
WHERE email = 'skilli211beng@gmail.com';
