const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function deploy() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Reassign Wellness Hub (ID 6) to User 2
        await client.query('UPDATE stores SET vendor_id = 2 WHERE store_id = 6');
        await client.query('UPDATE listings SET creator_id = 2 WHERE store_id = 6');

        // 1b. CLEANUP Wellness Hub (ID 6)
        // Delete non-wellness sections and items for listing 33
        await client.query('DELETE FROM menu_sections WHERE listing_id = 33 AND section_name NOT ILIKE \'%Wellness%\'');

        // Update Wellness Hub description
        await client.query(`
            UPDATE stores 
            SET name = 'Island Wellness Hub', 
                description = 'The premier destination for restorative care and physical excellence in the islands.'
            WHERE store_id = 6
        `);

        // 2. CREATE NEVIS TRADE HUB
        const tradeStoreRes = await client.query(`
            INSERT INTO stores (vendor_id, name, slug, category, description, status, subscription_type)
            VALUES (2, 'Nevis Trade Pro', 'nevis-trade-pro', 'Service', 'Reliable plumbing, electrical, and construction services for island homes.', 'active', 'premium')
            RETURNING store_id
        `);
        const tradeStoreId = tradeStoreRes.rows[0].store_id;

        const tradeListingRes = await client.query(`
            INSERT INTO listings (store_id, creator_id, title, description, price, category, status, type)
            VALUES ($1, 2, 'Trade Professional Hub', 'Expert trades for Nevis and St. Kitts residents.', 0, 'Service', 'active', 'service')
            RETURNING id
        `, [tradeStoreId]);
        const tradeListingId = tradeListingRes.rows[0].id;

        // Populate Trade Hub
        const plumbingSectionRes = await client.query('INSERT INTO menu_sections (listing_id, section_name, priority) VALUES ($1, \'Plumbing & Water\', 1) RETURNING section_id', [tradeListingId]);
        const electricalSectionRes = await client.query('INSERT INTO menu_sections (listing_id, section_name, priority) VALUES ($1, \'Electrical Solutions\', 2) RETURNING section_id', [tradeListingId]);

        await client.query(`
            INSERT INTO menu_items (section_id, listing_id, item_name, description, price, duration, availability)
            VALUES 
            ($1, $2, 'Leak Repair', 'Fixing burst pipes, faucets, and toilets.', 120, '1-2 Hours', '{"slots": ["09:00","11:00","14:00"]}'),
            ($1, $2, 'Clogged Drain Clearing', 'Professional snaking and clearing of blockage.', 85, '1 Hour', '{"slots": ["10:00","13:00","15:00"]}'),
            ($3, $2, 'Circuit Fault Finding', 'Diagnosing electrical issues and tripping breakers.', 150, '2 Hours', '{"slots": ["09:00","14:00"]}'),
            ($3, $2, 'AC Unit Maintenance', 'Full cleaning and gas check for split units.', 200, '1.5 Hours', '{"slots": ["08:30","10:30","13:30"]}')
        `, [plumbingSectionRes.rows[0].section_id, tradeListingId, electricalSectionRes.rows[0].section_id]);

        // 3. CREATE ST. KITTS CREATIVE STUDIO
        const creativeStoreRes = await client.query(`
            INSERT INTO stores (vendor_id, name, slug, category, description, status, subscription_type)
            VALUES (2, 'Island Creative Studio', 'island-creative-studio', 'Service', 'Professional photography, branding, and digital design for island entrepreneurs.', 'active', 'premium')
            RETURNING store_id
        `);
        const creativeStoreId = creativeStoreRes.rows[0].store_id;

        const creativeListingRes = await client.query(`
            INSERT INTO listings (store_id, creator_id, title, description, price, category, status, type)
            VALUES ($1, 2, 'Creative Professional Hub', 'State of the art creative services for your brand.', 0, 'Service', 'active', 'service')
            RETURNING id
        `, [creativeStoreId]);
        const creativeListingId = creativeListingRes.rows[0].id;

        // Populate Creative Hub
        const photoSectionRes = await client.query('INSERT INTO menu_sections (listing_id, section_name, priority) VALUES ($1, \'Photography\', 1) RETURNING section_id', [creativeListingId]);
        const brandingSectionRes = await client.query('INSERT INTO menu_sections (listing_id, section_name, priority) VALUES ($1, \'Brand Design\', 2) RETURNING section_id', [creativeListingId]);

        await client.query(`
            INSERT INTO menu_items (section_id, listing_id, item_name, description, price, duration, availability)
            VALUES 
            ($1, $2, 'Real Estate Shoot', 'Professional exterior and interior photography (20 photos).', 350, '2 Hours', '{"slots": ["10:00","14:00"]}'),
            ($1, $2, 'Portrait Session', 'High-end studio or lifestyle portraits.', 150, '45 Mins', '{"slots": ["09:00","11:00","13:00","15:00"]}'),
            ($3, $2, 'Logo Design Package', '3 unique concepts with full brand guidelines.', 600, '5 Working Days', '{}'),
            ($3, $2, 'Social Media Kit', 'Styled templates for Instagram and Facebook.', 250, '3 Working Days', '{}')
        `, [photoSectionRes.rows[0].section_id, creativeListingId, brandingSectionRes.rows[0].section_id]);

        await client.query('COMMIT');
        console.log('Professional Deployment Successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Deployment failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

deploy();
