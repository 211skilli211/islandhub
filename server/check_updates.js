const { pool } = require('./src/config/db');

async function check() {
    try {
        const result = await pool.query('SELECT * FROM campaign_updates');
        console.log('Updates:', result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();