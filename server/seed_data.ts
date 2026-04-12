
import { pool } from './src/config/db';
import bcrypt from 'bcryptjs';

async function seed() {
    try {
        console.log('Seeding sample data...');

        // Insert sample users
        const hashedPassword = await bcrypt.hash('password123', 10);
        await pool.query(`
      INSERT INTO users (name, email, password_hash, role, country) VALUES
      ('Alice Creator', 'alice@example.com', $1, 'creator', 'Grenada'),
      ('Bob Donor', 'bob@example.com', $1, 'donor', 'Barbados'),
      ('Charlie Admin', 'charlie@example.com', $1, 'admin', 'St. Lucia'),
      ('Dana Seller', 'dana@example.com', $1, 'creator', 'Trinidad')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

        // Get user IDs
        const userResult = await pool.query('SELECT user_id, name FROM users WHERE email IN ($1,$2,$3,$4)', ['alice@example.com', 'bob@example.com', 'charlie@example.com', 'dana@example.com']);
        const users: Record<string, number> = {};
        userResult.rows.forEach(row => users[row.name] = row.user_id);

        // Insert sample listings
        const sampleListings = [
            { type: 'campaign', title: 'Coral Reef Restoration', description: 'Help save our coral reefs', price: null, creator: 'Alice Creator', category: 'community', goal: 5000.00, current: 1200.00, featured: true },
            { type: 'product', title: 'Handmade Crafts', description: 'Local artisanal products', price: 25.00, creator: 'Bob Donor', category: 'arts', goal: null, current: null, featured: false },
            { type: 'rental', title: 'Luxury Beach Villa', description: 'Luxury beach villa with stunning ocean views.', price: 450.00, creator: 'Dana Seller', category: 'rental', sub_category: 'Apartment', goal: null, current: null, featured: true },
            { type: 'rental', title: 'Island SUV Rental', description: 'Reliable 4x4 for island exploration.', price: 85.00, creator: 'Dana Seller', category: 'rental', sub_category: 'Car', goal: null, current: null, featured: true },
            { type: 'service', title: 'Volcano Trek Adventure', description: 'Expert guided hike to the volcano summit.', price: 120.00, creator: 'Dana Seller', category: 'tour', sub_category: 'land', tour_category: 'land', goal: null, current: null, featured: true },
            { type: 'service', title: 'Secret Lagoon Boat Tour', description: 'Discover hidden coves and crystal clear waters.', price: 200.00, creator: 'Dana Seller', category: 'tour', sub_category: 'sea', tour_category: 'sea', goal: null, current: null, featured: true },
            { type: 'campaign', title: 'Tech Startup Fund', description: 'Funding for innovative startup', price: null, creator: 'Charlie Admin', category: 'business', goal: 10000.00, current: 2500.00, featured: true }
        ];

        for (const l of sampleListings) {
            const slug = l.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '');
            await pool.query(`
                INSERT INTO listings (type, title, description, price, creator_id, category, sub_category, tour_category, goal_amount, current_amount, currency, status, verified, featured, slug)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'XCD', 'active', true, $11, $12)
                ON CONFLICT (slug) DO NOTHING
            `, [l.type, l.title, l.description, l.price, users[l.creator], l.category, (l as any).sub_category || null, (l as any).tour_category || null, l.goal, l.current, l.featured, slug]);
        }

        // Get listing IDs
        const listingResult = await pool.query('SELECT id, title FROM listings WHERE title IN ($1,$2,$3,$4,$5)',
            ['Coral Reef Restoration', 'Handmade Crafts', 'Luxury Beach Villa', 'Volcano Trek Adventure', 'Tech Startup Fund']);
        const listings: Record<string, number> = {};
        listingResult.rows.forEach(row => listings[row.title] = row.id);

        // Insert sample posts
        console.log('Inserting sample posts...');
        await pool.query(`
            INSERT INTO user_posts (user_id, title, content, post_type, visibility, category) VALUES
            ($1, 'Welcome to the Community!', 'So excited to see this platform growing. Let us support each other!', 'post', 'public', 'general'),
            ($2, 'Check out our new campaign', 'Saving the coral reefs is critical for our island future.', 'promotion', 'public', 'community'),
            ($3, 'Community Guidelines', 'Keep it respectful and supportive.', 'announcement', 'public', 'announcements')
        `, [users['Alice Creator'], users['Bob Donor'], users['Charlie Admin']]);

        // Insert sample transactions
        if (listings['Coral Reef Restoration']) {
            await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 100.00, 'XCD', 'wipay', 'wipay', 'completed', true)`, [listings['Coral Reef Restoration'], users['Bob Donor']]);
            await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 50.00, 'XCD', 'paypal', 'paypal', 'completed', true)`, [listings['Coral Reef Restoration'], users['Charlie Admin']]);
        }
        if (listings['Handmade Crafts']) {
            await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 25.00, 'XCD', 'wipay', 'wipay', 'completed', false)`, [listings['Handmade Crafts'], users['Alice Creator']]);
        }
        if (listings['Beach Villa Rental']) {
            await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 150.00, 'XCD', 'paypal', 'paypal', 'pending', false)`, [listings['Beach Villa Rental'], users['Charlie Admin']]);
        }
        if (listings['Tech Startup Fund']) {
            await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 200.00, 'XCD', 'crypto', 'kyrrex', 'completed', true)`, [listings['Tech Startup Fund'], users['Bob Donor']]);
        }

        // Insert sample campaign updates
        if (listings['Coral Reef Restoration']) {
            await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Great progress on the reef! We planted 500 corals this week.', true)`, [listings['Coral Reef Restoration'], users['Alice Creator']]);
            await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Funding milestone reached! Thanks to all donors.', true)`, [listings['Coral Reef Restoration'], users['Alice Creator']]);
        }
        if (listings['Tech Startup Fund']) {
            await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Prototype development is underway.', true)`, [listings['Tech Startup Fund'], users['Charlie Admin']]);
            await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Team expansion completed.', false)`, [listings['Tech Startup Fund'], users['Charlie Admin']]);
        }

        console.log('Sample data seeded successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        pool.end();
    }
}

seed();
