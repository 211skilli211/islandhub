const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function check() {
    try {
        const stores = await pool.query('SELECT COUNT(*) FROM stores');
        const vendors = await pool.query('SELECT COUNT(*) FROM vendors');
        const listings = await pool.query('SELECT COUNT(*) FROM listings');
        console.log('Stores:', stores.rows[0].count);
        console.log('Vendors:', vendors.rows[0].count);
        console.log('Listings:', listings.rows[0].count);

        if (stores.rows[0].count > 0) {
            const sample = await pool.query('SELECT store_id, name, status, category FROM stores LIMIT 5');
            console.log('Sample Stores:', JSON.stringify(sample.rows, null, 2));
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
