/**
 * seed_production.ts — Minimal production seed for IslandHub
 * 
 * Creates only:
 *   1. Admin user (if not exists)
 *   2. Category taxonomy (vendor_categories + vendor_subtypes)
 *   3. Platform settings (site_settings)
 * 
 * No fake users, no fake stores, no fake listings.
 * Run: npx ts-node server/src/seed_production.ts
 */

import { pool } from './config/db';
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'skilli211ben@gmail.com';
const ADMIN_NAME = 'Admin Skilli';
const ADMIN_PASSWORD = 'password123';

async function seed() {
    console.log('🌴 IslandHub Production Seed\n');

    // ── 1. Admin User ──────────────────────────────────────────────
    console.log('1. Creating admin user...');
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [ADMIN_EMAIL]);
    let userId: number;

    if (existing.rows.length > 0) {
        userId = existing.rows[0].user_id;
        console.log(`   ✓ Admin already exists (ID: ${userId})`);
        await pool.query("UPDATE users SET role = 'admin' WHERE user_id = $1", [userId]);
    } else {
        const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, true) RETURNING user_id',
            [ADMIN_NAME, ADMIN_EMAIL, hash, 'admin']
        );
        userId = result.rows[0].user_id;
        console.log(`   ✓ Admin created (ID: ${userId})`);
    }

    // ── 2. Vendor Category Taxonomy ────────────────────────────────
    console.log('\n2. Seeding category taxonomy...');
    const categories = [
        { key: 'food', name: 'Food & Dining', icon: '🍽️', layout: 'product', order: 1 },
        { key: 'retail', name: 'Retail & Shopping', icon: '🛍️', layout: 'product', order: 2 },
        { key: 'service', name: 'Services', icon: '🛠️', layout: 'service', order: 3 },
        { key: 'rental', name: 'Rentals', icon: '🏠', layout: 'rental', order: 4 },
        { key: 'campaign', name: 'Campaigns', icon: '❤️', layout: 'campaign', order: 5 },
    ];

    const subtypes: Record<string, string[]> = {
        food: ['restaurant', 'kitchen', 'cafe', 'grill', 'bakery', 'bar'],
        retail: ['boutique', 'electronics', 'grocery', 'health', 'fashion', 'specialty'],
        service: ['professional', 'automotive', 'health', 'marine', 'events', 'cleaning'],
        rental: ['vehicle', 'housing', 'equipment', 'boat', 'bike', 'tools'],
        campaign: ['startup', 'community', 'education', 'health', 'environment'],
    };

    for (const cat of categories) {
        await pool.query(
            `INSERT INTO vendor_categories (category_key, display_name, icon, layout_type, sort_order)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (category_key) DO UPDATE SET display_name = EXCLUDED.display_name`,
            [cat.key, cat.name, cat.icon, cat.layout, cat.order]
        );
        console.log(`   ✓ ${cat.name}`);

        for (const subtype of subtypes[cat.key] || []) {
            await pool.query(
                `INSERT INTO vendor_subtypes (category_key, subtype_key, display_name)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (category_key, subtype_key) DO NOTHING`,
                [cat.key, subtype, subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())]
            );
        }
    }

    // ── 3. Platform Settings ───────────────────────────────────────
    console.log('\n3. Seeding platform settings...');
    const settings = [
        { key: 'site_name', value: 'IslandHub', type: 'string' },
        { key: 'site_tagline', value: 'The Caribbean Commerce Hub', type: 'string' },
        { key: 'currency', value: 'XCD', type: 'string' },
        { key: 'currency_symbol', value: '$', type: 'string' },
        { key: 'default_country', value: 'St. Kitts & Nevis', type: 'string' },
        { key: 'default_timezone', value: 'America/St_Kitts', type: 'string' },
        { key: 'enable_campaigns', value: 'true', type: 'boolean' },
        { key: 'enable_rentals', value: 'true', type: 'boolean' },
        { key: 'enable_transport', value: 'true', type: 'boolean' },
        { key: 'maintenance_mode', value: 'false', type: 'boolean' },
        { key: 'geospatial_enable_3d_tiles', value: 'false', type: 'boolean' },
        { key: 'geospatial_enable_gaussian_splat', value: 'false', type: 'boolean' },
    ];

    for (const s of settings) {
        await pool.query(
            `INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value`,
            [s.key, s.value, s.type, '']
        );
    }
    console.log(`   ✓ ${settings.length} settings configured`);

    // ── Done ───────────────────────────────────────────────────────
    console.log('\n✅ Production seed complete!');
    console.log(`   Admin: ${ADMIN_EMAIL}`);
    console.log(`   Categories: ${categories.length} with subtypes`);
    console.log(`   Settings: ${settings.length} configured`);
    console.log('\n⚠️  Change the default admin password immediately!');
}

seed()
    .then(() => process.exit(0))
    .catch(err => { console.error('Seed failed:', err); process.exit(1); });
