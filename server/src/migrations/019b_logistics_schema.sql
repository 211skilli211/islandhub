-- Alter listings table
ALTER TABLE listings
  ALTER COLUMN pickup_location TYPE JSONB USING jsonb_build_object('address', pickup_location),
  ALTER COLUMN dropoff_location TYPE JSONB USING jsonb_build_object('address', dropoff_location);

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS waypoints JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS extra_details JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_details JSONB DEFAULT '{}';

-- Alter logistics_pricing table
ALTER TABLE logistics_pricing
  ADD COLUMN IF NOT EXISTS extra_passenger_fee DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS item_size_multipliers JSONB DEFAULT '{}';

-- Seed Item Size Multipliers
UPDATE logistics_pricing SET item_size_multipliers = '{
    "food_small": 1.0,
    "medium_parcel": 1.2,
    "large_parcel": 1.5,
    "big_item": 2.5
}'::jsonb WHERE item_size_multipliers = '{}'::jsonb;
