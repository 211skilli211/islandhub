-- Migration: Create promotional_banners table
-- Date: 2026-01-24
-- Purpose: Enable dual-mode banner system (desktop hero + mobile floating)

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS promotional_banners CASCADE;

-- Create promotional_banners table with complete schema
CREATE TABLE promotional_banners (
    banner_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT,
    target_url TEXT,
    location VARCHAR(50) NOT NULL DEFAULT 'marketplace_hero',
    color_theme VARCHAR(20) NOT NULL DEFAULT 'teal',
    mobile_mode VARCHAR(20) NOT NULL DEFAULT 'hero', -- 'hero' or 'floating'
    dismissible BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create unique index to enforce one active banner per location
CREATE UNIQUE INDEX idx_promotional_banners_active_location
ON promotional_banners (location)
WHERE is_active = TRUE;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_banner_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call update function before each update
CREATE TRIGGER trg_update_banner_timestamp
BEFORE UPDATE ON promotional_banners
FOR EACH ROW
EXECUTE FUNCTION update_banner_timestamp();

-- Insert sample banner for testing (optional)
INSERT INTO promotional_banners (title, subtitle, location, color_theme, mobile_mode, is_active)
VALUES ('Welcome to IslandHub', 'Your premier Caribbean marketplace', 'home_hero', 'teal', 'hero', true)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE promotional_banners IS 'Promotional banners for hero sections with dual-mode rendering (desktop hero embed + mobile floating card)';
COMMENT ON COLUMN promotional_banners.mobile_mode IS 'Display mode: hero (embedded in hero section) or floating (mobile overlay with dismiss button)';
COMMENT ON COLUMN promotional_banners.dismissible IS 'Whether mobile floating banners can be dismissed by users';
COMMENT ON INDEX idx_promotional_banners_active_location IS 'Ensures only one active banner per location at a time';
