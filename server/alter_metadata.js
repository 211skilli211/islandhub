const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function run() {
    try {
        console.log('Adding metadata column...');
        await pool.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
        `);
        console.log('Success: metadata column added.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

run();
