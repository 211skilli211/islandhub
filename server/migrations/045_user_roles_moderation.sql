-- Add new roles and columns for enhanced user categorization
-- Run on Neon database

-- Add new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_category VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS vendor_category VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS driver_category VARCHAR(50);

-- Update existing vendor drivers to have category
UPDATE users SET role_category = 'vendor' WHERE role LIKE 'vendor%';
UPDATE users SET role_category = 'driver' WHERE role LIKE 'driver%';

-- Add moderator role to allowed roles if needed
-- Note: This is informational, the application handles role validation

-- Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_category ON users(role_category);
CREATE INDEX IF NOT EXISTS idx_users_role_prefix ON users(substring(role from 1 for 7));

-- Create moderation flags table for content flagging system
CREATE TABLE IF NOT EXISTS moderation_flags (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id INTEGER NOT NULL,
    flagged_by INTEGER REFERENCES users(user_id),
    flag_reason VARCHAR(100) NOT NULL,
    flag_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(user_id),
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_moderation_flags_status ON moderation_flags(status);
CREATE INDEX IF NOT EXISTS idx_moderation_flags_content ON moderation_flags(content_type, content_id);

-- Create internal notes table
CREATE TABLE IF NOT EXISTS internal_notes (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    user_id INTEGER REFERENCES users(user_id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_entity ON internal_notes(entity_type, entity_id);
