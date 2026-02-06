const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting image upload migration...');

        // Add avatar_url and cover_photo_url to users table
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500),
            ADD COLUMN IF NOT EXISTS cover_photo_url VARCHAR(500);
        `);
        console.log('✓ Added avatar_url and cover_photo_url to users table');

        // Add images array to listings table
        await client.query(`
            ALTER TABLE listings
            ADD COLUMN IF NOT EXISTS images TEXT[];
        `);
        console.log('✓ Added images array to listings table');

        // Add featured flag to listings
        await client.query(`
            ALTER TABLE listings
            ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
        `);
        console.log('✓ Added featured flag to listings table');

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
