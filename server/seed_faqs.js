const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'islandfund',
    password: '135246Rob',
    port: 5433,
});

async function seed() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Find all services for Wellness Hub (Store ID 6)
        const servicesRes = await client.query('SELECT item_id, item_name FROM menu_items WHERE listing_id = 33');

        for (const service of servicesRes.rows) {
            let faqs = [];
            if (service.item_name.toLowerCase().includes('massage')) {
                faqs = [
                    { question: 'What should I wear?', answer: 'Please wear comfortable, loose-fitting clothing. We provide robes and slippers for your comfort.' },
                    { question: 'Is there a cancellation policy?', answer: 'Yes, please notify us at least 24 hours in advance to avoid a 50% cancellation fee.' }
                ];
            } else if (service.item_name.toLowerCase().includes('yoga')) {
                faqs = [
                    { question: 'Do I need to bring my own mat?', answer: 'We provide high-quality yoga mats, but you are welcome to bring your own if you prefer.' },
                    { question: 'Is this suitable for beginners?', answer: 'Absolutely! Our instructors tailor the session to all skill levels.' }
                ];
            } else {
                faqs = [
                    { question: 'How do I prepare for my session?', answer: 'We recommend arriving 10 minutes early to relax and fill out a brief consultation form.' },
                    { question: 'Are gift vouchers available?', answer: 'Yes, you can purchase gift vouchers at our reception or online.' }
                ];
            }

            await client.query('UPDATE menu_items SET faqs = $1 WHERE item_id = $2', [JSON.stringify(faqs), service.item_id]);
        }

        await client.query('COMMIT');
        console.log('FAQ Seeding Successful');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Seeding failed:', e);
    } finally {
        client.release();
        pool.end();
    }
}

seed();
