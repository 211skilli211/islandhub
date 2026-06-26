-- Migration: Add lat/lng coordinates to vendors table for geospatial mapping
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS lat NUMERIC(10, 7);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS lng NUMERIC(10, 7);

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_vendors_lat_lng ON vendors(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Add sample coordinates for existing vendors (Caribbean region)
UPDATE vendors SET lat = 17.30, lng = -62.73 WHERE business_name ILIKE '%salt%' OR business_name ILIKE '%horizon%';
UPDATE vendors SET lat = 18.22, lng = -66.50 WHERE business_name ILIKE '%coffee%' OR business_name ILIKE '%mountain%';
UPDATE vendors SET lat = 13.16, lng = -59.55 WHERE business_name ILIKE '%barbados%';
