const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'technical_data.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database at:', dbPath);
    }
});

// Create tables for dense technical data
const initializeDB = () => {
    db.serialize(() => {
        // 1. API Endpoints Table
        db.run(`CREATE TABLE IF NOT EXISTS api_endpoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            method TEXT NOT NULL,
            path TEXT NOT NULL,
            description TEXT,
            request_schema TEXT,
            response_schema TEXT,
            auth_required BOOLEAN DEFAULT 1,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating api_endpoints table:", err.message);
            else console.log("api_endpoints table ready.");
        });

        // 2. Database Schemas Reference Table
        db.run(`CREATE TABLE IF NOT EXISTS db_schemas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            table_name TEXT NOT NULL UNIQUE,
            columns_schema TEXT NOT NULL,
            relationships TEXT,
            notes TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating db_schemas table:", err.message);
            else console.log("db_schemas table ready.");
        });

        // 3. System Configuration Reference
        db.run(`CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            description TEXT,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) console.error("Error creating system_config table:", err.message);
            else console.log("system_config table ready.");
        });
    });
};

initializeDB();

// Keep script running just to initialize, then exit.
setTimeout(() => {
    db.close((err) => {
        if (err) console.error(err.message);
        console.log('Close the database connection.');
        process.exit(0);
    });
}, 1000);
