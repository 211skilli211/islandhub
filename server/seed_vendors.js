const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:135246Rob@localhost:5433/islandfund'
});

async function run() {
    try {
        // Insert Service Provider
        await pool.query(`
            INSERT INTO vendors (user_id, business_name, description, sub_type, location, is_verified, store_slug)
            VALUES 
            (1, 'Island Fixers', 'Professional home repair and maintenance.', 'service', 'Basseterre', true, 'island-fixers')
            ON CONFLICT DO NOTHING;
        `);

        // Insert Product Vendor (if not exists)
        await pool.query(`
             INSERT INTO vendors (user_id, business_name, description, sub_type, location, is_verified, store_slug)
            VALUES 
            (1, 'Tropical Threads', 'Handmade island fashion.', 'retail', 'Charlestown', true, 'tropical-threads')
            ON CONFLICT DO NOTHING;
        `);

        console.log('Dummy vendors inserted/verified');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
