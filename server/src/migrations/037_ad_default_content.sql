-- Migration: Seed default style_config for ad spaces + sample platform ads
-- This ensures AdSpace components display fallback content when no vendor ads exist

-- Update existing ad spaces with default style_config for fallback display
UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#0d9488",
  "to": "#06b6d4",
  "bgOpacity": 1,
  "texture": "dots",
  "textureOpacity": 0.15,
  "textureScale": 1,
  "textureColor": "#ffffff",
  "pattern": "mesh",
  "patternColor": "#ffffff",
  "template": "standard",
  "textAlign": "center",
  "titleSize": 24,
  "defaultTitle": "Discover IslandHub",
  "defaultBody": "Caribbean marketplace for local vendors and artisans",
  "targetLink": "/listings",
  "showButton": true,
  "buttonText": "Explore Marketplace",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#0d9488",
  "radius": "rounded-2xl"
}'::jsonb WHERE name = 'home_hero_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#6366f1",
  "to": "#8b5cf6",
  "bgOpacity": 1,
  "texture": "none",
  "template": "standard",
  "textAlign": "left",
  "defaultTitle": "Featured This Week",
  "defaultBody": "Handpicked products from Caribbean creators",
  "targetLink": "/listings",
  "showButton": true,
  "buttonText": "Shop Now",
  "buttonStyle": "outline",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "transparent",
  "radius": "rounded-xl"
}'::jsonb WHERE name = 'home_sidebar_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#f59e0b",
  "to": "#ef4444",
  "bgOpacity": 1,
  "texture": "shimmer",
  "textureOpacity": 0.2,
  "template": "standard",
  "textAlign": "center",
  "defaultTitle": "Hot Deals 🔥",
  "defaultBody": "Limited time offers from island vendors",
  "targetLink": "/listings?sale=true",
  "showButton": true,
  "buttonText": "View Deals",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#dc2626",
  "radius": "rounded-xl"
}'::jsonb WHERE name = 'home_feed_ad_1' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#10b981",
  "to": "#059669",
  "bgOpacity": 1,
  "texture": "none",
  "template": "standard",
  "textAlign": "center",
  "defaultTitle": "New Arrivals",
  "defaultBody": "Fresh products just listed",
  "targetLink": "/listings?sort=newest",
  "showButton": true,
  "buttonText": "Browse New",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#047857",
  "radius": "rounded-xl"
}'::jsonb WHERE name = 'home_feed_ad_2' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#0d9488",
  "to": "#0891b2",
  "bgOpacity": 1,
  "texture": "mesh",
  "textureOpacity": 0.1,
  "template": "standard",
  "textAlign": "center",
  "defaultTitle": "Shop the Marketplace",
  "defaultBody": "Find unique products from Caribbean vendors",
  "targetLink": "/listings",
  "showButton": true,
  "buttonText": "Start Shopping",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#0d9488",
  "radius": "rounded-2xl"
}'::jsonb WHERE name = 'marketplace_hero_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#8b5cf6",
  "to": "#a78bfa",
  "bgOpacity": 1,
  "texture": "dots",
  "textureOpacity": 0.1,
  "template": "minimal",
  "textAlign": "center",
  "defaultTitle": "Sponsored",
  "defaultBody": "Support local businesses",
  "targetLink": "/vendors",
  "showButton": false,
  "radius": "rounded-lg"
}'::jsonb WHERE name = 'marketplace_grid_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#f97316",
  "to": "#fb923c",
  "bgOpacity": 1,
  "texture": "none",
  "template": "standard",
  "textAlign": "center",
  "defaultTitle": "Food & Dining",
  "defaultBody": "Discover local restaurants and food vendors",
  "targetLink": "/listings?category=food",
  "showButton": true,
  "buttonText": "Order Now",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#ea580c",
  "radius": "rounded-2xl"
}'::jsonb WHERE name = 'food_hero_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#ef4444",
  "to": "#f87171",
  "bgOpacity": 1,
  "texture": "none",
  "template": "standard",
  "textAlign": "left",
  "defaultTitle": "Today's Specials",
  "defaultBody": "Fresh meals from island kitchens",
  "targetLink": "/listings?category=food",
  "showButton": true,
  "buttonText": "View Menu",
  "buttonStyle": "solid",
  "buttonTextColor": "#ffffff",
  "buttonBgColor": "#dc2626",
  "radius": "rounded-xl"
}'::jsonb WHERE name = 'food_sidebar_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#0d9488",
  "to": "#14b8a6",
  "bgOpacity": 1,
  "texture": "dots",
  "textureOpacity": 0.1,
  "template": "standard",
  "textAlign": "center",
  "defaultTitle": "Welcome to Our Store",
  "defaultBody": "Browse our curated collection",
  "targetLink": null,
  "showButton": false,
  "radius": "rounded-xl"
}'::jsonb WHERE name = 'vendor_store_banner' AND (style_config IS NULL OR style_config = '{}'::jsonb);

UPDATE ad_spaces SET style_config = '{
  "bgMode": "gradient",
  "from": "#1e293b",
  "to": "#334155",
  "bgOpacity": 1,
  "texture": "none",
  "template": "minimal",
  "textAlign": "center",
  "defaultTitle": "IslandHub",
  "defaultBody": "Caribbean Marketplace",
  "targetLink": "/",
  "showButton": false,
  "radius": "none"
}'::jsonb WHERE name = 'mobile_footer_ad' AND (style_config IS NULL OR style_config = '{}'::jsonb);

-- Seed sample platform advertisements so ad spaces are never empty
-- These serve as default/fallback ads until vendors create their own

-- Homepage hero ad
INSERT INTO advertisements (
    title, description, advertiser_type, advertiser_name,
    media_type, media_url, ad_space_id, placement_priority,
    target_pages, click_action, target_url,
    status, is_active, start_date, end_date,
    style_config, layout_template, created_by
)
SELECT
    'Welcome to IslandHub 🌴',
    'Your Caribbean marketplace for local products, services, and experiences',
    'platform',
    'IslandHub',
    'image',
    NULL,
    space_id,
    0,
    ARRAY['home'],
    'url',
    '/listings',
    'active',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '{
        "bgMode": "gradient",
        "from": "#0d9488",
        "to": "#06b6d4",
        "texture": "mesh",
        "textureOpacity": 0.15,
        "showButton": true,
        "buttonText": "Explore Marketplace",
        "buttonStyle": "solid",
        "buttonTextColor": "#ffffff",
        "buttonBgColor": "#0d9488"
    }'::jsonb,
    'sleek',
    1
FROM ad_spaces WHERE name = 'home_hero_ad'
ON CONFLICT DO NOTHING;

-- Marketplace sidebar ad
INSERT INTO advertisements (
    title, description, advertiser_type, advertiser_name,
    media_type, media_url, ad_space_id, placement_priority,
    target_pages, click_action, target_url,
    status, is_active, start_date, end_date,
    style_config, layout_template, created_by
)
SELECT
    'Support Local Vendors',
    'Every purchase supports Caribbean artisans and small businesses',
    'platform',
    'IslandHub',
    'image',
    NULL,
    space_id,
    0,
    ARRAY['marketplace'],
    'url',
    '/vendors',
    'active',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '{
        "bgMode": "gradient",
        "from": "#6366f1",
        "to": "#8b5cf6",
        "texture": "dots",
        "showButton": true,
        "buttonText": "Meet Vendors",
        "buttonStyle": "outline",
        "buttonTextColor": "#ffffff",
        "buttonBgColor": "transparent"
    }'::jsonb,
    'glass',
    1
FROM ad_spaces WHERE name = 'home_sidebar_ad'
ON CONFLICT DO NOTHING;

-- Mobile footer ad
INSERT INTO advertisements (
    title, description, advertiser_type, advertiser_name,
    media_type, media_url, ad_space_id, placement_priority,
    target_pages, click_action, target_url,
    status, is_active, start_date, end_date,
    style_config, layout_template, created_by
)
SELECT
    'IslandHub 🌴',
    'Caribbean Marketplace',
    'platform',
    'IslandHub',
    'image',
    NULL,
    space_id,
    0,
    ARRAY['all'],
    'url',
    '/',
    'active',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '{
        "bgMode": "gradient",
        "from": "#1e293b",
        "to": "#334155",
        "showButton": false
    }'::jsonb,
    'minimal',
    1
FROM ad_spaces WHERE name = 'mobile_footer_ad'
ON CONFLICT DO NOTHING;

-- Vendor store banner (generic fallback)
INSERT INTO advertisements (
    title, description, advertiser_type, advertiser_name,
    media_type, media_url, ad_space_id, placement_priority,
    target_pages, click_action, target_url,
    status, is_active, start_date, end_date,
    style_config, layout_template, created_by
)
SELECT
    'Welcome to Our Store',
    'Browse our curated collection of products',
    'platform',
    'IslandHub',
    'image',
    NULL,
    space_id,
    0,
    ARRAY['vendor_store'],
    'none',
    NULL,
    'active',
    true,
    NOW(),
    NOW() + INTERVAL '1 year',
    '{
        "bgMode": "gradient",
        "from": "#0d9488",
        "to": "#14b8a6",
        "texture": "dots",
        "textureOpacity": 0.1,
        "showButton": false
    }'::jsonb,
    'standard',
    1
FROM ad_spaces WHERE name = 'vendor_store_banner'
ON CONFLICT DO NOTHING;
