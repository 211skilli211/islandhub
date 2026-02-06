const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Unified Orders Migration...');

        await client.query('BEGIN');

        // 1. Create Order Status ENUM if not exists
        await client.query(`
      DO $$ BEGIN
          CREATE TYPE order_status AS ENUM ('pending', 'paid', 'fulfilled', 'cancelled');
      EXCEPTION
          WHEN duplicate_object THEN null;
      END $$;
    `);

        // 2. Create Orders Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        status order_status DEFAULT 'pending',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

        // 3. Create Order Items Table
        await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
        item_id INT NOT NULL,
        item_type VARCHAR(20) NOT NULL, -- product, rental, service, campaign
        quantity INT DEFAULT 1,
        price DECIMAL(10,2) NOT NULL
      );
    `);

        // 4. Update Transactions Table
        await client.query(`
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS order_id INT REFERENCES orders(order_id);
      ALTER TABLE transactions ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
    `);

        await client.query('COMMIT');
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
