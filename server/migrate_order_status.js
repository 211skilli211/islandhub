const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'islandfund',
    password: process.env.DB_PASSWORD || '135246Rob',
    port: process.env.DB_PORT || 5433,
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting order status migration...');

        // Check if status format is an ENUM or Check Constraint
        // We will try to add values if it's a check constraint, or just do nothing if it's text.
        // If it's an enum, we alter type.

        // Simpler approach: Drop check constraint if exists and re-add it with new values, or change column to plain text.
        // Check for existing constraint
        const res = await client.query(`
            SELECT constraint_name 
            FROM information_schema.constraint_column_usage 
            WHERE table_name = 'orders' AND column_name = 'status'
        `);

        if (res.rows.length > 0) {
            const constraintName = res.rows[0].constraint_name;
            console.log(`Found constraint ${constraintName}, dropping and recreating...`);
            await client.query(`ALTER TABLE orders DROP CONSTRAINT "${constraintName}"`);

            // Re-add with new values
            await client.query(`
                ALTER TABLE orders 
                ADD CONSTRAINT orders_status_check 
                CHECK (status IN ('pending', 'paid', 'fulfilled', 'cancelled', 'preparing', 'ready', 'picked_up'))
            `);
            console.log('Constraint updated.');
        } else {
            console.log('No constraint found on status column, assuming it allows text.');
            // Optional: Add constraint to be safe
            // await client.query(`ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (...)`);
        }

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
