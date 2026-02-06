-- GOURMET SEEDING SCRIPT
-- Target: PostgreSQL
-- Wraps seeding logic in exception handler to skip if dependencies don't exist

DO $$
BEGIN
  -- 1. CLEANUP PREVIOUS SEEDING
  DELETE FROM menu_items WHERE listing_id IN (1, 5);
  DELETE FROM menu_sections WHERE listing_id IN (1, 5);

  -- 2. RESTORE ITAL VEGAN KITCHEN
  -- Ensure Listing 1 exists and is 'product' type for owner=3
  INSERT INTO listings (id, title, description, type, category, store_id, price, status, creator_id, images) 
  SELECT 1, 'Ital Vegan Kitchen storefront', 'Traditional Rastafarian cuisine.', 'product', 'food', 1, 0, 'active', 3, ARRAY['https://images.unsplash.com/photo-1540914124281-342587941389?auto=format&fit=crop&q=80&w=1000']
  WHERE EXISTS (SELECT 1 FROM users WHERE user_id = 3)
  ON CONFLICT (id) DO UPDATE SET creator_id = 3, type = 'product', store_id = 1;

  -- Ital Menu Sections
  INSERT INTO menu_sections (section_id, store_id, listing_id, section_name, priority) 
  SELECT * FROM (VALUES 
    (1, 1, 1, 'Today''s Special', 1), 
    (2, 1, 1, 'Beverages', 2)
  ) AS v(section_id, store_id, listing_id, section_name, priority)
  WHERE EXISTS (SELECT 1 FROM listings WHERE id = 1)
  ON CONFLICT (section_id) DO NOTHING;

  -- Ital Menu Items
  INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url)
  VALUES 
    (1, 'Ital Vital Stew', 'Slow-cooked roots and coconut milk.', 15.00, 1, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400'),
    (1, 'Roasted Breadfruit Bowl', 'Fire-roasted breadfruit with herb salsa.', 12.00, 1, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400'),
    (2, 'Soursop Bliss Juice', 'Freshly pressed soursop with a hint of lime.', 5.00, 1, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=400'),
    (2, 'Iced Hibiscus Tea', 'Refreshing local sorrel tea.', 4.00, 1, 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?auto=format&fit=crop&q=80&w=400')
  ON CONFLICT DO NOTHING;

  -- 3. UPGRADE SOUP KITCHEN TO GOURMET
  -- Ensure Listing 5 exists and is anchored to Store 5
  INSERT INTO listings (id, title, description, type, category, store_id, price, status, creator_id, images) 
  SELECT 5, 'Gourmet Soup Kitchen', 'Crafted soups, warm hearts. Premium island flavors.', 'product', 'food', 5, 0, 'active', 2, ARRAY['https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=1000']
  WHERE EXISTS (SELECT 1 FROM users WHERE user_id = 2)
  ON CONFLICT (id) DO UPDATE SET creator_id = 2, type = 'product', store_id = 5;

  -- Gourmet Sections
  INSERT INTO menu_sections (section_id, store_id, listing_id, section_name, priority) 
  SELECT * FROM (VALUES 
    (3, 5, 5, 'Gourmet Soups', 1), 
    (4, 5, 5, 'Premium Sides', 2), 
    (5, 5, 5, 'Community Heart', 3)
  ) AS v(section_id, store_id, listing_id, section_name, priority)
  WHERE EXISTS (SELECT 1 FROM listings WHERE id = 5)
  ON CONFLICT (section_id) DO NOTHING;

  -- Gourmet Menu Items (8 soups)
  INSERT INTO menu_items (section_id, item_name, description, price, listing_id, image_url, badges)
  VALUES 
    (3, 'French Onion Soup', 'Classic onion soup with toasted baguette and melted emmental.', 9.50, 5, 'https://images.unsplash.com/photo-1510627489930-0c1b0ba0cc11?auto=format&fit=crop&q=80&w=400', '["Signature"]'),
    (3, 'Caribbean Lentil Soup', 'Hearty lentils infused with local pimento and ginger.', 8.00, 5, 'https://images.unsplash.com/photo-1547592115-f5d933336712?auto=format&fit=crop&q=80&w=400', '["Vegan"]'),
    (3, 'Nevis Peak Watercress', 'Vibrant green soup with fresh mountain cress.', 7.50, 5, null, '["Fresh"]'),
    (3, 'Coastal Fish Soup', 'Rich broth with local snapper, roots, and thyme.', 12.00, 5, 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=80&w=400', '["Local Catch"]'),
    (3, 'Creamy Island Pumpkin', 'Roasted pumpkin with coconut cream and nutmeg.', 8.50, 5, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?auto=format&fit=crop&q=80&w=400', '["Creamy"]'),
    (3, 'Roasted Tomato Basil', 'Fire-roasted garden tomatoes with fresh basil.', 7.00, 5, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=400', '["Classic"]'),
    (3, 'Smoky Split Pea', 'Traditional split pea with hardwood smoked hints.', 8.00, 5, null, '["Hearty"]'),
    (3, 'Seafood Chowder', 'Velvety cream broth with clams, corn, and lobster bits.', 11.00, 5, 'https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=400', '["Premium"]'),
    -- Sides
    (4, 'Garlic Herb Bread', 'Warm baguette with local herb butter.', 3.50, 5, null, '["Side"]'),
    (4, 'Plantain Crisps', 'Hand-cut green plantain chips.', 4.00, 5, null, '["Side"]'),
    (4, 'Garden Salad Cup', 'Nevisian greens with island vinaigrette.', 5.00, 5, null, '["Side"]'),
    -- Community
    (5, 'Community Warm Meal', 'A hearty soup and bread for someone in need.', 5.00, 5, null, '["Donation"]'),
    (5, 'Sponsor a Family', 'Feeds a family of four for a day.', 20.00, 5, null, '["Donation"]')
  ON CONFLICT DO NOTHING;

  -- Update donation flag
  UPDATE menu_items SET donation_suggested = true WHERE section_id = 5;

  RAISE NOTICE 'Gourmet kitchen seeding completed successfully';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Gourmet kitchen seeding skipped: %', SQLERRM;
END $$;
