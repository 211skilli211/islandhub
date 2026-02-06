
import { pool } from './src/config/db';

async function checkSchema() {
    try {
        const tables = await pool.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
        console.log("Tables:", tables.rows.map(r => r.tablename));

        for (const table of tables.rows) {
            const columns = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table.tablename]);
            console.log(`\nTable: ${table.tablename}`);
            columns.rows.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
