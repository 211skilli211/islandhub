const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:135246Rob@localhost:5433/islandfund'
});

async function run() {
    try {
        const res = await pool.query("UPDATE vendors SET sub_type = 'boat' WHERE id = 2 RETURNING *");
        console.log('Updated vendor:', res.rows[0]);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

run();
