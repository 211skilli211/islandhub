-- ============================================
-- Vendor Subscriptions Table
-- Multi-tier subscription system for product and service vendors
-- ============================================

CREATE TABLE IF NOT EXISTS vendor_subscriptions (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL CHECK (tier IN (
        'basic_product', 'premium_product', 'enterprise_product',
        'basic_service', 'premium_service', 'enterprise_service'
    )),
    vendor_type VARCHAR(20) NOT NULL CHECK (vendor_type IN ('product', 'service')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete')) DEFAULT 'active',
    
    -- DodoPayments integration fields
    dodo_subscription_id VARCHAR(255) UNIQUE,
    dodo_customer_id VARCHAR(255),
    dodo_price_id VARCHAR(255),
    
    -- Subscription period tracking
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Tier-specific limits and rates
    commission_rate DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    max_stores INT NOT NULL DEFAULT 1,
    max_listings_per_store INT NOT NULL DEFAULT 10,
    
    -- Extensible features (analytics, API access, branding, etc.)
    features JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_dodo_subscription_id ON vendor_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON vendor_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_cancel_at_period_end ON vendor_subscriptions(cancel_at_period_end, current_period_end);

-- Unique constraint: one active subscription per vendor
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id_unique 
ON vendor_subscriptions(vendor_id) 
WHERE status = 'active';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vendor_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS vendor_subscriptions_updated_at ON vendor_subscriptions;
CREATE TRIGGER vendor_subscriptions_updated_at
BEFORE UPDATE ON vendor_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_vendor_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE vendor_subscriptions IS 'Subscription tiers for product and service vendors with DodoPayments integration';
COMMENT ON COLUMN vendor_subscriptions.tier IS 'Subscription tier: basic/premium/enterprise for product or service vendors';
COMMENT ON COLUMN vendor_subscriptions.vendor_type IS 'Type of vendor: product or service';
COMMENT ON COLUMN vendor_subscriptions.commission_rate IS 'Platform commission percentage (e.g., 5.00 = 5%)';
COMMENT ON COLUMN vendor_subscriptions.max_stores IS 'Maximum number of stores allowed for this tier';
COMMENT ON COLUMN vendor_subscriptions.max_listings_per_store IS 'Maximum listings per store for this tier';
COMMENT ON COLUMN vendor_subscriptions.features IS 'JSONB object containing tier-specific features (analytics, API access, etc.)';
COMMENT ON COLUMN vendor_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';
