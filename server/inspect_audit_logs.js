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

        console.log('--- audit_logs Columns ---');
        const cols = await client.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'audit_logs'");
        cols.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type} (${r.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`));

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
