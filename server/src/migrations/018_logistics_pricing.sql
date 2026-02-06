-- Logistics Pricing Settings Table
CREATE TABLE IF NOT EXISTS logistics_pricing (
    id SERIAL PRIMARY KEY,
    service_type VARCHAR(20) NOT NULL UNIQUE, -- 'taxi', 'delivery', 'pickup'
    vehicle_category VARCHAR(20) NOT NULL, -- 'scooter', 'car', 'suv', 'truck'
    base_fare DECIMAL(10, 2) DEFAULT 0.00,
    per_km_rate DECIMAL(10, 2) DEFAULT 0.00,
    per_min_rate DECIMAL(10, 2) DEFAULT 0.00,
    minimum_fare DECIMAL(10, 2) DEFAULT 0.00,
    surge_multiplier DECIMAL(10, 2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed Initial Pricing (St. Kitts & Nevis estimated rates)
INSERT INTO logistics_pricing (service_type, vehicle_category, base_fare, per_km_rate, per_min_rate, minimum_fare)
VALUES 
('taxi', 'car', 10.00, 2.50, 0.50, 15.00),
('taxi', 'suv', 15.00, 3.50, 0.70, 25.00),
('delivery', 'scooter', 5.00, 1.50, 0.30, 8.00),
('delivery', 'car', 8.00, 2.00, 0.40, 12.00),
('pickup', 'truck', 25.00, 5.00, 1.00, 45.00)
ON CONFLICT (service_type) DO NOTHING;
