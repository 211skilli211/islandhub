const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function createDeliveryRatingsTable() {
    try {
        const client = await pool.connect();
        
        console.log('Creating delivery_ratings table...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS delivery_ratings (
                rating_id SERIAL PRIMARY KEY,
                delivery_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
                customer_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                driver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                review TEXT,
                driver_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(delivery_id, customer_id)
            );
        `);
        console.log('Created delivery_ratings table');

        // Add indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_delivery_ratings_driver ON delivery_ratings(driver_id);
            CREATE INDEX IF NOT EXISTS idx_delivery_ratings_customer ON delivery_ratings(customer_id);
        `);
        console.log('Created indexes');

        // Add average rating column to users if not exists
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3,2) DEFAULT 0;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_rating_count INTEGER DEFAULT 0;
        `);
        console.log('Added driver rating columns to users table');

        console.log('Delivery ratings table created successfully!');
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        pool.end();
    }
}

createDeliveryRatingsTable();
