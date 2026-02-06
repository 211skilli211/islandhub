import { pool } from '../config/db';

export const migrateLogisticsPhase2 = async () => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Update Users table for driver status
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified_driver BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS last_online TIMESTAMP,
            ADD COLUMN IF NOT EXISTS live_lat DECIMAL(9,6),
            ADD COLUMN IF NOT EXISTS live_lng DECIMAL(9,6),
            ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3,2) DEFAULT 5.00,
            ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
        `);

        // 2. Create Driver Profiles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS driver_profiles (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id) UNIQUE,
                license_number TEXT,
                license_expiry DATE,
                verification_status TEXT DEFAULT 'pending', -- pending, approved, rejected
                rejection_reason TEXT,
                documents JSONB, -- URLs to license photos, etc.
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. Create Vehicles table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id SERIAL PRIMARY KEY,
                driver_id INTEGER REFERENCES users(user_id),
                make TEXT,
                model TEXT,
                year INTEGER,
                plate_number TEXT,
                color TEXT,
                category TEXT, -- economy, premium, van, bike
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. Update listings for surge and ETA
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS surge_multiplier DECIMAL(3,2) DEFAULT 1.00,
            ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP,
            ADD COLUMN IF NOT EXISTS live_lat DECIMAL(9,6),
            ADD COLUMN IF NOT EXISTS live_lng DECIMAL(9,6);
        `);

        await client.query('COMMIT');
        console.log('✅ Logistics Phase 2 Migrations Completed');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Error:', e);
    } finally {
        client.release();
    }
};

migrateLogisticsPhase2();
