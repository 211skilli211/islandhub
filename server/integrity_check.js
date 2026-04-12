const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: process.env.PGPASSWORD || '135246Rob',
    port: 5432,
});

const allowedTypes = {
    food: ['food', 'menu_item'],
    rental: ['rental', 'transport', 'accommodation'],
    service: ['service', 'tour'],
    product: ['product'],
    campaign: ['campaign']
};

async function checkIntegrity() {
    try {
        console.log("🔍 Starting Category Integrity Audit...");

        // Get all stores with a category
        const salesRes = await pool.query("SELECT store_id as id, vendor_id as creator_id, name as business_name, category FROM stores WHERE category IS NOT NULL");
        const vendors = salesRes.rows;

        let violations = 0;

        for (const vendor of vendors) {
            // Get listings for this vendor
            const listingsRes = await pool.query("SELECT id, title, type FROM listings WHERE creator_id = $1", [vendor.creator_id]);
            const listings = listingsRes.rows;

            const vendorCategory = vendor.category.toLowerCase();
            const allowed = allowedTypes[vendorCategory];

            if (!allowed) {
                console.warn(`⚠️ Vendor ${vendor.business_name} (ID: ${vendor.id}) has unknown category: ${vendorCategory}`);
                continue;
            }

            for (const listing of listings) {
                if (!allowed.includes(listing.type)) {
                    console.log(`❌ VIOLATION: Vendor '${vendor.business_name}' [${vendorCategory}] has listing '${listing.title}' (ID: ${listing.id}) of type '${listing.type}'`);
                    violations++;
                }
            }
        }

        console.log(`\n✅ Audit Complete. Found ${violations} violations.`);

    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkIntegrity();
