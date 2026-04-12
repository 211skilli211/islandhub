-- ============================================
-- Subscription Seed Data Migration
-- Populate free tier subscriptions for all existing users
-- ============================================

-- ============================================
-- 1. Migrate Existing Vendors to Free Tiers
-- ============================================

-- Insert vendor subscriptions based on existing sub_type column
INSERT INTO vendor_subscriptions (
    vendor_id,
    tier,
    vendor_type,
    status,
    commission_rate,
    max_stores,
    max_listings_per_store,
    features,
    current_period_start,
    current_period_end,
    cancel_at_period_end
)
SELECT 
    id AS vendor_id,
    CASE 
        WHEN sub_type = 'service' THEN 'basic_service'
        ELSE 'basic_product'
    END AS tier,
    CASE 
        WHEN sub_type = 'service' THEN 'service'
        ELSE 'product'
    END AS vendor_type,
    'active' AS status,
    5.00 AS commission_rate, -- Basic tier: 5% commission
    1 AS max_stores, -- Basic tier: 1 store
    10 AS max_listings_per_store, -- Basic tier: 10 listings per store
    '{"analytics": false, "api_access": false, "custom_branding": false, "priority_support": false}'::jsonb AS features,
    CURRENT_TIMESTAMP AS current_period_start,
    NULL::timestamp AS current_period_end, -- Free tier never expires
    FALSE AS cancel_at_period_end
FROM vendors
WHERE NOT EXISTS (
    SELECT 1 FROM vendor_subscriptions vs WHERE vs.vendor_id = vendors.id
);

-- ============================================
-- 2. Migrate Existing Customers to General Tier
-- ============================================

-- Insert customer subscriptions for all users (general tier is free)
INSERT INTO customer_subscriptions (
    user_id,
    tier,
    status,
    discount_rate,
    rewards_multiplier,
    features,
    current_period_start,
    current_period_end,
    cancel_at_period_end
)
SELECT 
    user_id,
    'general' AS tier,
    'active' AS status,
    0.00 AS discount_rate, -- General tier: no discount
    1.00 AS rewards_multiplier, -- General tier: 1x rewards
    '{"early_access": false, "exclusive_deals": false, "free_shipping": false}'::jsonb AS features,
    CURRENT_TIMESTAMP AS current_period_start,
    NULL::timestamp AS current_period_end, -- Free tier never expires
    FALSE AS cancel_at_period_end
FROM users
WHERE NOT EXISTS (
    SELECT 1 FROM customer_subscriptions cs WHERE cs.user_id = users.user_id
);

-- ============================================
-- 3. Migrate Existing Campaign Creators to Individual Tier
-- ============================================

-- Insert campaign creator subscriptions for users who have created campaigns
INSERT INTO campaign_creator_subscriptions (
    user_id,
    tier,
    status,
    platform_fee,
    max_campaigns,
    nonprofit_verified,
    features,
    current_period_start,
    current_period_end,
    cancel_at_period_end
)
SELECT DISTINCT
    c.user_id,
    'individual' AS tier,
    'active' AS status,
    5.00 AS platform_fee, -- Individual tier: 5% platform fee
    3 AS max_campaigns, -- Individual tier: 3 active campaigns
    FALSE AS nonprofit_verified,
    '{"advanced_analytics": false, "priority_support": false, "custom_branding": false}'::jsonb AS features,
    CURRENT_TIMESTAMP AS current_period_start,
    NULL::timestamp AS current_period_end, -- Free tier never expires
    FALSE AS cancel_at_period_end
FROM campaigns c
WHERE NOT EXISTS (
    SELECT 1 FROM campaign_creator_subscriptions ccs WHERE ccs.user_id = c.user_id
);

-- Also add individual tier for users with campaign-type listings
INSERT INTO campaign_creator_subscriptions (
    user_id,
    tier,
    status,
    platform_fee,
    max_campaigns,
    nonprofit_verified,
    features,
    current_period_start,
    current_period_end,
    cancel_at_period_end
)
SELECT DISTINCT
    l.creator_id AS user_id,
    'individual' AS tier,
    'active' AS status,
    5.00 AS platform_fee,
    3 AS max_campaigns,
    FALSE AS nonprofit_verified,
    '{"advanced_analytics": false, "priority_support": false, "custom_branding": false}'::jsonb AS features,
    CURRENT_TIMESTAMP AS current_period_start,
    NULL::timestamp AS current_period_end,
    FALSE AS cancel_at_period_end
FROM listings l
WHERE l.type = 'campaign'
AND NOT EXISTS (
    SELECT 1 FROM campaign_creator_subscriptions ccs WHERE ccs.user_id = l.creator_id
);

-- ============================================
-- 4. Verification Queries
-- ============================================

-- Count subscriptions created
DO $$
DECLARE
    vendor_count INT;
    customer_count INT;
    creator_count INT;
BEGIN
    SELECT COUNT(*) INTO vendor_count FROM vendor_subscriptions;
    SELECT COUNT(*) INTO customer_count FROM customer_subscriptions;
    SELECT COUNT(*) INTO creator_count FROM campaign_creator_subscriptions;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  Vendor subscriptions created: %', vendor_count;
    RAISE NOTICE '  Customer subscriptions created: %', customer_count;
    RAISE NOTICE '  Campaign creator subscriptions created: %', creator_count;
END $$;

-- Verify no NULL tiers exist
DO $$
DECLARE
    null_vendor_tiers INT;
    null_customer_tiers INT;
    null_creator_tiers INT;
BEGIN
    SELECT COUNT(*) INTO null_vendor_tiers FROM vendor_subscriptions WHERE tier IS NULL;
    SELECT COUNT(*) INTO null_customer_tiers FROM customer_subscriptions WHERE tier IS NULL;
    SELECT COUNT(*) INTO null_creator_tiers FROM campaign_creator_subscriptions WHERE tier IS NULL;
    
    IF null_vendor_tiers > 0 OR null_customer_tiers > 0 OR null_creator_tiers > 0 THEN
        RAISE EXCEPTION 'NULL tier values detected! Vendor: %, Customer: %, Creator: %', 
            null_vendor_tiers, null_customer_tiers, null_creator_tiers;
    ELSE
        RAISE NOTICE 'Verification passed: No NULL tier values found';
    END IF;
END $$;

-- ============================================
-- 5. Comments for Documentation
-- ============================================

COMMENT ON TABLE vendor_subscriptions IS 'All vendors start with basic_product or basic_service tier (free)';
COMMENT ON TABLE customer_subscriptions IS 'All customers start with general tier (free)';
COMMENT ON TABLE campaign_creator_subscriptions IS 'Campaign creators start with individual tier (free)';
