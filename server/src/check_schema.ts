import { pool } from './config/db';
async function run() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings'");
    for (const row of res.rows) {
        console.log(`${row.column_name}: ${row.data_type}`);
    }
    process.exit();
}
run();
