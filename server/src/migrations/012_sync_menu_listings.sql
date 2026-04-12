-- SYNCHRONIZE MENU ITEMS WITH INDIVIDUAL LISTINGS
-- Target: PostgreSQL
-- Wrapped in exception handler to skip if dependencies don't exist

DO $$
BEGIN
    -- 1. ITAL VEGAN KITCHEN RE-LINKING (Store 1, User 3)
    -- Link existing Ital listings to menu items
    UPDATE menu_items SET listing_id = 6 WHERE item_name = 'Ital Vital Stew';
    UPDATE menu_items SET listing_id = 7 WHERE item_name = 'Roasted Breadfruit Bowl';
    UPDATE menu_items SET listing_id = 10 WHERE item_name = 'Soursop Bliss Juice';
    UPDATE menu_items SET listing_id = 11 WHERE item_name = 'Iced Hibiscus Tea';

    -- Add missing Ital items from existing listings
    INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url)
    VALUES 
      (1, 'Fried Plantains', 'Sweet caramelized ripe plantains.', 7.00, 8, 'https://images.unsplash.com/photo-1627448866535-64506c483a9a?auto=format&fit=crop&q=80&w=400'),
      (1, 'Avocado Mash', 'Local avocado with lime and sea salt.', 6.00, 9, 'https://images.unsplash.com/photo-1523412035345-f09c647b74bd?auto=format&fit=crop&q=80&w=400')
    ON CONFLICT DO NOTHING;

    -- 2. GOURMET SOUP KITCHEN INDIVIDUAL LISTINGS (Store 5, User 2)
    -- Create listings for each soup and link them
    DECLARE
        new_listing_id INT;
    BEGIN
        -- Only proceed if user 2 exists
        IF EXISTS (SELECT 1 FROM users WHERE user_id = 2) THEN
            -- French Onion Soup
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('French Onion Soup', 'Classic onion soup with toasted baguette and melted emmental.', 9.50, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1510627489930-0c1b0ba0cc11?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'French Onion Soup';

            -- Caribbean Lentil Soup
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('Caribbean Lentil Soup', 'Hearty lentils infused with local pimento and ginger.', 8.00, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1547592115-f5d933336712?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Caribbean Lentil Soup';

            -- Nevis Peak Watercress
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id)
            VALUES ('Nevis Peak Watercress', 'Vibrant green soup with fresh mountain cress.', 7.50, 'product', 'food', 5, 'active', 2)
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Nevis Peak Watercress';

            -- Coastal Fish Soup
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('Coastal Fish Soup', 'Rich broth with local snapper, roots, and thyme.', 12.00, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Coastal Fish Soup';

            -- Creamy Island Pumpkin
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('Creamy Island Pumpkin', 'Roasted pumpkin with coconut cream and nutmeg.', 8.50, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Creamy Island Pumpkin';

            -- Roasted Tomato Basil
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('Roasted Tomato Basil', 'Fire-roasted garden tomatoes with fresh basil.', 7.00, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Roasted Tomato Basil';

            -- Smoky Split Pea
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id)
            VALUES ('Smoky Split Pea', 'Traditional split pea with hardwood smoked hints.', 8.00, 'product', 'food', 5, 'active', 2)
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Smoky Split Pea';

            -- Seafood Chowder
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, images)
            VALUES ('Seafood Chowder', 'Velvety cream broth with clams, corn, and lobster bits.', 11.00, 'product', 'food', 5, 'active', 2, ARRAY['https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800'])
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Seafood Chowder';

            -- Garlic Herb Bread
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id)
            VALUES ('Garlic Herb Bread', 'Warm baguette with local herb butter.', 3.50, 'product', 'food', 5, 'active', 2)
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Garlic Herb Bread';

            -- Plantain Crisps
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id)
            VALUES ('Plantain Crisps', 'Hand-cut green plantain chips.', 4.00, 'product', 'food', 5, 'active', 2)
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Plantain Crisps';

            -- Garden Salad Cup
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id)
            VALUES ('Garden Salad Cup', 'Nevisian greens with island vinaigrette.', 5.00, 'product', 'food', 5, 'active', 2)
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Garden Salad Cup';

            -- Community Warm Meal
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, metadata)
            VALUES ('Community Warm Meal', 'A hearty soup and bread for someone in need.', 5.00, 'product', 'food', 5, 'active', 2, '{"donation_suggested": true}')
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Community Warm Meal';

            -- Sponsor a Family
            INSERT INTO listings (title, description, price, type, category, store_id, status, creator_id, metadata)
            VALUES ('Sponsor a Family', 'Feeds a family of four for a day.', 20.00, 'product', 'food', 5, 'active', 2, '{"donation_suggested": true}')
            RETURNING id INTO new_listing_id;
            UPDATE menu_items SET listing_id = new_listing_id WHERE item_name = 'Sponsor a Family';
        END IF;
    END;

    RAISE NOTICE 'Menu listings sync completed successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Menu listings sync skipped: %', SQLERRM;
END $$;
