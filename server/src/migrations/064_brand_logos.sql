-- Migration 064: Brand Logos for Marquee
-- Stores partner/brand logo references for the infinite marquee slider

CREATE TABLE IF NOT EXISTS brand_logos (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT '',
    image_url TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for active logos sorted by order
CREATE INDEX IF NOT EXISTS idxbrand_logos_active_sort ON brand_logos (is_active, sort_order);

-- Insert some default placeholder brands (SVG logos from Wikimedia)
INSERT INTO brand_logos (name, image_url, sort_order) VALUES
    ('Adidas', 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Logo_Adidas.svg', 1),
    ('Nike', 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Logo_Nike.svg', 2),
    ('H&M', 'https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg', 3),
    ('Puma', 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Puma_Logo.svg', 4),
    ('McDonalds', 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg', 5)
ON CONFLICT DO NOTHING;
