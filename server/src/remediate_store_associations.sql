-- Remediation Script for Store-Listing Associations

-- 1. Fix Listings that are missing store_id or have incorrect vendor/store combinations
-- Listing 1 (Ital Vegan Kitchen) belongs to Store 1, but creator_id is 2. 
-- User 3 owns Store 1.
UPDATE listings SET creator_id = 3 WHERE id = 1 AND title = 'Ital Vegan Kitchen';

-- 2. Fix Menu Items that point to listings in the wrong store
-- We will nullify the listing_id if it's a mismatch, allowing the menu_item's own data 
-- (item_name, price, etc.) to be the source of truth, or we find the correct match.

-- Item 51 (Oceanview Villa) is in Store 10's section but points to Listing 10 (Store 1)
-- Listing 3 (Oceanview 2BR Apartment) belongs to Store 3, or maybe there's a missing listing for Store 10?
-- For now, let's just clear the incorrect listing associations for these specific items.

UPDATE menu_items mi
SET listing_id = NULL
FROM menu_sections ms, listings l
WHERE mi.section_id = ms.section_id
  AND mi.listing_id = l.id
  AND l.store_id != ms.store_id;

-- 3. Correct Pulse Island Apparel (Store 20) vs 211 Island Apparel (Store 4)
-- Ensure 'Island Pulse Tee' for Store 20 uses Listing 70, not Listing 4.
-- If any menu items for Store 20 point to 4, redirect them to 70.

UPDATE menu_items mi
SET listing_id = 70
FROM menu_sections ms
WHERE mi.section_id = ms.section_id
  AND ms.store_id = 20
  AND mi.item_name = 'Island Pulse Tee';

-- 4. Clean up any listings that belong to User 2 but are in the wrong store by default
-- User 2 owns MANY stores. Listings created without store_id might have defaulted to store 1 or 4.
-- This is harder to automate perfectly, but we can fix the ones we know.

-- Verification query
-- SELECT mi.item_id, mi.item_name, ms.store_id as section_store, l.store_id as listing_host 
-- FROM menu_items mi 
-- JOIN menu_sections ms ON mi.section_id = ms.section_id 
-- JOIN listings l ON mi.listing_id = l.id 
-- WHERE l.store_id != ms.store_id;
