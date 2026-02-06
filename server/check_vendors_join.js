const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function check() {
    const client = await pool.connect();
    try {
        const vResult = await client.query('SELECT v.business_name, v.user_id, u.name FROM vendors v LEFT JOIN users u ON v.user_id = u.user_id');
        console.log(vResult.rows);
    } catch (e) {
        console.error(e.message);
    } finally {
        client.release();
        await pool.end();
    }
}
check();
