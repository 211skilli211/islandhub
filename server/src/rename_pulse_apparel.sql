-- ============================================
-- Respect User Edits: Rename Pulse to 211 Island Apparel
-- ============================================

UPDATE stores SET 
    name = '211 Island Apparel',
    slug = '211-island-apparel' -- Best practice to update slug too for URL consistency
WHERE store_id = 4; -- Explicitly targeting the store ID for stability
