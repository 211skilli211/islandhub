const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: process.env.PGPASSWORD || '135246Rob',
    port: 5432,
});

async function inspect() {
    try {
        const storesRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores'");
        console.log('--- STORES TABLE ---');
        storesRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        const listingsRes = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings'");
        console.log('\n--- LISTINGS TABLE ---');
        listingsRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
