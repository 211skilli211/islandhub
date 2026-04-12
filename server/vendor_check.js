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
        const vendors = await pool.query('SELECT id, business_name FROM vendors');
        console.log('Vendors:', vendors.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
