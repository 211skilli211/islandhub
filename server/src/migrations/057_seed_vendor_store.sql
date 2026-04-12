-- Seed 10 sample vendors with stores (each vendor IS a user)
-- Run this on your islandhub database

-- 1. Create demo users for each vendor (if not exists)
INSERT INTO users (name, email, password_hash, role, created_at)
VALUES 
    ('Island Jerk Spot', 'jerk@islandfood.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Seaside Grill', 'reservations@seasidegrill.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Caribbean Crafts', 'shop@caribbeancrafts.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Island Web Studios', 'hello@islandwebstudios.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Tropical Spa Retreat', 'spa@tropicalretreat.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Island Auto Care', 'fix@islandautocare.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Caribbean Charters', 'sail@caribbeancharters.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Island Explorer Tours', 'tours@islandexplorer.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Carib Celebration', 'events@caribcelebration.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW()),
    ('Caribbean Legal', 'info@cariblegal.com', '\$2a\$10\$xQZ8HxKkPz5vVxY1LwJH9OZvT3LxYqKQxJy5vJ3wXqK9H5uWwJv6', 'vendor', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. Insert vendors
INSERT INTO vendors (user_id, business_name, description, logo_url, banner_url, contact_email, contact_phone, location, slug, sub_type, branding_color, status, kyb_verified, is_verified)
SELECT u.user_id, 
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'Island Jerk Spot'
        WHEN 'reservations@seasidegrill.com' THEN 'Seaside Grill & Bar'
        WHEN 'shop@caribbeancrafts.com' THEN 'Caribbean Crafts Co.'
        WHEN 'hello@islandwebstudios.com' THEN 'Island Web Studios'
        WHEN 'spa@tropicalretreat.com' THEN 'Tropical Spa Retreat'
        WHEN 'fix@islandautocare.com' THEN 'Island Auto Care'
        WHEN 'sail@caribbeancharters.com' THEN 'Caribbean Charters'
        WHEN 'tours@islandexplorer.com' THEN 'Island Explorer Tours'
        WHEN 'events@caribcelebration.com' THEN 'Carib Celebration Planners'
        WHEN 'info@cariblegal.com' THEN 'Caribbean Legal Associates'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'Authentic Jamaican jerk chicken and traditional Caribbean cuisine'
        WHEN 'reservations@seasidegrill.com' THEN 'Oceanfront dining with fresh seafood and Caribbean fusion'
        WHEN 'shop@caribbeancrafts.com' THEN 'Handmade Caribbean artifacts and gift items'
        WHEN 'hello@islandwebstudios.com' THEN 'Professional web design and digital marketing'
        WHEN 'spa@tropicalretreat.com' THEN 'Luxury spa and wellness center'
        WHEN 'fix@islandautocare.com' THEN 'Auto repair and maintenance services'
        WHEN 'sail@caribbeancharters.com' THEN 'Private boat tours and yacht charters'
        WHEN 'tours@islandexplorer.com' THEN 'Guided tours of historic sites'
        WHEN 'events@caribcelebration.com' THEN 'Wedding and event planning'
        WHEN 'info@cariblegal.com' THEN 'Law firm for business and immigration'
    END,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    u.email,
    '+1-555-0100',
    'Caribbean',
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'island-jerk-spot'
        WHEN 'reservations@seasidegrill.com' THEN 'seaside-grill-bar'
        WHEN 'shop@caribbeancrafts.com' THEN 'caribbean-crafts-co'
        WHEN 'hello@islandwebstudios.com' THEN 'island-web-studios'
        WHEN 'spa@tropicalretreat.com' THEN 'tropical-spa-retreat'
        WHEN 'fix@islandautocare.com' THEN 'island-auto-care'
        WHEN 'sail@caribbeancharters.com' THEN 'caribbean-charters'
        WHEN 'tours@islandexplorer.com' THEN 'island-explorer-tours'
        WHEN 'events@caribcelebration.com' THEN 'carib-celebration-planners'
        WHEN 'info@cariblegal.com' THEN 'caribbean-legal-associates'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'food_kitchen'
        WHEN 'reservations@seasidegrill.com' THEN 'restaurant'
        WHEN 'shop@caribbeancrafts.com' THEN 'shop'
        WHEN 'hello@islandwebstudios.com' THEN 'service_provider'
        WHEN 'spa@tropicalretreat.com' THEN 'health_beauty'
        WHEN 'fix@islandautocare.com' THEN 'automotive'
        WHEN 'sail@caribbeancharters.com' THEN 'marine'
        WHEN 'tours@islandexplorer.com' THEN 'tour_operator'
        WHEN 'events@caribcelebration.com' THEN 'event_services'
        WHEN 'info@cariblegal.com' THEN 'professional_services'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN '#f97316'
        WHEN 'reservations@seasidegrill.com' THEN '#0ea5e9'
        WHEN 'shop@caribbeancrafts.com' THEN '#8b5cf6'
        WHEN 'hello@islandwebstudios.com' THEN '#06b6d4'
        WHEN 'spa@tropicalretreat.com' THEN '#ec4899'
        WHEN 'fix@islandautocare.com' THEN '#eab308'
        WHEN 'sail@caribbeancharters.com' THEN '#14b8a6'
        WHEN 'tours@islandexplorer.com' THEN '#22c55e'
        WHEN 'events@caribcelebration.com' THEN '#f43f5e'
        WHEN 'info@cariblegal.com' THEN '#3b82f6'
    END,
    'active', true, true
FROM users u 
WHERE u.role = 'vendor' 
AND u.email IN ('jerk@islandfood.com', 'reservations@seasidegrill.com', 'shop@caribbeancrafts.com', 
    'hello@islandwebstudios.com', 'spa@tropicalretreat.com', 'fix@islandautocare.com',
    'sail@caribbeancharters.com', 'tours@islandexplorer.com', 'events@caribcelebration.com',
    'info@cariblegal.com')
ON CONFLICT DO NOTHING;

-- 3. Insert stores
INSERT INTO stores (vendor_id, name, slug, description, category, subtype, logo_url, banner_url, branding_color, status)
SELECT u.user_id,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'Island Jerk Spot'
        WHEN 'reservations@seasidegrill.com' THEN 'Seaside Grill & Bar'
        WHEN 'shop@caribbeancrafts.com' THEN 'Caribbean Crafts Co.'
        WHEN 'hello@islandwebstudios.com' THEN 'Island Web Studios'
        WHEN 'spa@tropicalretreat.com' THEN 'Tropical Spa Retreat'
        WHEN 'fix@islandautocare.com' THEN 'Island Auto Care'
        WHEN 'sail@caribbeancharters.com' THEN 'Caribbean Charters'
        WHEN 'tours@islandexplorer.com' THEN 'Island Explorer Tours'
        WHEN 'events@caribcelebration.com' THEN 'Carib Celebration Planners'
        WHEN 'info@cariblegal.com' THEN 'Caribbean Legal Associates'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'island-jerk-spot'
        WHEN 'reservations@seasidegrill.com' THEN 'seaside-grill-bar'
        WHEN 'shop@caribbeancrafts.com' THEN 'caribbean-crafts-co'
        WHEN 'hello@islandwebstudios.com' THEN 'island-web-studios'
        WHEN 'spa@tropicalretreat.com' THEN 'tropical-spa-retreat'
        WHEN 'fix@islandautocare.com' THEN 'island-auto-care'
        WHEN 'sail@caribbeancharters.com' THEN 'caribbean-charters'
        WHEN 'tours@islandexplorer.com' THEN 'island-explorer-tours'
        WHEN 'events@caribcelebration.com' THEN 'carib-celebration-planners'
        WHEN 'info@cariblegal.com' THEN 'caribbean-legal-associates'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'Authentic Jamaican jerk cuisine'
        WHEN 'reservations@seasidegrill.com' THEN 'Oceanfront seafood dining'
        WHEN 'shop@caribbeancrafts.com' THEN 'Handmade Caribbean gifts'
        WHEN 'hello@islandwebstudios.com' THEN 'Web design services'
        WHEN 'spa@tropicalretreat.com' THEN 'Luxury spa services'
        WHEN 'fix@islandautocare.com' THEN 'Auto repair services'
        WHEN 'sail@caribbeancharters.com' THEN 'Boat charters'
        WHEN 'tours@islandexplorer.com' THEN 'Guided tours'
        WHEN 'events@caribcelebration.com' THEN 'Event planning'
        WHEN 'info@cariblegal.com' THEN 'Legal services'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'Food'
        WHEN 'reservations@seasidegrill.com' THEN 'Food'
        WHEN 'shop@caribbeancrafts.com' THEN 'Shop'
        WHEN 'hello@islandwebstudios.com' THEN 'Services'
        WHEN 'spa@tropicalretreat.com' THEN 'Services'
        WHEN 'fix@islandautocare.com' THEN 'Automotive'
        WHEN 'sail@caribbeancharters.com' THEN 'Marine'
        WHEN 'tours@islandexplorer.com' THEN 'Tours'
        WHEN 'events@caribcelebration.com' THEN 'Events'
        WHEN 'info@cariblegal.com' THEN 'Professional'
    END,
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN 'food_kitchen'
        WHEN 'reservations@seasidegrill.com' THEN 'restaurant'
        WHEN 'shop@caribbeancrafts.com' THEN 'shop'
        WHEN 'hello@islandwebstudios.com' THEN 'service_provider'
        WHEN 'spa@tropicalretreat.com' THEN 'health_beauty'
        WHEN 'fix@islandautocare.com' THEN 'automotive'
        WHEN 'sail@caribbeancharters.com' THEN 'marine'
        WHEN 'tours@islandexplorer.com' THEN 'tour_operator'
        WHEN 'events@caribcelebration.com' THEN 'event_services'
        WHEN 'info@cariblegal.com' THEN 'professional_services'
    END,
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200',
    CASE u.email
        WHEN 'jerk@islandfood.com' THEN '#f97316'
        WHEN 'reservations@seasidegrill.com' THEN '#0ea5e9'
        WHEN 'shop@caribbeancrafts.com' THEN '#8b5cf6'
        WHEN 'hello@islandwebstudios.com' THEN '#06b6d4'
        WHEN 'spa@tropicalretreat.com' THEN '#ec4899'
        WHEN 'fix@islandautocare.com' THEN '#eab308'
        WHEN 'sail@caribbeancharters.com' THEN '#14b8a6'
        WHEN 'tours@islandexplorer.com' THEN '#22c55e'
        WHEN 'events@caribcelebration.com' THEN '#f43f5e'
        WHEN 'info@cariblegal.com' THEN '#3b82f6'
    END,
    'active'
FROM users u 
WHERE u.role = 'vendor' 
AND u.email IN ('jerk@islandfood.com', 'reservations@seasidegrill.com', 'shop@caribbeancrafts.com', 
    'hello@islandwebstudios.com', 'spa@tropicalretreat.com', 'fix@islandautocare.com',
    'sail@caribbeancharters.com', 'tours@islandexplorer.com', 'events@caribcelebration.com',
    'info@cariblegal.com')
ON CONFLICT DO NOTHING;

-- Verify
SELECT 'Users:' AS info, COUNT(*) AS count FROM users WHERE role = 'vendor'
UNION ALL
SELECT 'Vendors:', COUNT(*) FROM vendors
UNION ALL
SELECT 'Stores:', COUNT(*) FROM stores;
