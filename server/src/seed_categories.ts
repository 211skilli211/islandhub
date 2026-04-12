import { pool } from './config/db';

const seedVendorCategories = async () => {
    try {
        console.log('Seeding vendor categories...');

        // Clear existing categories and subtypes first to avoid duplicates
        await pool.query('DELETE FROM vendor_subtypes');
        await pool.query('DELETE FROM vendor_categories');

        const categories = [
            // Product Categories (physical goods)
            { category_key: 'fashion_apparel', display_name: 'Fashion & Apparel', icon: '👗', description: 'Clothing, accessories, and wearable items', layout_type: 'product', sort_order: 1 },
            { category_key: 'electronics', display_name: 'Electronics', icon: '💻', description: 'Devices, gadgets, and tech accessories', layout_type: 'product', sort_order: 2 },
            { category_key: 'home_garden', display_name: 'Home & Garden', icon: '🏠', description: 'Furniture, decor, and gardening supplies', layout_type: 'product', sort_order: 3 },
            { category_key: 'health_pharmacy', display_name: 'Health & Pharmacy', icon: '💊', description: 'Health products, supplements, and wellness items', layout_type: 'product', sort_order: 4 },
            { category_key: 'agro_produce', display_name: 'Agro & Produce', icon: '🌱', description: 'Fresh produce, seeds, and agricultural products', layout_type: 'product', sort_order: 5 },
            { category_key: 'grocery_convenience', display_name: 'Grocery & Convenience', icon: '🛒', description: 'Food items, beverages, and daily essentials', layout_type: 'product', sort_order: 6 },
            { category_key: 'books_media', display_name: 'Books & Media', icon: '📚', description: 'Books, music, movies, and entertainment', layout_type: 'product', sort_order: 7 },
            { category_key: 'sports_outdoors', display_name: 'Sports & Outdoors', icon: '⚽', description: 'Sports equipment and outdoor gear', layout_type: 'product', sort_order: 8 },

            // Food Service Categories (food establishments)
            { category_key: 'food_kitchen', display_name: 'Restaurant & Kitchen', icon: '🍽️', description: 'Full-service restaurants and food kitchens', layout_type: 'service', sort_order: 10 },
            { category_key: 'cafe_bakery', display_name: 'Cafe & Bakery', icon: '☕', description: 'Coffee shops, bakeries, and sweet treats', layout_type: 'service', sort_order: 11 },
            { category_key: 'food_truck', display_name: 'Food Truck', icon: '🚚', description: 'Mobile food vendors and street food', layout_type: 'service', sort_order: 12 },

            // Professional Services
            { category_key: 'professional', display_name: 'Professional Services', icon: '💼', description: 'Consulting, legal, financial, and business services', layout_type: 'service', sort_order: 20 },
            { category_key: 'home_services', display_name: 'Home Services', icon: '🔧', description: 'Repairs, cleaning, maintenance, and renovations', layout_type: 'service', sort_order: 21 },
            { category_key: 'beauty_wellness', display_name: 'Beauty & Wellness', icon: '💅', description: 'Salons, spas, and personal care services', layout_type: 'service', sort_order: 22 },
            { category_key: 'education', display_name: 'Education & Tutoring', icon: '📖', description: 'Tutoring, courses, and educational services', layout_type: 'service', sort_order: 23 },
            { category_key: 'event_services', display_name: 'Event Services', icon: '🎉', description: 'Photography, planning, catering, and event rentals', layout_type: 'service', sort_order: 24 },
            { category_key: 'transport', display_name: 'Transportation', icon: '🚗', description: 'Taxis, deliveries, and transport services', layout_type: 'service', sort_order: 25 },
            { category_key: 'landscaping', display_name: 'Landscaping', icon: '🌳', description: 'Garden design, lawn care, and outdoor maintenance', layout_type: 'service', sort_order: 26 },

            // Other Services
            { category_key: 'pet_services', display_name: 'Pet Services', icon: '🐕', description: 'Pet care, grooming, and veterinary services', layout_type: 'service', sort_order: 30 },
            { category_key: 'automotive', display_name: 'Automotive', icon: '🚙', description: 'Car repairs, detailing, and automotive services', layout_type: 'service', sort_order: 31 },

            // Digital & Creative
            { category_key: 'digital_products', display_name: 'Digital Products', icon: '💾', description: 'Downloadable files, courses, and digital content', layout_type: 'digital', sort_order: 40 },
            { category_key: 'creative_services', display_name: 'Creative Services', icon: '🎨', description: 'Design, writing, and creative work', layout_type: 'service', sort_order: 41 },

            // Rentals (these ARE services with time-based pricing)
            { category_key: 'vehicle_rental', display_name: 'Vehicle Rental', icon: '🚙', description: 'Cars, bikes, scooters, and vehicle rentals', layout_type: 'service', sort_order: 50 },
            { category_key: 'property_rental', display_name: 'Property Rental', icon: '🏠', description: 'Vacation rentals, apartments, and property leases', layout_type: 'service', sort_order: 51 },
            { category_key: 'equipment_rental', display_name: 'Equipment Rental', icon: '🔧', description: 'Tools, machinery, and equipment rentals', layout_type: 'service', sort_order: 52 },
            { category_key: 'boat_rental', display_name: 'Boat & Watercraft', icon: '🚤', description: 'Boat rentals, jet skis, and water activities', layout_type: 'service', sort_order: 53 },

            // Tours (these ARE services)
            { category_key: 'tour_land', display_name: 'Land Tours', icon: '🗺️', description: 'Guided land tours and excursions', layout_type: 'service', sort_order: 54 },
            { category_key: 'tour_water', display_name: 'Water Tours', icon: '🚤', description: 'Boat tours, snorkeling, and water activities', layout_type: 'service', sort_order: 55 },
            { category_key: 'tour_experience', display_name: 'Experiences', icon: '🎫', description: 'Unique experiences and activities', layout_type: 'service', sort_order: 56 },
        ];

        for (const cat of categories) {
            await pool.query(`
                INSERT INTO vendor_categories (category_key, display_name, icon, description, layout_type, sort_order)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (category_key) DO UPDATE SET
                    display_name = EXCLUDED.display_name,
                    icon = EXCLUDED.icon,
                    description = EXCLUDED.description,
                    layout_type = EXCLUDED.layout_type,
                    sort_order = EXCLUDED.sort_order
            `, [cat.category_key, cat.display_name, cat.icon, cat.description, cat.layout_type, cat.sort_order]);
        }

        console.log('Categories seeded successfully!');

        // Seed subtypes for food categories
        const foodSubtypes = [
            {
                category_key: 'food_kitchen', subtypes: [
                    { subtype_key: 'restaurant', display_name: 'Full Service Restaurant', icon: '🍽️' },
                    { subtype_key: 'fast_casual', display_name: 'Fast Casual', icon: '🍔' },
                    { subtype_key: 'buffet', display_name: 'Buffet', icon: '🍱' },
                    { subtype_key: 'delivery_only', display_name: 'Delivery Only', icon: '📦' },
                ]
            },
            {
                category_key: 'cafe_bakery', subtypes: [
                    { subtype_key: 'coffee_shop', display_name: 'Coffee Shop', icon: '☕' },
                    { subtype_key: 'bakery', display_name: 'Bakery', icon: '🥐' },
                    { subtype_key: 'dessert', display_name: 'Dessert Shop', icon: '🍰' },
                ]
            },
            {
                category_key: 'transport', subtypes: [
                    { subtype_key: 'taxi', display_name: 'Taxi Service', icon: '🚗' },
                    { subtype_key: 'delivery', display_name: 'Delivery Service', icon: '📦' },
                    { subtype_key: 'shuttle', display_name: 'Shuttle Service', icon: '🚌' },
                    { subtype_key: 'tour', display_name: 'Tour/Trip', icon: '🗺️' },
                ]
            },
        ];

        for (const cat of foodSubtypes) {
            const catResult = await pool.query('SELECT category_id FROM vendor_categories WHERE category_key = $1', [cat.category_key]);
            if (catResult.rows.length > 0) {
                for (const subtype of cat.subtypes) {
                    await pool.query(`
                        INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (category_id, subtype_key) DO UPDATE SET
                            display_name = EXCLUDED.display_name,
                            icon = EXCLUDED.icon
                    `, [catResult.rows[0].category_id, subtype.subtype_key, subtype.display_name, subtype.icon, 0]);
                }
            }
        }

        console.log('Subtypes seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding categories:', error);
        process.exit(1);
    }
};

seedVendorCategories();
