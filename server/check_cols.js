const { pool } = require('./src/config/db');

async function check() {
    try {
        const result = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'transactions\' AND table_schema = \'public\'');
        console.log('Transactions columns:', result.rows.map(x => x.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();