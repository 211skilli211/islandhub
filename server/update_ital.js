const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function updateMetadata() {
    try {
        const metadata = {
            menu_sections: [
                {
                    section_name: "Main Courses",
                    items: [
                        { name: "Ital Vital Stew", price: 18, description: "Hearty chunky root vegetables in a slow-simmered coconut and turmeric broth." },
                        { name: "Roasted Breadfruit Bowl", "price": 22, "description": "Fire-roasted breadfruit served with callsloo, avocado, and spicy mango chutney." }
                    ]
                },
                {
                    section_name: "Add-ons",
                    items: [
                        { "name": "Fried Plantains", "price": 5, "description": "Sweet, caramelised local plantain slices." },
                        { "name": "Avocado Mash", "price": 4, "description": "Freshly crushed organic avocado with lime and sea salt." }
                    ]
                },
                {
                    section_name: "Coolers & Drinks",
                    items: [
                        { "name": "Soursop Bliss Juice", "price": 8, "description": "Freshly pressed soursop with a hint of nutmeg and brown sugar." },
                        { "name": "Iced Hibiscus Tea", "price": 6, "description": "Refreshing local sorrel tea infused with ginger and cinnamon." }
                    ]
                }
            ],
            badges: ["Vegan", "Organic", "Farm-to-Table"]
        };

        const res = await pool.query(
            "UPDATE listings SET metadata = $1 WHERE title ILIKE '%Ital%' RETURNING id, title",
            [JSON.stringify(metadata)]
        );

        if (res.rows.length > 0) {
            console.log(`Updated listing: ${res.rows[0].title} (ID: ${res.rows[0].id})`);
        } else {
            console.log('No listing found matching "Ital"');
        }
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

updateMetadata();
