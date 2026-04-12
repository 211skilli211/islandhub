
import { pool } from './src/config/db';

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating stores table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS stores (
                store_id SERIAL PRIMARY KEY,
                vendor_id INTEGER REFERENCES users(user_id), -- Linking to user_id as owner
                category VARCHAR(50),      -- 'Restaurant', 'E-Commerce', 'Rental', 'Service'
                subtype VARCHAR(50),       -- 'Electronics', 'Housing', 'Cleaning', etc.
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE,
                description TEXT,
                logo_url TEXT,
                banner_url TEXT,
                subscription_type VARCHAR(20) DEFAULT 'basic', -- 'basic' or 'pro'
                status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Adding store_id column to listings table...');
        // Check if column exists first
        const columnCheck = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'listings' AND column_name = 'store_id'
        `);

        if (columnCheck.rows.length === 0) {
            await client.query(`
                ALTER TABLE listings ADD COLUMN store_id INTEGER REFERENCES stores(store_id)
            `);
        }

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
