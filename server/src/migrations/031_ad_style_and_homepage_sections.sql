-- Migration 031: Ad Style Config and Homepage Sections
-- Adds granular visual controls to advertisements and creates dynamic homepage sections

-- Add style config to ad_spaces
ALTER TABLE ad_spaces
ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{}';

-- Add style config and layout template to advertisements
ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS layout_template VARCHAR(50) DEFAULT 'standard';

-- Create homepage sections table
CREATE TABLE IF NOT EXISTS homepage_sections (
    section_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'empowering_economies', 'impact_stats'
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    body TEXT,
    image_url TEXT,
    asset_type VARCHAR(20) DEFAULT 'image', -- 'image', 'video'
    cta_text VARCHAR(100),
    cta_link TEXT,
    sponsor_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    style_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed Empowering Economies section
INSERT INTO homepage_sections (name, title, subtitle, body, cta_text, cta_link)
VALUES (
    'empowering_economies', 
    'Empowering Local Island Economies', 
    'We provide the tools for artisans, farmers, and entrepreneurs to reach a global market while keeping more wealth in the community.',
    'Connected directly to local artisans, restaurants, and community causes. Support the islands with every purchase.',
    'Become a Vendor',
    '/register'
) ON CONFLICT (name) DO NOTHING;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active, display_order);
