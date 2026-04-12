import { pool } from './src/config/db';

async function seedAssets() {
    try {
        console.log('Consolidating Data into Docker Database (5433)...');
        console.log('✅ Connected to Docker PostgreSQL');

        // 1. Ensure all Ad Spaces exist and align names
        const spacesToEnsure = [
            { name: 'home_hero_ad', display_name: 'Homepage Hero Ad', location: 'homepage' },
            { name: 'home_sidebar_ad', display_name: 'Homepage Sidebar', location: 'homepage' },
            { name: 'marketplace_hero_ad', display_name: 'Marketplace Hero', location: 'marketplace' },
            { name: 'marketplace_grid_ad', display_name: 'Marketplace Grid Ad', location: 'marketplace' },
            { name: 'community_sidebar', display_name: 'Community Sidebar', location: 'community' },
            { name: 'home_interstitial', display_name: 'Homepage Interstitial', location: 'homepage' }
        ];

        for (const s of spacesToEnsure) {
            await pool.query(`
                INSERT INTO ad_spaces (name, display_name, location, is_active, max_concurrent_ads)
                VALUES ($1, $2, $3, true, 1)
                ON CONFLICT (name) DO UPDATE SET is_active = true;
            `, [s.name, s.display_name, s.location]);
        }

        // 2. Sync Hero Asset Styles (Preserve user content)
        const heroStyles = [
            { page_key: 'home', pattern: 'dots', color: '#ffffff' },
            { page_key: 'marketplace', pattern: 'grid', color: '#ffffff' },
            { page_key: 'community', pattern: 'mesh', color: '#ffffff' }
        ];

        for (const h of heroStyles) {
            await pool.query(`
                UPDATE hero_assets 
                SET style_config = jsonb_set(
                    COALESCE(style_config, '{}'::jsonb), 
                    '{pattern}', 
                    $2::jsonb
                ) || jsonb_build_object('patternColor', $3::text)
                WHERE page_key = $1;
            `, [h.page_key, JSON.stringify(h.pattern), h.color]);
        }

        // 3. Migrate/Seed Advertisements
        const spacesRes = await pool.query("SELECT space_id, name FROM ad_spaces");
        const spaces: Record<string, number> = {};
        spacesRes.rows.forEach((row: any) => spaces[row.name] = row.space_id);

        const ads = [
            {
                title: 'Ital Kitchen Premium',
                description: 'Experience the real taste of the islands with our farm-to-table vegan delights.',
                media_url: '/assets/ads/seafood.png',
                space_id: spaces['home_hero_ad'],
                layout: 'sleek',
                style: { from: '#064e3b', to: '#020617', pattern: 'dots', patternColor: '#ffffff' }
            },
            {
                title: 'Blue Mountain Coffee',
                description: 'The world\'s most exclusive beans, roasted to perfection in the mountains.',
                media_url: '/assets/ads/coffee.png',
                space_id: spaces['community_sidebar'],
                layout: 'portrait',
                style: { from: '#451a03', to: '#0c0a09', pattern: 'grid', patternColor: '#fbbf24' }
            },
            {
                title: 'Mahogany Shades',
                description: 'Limited edition handcrafted frames. Protection with island style.',
                media_url: '/assets/ads/sunglasses.png',
                space_id: spaces['marketplace_hero_ad'],
                layout: 'portrait',
                style: { from: '#422006', to: '#000000', pattern: 'dots', patternColor: '#ffffff' }
            }
        ];

        // Clear existing admin ads in Docker to prevent duplicates
        await pool.query("DELETE FROM advertisements WHERE advertiser_type = 'admin' OR advertiser_type = 'platform'");

        for (const ad of ads) {
            if (!ad.space_id) continue;
            await pool.query(`
                INSERT INTO advertisements (title, description, media_type, media_url, ad_space_id, status, is_active, click_action, advertiser_type, layout_template, style_config)
                VALUES ($1, $2, 'image', $3, $4, 'active', true, 'url', 'admin', $5, $6)
            `, [ad.title, ad.description, ad.media_url, ad.space_id, ad.layout, JSON.stringify(ad.style)]);
        }

        console.log('✅ Consolidation and Seeding successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedAssets();
