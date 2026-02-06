const { pool } = require('./src/config/db');

async function check() {
    try {
        const result = await pool.query('SELECT * FROM audit_logs');
        console.log('Audit logs:', result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

check();