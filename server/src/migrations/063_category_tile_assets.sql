-- Migration: Category Tile Assets Management
-- Creates table for managing homepage category tile images

CREATE TABLE IF NOT EXISTS category_tile_assets (
    id SERIAL PRIMARY KEY,
    tile_key VARCHAR(50) NOT NULL UNIQUE,  -- e.g., 'food', 'products', 'services', 'events', 'community', 'rentals', 'tours', 'transport', 'campaigns'
    tile_label VARCHAR(100) NOT NULL,      -- Display label e.g., 'Food & Dining', 'Local Shopping'
    tile_emoji VARCHAR(10) DEFAULT '📦',    -- Emoji fallback when no image
    image_url TEXT,                         -- Uploaded image URL
    image_alt TEXT,                         -- Alt text for accessibility
    sort_order INTEGER DEFAULT 0,           -- Display order
    is_active BOOLEAN DEFAULT true,         -- Enable/disable tile
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_category_tile_assets_active ON category_tile_assets(is_active);
CREATE INDEX IF NOT EXISTS idx_category_tile_assets_sort ON category_tile_assets(sort_order);

-- Seed default category tiles (matching the homepage categoryTiles array)
INSERT INTO category_tile_assets (tile_key, tile_label, tile_emoji, sort_order, is_active) VALUES
    ('food', 'Food & Dining', '🍽️', 1, true),
    ('products', 'Shopping', '🛍️', 2, true),
    ('services', 'Services', '🛠️', 3, true),
    ('rentals', 'Rentals', '🏠', 4, true),
    ('tours', 'Tours', '🗺️', 5, true),
    ('transport', 'Transport', '🚕', 6, true),
    ('events', 'Events', '🎫', 7, true),
    ('campaigns', 'Campaigns', '❤️', 8, true),
    ('community', 'Community', '🌴', 9, true)
ON CONFLICT (tile_key) DO UPDATE SET
    tile_label = EXCLUDED.tile_label,
    tile_emoji = EXCLUDED.tile_emoji,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_category_tile_assets_updated_at ON category_tile_assets;
CREATE TRIGGER update_category_tile_assets_updated_at
    BEFORE UPDATE ON category_tile_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();