
import { pool } from './src/config/db';

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Clearing existing stores and updating listings...');
        await client.query('UPDATE listings SET store_id = NULL');
        await client.query('DELETE FROM stores');

        // Get some user IDs to act as vendors
        const usersRes = await client.query("SELECT user_id, email FROM users WHERE role IN ('admin', 'creator', 'vendor') LIMIT 5");
        const users = usersRes.rows;

        if (users.length < 1) {
            console.error('No suitable users found to assign stores to.');
            return;
        }

        const adminUser = users.find(u => u.email === 'skilli211beng@gmail.com') || users[0];
        const otherUser = users.find(u => u.user_id !== adminUser.user_id) || adminUser;

        const storeData = [
            // RESTAURANTS
            { name: 'Island Flavors Central', category: 'Restaurant', subtype: 'Caribbean', vendor_id: adminUser.user_id, sub: 'pro' },
            { name: 'Island Flavors Beachside', category: 'Restaurant', subtype: 'Seafood', vendor_id: adminUser.user_id, sub: 'pro' },
            { name: 'Spicy Cove Kitchen', category: 'Restaurant', subtype: 'Grill', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'The Juice Hut', category: 'Restaurant', subtype: 'Beverages', vendor_id: otherUser.user_id, sub: 'basic' },

            // E-COMMERCE
            { name: 'Tech Reef Electronics', category: 'E-Commerce', subtype: 'Electronics', vendor_id: adminUser.user_id, sub: 'pro' },
            { name: 'Green Valley Produce', category: 'E-Commerce', subtype: 'Farm Produce', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Harbor Threads Apparel', category: 'E-Commerce', subtype: 'Apparel', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Island Loft Furniture', category: 'E-Commerce', subtype: 'Furniture', vendor_id: adminUser.user_id, sub: 'pro' },

            // RENTALS
            { name: 'Sunset Palms Villas', category: 'Rental', subtype: 'Housing', vendor_id: adminUser.user_id, sub: 'pro' },
            { name: 'Ocean View Studios', category: 'Rental', subtype: 'Housing', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Island Wheels Car Rental', category: 'Rental', subtype: 'Vehicles', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Adventure ATV & Scooter', category: 'Rental', subtype: 'Vehicles', vendor_id: adminUser.user_id, sub: 'pro' },

            // SERVICES
            { name: 'Sparkle Island Cleaning', category: 'Service', subtype: 'Cleaning', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Master Mend Repair', category: 'Service', subtype: 'Repair', vendor_id: otherUser.user_id, sub: 'basic' },
            { name: 'Blue Horizon Consulting', category: 'Service', subtype: 'Consultant', vendor_id: adminUser.user_id, sub: 'pro' },
            { name: 'Cloud Coast Remote Services', category: 'Service', subtype: 'Remote', vendor_id: adminUser.user_id, sub: 'pro' }
        ];

        console.log(`Seeding ${storeData.length} stores...`);
        for (const s of storeData) {
            const slug = s.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            const res = await client.query(
                `INSERT INTO stores (name, category, subtype, vendor_id, subscription_type, slug, description)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING store_id`,
                [s.name, s.category, s.subtype, s.vendor_id, s.sub, slug, `Leading ${s.subtype} provider in the ${s.category} space.`]
            );
            const storeId = res.rows[0].store_id;

            // Seed some listings for this store
            const listingsToCreate = 3;
            for (let i = 1; i <= listingsToCreate; i++) {
                let type = 'product'; // Default for Restaurant and E-Commerce
                if (s.category === 'Rental') type = 'rental';
                if (s.category === 'Service') type = 'service';

                const title = `${s.name} ${s.category === 'Restaurant' ? 'Dish' : 'Item'} ${i}`;
                const price = (Math.random() * 500) + 10;

                await client.query(
                    `INSERT INTO listings (type, title, description, price, category, creator_id, store_id, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')`,
                    [type, title, `High quality ${s.subtype} listing from ${s.name}.`, price, s.subtype, s.vendor_id, storeId]
                );
            }
        }

        await client.query('COMMIT');
        console.log('Seeding successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
