-- Add visibility column to user_posts for privacy settings
-- Date: 2026-03-05

ALTER TABLE user_posts
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private'));

-- Add created_at if not exists (should already exist but ensuring)
ALTER TABLE user_posts
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Index for faster post queries
CREATE INDEX IF NOT EXISTS idx_user_posts_created_at ON user_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_posts_visibility ON user_posts(visibility);
