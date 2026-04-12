require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });

async function main() {
    try {
        const email = 'skilli211beng@gmail.com';
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, is_active, email_verified) VALUES ($1, $2, $3, $4, true, true) RETURNING user_id, email, role',
            ['Admin User', email, hash, 'admin']
        );
        console.log('✅ Admin user created:', result.rows[0]);
        console.log('Email:', email);
        console.log('Password:', password);
    } catch (e) {
        console.log('Error:', e.message);
    } finally {
        await pool.end();
    }
}

main();
