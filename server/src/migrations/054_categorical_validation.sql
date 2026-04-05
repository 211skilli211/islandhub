-- Migration: Database Categorical Validation & Integrity
-- Run: psql -d $DATABASE_URL -f 054_categorical_validation.sql

-- ============================================================================
-- STEP 1: Identify Categorical Mismatches
-- ============================================================================

-- Check listings with invalid category_id
SELECT 'Listings with invalid category_id' as check_name, COUNT(*) as count
FROM listings l
LEFT JOIN categories c ON c.id = l.category_id
WHERE l.category_id IS NOT NULL AND c.id IS NULL;

-- Check stores with invalid category_id
SELECT 'Stores with invalid category_id' as check_name, COUNT(*) as count
FROM stores s
LEFT JOIN categories c ON c.id = s.category_id
WHERE s.category_id IS NOT NULL AND c.id IS NULL;

-- Check menu_items with invalid category_id
SELECT 'Menu items with invalid category_id' as check_name, COUNT(*) as count
FROM menu_items mi
LEFT JOIN categories c ON c.id = mi.category_id
WHERE mi.category_id IS NOT NULL AND c.id IS NULL;

-- ============================================================================
-- STEP 2: Fix Orphaned Records - Set null where category doesn't exist
-- ============================================================================

-- Fix listings: set category_id to null where invalid
UPDATE listings l
SET category_id = NULL
WHERE l.category_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = l.category_id);

-- Fix stores: set category_id to null where invalid
UPDATE stores s
SET category_id = NULL
WHERE s.category_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = s.category_id);

-- Fix menu_items: set category_id to null where invalid
UPDATE menu_items mi
SET category_id = NULL
WHERE mi.category_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.id = mi.category_id);

-- ============================================================================
-- STEP 3: Add Foreign Key Constraints (if not exist)
-- ============================================================================

-- Listings -> Categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_category_fkey'
    ) THEN
        ALTER TABLE listings ADD CONSTRAINT listings_category_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Stores -> Categories
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stores_category_fkey'
    ) THEN
        ALTER TABLE stores ADD CONSTRAINT stores_category_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Menu Items -> Categories  
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'menu_items_category_fkey'
    ) THEN
        ALTER TABLE menu_items ADD CONSTRAINT menu_items_category_fkey 
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 4: Add Ownership Mapping Validation
-- ============================================================================

-- Ensure all listings have valid vendor_id (user_id)
SELECT 'Listings with invalid vendor_id' as check_name, COUNT(*) as count
FROM listings l
WHERE l.vendor_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = l.vendor_id);

-- Fix: Set vendor_id to null where user doesn't exist
UPDATE listings l
SET vendor_id = NULL
WHERE l.vendor_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = l.vendor_id);

-- Ensure all stores have valid user_id
SELECT 'Stores with invalid user_id' as check_name, COUNT(*) as count
FROM stores s
WHERE s.user_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = s.user_id);

-- Fix: Set user_id to null where user doesn't exist
UPDATE stores s
SET user_id = NULL
WHERE s.user_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = s.user_id);

-- ============================================================================
-- STEP 5: Add Ownership Foreign Keys (if not exist)
-- ============================================================================

-- Listings -> Users (vendor_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'listings_vendor_fkey'
    ) THEN
        ALTER TABLE listings ADD CONSTRAINT listings_vendor_fkey 
        FOREIGN KEY (vendor_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Stores -> Users (owner)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'stores_user_fkey'
    ) THEN
        ALTER TABLE stores ADD CONSTRAINT stores_user_fkey 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================================
-- STEP 6: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_vendor ON listings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stores_user ON stores(user_id);

-- ============================================================================
-- STEP 7: Verification - Show final counts
-- ============================================================================

SELECT 'Categories' as table_name, COUNT(*) as count FROM categories;
SELECT 'Listings with category' as check_name, COUNT(*) as count FROM listings WHERE category_id IS NOT NULL;
SELECT 'Stores with category' as check_name, COUNT(*) as count FROM stores WHERE category_id IS NOT NULL;
SELECT 'Listings with vendor' as check_name, COUNT(*) as count FROM listings WHERE vendor_id IS NOT NULL;
SELECT 'Stores with owner' as check_name, COUNT(*) as count FROM stores WHERE user_id IS NOT NULL;

-- Final verification - should show 0 for mismatches
SELECT 'Verification: Orphaned listings' as check_name, COUNT(*) as count
FROM listings l
LEFT JOIN categories c ON c.id = l.category_id
WHERE l.category_id IS NOT NULL AND c.id IS NULL;