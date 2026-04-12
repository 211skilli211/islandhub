import { pool } from './config/db';

const seedRoadmap = async () => {
    try {
        console.log('Seeding roadmap data...');

        // 1. Get some real user IDs to use as references
        const usersResult = await pool.query('SELECT user_id, role FROM users LIMIT 10');
        const users = usersResult.rows;

        if (users.length < 3) {
            console.error('Not enough users in the database to seed roadmap. Please register at least 3 users first.');
            process.exit(1);
        }

        const creator1 = users.find(u => u.role === 'creator') || users[0];
        const creator2 = users.find(u => u.role === 'creator' && u.user_id !== creator1.user_id) || users[1];
        const donor1 = users.find(u => u.role === 'donor') || users[2];

        // 2. Seed Vendors
        const vendor1 = await pool.query(`
            INSERT INTO vendors (user_id, business_name, bio, slug, theme_color)
            VALUES ($1, 'Caribbean Kitchen', 'Authentic Caribbean meals delivered fresh daily.', 'caribbean-kitchen', 'rose-500')
            ON CONFLICT (slug) DO UPDATE SET business_name = EXCLUDED.business_name
            RETURNING id
        `, [creator1.user_id]);

        const vendor2 = await pool.query(`
            INSERT INTO vendors (user_id, business_name, bio, slug, theme_color)
            VALUES ($1, 'Island Electronics', 'Your trusted source for electronics and accessories.', 'island-electronics', 'amber-400')
            ON CONFLICT (slug) DO UPDATE SET business_name = EXCLUDED.business_name
            RETURNING id
        `, [creator2.user_id]);

        const v1_id = vendor1.rows[0].id;
        const v2_id = vendor2.rows[0].id;

        // 3. Seed some Listings if they don't exist (to link reviews/rentals)
        const listing1 = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('product', 'Curry Goat', 'Spicy and tender goat meat curry.', 25, 'food', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const listing_rental = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('rental', 'Beach Jeep', 'Perfect for off-road island adventures.', 85, 'transport', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const listing_jetski = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('rental', 'Power Jet Ski', 'High-speed water adventure in Frigate Bay.', 60, 'adventure', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const listing_atv = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('rental', 'Island ATV Tour', 'Off-road exploration of St. Kitts.', 40, 'adventure', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const listing_apt = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('rental', 'Sunset Beach Apartment', 'Cozy 1-bedroom with ocean view.', 120, 'stays', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const listing_tool = await pool.query(`
            INSERT INTO listings (type, title, description, price, category, creator_id, verified)
            VALUES ('rental', 'Power Drill Set', 'High-performance tools for island DIY.', 25, 'tools', $1, true)
            RETURNING id
        `, [creator1.user_id]);

        const l1_id = listing1.rows[0].id;
        const lr_id = listing_rental.rows[0].id;
        const lj_id = listing_jetski.rows[0].id;
        const la_id = listing_atv.rows[0].id;
        const lapt_id = listing_apt.rows[0].id;
        const lt_id = listing_tool.rows[0].id;

        // 4. Seed Reviews (omitted for brevity in this chunk)
        // ...

        // 6. Seed Rentals
        await pool.query(`
            INSERT INTO rentals (vendor_id, listing_id, rental_type, location, price_per_day, availability_calendar)
            VALUES ($1, $2, 'car', 'Frigate Bay', 85, '{"2026-01-21": "available", "2026-01-22": "booked"}')
        `, [v1_id, lr_id]);

        await pool.query(`
            INSERT INTO rentals (vendor_id, listing_id, rental_type, location, price_per_day, availability_calendar)
            VALUES ($1, $2, 'jetski', 'Frigate Bay', 60, '{"2026-01-23": "available", "2026-01-24": "booked"}')
        `, [v1_id, lj_id]);

        await pool.query(`
            INSERT INTO rentals (vendor_id, listing_id, rental_type, location, price_per_day, availability_calendar)
            VALUES ($1, $2, 'atv', 'Old Road', 40, '{"2026-01-23": "available", "2026-01-24": "available"}')
        `, [v1_id, la_id]);

        await pool.query(`
            INSERT INTO rentals (vendor_id, listing_id, rental_type, location, price_per_day, availability_calendar)
            VALUES ($1, $2, 'apartments', 'Frigate Bay', 120, '{"2026-01-25": "available"}')
        `, [v1_id, lapt_id]);

        await pool.query(`
            INSERT INTO rentals (vendor_id, listing_id, rental_type, location, price_per_day, availability_calendar)
            VALUES ($1, $2, 'tools', 'Basseterre', 25, '{"2026-01-25": "available"}')
        `, [v1_id, lt_id]);

        console.log('Roadmap data seeded successfully 🌴');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedRoadmap();
