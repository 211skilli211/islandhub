import { pool } from './config/db';
import bcrypt from 'bcryptjs';

async function restoreAdmin() {
    const email = 'skilli211beng@gmail.com';
    const password = 'password123';
    const name = 'Skilli Admin';
    const role = 'admin';

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if table exists (it should, after schema_docker.sql)
        console.log(`Checking for user: ${email}`);

        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length > 0) {
            console.log('User exists, updating password and role...');
            await pool.query(
                'UPDATE users SET password_hash = $1, role = $2, is_active = true, email_verified = true WHERE email = $3',
                [passwordHash, role, email]
            );
        } else {
            console.log('User not found, inserting...');
            await pool.query(
                'INSERT INTO users (name, email, password_hash, role, is_active, email_verified) VALUES ($1, $2, $3, $4, true, true)',
                [name, email, passwordHash, role]
            );
        }

        console.log('✅ Admin user restored successfully');
    } catch (err) {
        console.error('❌ Error restoring admin:', err);
    } finally {
        process.exit();
    }
}

restoreAdmin();
