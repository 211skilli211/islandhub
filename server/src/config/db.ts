import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Docker-aware database configuration
const isDocker = process.env.DOCKER_ENV === 'true';

const poolConfig: PoolConfig = {
    user: process.env.DB_USER || 'postgres',
    host: isDocker ? 'postgres' : (process.env.DB_HOST || 'localhost'),
    database: process.env.DB_NAME || 'islandfund',
    password: process.env.DB_PASSWORD || '135246Rob',
    port: parseInt(process.env.DB_PORT || '5432'),
    
    // Connection pool settings - optimized for performance
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    min: parseInt(process.env.DB_POOL_MIN || '5'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    
    // Query performance settings
    statement_timeout: 30000,
    
    // SSL for production
    ssl: process.env.NODE_ENV === 'production' ? {
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

// Simple migration runner
export const runMigrations = async () => {
    try {
        // Test if connection works
        const isDbReady = await testConnection();
        if (!isDbReady) {
            console.error('❌ Cannot run migrations - database not connected');
            return;
        }

        console.log('🔄 Running database migrations...');
        
        // Create users table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'buyer',
                email_verified BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create listings table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS listings (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50),
                sub_category VARCHAR(50),
                condition VARCHAR(20),
                location TEXT,
                images JSONB DEFAULT '[]',
                metadata JSONB DEFAULT '{}',
                featured BOOLEAN DEFAULT FALSE,
                is_promoted BOOLEAN DEFAULT FALSE,
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create driver_payouts table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS driver_payouts (
                id SERIAL PRIMARY KEY,
                driver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
                delivery_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
                amount NUMERIC(10,2) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                paid_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for driver_payouts
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver ON driver_payouts(driver_id);
            CREATE INDEX IF NOT EXISTS idx_driver_payouts_status ON driver_payouts(status);
            CREATE INDEX IF NOT EXISTS idx_driver_payouts_delivery ON driver_payouts(delivery_id);
        `);

        // Update trigger for driver_payouts updated_at
        await pool.query(`
            CREATE OR REPLACE FUNCTION update_driver_payouts_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ language 'plpgsql';

            DROP TRIGGER IF EXISTS update_driver_payouts_updated_at_trigger ON driver_payouts;
            CREATE TRIGGER update_driver_payouts_updated_at_trigger
                BEFORE UPDATE ON driver_payouts
                FOR EACH ROW
                EXECUTE FUNCTION update_driver_payouts_updated_at();
        `);

        console.log('✅ Migrations completed successfully');
    } catch (err) {
        console.error('❌ Migration error:', err);
    }
};
