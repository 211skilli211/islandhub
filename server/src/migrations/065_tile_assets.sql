-- Migration 065: Create Tile Assets Table
-- Stores custom images for homepage category tiles

CREATE TABLE IF NOT EXISTS tile_assets (
    id SERIAL PRIMARY KEY,
    tile_key VARCHAR(50) NOT NULL UNIQUE,
    tile_label VARCHAR(100) NOT NULL,
    asset_url TEXT,
    asset_type VARCHAR(20) DEFAULT 'image',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial tile assets based on homepage category tiles
INSERT INTO tile_assets (tile_key, tile_label, display_order) VALUES
    ('food', 'Food & Dining', 1),
    ('products', 'Shopping', 2),
    ('services', 'Services', 3),
    ('rentals', 'Rentals', 4),
    ('tours', 'Tours', 5),
    ('transport', 'Transport', 6),
    ('events', 'Events', 7),
    ('campaigns', 'Campaigns', 8),
    ('community', 'Community', 9)
ON CONFLICT (tile_key) DO NOTHING;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tile_assets_active ON tile_assets(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tile_assets_order ON tile_assets(display_order);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_tile_assets_updated_at ON tile_assets;
CREATE TRIGGER update_tile_assets_updated_at
    BEFORE UPDATE ON tile_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();