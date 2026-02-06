
import { pool } from './src/config/db';

async function checkConstraints() {
    try {
        const res = await pool.query(`
            SELECT pg_get_constraintdef(oid) as def
            FROM pg_constraint 
            WHERE conrelid = 'listings'::regclass AND contype = 'c'
        `);
        res.rows.forEach(r => console.log(r.def));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkConstraints();
