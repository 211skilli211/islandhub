const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5432,
});

async function auditCategoryIntegrity() {
    try {
        console.log('🔍 Auditing Store and Listing Category Integrity...\n');

        // Check for stores without slugs
        const noSlugQuery = await pool.query(`
            SELECT store_id, name, category 
            FROM stores 
            WHERE slug IS NULL OR slug = ''
        `);

        if (noSlugQuery.rows.length > 0) {
            console.log('⚠️  Stores without slugs:');
            noSlugQuery.rows.forEach(row => {
                console.log(`   - ${row.name} (ID: ${row.store_id}, Category: ${row.category})`);
            });
            console.log('');
        } else {
            console.log('✅ All stores have slugs\n');
        }

        // Check category mapping between stores and listings
        const categoryMismatchQuery = await pool.query(`
            SELECT 
                s.store_id,
                s.name as store_name,
                s.category as store_category,
                l.type as listing_type,
                COUNT(l.id) as mismatch_count
            FROM stores s
            JOIN vendors v ON s.vendor_id = v.id
            JOIN listings l ON l.user_id = v.user_id
            WHERE 
                (s.category = 'Restaurant' AND l.type != 'product') OR
                (s.category = 'E-Commerce' AND l.type != 'product') OR
                (s.category = 'Service' AND l.type != 'service') OR
                (s.category = 'Rental' AND l.type != 'rental')
            GROUP BY s.store_id, s.name, s.category, l.type
            ORDER BY s.category, s.name
        `);

        if (categoryMismatchQuery.rows.length > 0) {
            console.log('⚠️  Category Mismatches Found:');
            categoryMismatchQuery.rows.forEach(row => {
                console.log(`   - Store: ${row.store_name} (${row.store_category})`);
                console.log(`     Has ${row.mismatch_count} listings of type: ${row.listing_type}`);
            });
            console.log('');
        } else {
            console.log('✅ All store-listing category mappings are correct\n');
        }

        // Show summary by category
        const summaryQuery = await pool.query(`
            SELECT 
                s.category as store_category,
                l.type as listing_type,
                COUNT(*) as count
            FROM stores s
            JOIN vendors v ON s.vendor_id = v.id
            JOIN listings l ON l.user_id = v.user_id
            GROUP BY s.category, l.type
            ORDER BY s.category, l.type
        `);

        console.log('📊 Category Distribution Summary:');
        summaryQuery.rows.forEach(row => {
            console.log(`   ${row.store_category} stores → ${row.listing_type} listings: ${row.count}`);
        });
        console.log('');

        // Stores without any listings
        const noListingsQuery = await pool.query(`
            SELECT s.store_id, s.name, s.category
            FROM stores s
            JOIN vendors v ON s.vendor_id = v.id
            LEFT JOIN listings l ON l.user_id = v.user_id
            WHERE l.id IS NULL
        `);

        if (noListingsQuery.rows.length > 0) {
            console.log('⚠️  Stores without any listings:');
            noListingsQuery.rows.forEach(row => {
                console.log(`   - ${row.name} (${row.category})`);
            });
        } else {
            console.log('✅ All stores have at least one listing');
        }

    } catch (error) {
        console.error('❌ Error during audit:', error);
    } finally {
        await pool.end();
    }
}

auditCategoryIntegrity();
