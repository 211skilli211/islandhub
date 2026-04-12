-- Update existing apartment to rental category
UPDATE listings SET type = 'rental', category = 'Rental' WHERE id = 3;

-- Get user_id (assuming user_id 2 based on previous context, will be updated)
-- Vehicle Rentals (4 listings)
INSERT INTO listings (title, description, price, type, category, creator_id, store_id, status, images)
VALUES 
('Island Jeep Wrangler 4x4', 'Explore rugged coastlines with this automatic 4x4. Perfect for beach adventures and mountain trails. Includes GPS and cooler.', 85.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/jeep-wrangler.jpg']),
('Economy Sedan - Toyota Corolla', 'Fuel-efficient and comfortable sedan perfect for city driving and island tours. Air conditioning, Bluetooth audio.', 55.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/sedan-economy.jpg']),
('Sport ATV - Off-Road Adventure', 'Adrenaline-pumping ATV for off-road exploration. Helmet and safety gear included. Must be 18+ with valid license.', 120.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/atv-sport.jpg']),
('Urban Scooter - Vespa Style', 'Zip through traffic and park anywhere with this stylish scooter. Perfect for solo travelers exploring the island.', 40.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/scooter-urban.jpg']);

-- Accommodation Rentals (2 listings)
INSERT INTO listings (title, description, price, type, category, creator_id, store_id, status, images)
VALUES
('Cozy Studio Apartment - Downtown', 'Modern studio in the heart of town. Full kitchen, WiFi, A/C. Walking distance to beaches and restaurants. Perfect for solo travelers or couples.', 150.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/apt-studio.jpg']),
('Luxury Airbnb Villa - Ocean View', '3-bedroom beachfront villa with private pool, chef kitchen, and stunning sunset views. Sleeps 6-8 guests comfortably.', 450.00, 'rental', 'Rental', 2, 10, 'active', ARRAY['/placeholders/villa-luxury.jpg']);

-- Water Sports Rentals (4 listings)
INSERT INTO listings (title, description, price, type, category, creator_id, store_id, status, images)
VALUES
('Turbo Jet Ski - High Performance', 'Experience high-speed thrills on the water. Latest model with safety features. Life jackets provided. Must be 16+ with adult supervision.', 150.00, 'rental', 'Rental', 2, 11, 'active', ARRAY['/placeholders/jetski-sport.jpg']),
('Family Cruiser Jet Ski', 'Stable 3-seater jet ski perfect for families. Easy to operate with safety features. Great for exploring the coastline together.', 200.00, 'rental', 'Rental', 2, 11, 'active', ARRAY['/placeholders/jetski-family.jpg']),
('Fishing Boat - 15ft Skiff', 'Perfect for coastal fishing trips. Includes tackle, cooler, and safety equipment. No license required for calm waters.', 300.00, 'rental', 'Rental', 2, 11, 'active', ARRAY['/placeholders/boat-fishing.jpg']),
('Luxury Speedboat with Captain', 'Experience the ultimate island adventure. Professional captain included. Perfect for day trips, snorkeling, or sunset cruises.', 800.00, 'rental', 'Rental', 2, 11, 'active', ARRAY['/placeholders/boat-speed.jpg']);
