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

        console.log('Adding badges column to vendors table...');

        // Add badges column (jsonb array)
        await client.query(`
      ALTER TABLE vendors 
      ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]';
    `);

        await client.query('COMMIT');
        console.log('Migration S7_Badges completed successfully.');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

run();
