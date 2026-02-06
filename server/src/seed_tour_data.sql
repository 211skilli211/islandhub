-- ============================================
-- Tour Hub Seed Data (Corrected Schema)
-- ============================================

-- 1. Create a Premium Tour Vendor (User 2 is Admin '211' / skilli211beng@gmail.com)
INSERT INTO stores (vendor_id, name, slug, category, subtype, description)
VALUES (2, 'Signature Island Tours', 'signature-island-tours', 'Service', 'Tours', 'Curated premium experiences in St. Kitts & Nevis.')
ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description;

-- Update Vendor Profile with Branding Assets
UPDATE vendors SET 
    logo_url = 'https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&q=80&w=200',
    banner_url = 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=1200',
    branding_color = '#f97316', -- Orange
    bio = 'Your gateway to the most exclusive and authentic island adventures in St. Kitts & Nevis. From land to sea, we curate the best.',
    is_featured = true
WHERE user_id = 2;

-- 2. Clear existing tours for this vendor to avoid duplicates during dev
DELETE FROM listings WHERE store_id = (SELECT store_id FROM stores WHERE slug = 'signature-island-tours');

-- 3. Seed Signature Tours
INSERT INTO listings (
    title, description, price, type, category, sub_category, 
    creator_id, store_id, duration, capacity, location, addons, status, featured, images, tour_category
)
VALUES 
(
    'St. Kitts Scenic Railway & Catamaran Combo', 
    'The unique "Last Railway in the West Indies" combined with a luxury catamaran cruise. Experience the island by rail and sea.', 
    165.00, 'service', 'Service', 'rail', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    '7 hours', 60, 'Basseterre Railway Station', 
    '[{"name": "Lunch Buffet", "price": 0}, {"name": "Open Bar", "price": 0}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=800'],
    'rail'
),
(
    'Mount Liamuiga Volcano Trek', 
    'A challenging hike to the summit of the sleeping giant. Breathtaking views of neighboring islands.', 
    95.00, 'service', 'Service', 'land', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    '5 hours', 15, 'St. Pauls Village', 
    '[{"name": "Hiking Poles", "price": 10}, {"name": "Packed Lunch", "price": 15}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800'],
    'land'
),
(
    'ATV Rainforest Adventure', 
    'Ride through tropical rainforests and historic sugar plantations on a powerful 4x4 ATV.', 
    110.00, 'service', 'Service', 'adventure', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    '3 hours', 12, 'Wingfield Estate', 
    '[{"name": "GoPro Rental", "price": 35}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1533038590840-1cde6b66b7c6?auto=format&fit=crop&w=800'],
    'adventure'
),
(
    'Caribbean Sunset Catamaran Sail', 
    'Sip cocktails as the sun dips below the horizon. Includes snorkeling at a secluded cove.', 
    85.00, 'service', 'Service', 'sea', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    '4 hours', 40, 'Port Zante Marina', 
    '[{"name": "Premium Champagne", "price": 90}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800'],
    'sea'
),
(
    'Deep Sea Fishing Expedition', 
    'Hunt for Marlin, Wahoo, and Mahi-Mahi with our expert crew in the deep blue waters.', 
    650.00, 'service', 'Service', 'charter', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    'Full Day', 6, 'Marina at Christophe Harbour', 
    '[{"name": "Private Chef", "price": 200}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1544551763-47a0159f963f?auto=format&fit=crop&w=800'],
    'charter'
),
(
    'Historic Basseterre & Brimstone Hill Tour', 
    'A journey through time. Visit the "Gibraltar of the West Indies" and colonial landmarks.', 
    75.00, 'service', 'Service', 'culture', 2, 
    (SELECT store_id FROM stores WHERE slug = 'signature-island-tours'),
    '4 hours', 20, 'The Circus, Basseterre', 
    '[{"name": "Museum Entry", "price": 0}]'::jsonb,
    'active', true, 
    ARRAY['https://images.unsplash.com/photo-1580619305218-8423a7f29b8c?auto=format&fit=crop&w=800'],
    'culture'
);
