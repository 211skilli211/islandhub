-- Migration: Add template columns to stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS template_id VARCHAR(50);
ALTER TABLE stores ADD COLUMN IF NOT EXISTS template_config JSONB DEFAULT '{}';

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_stores_template_id ON stores(template_id);
