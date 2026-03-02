require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });

async function fixSchema() {
    const client = await pool.connect();
    try {
        console.log('Adding missing columns to users table...');

        // Add missing columns to users table
        const userCols = [
            { name: 'bio', type: 'TEXT' },
            { name: 'profile_photo_url', type: 'VARCHAR(500)' },
            { name: 'banner_image_url', type: 'VARCHAR(500)' },
            { name: 'banner_color', type: 'VARCHAR(20)' },
            { name: 'phone', type: 'VARCHAR(50)' },
            { name: 'address', type: 'TEXT' },
            { name: 'city', type: 'VARCHAR(100)' },
            { name: 'state', type: 'VARCHAR(100)' },
            { name: 'zip_code', type: 'VARCHAR(20)' },
            { name: 'latitude', type: 'DECIMAL(10,8)' },
            { name: 'longitude', type: 'DECIMAL(11,8)' },
            { name: 'license_number', type: 'VARCHAR(100)' },
            { name: 'vehicle_type', type: 'VARCHAR(50)' },
            { name: 'vehicle_plate', type: 'VARCHAR(50)' },
            { name: 'is_verified_driver', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'current_location', type: 'JSONB' },
            { name: 'stripe_customer_id', type: 'VARCHAR(100)' },
            { name: 'referral_code', type: 'VARCHAR(50)' },
            { name: 'referred_by', type: 'INTEGER' },
            { name: 'newsletter_subscribed', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'two_factor_enabled', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'two_factor_secret', type: 'VARCHAR(100)' },
            { name: 'last_login', type: 'TIMESTAMP' },
            { name: 'deleted_at', type: 'TIMESTAMP' }
        ];

        for (const col of userCols) {
            try {
                await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`  ✅ ${col.name}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  ⏭️ ${col.name} already exists`);
                } else {
                    console.log(`  ❌ ${col.name}: ${e.message}`);
                }
            }
        }

        console.log('\nAdding missing columns to listings table...');

        // Add missing columns to listings table
        const listingCols = [
            { name: 'creator_id', type: 'INTEGER REFERENCES users(user_id)' },
            { name: 'slug', type: 'VARCHAR(255)' },
            { name: 'short_description', type: 'TEXT' },
            { name: 'duration', type: 'VARCHAR(50)' },
            { name: 'location', type: 'VARCHAR(255)' },
            { name: 'latitude', type: 'DECIMAL(10,8)' },
            { name: 'longitude', type: 'DECIMAL(11,8)' },
            { name: 'video_url', type: 'VARCHAR(500)' },
            { name: 'video_thumbnail', type: 'VARCHAR(500)' },
            { name: 'view_count', type: 'INTEGER DEFAULT 0' },
            { name: 'like_count', type: 'INTEGER DEFAULT 0' },
            { name: 'share_count', type: 'INTEGER DEFAULT 0' },
            { name: 'rating', type: 'DECIMAL(3,2) DEFAULT 0' },
            { name: 'review_count', type: 'INTEGER DEFAULT 0' },
            { name: 'is_featured', type: 'BOOLEAN DEFAULT FALSE' },
            { name: 'is_active', type: 'BOOLEAN DEFAULT TRUE' },
            { name: 'published_at', type: 'TIMESTAMP' },
            { name: 'expires_at', type: 'TIMESTAMP' },
            { name: 'deleted_at', type: 'TIMESTAMP' }
        ];

        for (const col of listingCols) {
            try {
                await client.query(`ALTER TABLE listings ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
                console.log(`  ✅ ${col.name}`);
            } catch (e) {
                if (e.code === '42701') {
                    console.log(`  ⏭️ ${col.name} already exists`);
                } else {
                    console.log(`  ❌ ${col.name}: ${e.message}`);
                }
            }
        }

        console.log('\n✅ Schema fixes complete!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        client.release();
        await pool.end();
    }
}

fixSchema();
