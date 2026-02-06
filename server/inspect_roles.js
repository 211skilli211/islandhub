const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function run() {
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT DISTINCT role FROM users');
        console.log('Distinct Roles:', res.rows.map(r => r.role));
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
