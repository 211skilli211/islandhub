-- Migration 010: Fix Menu Tables and Align with Controller Logic
-- Target Database: PostgreSQL

-- 1. Fix menu_sections table
ALTER TABLE menu_sections
    ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Fix menu_items table
ALTER TABLE menu_items
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS donation_suggested BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- No need to rename section_name/item_name as they already follow the user's preferred naming convention (checked via \d).
-- The controller will be updated to match the database.
