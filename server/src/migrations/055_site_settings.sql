-- Migration: Site-wide theme settings
-- Run: psql -d $DATABASE_URL -f 055_site_settings.sql

-- Site settings table for admin theme control
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by INTEGER REFERENCES users(user_id)
);

-- Default settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('theme', 'system', 'string', 'Default theme: light, dark, or system'),
('primary_color', '#0d9488', 'string', 'Primary brand color (teal)'),
('accent_color', '#14b8a6', 'string', 'Accent color'),
('site_name', 'IslandHub', 'string', 'Platform name'),
('site_description', 'Caribbean Marketplace', 'string', 'Platform description'),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode')
ON CONFLICT (setting_key) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);