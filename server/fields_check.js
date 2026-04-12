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
        const res = await pool.query("SELECT * FROM stores LIMIT 0");
        console.log('Fields:', res.fields.map(f => f.name));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
