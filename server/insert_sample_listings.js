const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const listings = [
    {
        type: 'product',
        title: 'Sunset Beach Grill',
        description: 'Fresh local seafood and tropical drinks right on the sand. Famous for our grilled snapper and passion fruit mojitos.',
        price: 45,
        category: 'food',
        creator_id: 6,
        verified: true,
        featured: true,
        metadata: {
            cuisine: 'Seafood',
            location: 'Sunset Beach',
            rating: 4.8,
            image: '/listings/food-1.jpg',
            inventory_count: 99,
            category_type: 'restaurant'
        }
    },
    {
        type: 'product',
        title: 'Handcrafted Shell Necklace',
        description: 'Unique island jewelry made from locally sourced seashells and sea glass. Every piece is one-of-a-kind.',
        price: 25,
        category: 'crafts',
        creator_id: 6,
        verified: true,
        featured: true,
        metadata: {
            material: 'Shells',
            artisan: 'Dana Seller',
            inventory_count: 15,
            category_type: 'jewelry',
            image: '/listings/product-1.jpg'
        }
    },
    {
        type: 'service',
        title: 'Island Sunset Tour',
        description: 'Experience the beauty of the island at golden hour. 2-hour guided boat tour with snacks and local history.',
        price: 120,
        category: 'tours',
        creator_id: 6,
        verified: true,
        featured: true,
        metadata: {
            duration: '2 hours',
            capacity: 10,
            available_days: ['Mon', 'Wed', 'Fri', 'Sat'],
            image: '/listings/tour-1.jpg'
        }
    }
];

async function insertData() {
    try {
        for (const l of listings) {
            await pool.query(
                'INSERT INTO listings (type, title, description, price, category, creator_id, verified, featured, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [l.type, l.title, l.description, l.price, l.category, l.creator_id, l.verified, l.featured, JSON.stringify(l.metadata)]
            );
        }
        console.log('✅ Sample listings inserted!');
    } catch (err) {
        console.error('❌ Error inserting data:', err);
    } finally {
        await pool.end();
    }
}

insertData();
