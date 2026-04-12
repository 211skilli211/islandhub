-- ============================================
-- Correct Store Ownership & Sync Branding
-- ============================================

-- 1. Reef Runner Boat Rentals (User 4)
UPDATE stores SET 
    vendor_id = 4,
    name = (CASE WHEN name = 'Reef Runner Boat Rentals' THEN name ELSE 'Reef Runner Boat Rentals' END)
WHERE store_id = 2;

-- 2. Caribbean Heights Apartment (User 5)
UPDATE stores SET 
    vendor_id = 5,
    name = 'Caribbean Heights Apartment'
WHERE store_id = 3;

-- 3. Ital Vegan Kitchen (User 3)
UPDATE stores SET 
    vendor_id = 3,
    name = 'Ital Vegan Kitchen'
WHERE store_id = 1;

-- 4. Pulse Island Apparel / 211 Island Apparel (User 6)
UPDATE stores SET 
    vendor_id = 6,
    name = 'Pulse Island Apparel'
WHERE store_id = 4;

-- 5. Signature Island Tours (User 2)
UPDATE stores SET 
    vendor_id = 2,
    name = 'Signature Island Tours'
WHERE store_id = 13;

-- Add professional imagery to stores table as well (to match the vendors Join fallback)
UPDATE stores s SET 
    logo_url = v.logo_url,
    banner_url = v.banner_url,
    branding_color = v.branding_color
FROM vendors v 
WHERE s.vendor_id = v.user_id;
