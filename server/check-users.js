require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });

async function main() {
    try {
        // Check tables
        const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        // Check users columns
        const cols = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('User cols:', cols.rows.map(c => c.column_name).join(', '));

        // Check existing users
        const users = await pool.query('SELECT user_id, email, role FROM users LIMIT 5');
        console.log('Users:', JSON.stringify(users.rows));
    } catch (e) {
        console.log('Error:', e.message);
    } finally {
        await pool.end();
    }
}

main();
