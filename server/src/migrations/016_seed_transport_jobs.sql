-- Sample Transport Jobs for Logistics Hub Testing
-- Run this to populate the database with test data
-- Wrapped in exception handler to skip if dependencies don't exist

DO $$
BEGIN
    -- Insert sample transport jobs
    INSERT INTO listings (
        creator_id, title, description, price, category, 
        service_type, pickup_location, dropoff_location, 
        vehicle_category, transport_status, created_at
    )
    SELECT * FROM (VALUES
        (2, 'Airport Transfer - Morning', 'Need a ride from hotel to airport, 2 passengers with luggage', 45.00, 'service', 
         'taxi', 'Park Hyatt St. Kitts', 'Robert L. Bradshaw International Airport', 
         'car', 'pending', NOW()),
        
        (2, 'Group Tour Pickup', 'Transport for 6 people to beach resort', 80.00, 'service',
         'taxi', 'Basseterre Cruise Port', 'Cockleshell Beach', 
         'suv', 'pending', NOW()),
        
        (2, 'Restaurant Food Delivery', 'Lunch order for office - 3 meals', 15.00, 'service',
         'delivery', 'Island Spice Restaurant', '123 Main Street, Basseterre', 
         'scooter', 'pending', NOW()),
        
        (2, 'Furniture Delivery', 'Large sofa and coffee table delivery', 120.00, 'service',
         'delivery', 'Island Furniture Store', '456 Ocean View Drive', 
         'truck', 'pending', NOW()),
        
        (2, 'Package Pickup from Port', 'Collect shipment from customs', 35.00, 'service',
         'pickup', 'Basseterre Port Authority', '789 Hill Road', 
         'car', 'pending', NOW())
    ) AS v(creator_id, title, description, price, category, service_type, pickup_location, dropoff_location, vehicle_category, transport_status, created_at)
    WHERE EXISTS (SELECT 1 FROM users WHERE user_id = 2)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Transport jobs seeding completed successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Transport jobs seeding skipped: %', SQLERRM;
END $$;
