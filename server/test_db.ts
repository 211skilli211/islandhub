
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

console.log('Testing DB Access...');
console.log('User:', process.env.DB_USER);
console.log('Host:', process.env.DB_HOST);
console.log('DB:', process.env.DB_NAME);
console.log('Pass length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function test() {
    try {
        console.log('Connecting...');
        const client = await pool.connect();
        console.log('Connected!');

        console.log('Querying listings columns...');
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'listings'
        `);
        console.log('Columns:', res.rows.map(r => r.column_name).join(', '));

        client.release();
        process.exit(0);
    } catch (err: any) {
        console.error('CONNECTION ERROR:', err.message);
        if (err.code) console.error('Code:', err.code);
        process.exit(1);
    }
}

test();
