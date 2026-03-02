require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });

async function fixSchema() {
    const client = await pool.connect();
    try {
        console.log('=== Comprehensive Schema Fix ===\n');

        // Add missing columns to users table
        console.log('Adding missing columns to users table...');
        const userCols = [
            { name: 'vehicle_color', type: 'VARCHAR(50)' },
            { name: 'vehicle_make', type: 'VARCHAR(50)' },
            { name: 'vehicle_model', type: 'VARCHAR(50)' },
            { name: 'vehicle_year', type: 'VARCHAR(10)' },
            { name: 'insurance_expiry', type: 'DATE' },
            { name: 'license_expiry', type: 'DATE' },
            { name: 'driver_license_front', type: 'VARCHAR(500)' },
            { name: 'driver_license_back', type: 'VARCHAR(500)' },
            { name: 'vehicle_registration', type: 'VARCHAR(500)' },
            { name: 'insurance_card', type: 'VARCHAR(500)' },
            { name: 'background_check_status', type: 'VARCHAR(20) DEFAULT \'pending\'' },
            { name: 'background_check_date', type: 'TIMESTAMP' },
        ];

        for (const col of userCols) {
            try {
                await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`  ✅ users.${col.name}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  ⏭️ users.${col.name} already exists`);
                } else {
                    console.log(`  ❌ users.${col.name}: ${e.message}`);
                }
            }
        }

        // Create vendor_kyc table
        console.log('\nCreating vendor_kyc table...');
        try {
            await client.query(`
        CREATE TABLE IF NOT EXISTS vendor_kyc (
          kyc_id SERIAL PRIMARY KEY,
          vendor_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
          document_type VARCHAR(50) NOT NULL,
          document_url VARCHAR(500),
          status VARCHAR(20) DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP,
          verified_by INTEGER REFERENCES users(user_id),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            console.log('  ✅ vendor_kyc table created');
        } catch (e) {
            if (e.code === '42P07') {
                console.log('  ⏭️ vendor_kyc table already exists');
            } else {
                console.log(`  ❌ vendor_kyc: ${e.message}`);
            }
        }

        // Create admin_settings table
        console.log('\nCreating admin_settings table...');
        try {
            await client.query(`
        CREATE TABLE IF NOT EXISTS admin_settings (
          setting_id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          setting_type VARCHAR(20) DEFAULT 'string',
          description TEXT,
          is_encrypted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
            console.log('  ✅ admin_settings table created');
        } catch (e) {
            if (e.code === '42P07') {
                console.log('  ⏭️ admin_settings table already exists');
            } else {
                console.log(`  ❌ admin_settings: ${e.message}`);
            }
        }

        // Add missing columns to admin_stats related queries
        console.log('\nAdding missing columns to listings table (for admin stats)...');
        const listingCols = [
            { name: 'type', type: 'VARCHAR(50) DEFAULT \'product\'' },
        ];

        for (const col of listingCols) {
            try {
                await client.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`  ✅ listings.${col.name}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  ⏭️ listings.${col.name} already exists`);
                } else {
                    console.log(`  ❌ listings.${col.name}: ${e.message}`);
                }
            }
        }

        // Add missing columns to carts table
        console.log('\nAdding missing columns to carts table...');
        const cartCols = [
            { name: 'session_id', type: 'VARCHAR(100)' },
            { name: 'device_type', type: 'VARCHAR(20)' },
            { name: 'coupon_code', type: 'VARCHAR(50)' },
            { name: 'coupon_discount', type: 'DECIMAL(10,2) DEFAULT 0' },
        ];

        for (const col of cartCols) {
            try {
                await client.query(`ALTER TABLE carts ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`  ✅ carts.${col.name}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  ⏭️ carts.${col.name} already exists`);
                } else {
                    console.log(`  ❌ carts.${col.name}: ${e.message}`);
                }
            }
        }

        console.log('\n=== Schema fixes complete! ===');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixSchema();
