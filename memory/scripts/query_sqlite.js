const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'technical_data.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

function queryDatabase(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'list-tables';

    console.log(`=== ReMeLight Dense Data Query ===\n`);

    try {
        if (command === 'list-tables') {
            const tables = await queryDatabase(`SELECT name FROM sqlite_master WHERE type='table'`);
            console.log("Available Tables:");
            tables.forEach(t => console.log(` - ${t.name}`));
        } else if (command === 'search-endpoints') {
            const term = args[1] || '';
            const endpoints = await queryDatabase(`SELECT * FROM api_endpoints WHERE path LIKE ? OR description LIKE ?`, [`%${term}%`, `%${term}%`]);
            console.log(`Found ${endpoints.length} endpoints matching '${term}':`);
            console.log(JSON.stringify(endpoints, null, 2));
        } else if (command === 'search-schemas') {
            const term = args[1] || '';
            const schemas = await queryDatabase(`SELECT * FROM db_schemas WHERE table_name LIKE ?`, [`%${term}%`]);
            console.log(`Found ${schemas.length} schemas matching '${term}':`);
            console.log(JSON.stringify(schemas, null, 2));
        } else if (command === 'raw') {
            const rawQuery = args.slice(1).join(' ');
            if (!rawQuery) throw new Error("Please provide a raw SQL query.");
            const results = await queryDatabase(rawQuery);
            console.log(JSON.stringify(results, null, 2));
        } else {
            console.log(`Unknown command: ${command}`);
            console.log(`Supported commands: list-tables, search-endpoints [term], search-schemas [term], raw "SELECT ..."`);
        }
    } catch (err) {
        console.error("Database error:", err.message);
    } finally {
        db.close();
    }
}

if (require.main === module) {
    main();
}
