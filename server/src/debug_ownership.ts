import { pool } from './config/db';
async function run() {
    try {
        const res = await pool.query('SELECT s.store_id, s.name, s.vendor_id, u.email FROM stores s JOIN users u ON s.vendor_id = u.user_id WHERE u.email LIKE $1', ['skilli211ben%']);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}
run();
