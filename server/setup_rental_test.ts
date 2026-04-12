
import { pool } from './src/config/db';

async function setup() {
    try {
        // 1. Find a rental
        const rental = await pool.query("SELECT id, title FROM listings WHERE type = 'rental' LIMIT 1");

        if (rental.rows.length === 0) {
            console.log("No rentals found. Creating one...");
            // Create a dummy rental if none exists
            // ... (skip for now assuming one exists based on previous curl)
            process.exit(1);
        }

        const listingId = rental.rows[0].id;
        console.log(`Found rental: ${listingId} - ${rental.rows[0].title}`);

        // 2. Clear existing availability for clean test
        await pool.query("DELETE FROM rental_availability WHERE listing_id = $1", [listingId]);

        // 3. Insert blocked dates (Propagate to next few days from today)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 3);

        await pool.query(
            "INSERT INTO rental_availability (listing_id, start_date, end_date, is_available) VALUES ($1, $2, $3, $4)",
            [listingId, tomorrow, dayAfter, false]
        );

        console.log(`Inserted blocked dates for listing ${listingId}`);
        console.log(`URL: http://localhost:3000/listings/${listingId}`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

setup();
