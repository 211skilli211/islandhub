const { pool } = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Applying marketplace migration...');
        const sql = fs.readFileSync(path.join(__dirname, '../islandhub_migration.sql'), 'utf8');
        await pool.query(sql);
        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

runMigration();