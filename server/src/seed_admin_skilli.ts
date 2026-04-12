import { pool } from './config/db';
import bcrypt from 'bcryptjs';

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const runSeeding = async () => {
    try {
        const adminEmail1 = 'skilli211ben@gmail.com';
        const adminEmail2 = 'skilli211beng@gmail.com';

        console.log('Searching for admin user...');
        let userRes = await pool.query('SELECT user_id FROM users WHERE email IN ($1, $2)', [adminEmail1, adminEmail2]);

        let userId: number;

        if (userRes.rows.length === 0) {
            console.log('Admin user not found, creating skilli211ben@gmail.com...');
            const passwordHash = await bcrypt.hash('password123', 10);
            const newUserRes = await pool.query(
                'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) RETURNING user_id',
                ['Admin Skilli', adminEmail1, passwordHash, 'admin']
            );
            userId = newUserRes.rows[0].user_id;
        } else {
            userId = userRes.rows[0].user_id;
            console.log(`Found admin user ID: ${userId}`);
            // Ensure role is admin
            await pool.query("UPDATE users SET role = 'admin' WHERE user_id = $1", [userId]);
        }

        // Ensure vendor profile exists for the owner
        const vendorCheck = await pool.query('SELECT id FROM vendors WHERE user_id = $1', [userId]);
        let vendorPrimaryId: number;
        if (vendorCheck.rows.length === 0) {
            const vRes = await pool.query(
                "INSERT INTO vendors (user_id, business_name, slug, bio, kyc_status) VALUES ($1, 'Admin Skilli Ventures', 'admin-skilli', 'Main hub for admin owned stores', 'verified') RETURNING id",
                [userId]
            );
            vendorPrimaryId = vRes.rows[0].id;
        } else {
            vendorPrimaryId = vendorCheck.rows[0].id;
        }

        console.log('Seeding stores and listings...');

        const storesData = [
            {
                name: 'IslandHub Lifestyle',
                category: 'Retail',
                subtype: 'boutique',
                description: 'Premium island apparel and smart technology gadgets.',
                listings: [
                    { type: 'product', title: 'IslandHub Signature Tee', price: 25.00, images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800'] },
                    { type: 'product', title: 'Pro-Audio Wireless Earbuds', price: 89.99, images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800'] }
                ]
            },
            {
                name: 'Ital Fresh Island Kitchen',
                category: 'Food',
                subtype: 'restaurant',
                description: 'Authentic vegan ital meals prepared with locally grown ingredients.',
                listings: [
                    { type: 'product', title: 'Ultimate Ital Platter', price: 15.00, images: ['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800'] }
                ]
            },
            {
                name: 'ProWash & Landscaping',
                category: 'Service',
                subtype: 'professional',
                description: 'Keeping your island properties pristine with professional washing and landscaping.',
                listings: [
                    { type: 'service', title: 'Full House Exterior Powerwash', price: 250.00, images: ['https://images.unsplash.com/photo-1523413363574-c3c444a1183e?w=800'] },
                    { type: 'service', title: 'Garden & Lawn Maintenance (Monthly)', price: 150.00, images: ['https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=800'] }
                ]
            },
            {
                name: '211 Vehicular Rentals',
                category: 'Rental',
                subtype: 'vehicle',
                description: 'Reliable car and bike rentals for exploring the islands.',
                listings: [
                    { type: 'rental', title: 'Modern SUV Explorer', price: 65.00, rental_category: 'vehicle', rental_subtype: 'suv', images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800'] },
                    { type: 'rental', title: 'Mountain Trail Bike', price: 25.00, rental_category: 'vehicle', rental_subtype: 'bike', images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'] }
                ]
            },
            {
                name: '211 Sea Rentals',
                category: 'Rental',
                subtype: 'vehicle',
                description: 'The ultimate sea experience with premium boats and jetskis.',
                listings: [
                    { type: 'rental', title: 'Speedy Coastal Yacht', price: 450.00, rental_category: 'vehicle', rental_subtype: 'boat', images: ['https://images.unsplash.com/photo-1567899378494-47b22a2bb96a?w=800'] },
                    { type: 'rental', title: 'High-Performance Jetski', price: 120.00, rental_category: 'vehicle', rental_subtype: 'jet_ski', images: ['https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800'] }
                ]
            },
            {
                name: 'Skilli Stays & Studios',
                category: 'Rental',
                subtype: 'housing',
                description: 'Luxury apartments and creative studio spaces.',
                listings: [
                    { type: 'rental', title: 'Sunset View Luxury Apartment', price: 180.00, rental_category: 'housing', rental_subtype: 'apartment', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'] },
                    { type: 'rental', title: 'Creative Audio Recording Studio', price: 75.00, rental_category: 'housing', rental_subtype: 'studio', images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'] }
                ]
            },
            {
                name: 'Elite Equipment Rentals',
                category: 'Rental',
                subtype: 'special',
                description: 'Professional tools and equipment for any project.',
                listings: [
                    { type: 'rental', title: 'Industrial Generator 5000W', price: 50.00, rental_category: 'special', rental_subtype: 'equipment', images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800'] },
                    { type: 'rental', title: 'Heavy Duty Rotary Drill', price: 20.00, rental_category: 'special', rental_subtype: 'tools', images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800'] }
                ]
            },
            {
                name: 'KanTours',
                category: 'Service',
                subtype: 'professional',
                description: 'Island tours and historical excursions.',
                listings: [
                    { type: 'service', title: 'Brimstone Hill Heritage Day Tour', price: 85.00, images: ['https://images.unsplash.com/photo-1589182337358-2cb634949d0b?w=800'] }
                ]
            },
            {
                name: 'IslandHub',
                category: 'Service',
                subtype: 'professional',
                description: 'IslandHub logistics, taxi, and delivery services.',
                listings: [
                    { type: 'service', title: 'IslandHub Taxi Service', price: 25.00, images: ['https://images.unsplash.com/photo-1549490349-8643362247b5?w=800'] },
                    { type: 'service', title: 'Logistics Pickup & Delivery', price: 10.00, images: ['https://images.unsplash.com/photo-1586864387917-f58a4b29fd1b?w=800'] }
                ]
            }
        ];

        for (const store of storesData) {
            const slug = generateSlug(store.name);
            const storeRes = await pool.query(
                'INSERT INTO stores (vendor_id, name, slug, description, category, subtype, status) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO UPDATE SET vendor_id = EXCLUDED.vendor_id RETURNING store_id',
                [userId, store.name, slug, store.description, store.category, store.subtype, 'active']
            );

            const storeId = storeRes.rows[0].store_id;

            for (const listing of store.listings) {
                const lRes = await pool.query(
                    'INSERT INTO listings (type, title, description, price, creator_id, store_id, category, status, featured, images, metadata, rental_category, rental_subtype) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id',
                    [
                        listing.type, listing.title, store.description, listing.price,
                        userId, storeId, store.category, 'active', true,
                        listing.images || [],
                        JSON.stringify({}),
                        (listing as any).rental_category || null,
                        (listing as any).rental_subtype || null
                    ]
                );

                const listingId = lRes.rows[0].id;

                // Create helper entries for rentals if needed
                if (listing.type === 'rental') {
                    await pool.query(
                        'INSERT INTO rentals (vendor_id, listing_id, rental_type, price_per_day, location) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                        [vendorPrimaryId, listingId, (listing as any).rental_subtype || 'other', listing.price, 'St. Kitts']
                    );
                }
            }
        }

        // --- 🚀 STARTUP CAMPAIGN ---
        console.log('Seeding startup campaign...');
        const campaignTitle = 'IslandHub Future Startup';
        const campaignRes = await pool.query(
            'INSERT INTO campaigns (user_id, title, description, category, goal_amount, current_amount, status, verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING RETURNING campaign_id',
            [userId, campaignTitle, 'Support the next generation of Caribbean commerce and technology.', 'startup', 50000, 12500, 'active', true]
        );

        await pool.query(
            'INSERT INTO listings (type, title, description, goal_amount, current_amount, creator_id, category, status, featured, images, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
            ['campaign', campaignTitle, 'Support the next generation of Caribbean commerce and technology.', 50000, 12500, userId, 'Campaign', 'active', true, ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800'], JSON.stringify({})]
        );

        console.log('Seeding admin stores and listings completed successfully! 🏝️');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        process.exit();
    }
};

runSeeding();
