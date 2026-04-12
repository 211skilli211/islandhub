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

        console.log('Updating users_role_check to include moderator...');

        // Drop and re-add with all required roles
        await client.query(`
      ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
      ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role::text = ANY (ARRAY[
        'admin', 'buyer', 'creator', 'sponsor', 'vendor', 'donor', 'moderator'
      ]::text[]));
    `);

        await client.query('COMMIT');
        console.log('Migration S7_Roles completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
