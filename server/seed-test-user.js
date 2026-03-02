#!/usr/bin/env node
/**
 * Seed a test user for development
 */
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: true }
});

async function seedTestUser() {
    const client = await pool.connect();
    try {
        const email = 'test@island.fund';
        const password = 'password123';
        const name = 'Test User';

        // Check if user exists
        const existing = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            console.log('Test user already exists:', email);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Create user
        const result = await client.query(`
      INSERT INTO users (name, email, password_hash, role, country, is_active, email_verified, created_at, updated_at)
      VALUES ($1, $2, $3, 'admin', 'US', true, true, NOW(), NOW())
      RETURNING user_id, email, name, role
    `, [name, email, password_hash]);

        console.log('✅ Test user created:', result.rows[0]);
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seedTestUser();
