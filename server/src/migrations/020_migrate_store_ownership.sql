-- Migration 020: Consolidate Store Ownership
-- All existing stores will be owned by vendor_id 2 (skilli211beng@gmail.com)

UPDATE stores SET vendor_id = 2;

-- Ensure vendor 2 exists in vendors table if not already (safeguard)
INSERT INTO vendors (user_id, business_name, contact_email)
SELECT 2, 'Island Hub Admin', 'skilli211beng@gmail.com'
WHERE NOT EXISTS (SELECT 1 FROM vendors WHERE user_id = 2);
