const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function seedMenus() {
    try {
        // 1. Get Ital Store
        const italRes = await pool.query("SELECT store_id, vendor_id FROM stores WHERE name ILIKE '%Ital%'");
        if (italRes.rows.length > 0) {
            const italStoreId = italRes.rows[0].store_id;
            console.log(`Seeding Ital Menu (Store ID: ${italStoreId})`);

            // Clear old menu if any
            await pool.query("DELETE FROM menu_sections WHERE store_id = $1", [italStoreId]);

            // Add Sections
            const breakfast = await pool.query("INSERT INTO menu_sections (store_id, name, priority) VALUES ($1, 'Breakfast', 0) RETURNING id", [italStoreId]);
            const lunch = await pool.query("INSERT INTO menu_sections (store_id, name, priority) VALUES ($1, 'Lunch', 1) RETURNING id", [italStoreId]);
            const drinks = await pool.query("INSERT INTO menu_sections (store_id, name, priority) VALUES ($1, 'Coolers & Drinks', 2) RETURNING id", [italStoreId]);

            // Add Items for Breakfast
            await pool.query(
                `INSERT INTO menu_items (section_id, name, description, price, image_url, badges) 
                 VALUES ($1, 'Ital Porridge', 'Plant-based porridge with coconut milk and spices.', 8.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800', '["Vegan", "Gluten-Free"]')`,
                [breakfast.rows[0].id]
            );

            // Add Items for Lunch (Linking to existing listings if possible)
            // I'll just add new menu items for simplicity in this seed
            await pool.query(
                `INSERT INTO menu_items (section_id, name, description, price, image_url, badges) 
                 VALUES ($1, 'Ital Vital Stew', 'Hearty chunky root vegetables in a slow-simmered broth.', 18.00, 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800', '["Vegan", "Signature"]')`,
                [lunch.rows[0].id]
            );
        }

        // 2. Create Soup Kitchen
        console.log('Creating Soup Kitchen...');
        // Find a vendor user or create one
        const vendorRes = await pool.query("SELECT user_id FROM users WHERE role = 'vendor' LIMIT 1");
        const vendorUserId = vendorRes.rows[0].user_id;

        const soupSlug = 'soup-kitchen';
        await pool.query("DELETE FROM stores WHERE slug = $1", [soupSlug]);
        const soupStore = await pool.query(
            `INSERT INTO stores (vendor_id, name, category, subtype, description, status, slug) 
             VALUES ($1, 'Soup Kitchen', 'Food', 'community_kitchen', 'Nourishing the community with love and warmth.', 'active', $2) 
             RETURNING store_id`,
            [vendorUserId, soupSlug]
        );
        const soupStoreId = soupStore.rows[0].store_id;

        // Add Soup Kitchen Menu
        const soupSection = await pool.query("INSERT INTO menu_sections (store_id, name, priority) VALUES ($1, 'Daily Soups', 0) RETURNING id", [soupStoreId]);

        await pool.query(
            `INSERT INTO menu_items (section_id, name, description, price, donation_suggested, image_url) 
             VALUES ($1, 'Lentil Comfort', 'Rich, protein-packed lentil soup with garden herbs.', 5.00, true, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800')`,
            [soupSection.rows[0].id]
        );

        await pool.query(
            `INSERT INTO menu_items (section_id, name, description, price, donation_suggested, image_url) 
             VALUES ($1, 'Pumpkin Glow', 'Pureed roasted pumpkin with Caribbean ginger.', 5.00, true, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=800')`,
            [soupSection.rows[0].id]
        );

        console.log('Menu seeding completed successfully! 🌿');

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

seedMenus();
