const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function populateItalStore() {
    try {
        // 1. Get Store ID and Vendor ID
        const storeRes = await pool.query("SELECT store_id, vendor_id, slug FROM stores WHERE name ILIKE '%Ital%'");
        if (storeRes.rows.length === 0) {
            console.log("Ital Store not found");
            return;
        }
        const { store_id, vendor_id, slug } = storeRes.rows[0];
        console.log(`Found store: ${slug} (ID: ${store_id}, Vendor: ${vendor_id})`);

        // 2. Clear existing listings for this store to avoid duplicates if re-running
        await pool.query("DELETE FROM listings WHERE store_id = $1", [store_id]);

        // 3. Define the items
        const items = [
            // FOOD (2 items)
            {
                type: 'product',
                title: 'Ital Vital Stew',
                price: 18,
                category: 'Main Courses',
                description: 'Hearty chunky root vegetables in a slow-simmered coconut and turmeric broth.',
                image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800'
            },
            {
                type: 'product',
                title: 'Roasted Breadfruit Bowl',
                price: 22,
                category: 'Main Courses',
                description: 'Fire-roasted breadfruit served with callsloo, avocado, and spicy mango chutney.',
                image_url: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800'
            },
            // ADDONS (2 items)
            {
                type: 'product',
                title: 'Fried Plantains',
                price: 5,
                category: 'Add-ons',
                description: 'Sweet, caramelised local plantain slices.',
                image_url: 'https://images.unsplash.com/photo-1621263765133-7288ee88e14e?auto=format&fit=crop&q=80&w=800'
            },
            {
                type: 'product',
                title: 'Avocado Mash',
                price: 4,
                category: 'Add-ons',
                description: 'Freshly crushed organic avocado with lime and sea salt.',
                image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800'
            },
            // DRINKS (2 items)
            {
                type: 'product',
                title: 'Soursop Bliss Juice',
                price: 8,
                category: 'Coolers & Drinks',
                description: 'Freshly pressed soursop with a hint of nutmeg and brown sugar.',
                image_url: 'https://images.unsplash.com/photo-1623067939682-1d5f840994f1?auto=format&fit=crop&q=80&w=800'
            },
            {
                type: 'product',
                title: 'Iced Hibiscus Tea',
                price: 6,
                category: 'Coolers & Drinks',
                description: 'Refreshing local sorrel tea infused with ginger and cinnamon.',
                image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800'
            }
        ];

        // 4. Insert items
        for (const item of items) {
            await pool.query(
                `INSERT INTO listings (type, title, description, price, category, creator_id, store_id, status, images)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)`,
                [item.type, item.title, item.description, item.price, item.category, vendor_id, store_id, [item.image_url]]
            );
            console.log(`Inserted: ${item.title}`);
        }

        console.log("Ital Store populated successfully!");

    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

populateItalStore();
