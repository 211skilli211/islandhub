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
        const stores = await pool.query('SELECT store_id, name, vendor_id FROM stores LIMIT 20');
        console.log('Stores:', JSON.stringify(stores.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
