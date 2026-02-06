-- Migration 032: Promotional Refinements

-- Add layout and style config to hero_assets
ALTER TABLE hero_assets 
ADD COLUMN IF NOT EXISTS layout_template VARCHAR(50) DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS style_config JSONB DEFAULT '{}';

-- Clean up site_sections/homepage_sections and recreate with correct schema
DROP TABLE IF EXISTS site_sections CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;

CREATE TABLE site_sections (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(store_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) DEFAULT 'standard', -- 'homepage', 'store_kitchen', 'store_sidebar'
    title VARCHAR(255),
    body TEXT,
    cta_text VARCHAR(100),
    cta_link VARCHAR(255),
    image_url TEXT,
    list_items JSONB DEFAULT '[]', -- For multi-item sections like Kitchen Story
    style_config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_store_section UNIQUE (store_id, name)
);

-- Seed homepage impact section
INSERT INTO site_sections (name, section_type, title, body, cta_text, cta_link, style_config)
VALUES (
    'empowering_economies', 
    'homepage', 
    'Empowering Local Island Economies', 
    'Connected directly to local artisans, restaurants, and community causes. Support the islands with every purchase.',
    'Become a Vendor',
    '/register',
    '{"from": "#0d9488", "to": "#059669"}'
) ON CONFLICT DO NOTHING;

-- Index for performance
CREATE INDEX idx_site_sections_active ON site_sections(is_active) WHERE is_active = true;
CREATE INDEX idx_site_sections_store_id ON site_sections(store_id);
CREATE INDEX idx_site_sections_type ON site_sections(section_type);
