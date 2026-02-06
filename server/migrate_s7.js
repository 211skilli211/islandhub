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

        // 1. Fix Users Role Constraint
        // Check existing constraint definition first to be safe, but we know it's missing 'vendor'
        console.log('Fixing users_role_check...');

        // We drop the old constraint and add the new one with 'vendor' included
        // We also keep 'creator' just in case legacy data uses it.
        await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role::text = ANY (ARRAY['admin'::character varying, 'buyer'::character varying, 'creator'::character varying, 'sponsor'::character varying, 'vendor'::character varying, 'donor'::character varying]::text[]));
    `);

        // 2. Add badges to Listings
        console.log('Adding badges to listings...');
        await client.query(`
      ALTER TABLE listings 
      ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
    `);

        // 3. Add badges to Stores
        console.log('Adding badges to stores...');
        await client.query(`
      ALTER TABLE stores 
      ADD COLUMN IF NOT EXISTS badges text[] DEFAULT '{}';
    `);

        await client.query('COMMIT');
        console.log('Migration S7 completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
