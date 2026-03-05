import { pool } from './config/db';
import bcrypt from 'bcryptjs';

const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

const seedMarketplace = async () => {
    try {
        const passwordHash = await bcrypt.hash('password123', 10);

        console.log('Seeding categories...');
        const categories = [
            { name: 'Food', description: 'Restaurants, kitchens, and food spots' },
            { name: 'Retail', description: 'Apparel, electronics, and goods' },
            { name: 'Service', description: 'Repairs, landscaping, and more' },
            { name: 'Campaign', description: 'Donations and fundraisers' },
            { name: 'Rental', description: 'Cars, bikes, boats, and studios' }
        ];

        for (const cat of categories) {
            await pool.query(
                'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                [cat.name, cat.description]
            );
        }

        console.log('Seeding entities...');

        // --- 🍔 RESTAURANTS ---
        const italSlug = generateSlug('Ital Vegan Kitchen');
        const italUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING user_id',
            ['Ital Owner', 'ital@example.com', passwordHash, 'vendor']
        );
        const italVendor = await pool.query(
            'INSERT INTO vendors (user_id, business_name, sub_type, bio, kyc_status, location, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING id',
            [italUser.rows[0].user_id, 'Ital Vegan Kitchen', 'food', 'Healthy organic plant-based meals.', 'verified', 'St. Kitts', italSlug]
        );
        const italStore = await pool.query(
            'INSERT INTO stores (vendor_id, name, category, subtype, description, status, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING store_id',
            [italUser.rows[0].user_id, 'Ital Vegan Kitchen', 'Food', 'restaurant', 'Healthy organic plant-based meals.', 'active', italSlug]
        );

        const italMetadata = {
            menu_sections: [
                {
                    section_name: 'Main Courses',
                    items: [
                        { name: 'Ital Stew', price: 18, description: 'Hearty root vegetable stew with coconut milk.' },
                        { name: 'Plantain Burger', price: 15, description: 'Savory lentil patty on a fried plantain bun.' }
                    ]
                }
            ],
            badges: ['Vegan', 'Organic']
        };

        if (italStore.rows.length > 0) {
            await pool.query(
                'INSERT INTO listings (type, title, description, price, creator_id, store_id, category, status, featured, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING',
                ['product', 'Ital Sampler Box', 'Complete organic experience delivered.', 45.00, italUser.rows[0].user_id, italStore.rows[0].store_id, 'Food', 'active', true, JSON.stringify(italMetadata)]
            );
        }

        // --- 🚤 RENTALS ---
        const boatSlug = generateSlug('Reef Runner Boat Rentals');
        const boatUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING user_id',
            ['Boat Captain', 'captain@example.com', passwordHash, 'vendor']
        );
        const boatVendor = await pool.query(
            'INSERT INTO vendors (user_id, business_name, sub_type, bio, kyc_status, location, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING id',
            [boatUser.rows[0].user_id, 'Reef Runner Boat Rentals', 'rental', 'The best boat tours on the island.', 'verified', 'Frigate Bay', boatSlug]
        );
        const boatStore = await pool.query(
            'INSERT INTO stores (vendor_id, name, category, subtype, description, status, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING store_id',
            [boatUser.rows[0].user_id, 'Reef Runner Boat Rentals', 'Rental', 'boat_rental', 'Explore the hidden gems of our coastline.', 'active', boatSlug]
        );

        const boatMetadata = {
            capacity: '12 Guests',
            features: ['Captain Included', 'Sound System', 'Snorkel Gear'],
            pricing_tiers: [
                { label: 'Half Day (4h)', price: 400 },
                { label: 'Full Day (8h)', price: 750 }
            ],
            rental_type: 'Boat'
        };

        if (boatStore.rows.length > 0) {
            const boatListing = await pool.query(
                'INSERT INTO listings (type, title, description, price, creator_id, store_id, category, status, featured, metadata, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING RETURNING id',
                ['rental', '45ft Custom Yacht', 'Luxury coastal explorer for private groups.', 400.00, boatUser.rows[0].user_id, boatStore.rows[0].store_id, 'Rental', 'active', true, JSON.stringify(boatMetadata), ['https://images.unsplash.com/photo-1567899378494-47b22a2bb96a?auto=format&fit=crop&q=80&w=800']]
            );

            if (boatListing.rows.length > 0 && boatVendor.rows.length > 0) {
                await pool.query(
                    'INSERT INTO rentals (vendor_id, listing_id, rental_type, price_per_day, location) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                    [boatVendor.rows[0].id, boatListing.rows[0].id, 'boat', 400.00, 'Frigate Bay']
                );
            }
        }


        // --- 🏠 PROPERTY RENTALS ---
        const staySlug = generateSlug('Caribbean Heights Apartment');
        const stayUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING user_id',
            ['Property Owner', 'owner@example.com', passwordHash, 'vendor']
        );
        const stayVendor = await pool.query(
            'INSERT INTO vendors (user_id, business_name, sub_type, bio, kyc_status, location, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING id',
            [stayUser.rows[0].user_id, 'Island Stays', 'rental', 'Curated premium stays.', 'verified', 'Frigate Bay', staySlug]
        );
        const stayStore = await pool.query(
            'INSERT INTO stores (vendor_id, name, category, subtype, description, status, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING store_id',
            [stayUser.rows[0].user_id, 'Caribbean Heights Apartment', 'Rental', 'accommodation', 'Breathtaking ocean views.', 'active', staySlug]
        );

        const stayMetadata = {
            property_type: 'Apartment',
            rooms: 2,
            beds: 3,
            amenities: ['Wi-Fi', 'Pool Access', 'AC', 'Full Kitchen'],
            inclusions: ['Airport Pickup']
        };

        if (stayStore.rows.length > 0) {
            const stayListing = await pool.query(
                'INSERT INTO listings (type, title, description, price, creator_id, store_id, category, status, featured, metadata, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING RETURNING id',
                ['rental', 'Oceanview 2BR Apartment', 'Modern hilltop living with sunset terraces.', 180.00, stayUser.rows[0].user_id, stayStore.rows[0].store_id, 'Rental', 'active', true, JSON.stringify(stayMetadata), ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800']]
            );

            if (stayListing.rows.length > 0 && stayVendor.rows.length > 0) {
                await pool.query(
                    'INSERT INTO rentals (vendor_id, listing_id, rental_type, price_per_day, location) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
                    [stayVendor.rows[0].id, stayListing.rows[0].id, 'apartment', 180.00, 'Frigate Bay']
                );
            }
        }


        // --- 🛍️ PRODUCT STORE ---
        const appSlug = generateSlug('Pulse Island Apparel');
        const appUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING user_id',
            ['Apparel Manager', 'pulse@example.com', passwordHash, 'vendor']
        );
        const appVendor = await pool.query(
            'INSERT INTO vendors (user_id, business_name, sub_type, bio, kyc_status, location, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING id',
            [appUser.rows[0].user_id, 'Pulse Island Apparel', 'retail', 'Wear the rhythm of the waves.', 'verified', 'Basseterre', appSlug]
        );
        const appStore = await pool.query(
            'INSERT INTO stores (vendor_id, name, category, subtype, description, status, slug) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (slug) DO NOTHING RETURNING store_id',
            [appUser.rows[0].user_id, 'Pulse Island Apparel', 'Retail', 'store', 'Modern streetwear with island soul.', 'active', appSlug]
        );

        const shirtMetadata = {
            variants: [
                { name: 'Size', values: ['S', 'M', 'L', 'XL'] },
                { name: 'Color', values: ['Jet Black', 'Sea Mist', 'Coral'] }
            ]
        };

        if (appStore.rows.length > 0) {
            await pool.query(
                'INSERT INTO listings (type, title, description, price, creator_id, store_id, category, status, featured, metadata, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT DO NOTHING',
                ['product', 'Island Pulse Tee', '100% Cotton, locally screen-printed.', 35.00, appUser.rows[0].user_id, appStore.rows[0].store_id, 'Retail', 'active', true, JSON.stringify(shirtMetadata), ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=800']]
            );
        }


        // --- ❤️ CAMPAIGN ---
        const cancerUser = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role RETURNING user_id',
            ['Skits Cancer Fund', 'charity@example.com', passwordHash, 'creator']
        );

        const campaignMetadata = {
            updates: [
                { date: '2026-01-20', title: 'Phase 1 Complete', content: 'We have raised enough for the first 5 treatment plans!' }
            ],
            deadline: '2026-06-30'
        };

        const existingCampaign = await pool.query('SELECT campaign_id FROM campaigns WHERE title = $1', ['Community Cancer Support']);
        if (existingCampaign.rows.length === 0) {
            await pool.query(
                'INSERT INTO campaigns (user_id, title, description, category, goal_amount, current_amount, status, verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                [cancerUser.rows[0].user_id, 'Community Cancer Support', 'Help us provide medical care and support to islanders in need.', 'community', 100000, 32400, 'active', true]
            );
        }

        const existingListing = await pool.query('SELECT id FROM listings WHERE title = $1 AND type = $2', ['Community Cancer Support', 'campaign']);
        if (existingListing.rows.length === 0) {
            await pool.query(
                'INSERT INTO listings (type, title, description, goal_amount, current_amount, creator_id, category, status, featured, metadata, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                ['campaign', 'Community Cancer Support', 'Help us provide medical care and support to islanders in need.', 100000, 32400, cancerUser.rows[0].user_id, 'Campaign', 'active', true, JSON.stringify(campaignMetadata), ['https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800']]
            );
        }

        // --- 📢 PROMOTIONS & BANNERS ---
        console.log('Seeding promotions...');

        // Floating Urgent Banner
        const existingFloating = await pool.query('SELECT banner_id FROM promotional_banners WHERE title = $1', ['Limited Time Offer']);
        if (existingFloating.rows.length === 0) {
            await pool.query(
                `INSERT INTO promotional_banners (title, subtitle, location, color_theme, mobile_mode, template_type, icon, target_url, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['Limited Time Offer', 'Get 20% off all Reef Runner boat rentals this weekend!', 'marketplace_floating', 'rose', 'floating', 'urgency', '⏰', '/rentals', true]
            );
        }

        // Community Support Banner
        const existingHero = await pool.query('SELECT banner_id FROM promotional_banners WHERE title = $1', ['Community First']);
        if (existingHero.rows.length === 0) {
            await pool.query(
                `INSERT INTO promotional_banners (title, subtitle, location, color_theme, mobile_mode, template_type, icon, target_url, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['Community First', 'Support local island startups and craftsmen.', 'home_hero', 'indigo', 'standard', 'community', '🏝', '/community', true]
            );
        }

        // Food Promotion
        const existingFood = await pool.query('SELECT banner_id FROM promotional_banners WHERE title = $1', ['Fresh Catch Friday']);
        if (existingFood.rows.length === 0) {
            await pool.query(
                `INSERT INTO promotional_banners (title, subtitle, location, color_theme, mobile_mode, template_type, icon, target_url, is_active) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['Fresh Catch Friday', 'New seafood platters at Ital Vegan Kitchen!', 'community_hero', 'amber', 'standard', 'promotion', '🥗', '/store/ital-vegan-kitchen', true]
            );
        }

        // Mobile Marquee
        const existingMarquee = await pool.query('SELECT marquee_id FROM text_marquee WHERE message = $1', ['New Apartment Stays added in Frigate Bay! Book your weekend getaway now.']);
        if (existingMarquee.rows.length === 0) {
            await pool.query(
                `INSERT INTO text_marquee (message, priority, is_active, template_type, icon) 
                 VALUES ($1, $2, true, $3, $4)`,
                ['New Apartment Stays added in Frigate Bay! Book your weekend getaway now.', 10, 'standard', '🏠']
            );
        }

        console.log('Seeding completed successfully! 🌴');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        process.exit();
    }
};

seedMarketplace();
