-- Add moderation columns to listings if not exists
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

-- Create content_moderation_logs table
CREATE TABLE IF NOT EXISTS content_moderation_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    content_type VARCHAR(50),
    reference_id INTEGER,
    content TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    categories JSONB,
    scores JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for moderation status
CREATE INDEX IF NOT EXISTS idx_listings_moderation_status ON listings(moderation_status);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_created ON content_moderation_logs(created_at DESC);

COMMENT ON COLUMN listings.moderation_status IS 'pending, approved, flagged';
COMMENT ON COLUMN listings.moderation_notes IS 'Notes from moderation review';