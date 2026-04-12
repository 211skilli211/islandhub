import { Pool, PoolClient, PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Docker-aware database configuration
const isDocker = process.env.DOCKER_ENV === 'true';

// Support both DATABASE_URL (Neon/Cloud) and individual DB_* variables (local)
const poolConfig: PoolConfig = {
    // Use DATABASE_URL if available (Neon, Railway, etc.)
    connectionString: process.env.DATABASE_URL,

    // Fallback to individual variables for local development
    user: process.env.DB_USER || (process.env.DATABASE_URL ? undefined : 'postgres'),
    host: isDocker ? 'postgres' : (process.env.DB_HOST || (process.env.DATABASE_URL ? undefined : 'localhost')),
    database: process.env.DB_NAME || (process.env.DATABASE_URL ? undefined : 'islandfund'),
    password: process.env.DB_PASSWORD || (process.env.DATABASE_URL ? undefined : '135246Rob'),
    port: parseInt(process.env.DB_PORT || (process.env.DATABASE_URL ? '5432' : '5432')),

    // Connection pool settings - optimized for performance
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,

    // Query performance settings
    statement_timeout: 30000,

    // SSL for production (required for Neon)
    ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL ? {
        rejectUnauthorized: true
    } : false
};

export const pool = new Pool(poolConfig);

// Connection status tracking
let isConnected = false;

pool.on('connect', () => {
    if (!isConnected) {
        console.log('✅ Connected to PostgreSQL database');
        isConnected = true;
    }
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
    isConnected = false;
});

// Test connection on startup
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as time, current_database() as db');
        client.release();
        console.log(`📊 Database: ${result.rows[0].db}, Server Time: ${result.rows[0].time}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
        return false;
    }
};

// Enhanced query wrapper with performance tracking
export const query = async (text: string, params?: any[]) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        if (duration > 500) {
            console.warn(`⚠️  Slow query (${duration}ms): ${text.substring(0, 100)}...`);
        }

        return result;
    } catch (error) {
        console.error(`❌ Query error (${Date.now() - start}ms): ${text.substring(0, 100)}...`, error);
        throw error;
    }
};

// Transaction helper with automatic rollback
export const transaction = async <T>(callback: (client: any) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

// Unified migration runner — executes all .sql files in src/migrations/ in order
export const runMigrations = async () => {
    const client: PoolClient = await pool.connect();
    try {
        // Test if connection works first
        const isDbReady = await testConnection();
        if (!isDbReady) {
            console.error('❌ Cannot run migrations - database not connected');
            return;
        }

        console.log('🚀 Running unified database migrations from src/migrations/...');

        // Create migrations tracking table
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Get already-executed migrations
        const executedResult = await client.query('SELECT filename FROM migrations');
        const executedMigrations = new Set<string>(executedResult.rows.map((r: { filename: string }) => r.filename));

        // Read all .sql migration files from src/migrations/ sorted alphabetically
        const migrationsDir = path.join(__dirname, 'migrations');
        let migrationFiles: string[] = [];

        if (fs.existsSync(migrationsDir)) {
            migrationFiles = fs.readdirSync(migrationsDir)
                .filter((f: string) => f.endsWith('.sql'))
                .sort();
        }

        console.log(`📋 Found ${migrationFiles.length} migration files`);

        let executedCount = 0;
        for (const filename of migrationFiles) {
            if (executedMigrations.has(filename)) {
                console.log(`⏭️  Skipping ${filename} (already executed)`);
                continue;
            }

            console.log(`🔄 Executing ${filename}...`);
            const filePath = path.join(migrationsDir, filename);
            const sql = fs.readFileSync(filePath, 'utf8');

            await client.query('BEGIN');
            try {
                await client.query(sql);
                await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
                await client.query('COMMIT');
                console.log(`✅ ${filename} executed successfully`);
                executedCount++;
            } catch (error: any) {
                await client.query('ROLLBACK');
                // Log error but continue — some migrations may fail on existing schemas (e.g. redundant constraints)
                console.warn(`⚠️  ${filename} failed: ${error.message} — skipping and continuing`);
                // Still mark as "attempted" to avoid infinite retries on startup
                try {
                    await client.query('INSERT INTO migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
                } catch (_) { /* ignore */ }
            }
        }

        console.log(`✅ Unified migrations complete! Ran ${executedCount} new migration(s).`);
    } catch (err) {
        console.error('❌ Migration runner error:', err);
    } finally {
        client.release();
    }
};
