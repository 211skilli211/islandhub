const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function migrate() {
    try {
        console.log('Starting data migration for rental sub-categories...');

        // Step 1: Add sub_category column (safety check, already in db.ts but good for standalone)
        await pool.query(`
            ALTER TABLE listings
            ADD COLUMN IF NOT EXISTS sub_category TEXT;
        `);

        // Step 2: Update Palm Ridge Estates & Rentals (Store 10)
        // Vehicles → Land Rentals
        console.log('Updating Palm Ridge vehicles...');
        await pool.query(`
            UPDATE listings SET sub_category = 'land'
            WHERE id IN (36, 37, 38, 39);
        `);

        // Apartments/Villas → Stays
        console.log('Updating Palm Ridge stays...');
        await pool.query(`
            UPDATE listings SET sub_category = 'stays'
            WHERE id IN (40, 41, 3);
        `);

        // Step 3: Update Azure Watersports (Store 11)
        // Jet Skis + Boats → Sea Rentals
        console.log('Updating Azure Watersports sea rentals...');
        await pool.query(`
            UPDATE listings SET sub_category = 'sea'
            WHERE id IN (42, 43, 44, 45);
        `);

        // Step 4: Update Reef Runner Boat Rentals (Store 2)
        // Yacht → Sea Rentals
        console.log('Updating Reef Runner sea rentals...');
        await pool.query(`
            UPDATE listings SET sub_category = 'sea'
            WHERE id = 2;
        `);

        // Step 5: Update any other rental listings based on title patterns
        console.log('Refining other rental listings based on patterns (overriding defaults if necessary)...');

        // Stays patterns (Override 'equipment' if it matches)
        await pool.query(`
            UPDATE listings SET sub_category = 'stays'
            WHERE category IN ('Rental', 'Rentals & Property', 'rental', 'rentals', 'Rentals')
            AND (title ILIKE '%Apartment%' OR title ILIKE '%Villa%' OR title ILIKE '%Studio%' OR title ILIKE '%Condo%')
            AND (sub_category IS NULL OR sub_category = 'equipment');
        `);

        // Land patterns (Override 'equipment' if it matches)
        await pool.query(`
            UPDATE listings SET sub_category = 'land'
            WHERE category IN ('Rental', 'Rentals & Property', 'rental', 'rentals', 'Rentals')
            AND (title ILIKE '%Car%' OR title ILIKE '%SUV%' OR title ILIKE '%Sedan%' OR title ILIKE '%Scooter%' OR title ILIKE '%Bike%' OR title ILIKE '%Jeep%' OR title ILIKE '%Mustang%')
            AND (sub_category IS NULL OR sub_category = 'equipment');
        `);

        // Final catch-all for equipment (only if still NULL)
        await pool.query(`
            UPDATE listings SET sub_category = 'equipment'
            WHERE category IN ('Rental', 'Rentals & Property', 'rental', 'rentals', 'Rentals')
            AND sub_category IS NULL;
        `);

        console.log('Data migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
