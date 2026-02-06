const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '5432'),
});

async function fixMigration() {
    try {
        console.log('Starting fix migration (JS)...');
        console.log(`Connecting to ${process.env.DB_NAME} as ${process.env.DB_USER}`);

        // 1. Users
        try {
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE");
            console.log('Added email_verified to users');
        } catch (e) {
            console.log('email_verified error (ignored):', e.message);
        }

        try {
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'buyer'");
            console.log('Added role to users');
        } catch (e) {
            console.log('role error (ignored):', e.message);
        }

        // 2. Vendors
        try {
            await pool.query("ALTER TABLE vendors ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending'");
            console.log('Added kyc_status to vendors');
        } catch (e) {
            console.log('kyc_status error (ignored):', e.message);
        }

        try {
            await pool.query("ALTER TABLE vendors ADD COLUMN IF NOT EXISTS storefront_info JSONB DEFAULT '{}'::jsonb");
            console.log('Added storefront_info to vendors');
        } catch (e) {
            console.log('storefront_info error (ignored):', e.message);
        }

        // 3. Tables
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS vendor_kyc (
                    kyc_id SERIAL PRIMARY KEY,
                    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
                    documents JSONB NOT NULL,
                    status VARCHAR(20) DEFAULT 'pending',
                    submitted_at TIMESTAMP DEFAULT NOW(),
                    reviewed_at TIMESTAMP
                )
            `);
            console.log('Created vendor_kyc table');
        } catch (e) {
            console.error('vendor_kyc table error:', e.message);
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS campaigns (
                    campaign_id SERIAL PRIMARY KEY,
                    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    goal_amount DECIMAL(12,2),
                    current_amount DECIMAL(12,2) DEFAULT 0.00,
                    status VARCHAR(20) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('Created campaigns table');
        } catch (e) {
            console.error('campaigns table error:', e.message);
        }

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS donations (
                    donation_id SERIAL PRIMARY KEY,
                    campaign_id INT NOT NULL REFERENCES campaigns(campaign_id) ON DELETE CASCADE,
                    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
                    amount DECIMAL(12,2) NOT NULL,
                    message TEXT,
                    status VARCHAR(20) DEFAULT 'completed',
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);
            console.log('Created donations table');
        } catch (e) {
            console.error('donations table error:', e.message);
        }

        // 4. Indexes
        try {
            await pool.query("CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified)");
            console.log('Created idx_users_email_verified');
        } catch (e) { console.error(e.message); }

        try {
            await pool.query("CREATE INDEX IF NOT EXISTS idx_vendors_kyc_status ON vendors(kyc_status)");
            console.log('Created idx_vendors_kyc_status');
        } catch (e) { console.error(e.message); }

        try {
            await pool.query("CREATE INDEX IF NOT EXISTS idx_vendor_kyc_status ON vendor_kyc(status)");
            console.log('Created idx_vendor_kyc_status');
        } catch (e) { console.error(e.message); }

        try {
            await pool.query("CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)");
            console.log('Created idx_campaigns_status');
        } catch (e) { console.error(e.message); }

        console.log('Fix migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

fixMigration();
