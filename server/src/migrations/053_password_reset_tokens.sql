-- Migration: Password reset tokens table
-- Run: psql -d $DATABASE_URL -f 053_password_reset_tokens.sql

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_password_reset_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);

-- Add method column to user_2fa for dual 2FA options (email_otp / authenticator)
ALTER TABLE user_2fa ADD COLUMN IF NOT EXISTS method VARCHAR(20) DEFAULT 'authenticator';
ALTER TABLE user_2fa ADD COLUMN IF NOT EXISTS email_otp_secret VARCHAR(255);
ALTER TABLE user_2fa ADD COLUMN IF NOT EXISTS email_otp_enabled BOOLEAN DEFAULT FALSE;