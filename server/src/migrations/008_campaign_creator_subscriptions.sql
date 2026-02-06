-- ============================================
-- Campaign Creator Subscriptions Table
-- Tiered system for campaign creators with platform fees and limits
-- ============================================

CREATE TABLE IF NOT EXISTS campaign_creator_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('individual', 'organization', 'nonprofit')) DEFAULT 'individual',
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete')) DEFAULT 'active',
    
    -- DodoPayments integration fields
    dodo_subscription_id VARCHAR(255) UNIQUE,
    dodo_customer_id VARCHAR(255),
    dodo_price_id VARCHAR(255),
    
    -- Subscription period tracking
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Tier-specific limits and fees
    platform_fee DECIMAL(5,2) NOT NULL DEFAULT 5.00, -- e.g., 5.00 = 5% platform fee
    max_campaigns INT NOT NULL DEFAULT 3,
    
    -- Nonprofit verification
    nonprofit_verified BOOLEAN DEFAULT FALSE,
    nonprofit_verification_date TIMESTAMP,
    nonprofit_tax_id VARCHAR(100),
    
    -- Extensible features (advanced analytics, priority support, etc.)
    features JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_user_id ON campaign_creator_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_dodo_subscription_id ON campaign_creator_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_status ON campaign_creator_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_cancel_at_period_end ON campaign_creator_subscriptions(cancel_at_period_end, current_period_end);
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_nonprofit_verified ON campaign_creator_subscriptions(nonprofit_verified);

-- Unique constraint: one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_user_id_unique 
ON campaign_creator_subscriptions(user_id) 
WHERE status = 'active';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaign_creator_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS campaign_creator_subscriptions_updated_at ON campaign_creator_subscriptions;
CREATE TRIGGER campaign_creator_subscriptions_updated_at
BEFORE UPDATE ON campaign_creator_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_campaign_creator_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE campaign_creator_subscriptions IS 'Subscription tiers for campaign creators with DodoPayments integration';
COMMENT ON COLUMN campaign_creator_subscriptions.tier IS 'Creator tier: individual, organization, or nonprofit';
COMMENT ON COLUMN campaign_creator_subscriptions.platform_fee IS 'Platform fee percentage (e.g., 5.00 = 5%)';
COMMENT ON COLUMN campaign_creator_subscriptions.max_campaigns IS 'Maximum number of active campaigns allowed for this tier';
COMMENT ON COLUMN campaign_creator_subscriptions.nonprofit_verified IS 'Whether nonprofit status has been verified by admin';
COMMENT ON COLUMN campaign_creator_subscriptions.features IS 'JSONB object containing tier-specific features (analytics, priority support, etc.)';
COMMENT ON COLUMN campaign_creator_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';
