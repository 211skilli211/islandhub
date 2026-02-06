const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'islandfund',
    password: process.env.DB_PASSWORD || '135246Rob',
    port: process.env.DB_PORT || 5433,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migration...');

        // Add photos column
        await client.query(`
            ALTER TABLE menu_items 
            ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]';
        `);
        console.log('Added photos column to menu_items');

        // Add prep_time column (Integer minutes)
        await client.query(`
            ALTER TABLE menu_items 
            ADD COLUMN IF NOT EXISTS prep_time INTEGER DEFAULT 0;
        `);
        console.log('Added prep_time column to menu_items');

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
