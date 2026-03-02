require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 30000
});

async function main() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('Connected:', result.rows[0].now);

        const tables = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' ORDER BY table_name
    `);
        console.log('\\nTables:', tables.rows.map(r => r.table_name).join(', '));
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await pool.end();
    }
}

main();
