import { pool } from './config/db';

async function cleanupAdminData() {
    try {
        const adminEmail1 = 'skilli211ben@gmail.com';
        const adminEmail2 = 'skilli211beng@gmail.com';
        const placeholderImage = 'file-1769965232226-73669333.jpg';

        console.log('Finding admin user...');
        const userRes = await pool.query('SELECT user_id FROM users WHERE email IN ($1, $2)', [adminEmail1, adminEmail2]);
        if (userRes.rows.length === 0) {
            console.log('Admin user not found.');
            return;
        }
        const userId = userRes.rows[0].user_id;

        console.log(`Cleaning up listings for user ${userId}...`);

        // Define search prompts map based on listing titles (partial match)
        const prompts = [
            { title: 'Signature Tee', prompt: 'premium minimalist caribbean streetwear t-shirt charcoal gray mockup' },
            { title: 'Wireless Earbuds', prompt: 'sleek modern wireless earbuds charging case professional lifestyle photo' },
            { title: 'Ital Platter', prompt: 'vibrant authentic caribbean ital food platter wooden bowl organic vegetables' },
            { title: 'Powerwash', prompt: 'professional pressure washing house exterior before and after cleaning service' },
            { title: 'Landscaping', prompt: 'manicured tropical garden landscape lush green lawn island home' },
            { title: 'SUV Explorer', prompt: 'luxury white off-road suv parked on tropical coast road sunset' },
            { title: 'Mountain Trail Bike', prompt: 'professional mountain bike on rugged scenic trail forest background' },
            { title: 'Coastal Yacht', prompt: 'luxury modern motor yacht cruising clear blue caribbean water' },
            { title: 'Jetski', prompt: 'fast jet ski on turquoise tropical water spray action shot' },
            { title: 'Luxury Apartment', prompt: 'modern luxury apartment interior terrace view caribbean ocean sunset' },
            { title: 'Recording Studio', prompt: 'professional music recording studio high end equipment mood lighting' },
            { title: 'Generator', prompt: 'heavy duty industrial portable power generator on construction site' },
            { title: 'Rotary Drill', prompt: 'professional construction power tool rotary hammer drill industrial' },
            { title: 'Brimstone Hill', prompt: 'historical caribbean stone fort brimstone hill vista ocean view' },
            { title: 'Taxi Service', prompt: 'clean white modern taxi car island road coastal background' },
            { title: 'Pickup & Delivery', prompt: 'delivery motorcycle courier with box city street island logistics' },
            { title: 'Future Startup', prompt: 'modern caribbean startup office diverse young entrepreneurs working' }
        ];

        // Fetch all listings for this user
        const listingsRes = await pool.query('SELECT id, title, metadata FROM listings WHERE creator_id = $1', [userId]);

        for (const listing of listingsRes.rows) {
            const promptEntry = prompts.find(p => listing.title.includes(p.title));
            const searchPrompt = promptEntry ? promptEntry.prompt : 'caribbean island lifestyle high quality professional photography';

            const newMetadata = {
                ...(listing.metadata || {}),
                search_prompt: searchPrompt
            };

            await pool.query(
                "UPDATE listings SET images = '{}', metadata = $1 WHERE id = $2",
                [JSON.stringify(newMetadata), listing.id]
            );
            console.log(`Updated listing: ${listing.title}`);
        }

        console.log('Setting store placeholders...');
        // Set all admin stores to use the placeholder image if it exists in the backend
        // We'll set it as an actual value so it displays everywhere
        await pool.query(
            "UPDATE stores SET logo_url = $1, banner_url = $1 WHERE vendor_id = $2",
            [placeholderImage, userId]
        );

        console.log('Cleanup completed successfully! 🏝️');
    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        process.exit();
    }
}

cleanupAdminData();
