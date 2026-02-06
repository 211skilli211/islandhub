-- ============================================
-- Vendor Category System Migration
-- Purpose: Comprehensive category/subtype system for all vendor types
-- ============================================

-- 1. Main Categories Table
CREATE TABLE IF NOT EXISTS vendor_categories (
    category_id SERIAL PRIMARY KEY,
    category_key VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(20),
    description TEXT,
    layout_type VARCHAR(50) DEFAULT 'product',  -- product, food, service, rental
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Subtypes Table
CREATE TABLE IF NOT EXISTS vendor_subtypes (
    subtype_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES vendor_categories(category_id) ON DELETE CASCADE,
    subtype_key VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category_id, subtype_key)
);

-- 3. Dynamic Form Fields Configuration
CREATE TABLE IF NOT EXISTS category_form_fields (
    field_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES vendor_categories(category_id) ON DELETE CASCADE,
    subtype_id INT REFERENCES vendor_subtypes(subtype_id) ON DELETE CASCADE,
    field_key VARCHAR(50) NOT NULL,
    field_type VARCHAR(30) NOT NULL CHECK (field_type IN ('text', 'number', 'select', 'multiselect', 'checkbox', 'file', 'textarea', 'date', 'time', 'price', 'location')),
    field_label VARCHAR(100) NOT NULL,
    field_placeholder VARCHAR(255),
    options JSONB,  -- For select/multiselect options
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSONB,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_categories_key ON vendor_categories(category_key);
CREATE INDEX IF NOT EXISTS idx_vendor_categories_active ON vendor_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_vendor_subtypes_category ON vendor_subtypes(category_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subtypes_key ON vendor_subtypes(subtype_key);
CREATE INDEX IF NOT EXISTS idx_category_form_fields_category ON category_form_fields(category_id);
CREATE INDEX IF NOT EXISTS idx_category_form_fields_subtype ON category_form_fields(subtype_id);

-- ============================================
-- Seed Main Categories (15 categories)
-- ============================================

INSERT INTO vendor_categories (category_key, display_name, icon, description, layout_type, sort_order) VALUES
    ('food_kitchen', 'Food & Kitchen', '🍳', 'Restaurants, cafes, caterers, ghost kitchens, bakeries', 'food', 1),
    ('fashion_apparel', 'Fashion & Apparel', '👕', 'Boutiques, clothing, accessories, jewelry, cosmetics', 'product', 2),
    ('electronics', 'Electronics', '📱', 'Phones, computers, appliances, gadgets', 'product', 3),
    ('health_pharmacy', 'Health & Pharmacy', '💊', 'Pharmacies, supplements, medical supplies', 'product', 4),
    ('agro_produce', 'Agro & Produce', '🌾', 'Fresh produce, farmers markets, agro supplies', 'product', 5),
    ('grocery_convenience', 'Grocery & Convenience', '🛒', 'Supermarkets, convenience stores, specialty foods', 'product', 6),
    ('home_garden', 'Home & Garden', '🏡', 'Furniture, decor, hardware, garden supplies', 'product', 7),
    ('books_media', 'Books & Media', '📚', 'Bookstores, stationery, media, music', 'product', 8),
    ('sports_outdoors', 'Sports & Outdoors', '⚽', 'Sports equipment, outdoor gear, fitness', 'product', 9),
    ('tours_activities', 'Tours & Activities', '🎯', 'Tour operators, adventure activities, experiences', 'service', 10),
    ('professional_services', 'Professional Services', '💼', 'Consulting, legal, accounting, marketing', 'service', 11),
    ('local_services', 'Local Services', '🔧', 'Repair, maintenance, cleaning, handyman', 'service', 12),
    ('rentals', 'Rentals', '🏠', 'Housing, vehicles, equipment, tools rental', 'rental', 13),
    ('events_entertainment', 'Events & Entertainment', '🎭', 'Event venues, entertainment, tickets', 'service', 14),
    ('campaigns_donations', 'Campaigns & Donations', '❤️', 'Crowdfunding, community projects, charity', 'campaign', 15)
ON CONFLICT (category_key) DO NOTHING;

-- ============================================
-- Seed Subtypes (80+ total)
-- ============================================

-- Food & Kitchen Subtypes (10)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('restaurant', 'Restaurant', '🍽️', 1),
    ('cafe', 'Cafe & Coffee Shop', '☕', 2),
    ('bakery', 'Bakery & Pastry', '🥐', 3),
    ('food_truck', 'Food Truck', '🚚', 4),
    ('ghost_kitchen', 'Ghost Kitchen', '👻', 5),
    ('caterer', 'Catering Service', '🍲', 6),
    ('bar_lounge', 'Bar & Lounge', '🍸', 7),
    ('soup_kitchen', 'Community Kitchen', '🥣', 8),
    ('meal_prep', 'Meal Prep Service', '📦', 9),
    ('juice_bar', 'Juice & Smoothie Bar', '🥤', 10)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'food_kitchen'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Fashion & Apparel Subtypes (8)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('boutique', 'Boutique', '👗', 1),
    ('clothing_general', 'General Clothing', '👔', 2),
    ('footwear', 'Footwear', '👟', 3),
    ('accessories', 'Accessories', '👜', 4),
    ('jewelry', 'Jewelry', '💍', 5),
    ('cosmetics', 'Cosmetics & Beauty', '💄', 6),
    ('perfume', 'Perfume & Fragrance', '🌸', 7),
    ('tailor', 'Tailor & Alterations', '✂️', 8)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'fashion_apparel'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Electronics Subtypes (6)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('phones_mobile', 'Phones & Mobile', '📱', 1),
    ('computers', 'Computers & Laptops', '💻', 2),
    ('appliances', 'Home Appliances', '🔌', 3),
    ('audio_video', 'Audio & Video', '🔊', 4),
    ('gaming', 'Gaming', '🎮', 5),
    ('repair_service', 'Electronics Repair', '🔧', 6)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'electronics'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Health & Pharmacy Subtypes (5)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('pharmacy', 'Pharmacy', '💊', 1),
    ('supplements', 'Supplements & Vitamins', '💪', 2),
    ('medical_supplies', 'Medical Supplies', '🏥', 3),
    ('wellness', 'Wellness Products', '🧘', 4),
    ('optical', 'Optical & Vision', '👓', 5)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'health_pharmacy'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Agro & Produce Subtypes (5)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('farmers_market', 'Farmers Market', '🥕', 1),
    ('fresh_produce', 'Fresh Produce', '🍎', 2),
    ('agro_supplies', 'Agro Supplies', '🌱', 3),
    ('livestock', 'Livestock & Poultry', '🐔', 4),
    ('organic', 'Organic & Natural', '🌿', 5)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'agro_produce'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Grocery & Convenience Subtypes (5)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('supermarket', 'Supermarket', '🛒', 1),
    ('convenience', 'Convenience Store', '🏪', 2),
    ('specialty_foods', 'Specialty Foods', '🧀', 3),
    ('liquor', 'Liquor Store', '🍷', 4),
    ('wholesale', 'Wholesale', '📦', 5)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'grocery_convenience'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Home & Garden Subtypes (6)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('furniture', 'Furniture', '🛋️', 1),
    ('home_decor', 'Home Decor', '🖼️', 2),
    ('hardware', 'Hardware Store', '🔨', 3),
    ('garden_supplies', 'Garden Supplies', '🌻', 4),
    ('kitchenware', 'Kitchenware', '🍳', 5),
    ('bedding_bath', 'Bedding & Bath', '🛏️', 6)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'home_garden'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Tours & Activities Subtypes (8)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('land_tours', 'Land Tours', '🚙', 1),
    ('sea_tours', 'Sea & Water Tours', '🚤', 2),
    ('air_tours', 'Air Tours', '🚁', 3),
    ('adventure', 'Adventure Activities', '🧗', 4),
    ('cultural', 'Cultural Experiences', '🏛️', 5),
    ('eco_tours', 'Eco Tourism', '🌴', 6),
    ('food_tours', 'Food & Culinary Tours', '🍴', 7),
    ('guided_walks', 'Guided Walks', '🚶', 8)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'tours_activities'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Professional Services Subtypes (8)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('consulting', 'Consulting', '💡', 1),
    ('legal', 'Legal Services', '⚖️', 2),
    ('accounting', 'Accounting & Tax', '📊', 3),
    ('marketing', 'Marketing & Advertising', '📢', 4),
    ('it_tech', 'IT & Technology', '🖥️', 5),
    ('design', 'Design Services', '🎨', 6),
    ('real_estate_agent', 'Real Estate Agent', '🏘️', 7),
    ('insurance', 'Insurance Services', '🛡️', 8)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'professional_services'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Local Services Subtypes (10)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('plumbing', 'Plumbing', '🔧', 1),
    ('electrical', 'Electrical', '⚡', 2),
    ('cleaning', 'Cleaning Services', '🧹', 3),
    ('landscaping', 'Landscaping', '🌳', 4),
    ('pest_control', 'Pest Control', '🐛', 5),
    ('hvac', 'HVAC & Air Conditioning', '❄️', 6),
    ('handyman', 'Handyman', '🛠️', 7),
    ('moving', 'Moving Services', '📦', 8),
    ('security', 'Security Services', '🔒', 9),
    ('beauty_salon', 'Beauty Salon', '💇', 10)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'local_services'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Rentals Subtypes (8)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('stays_housing', 'Stays & Housing', '🏠', 1),
    ('cars', 'Car Rentals', '🚗', 2),
    ('motorcycles', 'Motorcycles & Scooters', '🏍️', 3),
    ('boats', 'Boat & Watercraft', '⛵', 4),
    ('equipment', 'Equipment & Tools', '🔨', 5),
    ('event_spaces', 'Event Spaces', '🎪', 6),
    ('storage', 'Storage Units', '📦', 7),
    ('party_supplies', 'Party Supplies', '🎈', 8)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'rentals'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- Campaigns & Donations Subtypes (5)
INSERT INTO vendor_subtypes (category_id, subtype_key, display_name, icon, sort_order)
SELECT c.category_id, s.subtype_key, s.display_name, s.icon, s.sort_order
FROM vendor_categories c, (VALUES
    ('business', 'Business & Startup', '🚀', 1),
    ('arts', 'Arts & Creative', '🎭', 2),
    ('community', 'Community Projects', '🤝', 3),
    ('tourism', 'Tourism & Hospitality', '🏝️', 4),
    ('disaster_relief', 'Disaster Relief', '🆘', 5)
) AS s(subtype_key, display_name, icon, sort_order)
WHERE c.category_key = 'campaigns_donations'
ON CONFLICT (category_id, subtype_key) DO NOTHING;

-- ============================================
-- Update stores table (add category references)
-- ============================================

ALTER TABLE stores
ADD COLUMN IF NOT EXISTS category_id INT REFERENCES vendor_categories(category_id),
ADD COLUMN IF NOT EXISTS subtype_id INT REFERENCES vendor_subtypes(subtype_id),
ADD COLUMN IF NOT EXISTS secondary_subtypes INT[];

CREATE INDEX IF NOT EXISTS idx_stores_category ON stores(category_id);
CREATE INDEX IF NOT EXISTS idx_stores_subtype ON stores(subtype_id);

-- ============================================
-- Seed Form Fields for Food & Kitchen
-- ============================================

INSERT INTO category_form_fields (category_id, subtype_id, field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
SELECT 
    c.category_id,
    NULL,
    f.field_key,
    f.field_type,
    f.field_label,
    f.field_placeholder,
    f.options::jsonb,
    f.is_required,
    f.sort_order
FROM vendor_categories c, (VALUES
    ('cuisine_types', 'multiselect', 'Cuisine Types', 'Select cuisines...', '["Caribbean","Italian","Chinese","Mexican","Japanese","American","Indian","Thai","Mediterranean","Seafood","BBQ","Vegan","Fusion"]', true, 1),
    ('dietary_options', 'multiselect', 'Dietary Options', 'Select dietary options...', '["Vegetarian","Vegan","Gluten-Free","Halal","Kosher","Dairy-Free","Nut-Free"]', false, 2),
    ('delivery_radius', 'number', 'Delivery Radius (km)', 'Enter delivery radius...', NULL, false, 3),
    ('avg_prep_time', 'select', 'Average Prep Time', 'Select prep time...', '["15-20 mins","20-30 mins","30-45 mins","45-60 mins","1+ hour"]', false, 4),
    ('seating_capacity', 'number', 'Seating Capacity', 'Number of seats...', NULL, false, 5)
) AS f(field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
WHERE c.category_key = 'food_kitchen'
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Form Fields for Tours & Activities
-- ============================================

INSERT INTO category_form_fields (category_id, subtype_id, field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
SELECT 
    c.category_id,
    NULL,
    f.field_key,
    f.field_type,
    f.field_label,
    f.field_placeholder,
    f.options::jsonb,
    f.is_required,
    f.sort_order
FROM vendor_categories c, (VALUES
    ('duration', 'select', 'Tour Duration', 'Select duration...', '["1-2 hours","Half Day","Full Day","Multi-Day","Flexible"]', true, 1),
    ('group_size', 'select', 'Max Group Size', 'Select group size...', '["Private (1-4)","Small (5-10)","Medium (11-20)","Large (20+)"]', true, 2),
    ('difficulty', 'select', 'Difficulty Level', 'Select difficulty...', '["Easy","Moderate","Challenging","Expert"]', false, 3),
    ('included_items', 'multiselect', 'Included Items', 'Select what is included...', '["Transport","Meals","Equipment","Guide","Insurance","Photos"]', false, 4),
    ('meeting_point', 'location', 'Meeting Point', 'Enter pickup/meeting location...', NULL, true, 5),
    ('languages', 'multiselect', 'Guide Languages', 'Select languages...', '["English","Spanish","French","Portuguese","Dutch","Papiamento"]', false, 6)
) AS f(field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
WHERE c.category_key = 'tours_activities'
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed Form Fields for Rentals
-- ============================================

INSERT INTO category_form_fields (category_id, subtype_id, field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
SELECT 
    c.category_id,
    NULL,
    f.field_key,
    f.field_type,
    f.field_label,
    f.field_placeholder,
    f.options::jsonb,
    f.is_required,
    f.sort_order
FROM vendor_categories c, (VALUES
    ('rental_period', 'select', 'Rental Period', 'Select rental period...', '["Hourly","Daily","Weekly","Monthly"]', true, 1),
    ('security_deposit', 'price', 'Security Deposit', 'Enter deposit amount...', NULL, false, 2),
    ('min_age', 'number', 'Minimum Age Requirement', 'Enter minimum age...', NULL, false, 3),
    ('requirements', 'multiselect', 'Requirements', 'Select requirements...', '["Valid ID","Drivers License","Credit Card","Insurance","Deposit"]', false, 4),
    ('pickup_location', 'location', 'Pickup Location', 'Enter pickup address...', NULL, true, 5)
) AS f(field_key, field_type, field_label, field_placeholder, options, is_required, sort_order)
WHERE c.category_key = 'rentals'
ON CONFLICT DO NOTHING;

COMMIT;
