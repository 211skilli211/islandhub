
-- Migration: Add Profile and Social Features
-- Date: 2026-01-23

-- Expand users table for profile customization
ALTER TABLE users
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN banner_image_url TEXT,
ADD COLUMN banner_color TEXT,
ADD COLUMN bio TEXT;

-- Create user_posts table for community updates
CREATE TABLE user_posts (
  post_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  title TEXT,
  content TEXT,
  media_url TEXT,
  media_type TEXT, -- 'image', 'video', 'audio'
  category TEXT,   -- 'food', 'events', 'deals', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create text_marquee table for scrolling updates
CREATE TABLE text_marquee (
  marquee_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add branding-specific assets to vendors or users
-- (Using users for general branding, or we can add to vendors table if specific)
ALTER TABLE vendors
ADD COLUMN branding_color TEXT,
ADD COLUMN secondary_color TEXT,
ADD COLUMN promo_video_url TEXT,
ADD COLUMN audio_intro_url TEXT;
