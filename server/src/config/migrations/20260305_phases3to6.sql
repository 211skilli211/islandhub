-- Migration: Phases 3-6 - Groups, Events, Stories, Moderation
-- Date: 2026-03-05

-- ==================== PHASE 3: COMMUNITY GROUPS ====================

-- 1. Create groups table
CREATE TABLE IF NOT EXISTS groups (
    group_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    avatar_url TEXT,
    privacy TEXT CHECK (privacy IN ('public', 'private', 'invite_only')) DEFAULT 'public',
    category TEXT,
    tags TEXT[],
    owner_id INTEGER NOT NULL REFERENCES users(user_id),
    member_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_groups_slug ON groups(slug);
CREATE INDEX idx_groups_owner ON groups(owner_id);
CREATE INDEX idx_groups_category ON groups(category);

-- 2. Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'admin', 'moderator', 'member', 'restricted')) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- 3. Create group_posts table
CREATE TABLE IF NOT EXISTS group_posts (
    post_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_announcement BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_posts_group ON group_posts(group_id);
CREATE INDEX idx_group_posts_user ON group_posts(user_id);

-- 4. Create group_join_requests table
CREATE TABLE IF NOT EXISTS group_join_requests (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- ==================== PHASE 4: ENHANCED EVENTS ====================

-- 5. Create standalone events table
CREATE TABLE IF NOT EXISTS community_events (
    event_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    location TEXT,
    location_type TEXT CHECK (location_type IN ('physical', 'virtual', 'hybrid')) DEFAULT 'physical',
    virtual_link TEXT,
    address TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    timezone TEXT DEFAULT 'UTC',
    capacity INTEGER,
    attendee_count INTEGER DEFAULT 0,
    interested_count INTEGER DEFAULT 0,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule TEXT,
    organizer_id INTEGER NOT NULL REFERENCES users(user_id),
    group_id INTEGER REFERENCES groups(group_id),
    visibility TEXT CHECK (visibility IN ('public', 'private', 'unlisted')) DEFAULT 'public',
    category TEXT,
    tags TEXT[],
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_community_events_start ON community_events(start_time);
CREATE INDEX idx_community_events_organizer ON community_events(organizer_id);
CREATE INDEX idx_community_events_group ON community_events(group_id);

-- 6. Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES community_events(event_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('attending', 'interested', 'not_attending')) DEFAULT 'interested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX idx_event_rsvps_user ON event_rsvps(user_id);

-- 7. Create event_discussions table
CREATE TABLE IF NOT EXISTS event_discussions (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES community_events(event_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================== PHASE 5: STORIES ====================

-- 8. Create stories table
CREATE TABLE IF NOT EXISTS stories (
    story_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video')) DEFAULT 'image',
    caption TEXT,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stories_user ON stories(user_id);
CREATE INDEX idx_stories_expires ON stories(expires_at);

-- 9. Create story_views table
CREATE TABLE IF NOT EXISTS story_views (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_views_story ON story_views(story_id);
CREATE INDEX idx_story_views_user ON story_views(user_id);

-- 10. Create story_reactions table
CREATE TABLE IF NOT EXISTS story_reactions (
    id SERIAL PRIMARY KEY,
    story_id INTEGER NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reaction TEXT DEFAULT 'view',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(story_id, user_id, reaction)
);

-- 11. Create story_highlights table
CREATE TABLE IF NOT EXISTS story_highlights (
    highlight_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    cover_story_id INTEGER REFERENCES stories(story_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_story_highlights_user ON story_highlights(user_id);

-- 12. Create highlight_stories table (many-to-many)
CREATE TABLE IF NOT EXISTS highlight_stories (
    highlight_id INTEGER NOT NULL REFERENCES story_highlights(highlight_id) ON DELETE CASCADE,
    story_id INTEGER NOT NULL REFERENCES stories(story_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (highlight_id, story_id)
);

-- ==================== PHASE 6: MODERATION ====================

-- 13. Create content_reports table
CREATE TABLE IF NOT EXISTS content_reports (
    report_id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES users(user_id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_reports_content ON content_reports(content_type, content_id);
CREATE INDEX idx_content_reports_reporter ON content_reports(reporter_id);
CREATE INDEX idx_content_reports_status ON content_reports(status);

-- 14. Create content_flags table (automated moderation)
CREATE TABLE IF NOT EXISTS content_flags (
    id SERIAL PRIMARY KEY,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    flag_type TEXT NOT NULL,
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Create moderation_logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
    id SERIAL PRIMARY KEY,
    moderator_id INTEGER NOT NULL REFERENCES users(user_id),
    action TEXT NOT NULL,
    content_type TEXT,
    content_id INTEGER,
    target_user_id INTEGER REFERENCES users(user_id),
    reason TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Create user_appeals table
CREATE TABLE IF NOT EXISTS user_appeals (
    appeal_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content_type TEXT NOT NULL,
    content_id INTEGER NOT NULL,
    original_action TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES users(user_id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
