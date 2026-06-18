/**
 * create_test_user.ts — Create a single test user for onboarding
 * 
 * Usage: npx ts-node server/src/create_test_user.ts <email> <name> <password> [role]
 * Role defaults to 'customer'. Options: customer, vendor, driver, admin
 * 
 * Example:
 *   npx ts-node server/src/create_test_user.ts john@example.com "John Doe" mypass123 vendor
 */

import { pool } from './config/db';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['customer', 'vendor', 'driver', 'admin', 'moderator'];

async function createUser(email: string, name: string, password: string, role: string) {
    console.log(`\n👤 Creating test user: ${email}\n`);

    // Validate
    if (!email || !name || !password) {
        console.error('❌ Missing required fields: email, name, password');
        process.exit(1);
    }
    if (!VALID_ROLES.includes(role)) {
        console.error(`❌ Invalid role: ${role}. Valid: ${VALID_ROLES.join(', ')}`);
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('❌ Password must be at least 8 characters');
        process.exit(1);
    }

    // Check if exists
    const existing = await pool.query('SELECT user_id, role FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        const u = existing.rows[0];
        console.log(`⚠️  User already exists (ID: ${u.user_id}, role: ${u.role})`);
        const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        const answer = await new Promise<string>(resolve => {
            readline.question('Update role? (y/n): ', resolve);
        });
        readline.close();
        if (answer.toLowerCase() === 'y') {
            await pool.query('UPDATE users SET role = $1 WHERE user_id = $2', [role, u.user_id]);
            console.log(`   ✓ Role updated to: ${role}`);
        }
        process.exit(0);
    }

    // Create
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, email_verified, created_at)
         VALUES ($1, $2, $3, $4, true, NOW())
         RETURNING user_id, name, email, role`,
        [name, email, hash, role]
    );

    const user = result.rows[0];
    console.log(`   ✓ User created (ID: ${user.user_id})`);
    console.log(`   ✓ Name: ${user.name}`);
    console.log(`   ✓ Email: ${user.email}`);
    console.log(`   ✓ Role: ${user.role}`);
    console.log(`   ✓ Email verified: true`);

    // If vendor, create vendor profile
    if (role === 'vendor') {
        const vResult = await pool.query(
            `INSERT INTO vendors (user_id, business_name, slug, bio, kyc_status)
             VALUES ($1, $2, $3, $4, 'pending')
             RETURNING id`,
            [user.user_id, `${name}'s Business`, name.toLowerCase().replace(/\s+/g, '-'), '']
        );
        console.log(`   ✓ Vendor profile created (ID: ${vResult.rows[0].id})`);
    }

    console.log('\n✅ Done!');
}

const [email, name, password, role = 'customer'] = process.argv.slice(2);
createUser(email, name, password, role)
    .then(() => process.exit(0))
    .catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
