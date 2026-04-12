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

        console.log('\n--- Triggers ---');
        const trigs = await client.query("SELECT trigger_name, event_manipulation, action_statement FROM information_schema.triggers WHERE event_object_table = 'users'");
        if (trigs.rows.length === 0) console.log("No triggers found.");
        else trigs.rows.forEach(r => console.log(`[${r.trigger_name}] ${r.event_manipulation} -> ${r.action_statement}`));

        client.release();
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

inspect();
