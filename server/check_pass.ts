
import { Client } from 'pg';

const passwords = [
    'password',
    '135246Rob!',
    '135246Rob',
    'Password123',
    'password123',
    'postgres',
    'admin',
    'root',
    ''
];

async function check() {
    console.log('Checking passwords...');
    for (const p of passwords) {
        const client = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'islandfund',
            password: p,
            port: 5432,
        });

        try {
            await client.connect();
            console.log(`SUCCESS! Password found: "${p}"`);
            await client.end();
            process.exit(0);
        } catch (e: any) {
            console.log(`Failed: "${p}" - ${e.code}`);
        }
    }
    console.log('All failed.');
    process.exit(1);
}

check();
