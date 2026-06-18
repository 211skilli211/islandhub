-- Migration: Phase 2 - Engagement Systems (Messaging, Gamification)
-- Date: 2026-03-05

-- 1. Enhance notifications table with more features
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS action_url TEXT,
ADD COLUMN IF NOT EXISTS actor_id INTEGER REFERENCES users(user_id);

-- 2. Create conversations table for enhanced messaging
CREATE TABLE IF NOT EXISTS conversations (
    conversation_id SERIAL PRIMARY KEY,
    type TEXT CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
    name TEXT,
    avatar_url TEXT,
    created_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_conversations_created_by ON conversations(created_by);

-- 3. Create conversation_participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMP,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON conversation_participants(user_id);

-- 4. Update messages table to link to conversations
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS conversation_id INTEGER REFERENCES conversations(conversation_id),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 5. Create user_reputation table for gamification
CREATE TABLE IF NOT EXISTS user_reputation (
    user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    posts_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    likes_received INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_active DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create badges table
CREATE TABLE IF NOT EXISTS badges (
    badge_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon_url TEXT,
    points_value INTEGER DEFAULT 0,
    criteria JSONB,
    category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    badge_id INTEGER NOT NULL REFERENCES badges(badge_id),
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- 8. Insert default badges
INSERT INTO badges (name, description, icon_url, points_value, category) VALUES
    ('First Post', 'Created your first post', '🎉', 10, 'milestone'),
    ('Active Contributor', 'Created 10+ posts', '📝', 50, 'milestone'),
    ('Conversation Starter', 'Posted 5+ comments', '💬', 25, 'engagement'),
    ('Community Builder', 'Got 10+ followers', '🤝', 75, 'social'),
    ('Helpful Hand', 'Received 10 helpful marks', '🤗', 100, 'quality'),
    ('Early Bird', 'Joined in the first month', '🌅', 50, 'special'),
    ('Verified Islander', 'Completed profile verification', '✅', 30, 'verification'),
    ('Top Supporter', 'Liked 100+ posts', '❤️', 40, 'engagement')
ON CONFLICT (name) DO NOTHING;

-- 9. Create user_blocks table
CREATE TABLE IF NOT EXISTS user_blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
