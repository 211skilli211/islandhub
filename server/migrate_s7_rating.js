const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function run() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Adding admin_rating column to vendors table...');

        // Add admin_rating column (float, nullable)
        // If it is set, it overrides the calculated rating
        await client.query(`
      ALTER TABLE vendors 
      ADD COLUMN IF NOT EXISTS admin_rating NUMERIC(2,1);
    `);

        // Add constraint to ensure rating is between 0 and 5
        await client.query(`
        ALTER TABLE vendors DROP CONSTRAINT IF EXISTS check_admin_rating;
        ALTER TABLE vendors 
        ADD CONSTRAINT check_admin_rating CHECK (admin_rating >= 0 AND admin_rating <= 5);
    `);

        await client.query('COMMIT');
        console.log('Migration S7_Rating completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
