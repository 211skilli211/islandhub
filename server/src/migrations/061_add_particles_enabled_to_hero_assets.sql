-- Migration: Add particles_enabled to hero_assets table
-- Enables per-page particle effect toggle in admin

ALTER TABLE hero_assets ADD COLUMN IF NOT EXISTS particles_enabled BOOLEAN DEFAULT true;

-- Create index for future queries
CREATE INDEX IF NOT EXISTS idx_hero_assets_particles ON hero_assets(page_key) WHERE particles_enabled = true;
