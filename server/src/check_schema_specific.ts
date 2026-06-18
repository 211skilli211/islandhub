import { pool } from './config/db';
async function run() {
    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'listings'");
    const info = res.rows.filter(r => ['images', 'metadata', 'rental_category', 'rental_subtype'].includes(r.column_name));
    console.log(JSON.stringify(info, null, 2));
    process.exit();
}
run();
