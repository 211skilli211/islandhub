const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function checkColumns() {
    try {
        const client = await pool.connect();
        const cols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name IN ('pickup_location', 'dropoff_location', 'transport_status', 'driver_id', 'vehicle_category', 'service_type', 'waypoints', 'extra_details', 'pricing_details')
            ORDER BY column_name;
        `);
        console.log('Columns found:', cols.rows);
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

checkColumns();
