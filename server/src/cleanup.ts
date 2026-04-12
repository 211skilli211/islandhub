import { pool } from './config/db';

const cleanup = async () => {
    try {
        console.log('Cleaning up database...');

        // 1. Backup admin user if exists
        const adminEmail = 'skilli211beng@gmail.com';
        const adminRes = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        const admin = adminRes.rows[0];

        // 2. Truncate all tables
        await pool.query(`
            TRUNCATE TABLE 
                vendors, stores, media, campaigns, listings, campaign_updates, campaign_change_requests,
                rentals, rental_availability, rental_pricing, rental_seasonal_rates,
                service_calendars,
                donations, transactions, orders, order_items, payouts, revenue_orders,
                cart_items, carts,
                reviews, user_posts, messages, listing_views,
                promotional_banners, marquee_templates, text_marquee,
                campaign_creator_subscriptions, customer_subscriptions, vendor_subscriptions, subscriptions,
                vendor_kyc,
                menu_items, menu_sections, menu_addons,
                product_variants,
                categories,
                users
            CASCADE;
        `);

        // 3. Reset all sequences to 1 first
        const sequencesRes = await pool.query(`
            SELECT c.oid::regclass::text AS seqname
            FROM pg_class c
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relkind = 'S'
        `);

        for (const row of sequencesRes.rows) {
            await pool.query(`ALTER SEQUENCE ${row.seqname} RESTART WITH 1`);
        }

        // 4. Restore admin if existed and sync user sequence
        if (admin) {
            console.log('Restoring admin user...');
            await pool.query(
                'INSERT INTO users (user_id, name, email, password_hash, role, email_verified) VALUES ($1, $2, $3, $4, $5, $6)',
                [admin.user_id, admin.name, admin.email, admin.password_hash, admin.role, admin.email_verified]
            );
            // Sync sequence to avoid collision
            await pool.query("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users))");
        }

        console.log('Cleanup successful! 🧹');
    } catch (err) {
        console.error('Cleanup failed:', err);
    } finally {
        process.exit();
    }
};

cleanup();
