// Migration to add status column to vendors table for KYB verification workflow
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'islandfund',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5433')
});

async function migrate() {
    try {
        // Add status column to vendors if it doesn't exist
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'vendors' 
                    AND column_name = 'status'
                ) THEN
                    ALTER TABLE vendors ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
                    COMMENT ON COLUMN vendors.status IS 'Vendor status: pending, active, suspended, rejected';
                END IF;
            END $$;
        `);
        console.log('✅ Added status column to vendors table');

        // Add kyb_verified column to track KYB verification
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'vendors' 
                    AND column_name = 'kyb_verified'
                ) THEN
                    ALTER TABLE vendors ADD COLUMN kyb_verified BOOLEAN DEFAULT FALSE;
                    COMMENT ON COLUMN vendors.kyb_verified IS 'Whether KYB documents have been verified by admin';
                END IF;
            END $$;
        `);
        console.log('✅ Added kyb_verified column to vendors table');

        // Add admin_notes column for verification notes
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT FROM information_schema.columns 
                    WHERE table_name = 'vendors' 
                    AND column_name = 'admin_notes'
                ) THEN
                    ALTER TABLE vendors ADD COLUMN admin_notes TEXT;
                    COMMENT ON COLUMN vendors.admin_notes IS 'Admin notes from verification process';
                END IF;
            END $$;
        `);
        console.log('✅ Added admin_notes column to vendors table');

        // Update existing vendors to have active status
        await pool.query(`
            UPDATE vendors SET status = 'active' WHERE status IS NULL OR status = '';
        `);
        console.log('✅ Updated existing vendors to active status');

        // Update stores to have pending status by default for new vendors
        // (The store creation will be modified to use pending status)

        console.log('\n✅ Migration complete! Vendors now have KYB verification workflow.');
        console.log('Status values: pending → active (after admin verification)');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

migrate();
