const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function inspect() {
    try {
        const client = await pool.connect();

        console.log('--- Listings Columns ---');
        const cols = await client.query("SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'listings'");
        cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.udt_name})`));

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
