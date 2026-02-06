const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'island_fund_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function migrate() {
    try {
        const client = await pool.connect();
        console.log('Connected to database...');

        // Check if column exists
        const checkRes = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='is_active';
    `);

        if (checkRes.rows.length === 0) {
            console.log('Adding is_active column to users table...');
            await client.query(`
        ALTER TABLE users 
        ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
      `);
            console.log('Column added successfully.');
        } else {
            console.log('Column is_active already exists.');
        }

        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
