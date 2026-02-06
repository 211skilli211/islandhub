
-- Migration: Add Marquee Templates and Promotional Asset Tracking
-- Date: 2026-01-24

CREATE TABLE marquee_templates (
  template_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial templates
INSERT INTO marquee_templates (name, content, priority) VALUES
('Holiday Sale', '🎄 Huge Holiday Sale! Up to 50% off on all island products. Shop now! 🏝️', 5),
('New Vendor Alert', '👋 Welcome our newest vendor to IslandHub! Check out their fresh collection. 🌊', 3),
('Flash Deal', '⚡ 24-HOUR FLASH DEAL: Get exclusive discounts on local listings. Ends tonight! ⏰', 8);

-- Extension: Marketplace Promotional Banners (linked to assets)
CREATE TABLE promotional_banners (
  banner_id SERIAL PRIMARY KEY,
  title TEXT,
  subtitle TEXT,
  image_url TEXT,
  target_url TEXT,
  location TEXT DEFAULT 'marketplace_hero', -- where it shows up
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
