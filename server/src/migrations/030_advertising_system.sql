-- Comprehensive Advertising System Migration
-- Creates tables for advertisements, ad spaces, vendor promotions, and analytics

-- Ad spaces (where ads can be placed)
CREATE TABLE IF NOT EXISTS ad_spaces (
    space_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- 'home_hero_ad', 'sidebar_main', 'feed_inline'
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dimensions
    width INTEGER, -- Recommended width in px
    height INTEGER, -- Recommended height in px
    aspect_ratio VARCHAR(20), -- '16:9', '1:1', '4:3'
    
    -- Placement details
    location VARCHAR(50) NOT NULL, -- 'home', 'marketplace', 'vendor_store'
    position VARCHAR(50), -- 'hero', 'sidebar', 'inline', 'footer'
    
    -- Constraints
    max_file_size INTEGER, -- In MB
    allowed_media_types TEXT[], -- ['image', 'video']
    max_duration INTEGER, -- For videos, in seconds
    
    -- Pricing
    base_price DECIMAL(10, 2), -- Base price per period
    pricing_period VARCHAR(20), -- 'day', 'week', 'month'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    max_concurrent_ads INTEGER DEFAULT 1, -- How many ads can show at once
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
    ad_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Advertiser info
    advertiser_type VARCHAR(50) NOT NULL, -- 'vendor', 'external', 'platform'
    advertiser_id INTEGER, -- vendor_id if vendor, null for external
    advertiser_name VARCHAR(255), -- Company name for external advertisers
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Media
    media_type VARCHAR(20) NOT NULL, -- 'image', 'video', 'carousel'
    media_url TEXT NOT NULL, -- Primary media URL
    media_urls JSONB, -- For carousel: array of URLs
    thumbnail_url TEXT, -- For videos
    
    -- Placement
    ad_space_id INTEGER REFERENCES ad_spaces(space_id) ON DELETE SET NULL,
    placement_priority INTEGER DEFAULT 0, -- Higher = shows first
    
    -- Targeting
    target_pages TEXT[], -- ['home', 'marketplace', 'food']
    target_categories TEXT[], -- ['food', 'rental', 'service']
    target_locations TEXT[], -- Geographic targeting
    
    -- Click action
    click_action VARCHAR(50), -- 'url', 'store', 'listing', 'none'
    target_url TEXT,
    target_store_id INTEGER,
    target_listing_id INTEGER,
    
    -- Scheduling
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    schedule_config JSONB, -- Days/hours to show
    
    -- Budget & Billing
    pricing_model VARCHAR(20), -- 'flat', 'cpm', 'cpc'
    budget_amount DECIMAL(10, 2),
    spent_amount DECIMAL(10, 2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'pending', 'active', 'paused', 'completed', 'rejected'
    is_active BOOLEAN DEFAULT false,
    
    -- Analytics
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Metadata
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    approved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor in-store banners/promotions
CREATE TABLE IF NOT EXISTS vendor_promotions (
    promo_id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(store_id) ON DELETE CASCADE,
    
    -- Promotion details
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    promo_type VARCHAR(50), -- 'banner', 'flash_sale', 'announcement', 'featured_product'
    
    -- Media
    media_type VARCHAR(20), -- 'image', 'video', 'text'
    media_url TEXT,
    background_color VARCHAR(20),
    text_color VARCHAR(20),
    
    -- Placement in store
    placement VARCHAR(50), -- 'store_hero', 'store_sidebar', 'product_grid', 'checkout'
    display_order INTEGER DEFAULT 0,
    
    -- Promotion details
    discount_type VARCHAR(20), -- 'percentage', 'fixed', 'none'
    discount_value DECIMAL(10, 2),
    promo_code VARCHAR(50),
    
    -- Targeting
    target_products INTEGER[], -- Specific product IDs
    target_categories TEXT[],
    
    -- Scheduling
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- For recurring promotions
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT true, -- Changed default to true
    approved_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    approval_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    
    -- Analytics
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ad analytics (detailed tracking)
CREATE TABLE IF NOT EXISTS ad_analytics (
    analytics_id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES advertisements(ad_id) ON DELETE CASCADE,
    
    -- Event details
    event_type VARCHAR(20), -- 'impression', 'click', 'conversion'
    event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- User context
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    
    -- Page context
    page_url TEXT,
    page_type VARCHAR(50),
    
    -- Device/location
    device_type VARCHAR(20), -- 'mobile', 'tablet', 'desktop'
    user_agent TEXT,
    ip_address VARCHAR(50),
    location_data JSONB,
    
    -- Conversion tracking
    conversion_value DECIMAL(10, 2),
    conversion_type VARCHAR(50)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ads_status ON advertisements(status, is_active);
CREATE INDEX IF NOT EXISTS idx_ads_dates ON advertisements(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_ads_space ON advertisements(ad_space_id);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser ON advertisements(advertiser_type, advertiser_id);
CREATE INDEX IF NOT EXISTS idx_vendor_promos_vendor ON vendor_promotions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_promos_active ON vendor_promotions(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_analytics_ad ON ad_analytics(ad_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON ad_analytics(event_timestamp);

-- Seed default ad spaces
INSERT INTO ad_spaces (name, display_name, description, width, height, aspect_ratio, location, position, allowed_media_types, base_price, pricing_period, max_concurrent_ads) VALUES
-- Homepage
('home_hero_ad', 'Homepage Hero Ad', 'Large hero banner on homepage', 1920, 600, '16:5', 'home', 'hero', ARRAY['image', 'video'], 500.00, 'week', 3),
('home_sidebar_ad', 'Homepage Sidebar', 'Sidebar ad on homepage', 300, 600, '1:2', 'home', 'sidebar', ARRAY['image'], 200.00, 'week', 2),
('home_feed_ad_1', 'Homepage Feed Ad (Top)', 'Inline ad in homepage feed', 800, 400, '2:1', 'home', 'inline', ARRAY['image', 'video'], 300.00, 'week', 1),
('home_feed_ad_2', 'Homepage Feed Ad (Mid)', 'Inline ad in homepage feed', 800, 400, '2:1', 'home', 'inline', ARRAY['image', 'video'], 250.00, 'week', 1),

-- Marketplace
('marketplace_hero_ad', 'Marketplace Hero', 'Hero banner on marketplace', 1920, 500, '16:5', 'marketplace', 'hero', ARRAY['image', 'video'], 400.00, 'week', 2),
('marketplace_grid_ad', 'Marketplace Grid Ad', 'Ad within product grid', 400, 400, '1:1', 'marketplace', 'inline', ARRAY['image'], 150.00, 'week', 1),

-- Food section
('food_hero_ad', 'Food Section Hero', 'Hero banner on food pages', 1920, 500, '16:5', 'food', 'hero', ARRAY['image', 'video'], 350.00, 'week', 2),
('food_sidebar_ad', 'Food Sidebar', 'Sidebar on food pages', 300, 600, '1:2', 'food', 'sidebar', ARRAY['image'], 150.00, 'week', 1),

-- Vendor stores
('vendor_store_banner', 'Vendor Store Banner', 'Banner in vendor store pages', 1200, 300, '4:1', 'vendor_store', 'hero', ARRAY['image'], 100.00, 'month', 1),

-- Mobile-specific
('mobile_footer_ad', 'Mobile Footer Ad', 'Sticky footer ad on mobile', 375, 100, '15:4', 'all', 'footer', ARRAY['image'], 200.00, 'week', 1)
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE ad_spaces IS 'Defines available advertising spaces across the platform';
COMMENT ON TABLE advertisements IS 'Stores all advertisements from vendors, external advertisers, and platform';
COMMENT ON TABLE vendor_promotions IS 'Vendor-specific in-store promotions and banners';
COMMENT ON TABLE ad_analytics IS 'Detailed tracking of ad impressions, clicks, and conversions';
