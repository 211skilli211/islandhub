-- PULSE ISLAND APPAREL SEEDING
-- Store 4, Vendor 6
-- Wrapped in exception handler to skip if dependencies don't exist

DO $$
BEGIN
    -- 1. DELETE PREVIOUS MOCKED SEEDING FOR STORE 4
    DELETE FROM menu_items WHERE listing_id IN (SELECT id FROM listings WHERE store_id = 4);
    DELETE FROM menu_sections WHERE listing_id IN (SELECT id FROM listings WHERE store_id = 4);

    -- 2. CATALOGUE SECTIONS
    INSERT INTO menu_sections (section_id, store_id, listing_id, section_name, priority) 
    VALUES (6, 4, 4, 'Apparel', 1), (7, 4, 4, 'Smart Gear', 2)
    ON CONFLICT (section_id) DO NOTHING;

    -- 3. APPAREL LISTINGS & MENU ITEMS
    -- Only proceed if user 6 exists
    IF EXISTS (SELECT 1 FROM users WHERE user_id = 6) THEN
        -- Island Pulse T-Shirt
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (25, 'Island Pulse T-Shirt', 'Lightweight cotton tee with Caribbean-inspired design', 25.00, 'product', 'apparel', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Size", "values": "S, M, L, XL"}, {"name": "Color", "values": "White, Black, Blue"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (6, 'Island Pulse T-Shirt', 'Lightweight cotton tee with Caribbean-inspired design', 25.00, 25, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=400', '["Eco-Friendly", "Unisex"]')
        ON CONFLICT DO NOTHING;

        -- Pulse Hoodie
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (26, 'Pulse Hoodie', 'Premium hoodie with embroidered logo', 55.00, 'product', 'apparel', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Size", "values": "S, M, L, XL"}, {"name": "Color", "values": "Grey, Navy"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (6, 'Pulse Hoodie', 'Premium hoodie with embroidered logo', 55.00, 26, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=400', '["Premium", "Unisex"]')
        ON CONFLICT DO NOTHING;

        -- Island Dress
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (27, 'Island Dress', 'Flowy summer dress with tropical print', 65.00, 'product', 'apparel', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Size", "values": "XS, S, M, L"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (6, 'Island Dress', 'Flowy summer dress with tropical print', 65.00, 27, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=400', '["Women", "Seasonal"]')
        ON CONFLICT DO NOTHING;

        -- Pulse Cap
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (28, 'Pulse Cap', 'Adjustable cap with Pulse Island branding', 20.00, 'product', 'apparel', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Color", "values": "Black, White, Red"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (6, 'Pulse Cap', 'Adjustable cap with Pulse Island branding', 20.00, 28, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=400', '["Accessory"]')
        ON CONFLICT DO NOTHING;

        -- 4. SMART GEAR LISTINGS & MENU ITEMS
        -- Pulse Smartwatch
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (29, 'Pulse Smartwatch', 'Fitness tracking smartwatch with heart rate monitor', 120.00, 'product', 'electronics', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Color", "values": "Black, Silver"}, {"name": "Band", "values": "Leather, Silicone"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (7, 'Pulse Smartwatch', 'Fitness tracking smartwatch with heart rate monitor', 120.00, 29, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400', '["Smart Gear", "Fitness"]')
        ON CONFLICT DO NOTHING;

        -- Wireless Earbuds
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (30, 'Wireless Earbuds', 'Noise-cancelling earbuds with charging case', 85.00, 'product', 'electronics', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Color", "values": "White, Black"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (7, 'Wireless Earbuds', 'Noise-cancelling earbuds with charging case', 85.00, 30, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=400', '["Smart Gear", "Audio"]')
        ON CONFLICT DO NOTHING;

        -- Smart Glasses
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (31, 'Smart Glasses', 'Lightweight smart glasses with AR display', 250.00, 'product', 'electronics', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Lens", "values": "Clear, Tinted"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (7, 'Smart Glasses', 'Lightweight smart glasses with AR display', 250.00, 31, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=400', '["Smart Gear", "AR"]')
        ON CONFLICT DO NOTHING;

        -- Pulse Fitness Band
        INSERT INTO listings (id, title, description, price, type, category, store_id, status, creator_id, images, metadata)
        VALUES (32, 'Pulse Fitness Band', 'Waterproof fitness band with step counter and sleep tracking', 60.00, 'product', 'electronics', 4, 'active', 6, ARRAY['https://images.unsplash.com/photo-1575311373937-040b8e3fd5b6?auto=format&fit=crop&q=80&w=800'], '{"variants": [{"name": "Color", "values": "Black, Blue, Pink"}]}')
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
        VALUES (7, 'Pulse Fitness Band', 'Waterproof fitness band with step counter and sleep tracking', 60.00, 32, 'https://images.unsplash.com/photo-1575311373937-040b8e3fd5b6?auto=format&fit=crop&q=80&w=400', '["Smart Gear", "Health"]')
        ON CONFLICT DO NOTHING;
    END IF;

    RAISE NOTICE 'Pulse Island Apparel seeding completed successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Pulse Island Apparel seeding skipped: %', SQLERRM;
END $$;
