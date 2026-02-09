const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function setupFeatured() {
    try {
        console.log('Checking listings table schema...');
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'listings' AND column_name = 'featured';
        `);

        if (res.rows.length === 0) {
            console.log('Adding featured column...');
            await pool.query('ALTER TABLE listings ADD COLUMN featured BOOLEAN DEFAULT FALSE;');
            console.log('Featured column added!');
        } else {
            console.log('Featured column already exists.');
        }

        // Feature some random listing for demo if none are featured
        const featuredCount = await pool.query('SELECT COUNT(*) FROM listings WHERE featured = TRUE');
        if (parseInt(featuredCount.rows[0].count) === 0) {
            console.log('Featuring a random active campaign...');
            // Need to handle the case where no listings exist or none are active
            await pool.query("UPDATE listings SET featured = TRUE WHERE type = 'campaign' AND id IN (SELECT id FROM listings WHERE type = 'campaign' LIMIT 1);");
            console.log('Featured a campaign.');
        }

    } catch (err) {
        console.error('Error setting up featured column:', err);
    } finally {
        await pool.end();
        process.exit();
    }
}

setupFeatured();
