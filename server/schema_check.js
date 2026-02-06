const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function check() {
    try {
        const storesSchema = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'stores'");
        const vendorsSchema = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'vendors'");

        console.log('Stores columns:', storesSchema.rows.map(r => r.column_name).join(', '));
        console.log('Vendors columns:', vendorsSchema.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}
check();
