const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Explicitly load .env
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env:", result.error);
}

console.log("DB_HOST loaded:", !!process.env.DB_HOST);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        console.log("Connecting to DB...");
        const client = await pool.connect();
        console.log("Connected.");

        // Check listings count
        const countRes = await client.query('SELECT COUNT(*) FROM listings');
        console.log(`Total listings: ${countRes.rows[0].count}`);

        // Add columns if missing
        await client.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
        `);
        console.log("Ensured 'verified' column exists.");

        // Update verify status
        const updateRes = await client.query(`
            UPDATE listings SET verified = TRUE WHERE verified IS NOT TRUE;
        `);
        console.log(`Updated ${updateRes.rowCount} listings to verified=TRUE.`);

        // Check users columns
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
        `);
        console.log("Ensured 'google_id' and 'avatar_url' columns exist.");

        client.release();
    } catch (err) {
        console.error("Migration Error:", err);
    } finally {
        await pool.end();
    }
}

run();
