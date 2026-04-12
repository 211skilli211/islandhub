import { pool } from './config/db';

async function seedMissingData() {
    console.log('Seeding missing platform data...');

    try {
        // 1. Seed Text Marquee (Broadcasts)
        console.log('Seeding Text Marquee...');
        await pool.query(`
            INSERT INTO text_marquee (message, priority, is_active, template_type, icon)
            VALUES 
            ('Welcome to IslandHub! Discover premiere local brands.', 10, true, 'standard', '🏖️'),
            ('Free shipping on all curated local bundles this weekend!', 5, true, 'alert', '🚚')
            ON CONFLICT DO NOTHING;
        `);

        // 2. Seed Promotional Banners (Hero Assets)
        console.log('Seeding Hero Assets (Promotional Banners)...');
        await pool.query(`
            INSERT INTO promotional_banners (title, subtitle, location, is_active, image_url, template_type)
            VALUES 
            ('Island Discoveries', 'Unearth the hidden gems of our creative ecosystem.', 'home_hero', true, 'file-1769965232226-73669333.jpg', 'hero_main')
            ON CONFLICT (location) WHERE is_active = true
            DO UPDATE SET image_url = EXCLUDED.image_url;
        `);

        // 3. Seed Ad Spaces (if empty)
        console.log('Seeding Ad Spaces...');
        const adSpaceCheck = await pool.query("SELECT space_id FROM ad_spaces WHERE name = 'home_top' LIMIT 1");
        if (adSpaceCheck.rows.length === 0) {
            await pool.query(`
                INSERT INTO ad_spaces (name, display_name, description, location, position, is_active)
                VALUES 
                ('home_top', 'Homepage Top Banner', 'Premium placement at the top of the homepage', 'homepage', 'top', true),
                ('home_sidebar', 'Homepage Sidebar', 'Sticky sidebar ad space', 'homepage', 'sidebar', true)
            `);
        }

        // 4. Seed Advertisements
        console.log('Seeding Advertisements...');
        const adSpaceIdRes = await pool.query("SELECT space_id FROM ad_spaces WHERE name = 'home_top' LIMIT 1");
        if (adSpaceIdRes.rows.length > 0) {
            const adSpaceId = adSpaceIdRes.rows[0].space_id;
            await pool.query(`
                INSERT INTO advertisements (
                    ad_space_id, title, description, advertiser_name, advertiser_type,
                    media_type, media_url, status, is_active, pricing_model
                )
                VALUES 
                ($1, 'Summer Island Festival', 'Get your tickets now for the biggest event of the year!', 'Island Events Co.', 'admin', 'image', 'file-1769965232226-73669333.jpg', 'active', true, 'cpc')
                ON CONFLICT DO NOTHING;
            `, [adSpaceId]);
        }

        // 5. Seed Logistics Pricing
        console.log('Seeding Logistics Pricing...');
        await pool.query(`
            INSERT INTO logistics_pricing (service_type, vehicle_category, base_fare, per_km_rate, per_min_rate, minimum_fare, surge_multiplier, is_active)
            VALUES 
            ('pickup', 'car', 10.00, 2.00, 0.50, 15.00, 1.0, true),
            ('delivery', 'bike', 15.00, 1.80, 0.40, 20.00, 1.2, true),
            ('taxi', 'car', 8.00, 2.50, 0.30, 10.00, 1.0, true)
            ON CONFLICT (service_type) 
            DO NOTHING;
        `);

        console.log('Missing data seeded successfully!');
    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        pool.end();
    }
}

seedMissingData();
