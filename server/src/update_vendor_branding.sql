-- ============================================
-- Update Vendor Branding with Unique Assets
-- ============================================

-- 1. Ital Vegan Kitchen (User 3)
UPDATE vendors SET 
    logo_url = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=200',
    banner_url = 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&q=80&w=1200',
    branding_color = '#10b981', -- Emerald
    bio = 'Healing the world one plate at a time with organic, plant-based island dishes.'
WHERE user_id = 3;

-- 2. Reef Runner Boat Rentals (User 4)
UPDATE vendors SET 
    logo_url = 'https://images.unsplash.com/photo-1544413647-ad342137996a?auto=format&fit=crop&q=80&w=200',
    banner_url = 'https://images.unsplash.com/photo-1544522613-e5ef85297312?auto=format&fit=crop&q=80&w=1200',
    branding_color = '#06b6d4', -- Cyan
    bio = 'Elite boat rentals and coastal excursions. Explore the bays of St. Kitts in style.'
WHERE user_id = 4;

-- 3. Island Stays (User 5)
UPDATE vendors SET 
    logo_url = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=200',
    banner_url = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
    branding_color = '#8b5cf6', -- Violet
    bio = 'Curated luxury accommodations, from beachfront villas to modern hilltop apartments.'
WHERE user_id = 5;

-- 4. Pulse Island Apparel (User 6)
UPDATE vendors SET 
    logo_url = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=200',
    banner_url = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
    branding_color = '#f43f5e', -- Rose
    bio = 'The rhythm of the island in every thread. Modern streetwear designed and printed locally.'
WHERE user_id = 6;
