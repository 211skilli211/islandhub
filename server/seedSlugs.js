const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:135246Rob@localhost:5433/islandfund'
});

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function seedSlugs() {
    try {
        console.log('Seeding slugs for stores...');
        const stores = await pool.query('SELECT store_id, name FROM stores WHERE slug IS NULL');
        for (const store of stores.rows) {
            let slug = slugify(store.name);
            // Check uniqueness
            const check = await pool.query('SELECT store_id FROM stores WHERE slug = $1', [slug]);
            if (check.rows.length > 0) {
                slug = `${slug}-${store.store_id}`;
            }
            await pool.query('UPDATE stores SET slug = $1 WHERE store_id = $2', [slug, store.store_id]);
            console.log(`Updated store ${store.store_id}: ${slug}`);
        }

        console.log('Seeding slugs for listings...');
        const listings = await pool.query('SELECT id, title FROM listings WHERE slug IS NULL');
        for (const listing of listings.rows) {
            let slug = slugify(listing.title);
            // Check uniqueness
            const check = await pool.query('SELECT id FROM listings WHERE slug = $1', [slug]);
            if (check.rows.length > 0) {
                slug = `${slug}-${listing.id}`;
            }
            await pool.query('UPDATE listings SET slug = $1 WHERE id = $2', [slug, listing.id]);
            console.log(`Updated listing ${listing.id}: ${slug}`);
        }

        console.log('Seeding complete!');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await pool.end();
    }
}

seedSlugs();
