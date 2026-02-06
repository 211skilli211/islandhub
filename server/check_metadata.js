const { pool } = require('./src/config/db');

async function checkMetadata() {
    try {
        const result = await pool.query('SELECT id, type, metadata FROM listings LIMIT 5');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkMetadata();