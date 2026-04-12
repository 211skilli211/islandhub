
import { pool } from './src/config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding business detail columns to stores table...');
        await client.query(`
            ALTER TABLE stores 
            ADD COLUMN IF NOT EXISTS aims TEXT,
            ADD COLUMN IF NOT EXISTS objectives TEXT,
            ADD COLUMN IF NOT EXISTS website_url TEXT,
            ADD COLUMN IF NOT EXISTS business_address TEXT,
            ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS service_mode VARCHAR(50) DEFAULT 'walk-in'
        `);

        console.log('Adding service mode column to listings table for granular control...');
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS service_mode VARCHAR(50)
        `);

        await client.query('COMMIT');
        console.log('Migration successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
