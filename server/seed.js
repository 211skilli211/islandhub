const { pool } = require('./src/config/db');
const bcrypt = require('bcryptjs');

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
        const users = {};
        userResult.rows.forEach(row => users[row.name] = row.user_id);

        // Insert sample listings
        await pool.query(`
      INSERT INTO listings (type, title, description, price, creator_id, category, goal_amount, current_amount, currency, status, verified, featured) VALUES
      ('campaign', 'Coral Reef Restoration', 'Help save our coral reefs', NULL, $1, 'community', 5000.00, 1200.00, 'XCD', 'active', true, true),
      ('product', 'Handmade Crafts', 'Local artisanal products', 25.00, $2, 'arts', NULL, NULL, 'XCD', 'active', false, false),
      ('rental', 'Beach Villa Rental', 'Luxury beach villa for tourists', 150.00, $4, 'tourism', NULL, NULL, 'XCD', 'active', true, false),
      ('service', 'Tour Guide Service', 'Expert island tour guide', 50.00, $4, 'tourism', NULL, NULL, 'XCD', 'active', false, false),
      ('campaign', 'Tech Startup Fund', 'Funding for innovative startup', NULL, $3, 'business', 10000.00, 2500.00, 'XCD', 'active', false, true)
      ON CONFLICT DO NOTHING
    `, [users['Alice Creator'], users['Bob Donor'], users['Charlie Admin'], users['Dana Seller']]);

        // Get listing IDs
        const listingResult = await pool.query('SELECT id, title FROM listings WHERE title IN ($1,$2,$3,$4,$5)',
            ['Coral Reef Restoration', 'Handmade Crafts', 'Beach Villa Rental', 'Tour Guide Service', 'Tech Startup Fund']);
        const listings = {};
        listingResult.rows.forEach(row => listings[row.title] = row.id);

        // Insert sample transactions
        await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 100.00, 'XCD', 'wipay', 'wipay', 'completed', true)`, [listings['Coral Reef Restoration'], users['Bob Donor']]);
        await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 50.00, 'XCD', 'paypal', 'paypal', 'completed', true)`, [listings['Coral Reef Restoration'], users['Charlie Admin']]);
        await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 25.00, 'XCD', 'wipay', 'wipay', 'completed', false)`, [listings['Handmade Crafts'], users['Alice Creator']]);
        await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 150.00, 'XCD', 'paypal', 'paypal', 'pending', false)`, [listings['Beach Villa Rental'], users['Charlie Admin']]);
        await pool.query(`INSERT INTO transactions (listing_id, user_id, amount, currency, payment_method, payment_provider, status, is_donation) VALUES ($1, $2, 200.00, 'XCD', 'crypto', 'kyrrex', 'completed', true)`, [listings['Tech Startup Fund'], users['Bob Donor']]);

        // Insert sample campaign updates
        await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Great progress on the reef! We planted 500 corals this week.', true)`, [listings['Coral Reef Restoration'], users['Alice Creator']]);
        await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Funding milestone reached! Thanks to all donors.', true)`, [listings['Coral Reef Restoration'], users['Alice Creator']]);
        await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Prototype development is underway.', true)`, [listings['Tech Startup Fund'], users['Charlie Admin']]);
        await pool.query(`INSERT INTO campaign_updates (listing_id, creator_id, content, is_public) VALUES ($1, $2, 'Team expansion completed.', false)`, [listings['Tech Startup Fund'], users['Charlie Admin']]);

        console.log('Sample data seeded successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        pool.end();
    }
}

seed();