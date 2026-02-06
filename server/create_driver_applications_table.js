const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function createDriverApplicationsTable() {
    try {
        const client = await pool.connect();

        console.log('Creating driver_applications table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS driver_applications (
                application_id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'pending',
                vehicle_type VARCHAR(50) NOT NULL,
                vehicle_make VARCHAR(100),
                vehicle_model VARCHAR(100),
                vehicle_year INTEGER,
                vehicle_plate VARCHAR(50),
                vehicle_color VARCHAR(50),
                license_number VARCHAR(100),
                license_expiry DATE,
                license_photo_url VARCHAR(512),
                vehicle_photo_url VARCHAR(512),
                insurance_photo_url VARCHAR(512),
                background_check_status VARCHAR(50) DEFAULT 'pending',
                notes TEXT,
                reviewed_by INTEGER REFERENCES users(user_id),
                reviewed_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id)
            );
        `);
        console.log('Created driver_applications table');

        // Add index for status lookups
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_driver_applications_status 
            ON driver_applications(status);
        `);
        console.log('Created index');

        console.log('Driver applications table created successfully!');
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

createDriverApplicationsTable();
