const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('Starting migration...');

        // Add verified column to listings
        await pool.query(`
            ALTER TABLE listings 
            ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
        `);
        console.log('Checked/Added listings.verified');

        // Update existing listings to verified for dev convenience (optional, but requested implicitly)
        await pool.query(`
            UPDATE listings SET verified = TRUE WHERE verified IS NOT TRUE;
        `);
        console.log('Updated existing listings to verified=TRUE');

        // Add google_id and avatar_url to users for Google Auth
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
            ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255);
        `);
        console.log('Checked/Added users.google_id and users.avatar_url');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
