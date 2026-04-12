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
        const vCount = await client.query('SELECT COUNT(*) FROM vendors');
        const sCount = await client.query('SELECT COUNT(*) FROM stores');
        const mCount = await client.query('SELECT COUNT(*) FROM media');
        console.log({
            vendors: vCount.rows[0].count,
            stores: sCount.rows[0].count,
            media: mCount.rows[0].count
        });
    } catch (e) {
        console.error(e.message);
    } finally {
        client.release();
        await pool.end();
    }
}
check();