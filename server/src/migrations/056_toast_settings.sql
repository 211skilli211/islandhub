-- Migration: Toast style settings
-- Run: psql -d $DATABASE_URL -f 056_toast_settings.sql

-- Add toast_style to site_settings table
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) 
VALUES ('toast_style', 'modern-dark', 'string', 'Toast notification style: modern-dark, clean-light, teal-accent, neumorphic, minimal')
ON CONFLICT (setting_key) DO NOTHING;