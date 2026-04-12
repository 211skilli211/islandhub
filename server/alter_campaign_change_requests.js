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
        console.log('Adding campaign_change_requests table...');
        await pool.query(`
            CREATE TABLE campaign_change_requests (
                id SERIAL PRIMARY KEY,
                listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
                admin_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
                feedback TEXT NOT NULL,
                status VARCHAR(20) CHECK (status IN ('requested', 'addressed', 'cancelled')) DEFAULT 'requested',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Success: campaign_change_requests table added.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

run();