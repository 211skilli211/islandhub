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
    try {
        const tables = ['stores', 'media', 'vendors', 'listings', 'reviews'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position
            `, [table]);
            console.log(`${table.toUpperCase()} COLUMNS:`, res.rows.map(r => r.column_name));
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();
