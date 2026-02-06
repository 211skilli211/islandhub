-- ============================================
-- Tour Hub Metadata Extension
-- Purpose: Support duration, capacity, and specific metadata for premium tours.
-- ============================================

-- 1. Extend Listings with Tour-specific fields
-- Note: 'sub_category' already exists and will be used for silo filtering (land, sea, rail, etc.)
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS duration VARCHAR(100),    -- e.g., "3 hours", "Full Day"
ADD COLUMN IF NOT EXISTS capacity INTEGER,         -- Max participants
ADD COLUMN IF NOT EXISTS location TEXT,            -- Pickup or start point
ADD COLUMN IF NOT EXISTS tour_category VARCHAR(50), -- land, sea, rail, etc.
ADD COLUMN IF NOT EXISTS addons JSONB DEFAULT '[]'; -- Optional meals, transport, etc.

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_listings_sub_category ON listings(sub_category);
CREATE INDEX IF NOT EXISTS idx_listings_tour_category_column ON listings(tour_category);
CREATE INDEX IF NOT EXISTS idx_listings_tour_status ON listings(category) WHERE category = 'service' AND sub_category = 'tour';
