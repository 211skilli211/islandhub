const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function addColumns() {
    try {
        const client = await pool.connect();

        console.log('Adding missing columns...');

        // Add transport_status if missing
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS transport_status VARCHAR(50) DEFAULT 'pending';
        `);
        console.log('Added transport_status');

        // Add vehicle_category if missing
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS vehicle_category VARCHAR(50);
        `);
        console.log('Added vehicle_category');

        // Add scheduled_time if missing
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS scheduled_time TIMESTAMP;
        `);
        console.log('Added scheduled_time');

        console.log('All columns added successfully!');
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

addColumns();
