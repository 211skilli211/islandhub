-- Seed sample listings for the vendors
-- Run AFTER seed_vendor_store.sql

DO $$
DECLARE
    jerk_store_id INTEGER;
    seaside_store_id INTEGER;
    crafts_store_id INTEGER;
    web_store_id INTEGER;
    spa_store_id INTEGER;
    auto_store_id INTEGER;
    charters_store_id INTEGER;
    tours_store_id INTEGER;
    events_store_id INTEGER;
    legal_store_id INTEGER;
    
    jerk_vendor_id INTEGER;
    seaside_vendor_id INTEGER;
    crafts_vendor_id INTEGER;
    web_vendor_id INTEGER;
    spa_vendor_id INTEGER;
BEGIN
    -- Get store IDs by slug
    SELECT store_id, vendor_id INTO jerk_store_id, jerk_vendor_id 
    FROM stores WHERE slug = 'island-jerk-spot';
    
    SELECT store_id, vendor_id INTO seaside_store_id, seaside_vendor_id 
    FROM stores WHERE slug = 'seaside-grill-bar';
    
    SELECT store_id, vendor_id INTO crafts_store_id, crafts_vendor_id 
    FROM stores WHERE slug = 'caribbean-crafts-co';
    
    SELECT store_id, vendor_id INTO web_store_id, web_vendor_id 
    FROM stores WHERE slug = 'island-web-studios';
    
    SELECT store_id, vendor_id INTO spa_store_id, spa_vendor_id 
    FROM stores WHERE slug = 'tropical-spa-retreat';
    
    SELECT store_id, vendor_id INTO auto_store_id 
    FROM stores WHERE slug = 'island-auto-care';
    
    SELECT store_id, vendor_id INTO charters_store_id 
    FROM stores WHERE slug = 'caribbean-charters';
    
    SELECT store_id, vendor_id INTO tours_store_id 
    FROM stores WHERE slug = 'island-explorer-tours';
    
    SELECT store_id, vendor_id INTO events_store_id 
    FROM stores WHERE slug = 'carib-celebration-planners';
    
    SELECT store_id, vendor_id INTO legal_store_id 
    FROM stores WHERE slug = 'caribbean-legal-associates';
    
    -- Insert sample listings for each store
    IF jerk_store_id IS NOT NULL THEN
        INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images) VALUES
        ('Jerk Chicken Special', 'Authentic Jamaican jerk chicken with rice and peas', 18.99, 'food', 'food', jerk_store_id, 'active', jerk_vendor_id, ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800']),
        ('Curry Goat', 'Traditional Jamaican curry goat with rice', 22.99, 'food', 'food', jerk_store_id, 'active', jerk_vendor_id, ARRAY['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800']),
        ('Festival & Fry Fish', 'Fried snapper with festival dumplings', 25.99, 'food', 'food', jerk_store_id, 'active', jerk_vendor_id, ARRAY['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800'])
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF seaside_store_id IS NOT NULL THEN
        INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images) VALUES
        ('Grilled Lobster', 'Fresh Caribbean lobster with garlic butter', 45.99, 'food', 'food', seaside_store_id, 'active', seaside_vendor_id, ARRAY['https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800']),
        ('Seafood Platter', 'Mixed seafood with sides', 65.99, 'food', 'food', seaside_store_id, 'active', seaside_vendor_id, ARRAY['https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800']),
        ('Conch Fritters', 'Crispy conch fritters with spicy mayo', 14.99, 'food', 'food', seaside_store_id, 'active', seaside_vendor_id, ARRAY['https://images.unsplash.com/photo-1562967914-608f82629710?w=800'])
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF crafts_store_id IS NOT NULL THEN
        INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images) VALUES
        ('Handwoven Basket', 'Traditional Caribbean handwoven basket', 35.99, 'product', 'product', crafts_store_id, 'active', crafts_vendor_id, ARRAY['https://images.unsplash.com/photo-1595231776515-ddffb1f4eb73?w=800']),
        ('Caribbean Spice Set', 'Assorted local spices', 24.99, 'product', 'product', crafts_store_id, 'active', crafts_vendor_id, ARRAY['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800']),
        ('Sea Glass Jewelry', 'Handmade jewelry from local sea glass', 45.00, 'product', 'product', crafts_store_id, 'active', crafts_vendor_id, ARRAY['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'])
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF web_store_id IS NOT NULL THEN
        INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images) VALUES
        ('Website Design Package', 'Professional website design and development', 499.99, 'service', 'service', web_store_id, 'active', web_vendor_id, ARRAY['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800']),
        ('SEO Package', 'Search engine optimization services', 299.99, 'service', 'service', web_store_id, 'active', web_vendor_id, ARRAY['https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800']),
        ('Social Media Management', 'Monthly social media management', 199.99, 'service', 'service', web_store_id, 'active', web_vendor_id, ARRAY['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800'])
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF spa_store_id IS NOT NULL THEN
        INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images) VALUES
        ('Couples Massage', '90-minute couples massage with aromatherapy', 250.00, 'service', 'service', spa_store_id, 'active', spa_vendor_id, ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800']),
        ('Spa Day Package', 'Full day spa experience with lunch', 350.00, 'service', 'service', spa_store_id, 'active', spa_vendor_id, ARRAY['https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800']),
        ('Facial Treatment', 'Hydrating facial with natural products', 120.00, 'service', 'service', spa_store_id, 'active', spa_vendor_id, ARRAY['https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800'])
        ON CONFLICT DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Listings seeded successfully';
END $$;

-- Verify
SELECT 'Listings:' AS info, COUNT(*) AS count FROM listings;
