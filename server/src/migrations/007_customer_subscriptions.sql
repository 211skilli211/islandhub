-- ============================================
-- Customer Subscriptions Table
-- VIP tier system for customers with discounts and rewards
-- ============================================

CREATE TABLE IF NOT EXISTS customer_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('general', 'vip')) DEFAULT 'general',
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'cancelled', 'incomplete')) DEFAULT 'active',
    
    -- DodoPayments integration fields
    dodo_subscription_id VARCHAR(255) UNIQUE,
    dodo_customer_id VARCHAR(255),
    dodo_price_id VARCHAR(255),
    
    -- Subscription period tracking
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- VIP benefits
    discount_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- e.g., 10.00 = 10% discount
    rewards_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- e.g., 2.00 = 2x points
    
    -- Extensible features (early access, exclusive deals, etc.)
    features JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id ON customer_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_dodo_subscription_id ON customer_subscriptions(dodo_subscription_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_cancel_at_period_end ON customer_subscriptions(cancel_at_period_end, current_period_end);

-- Unique constraint: one active subscription per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id_unique 
ON customer_subscriptions(user_id) 
WHERE status = 'active';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_customer_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customer_subscriptions_updated_at ON customer_subscriptions;
CREATE TRIGGER customer_subscriptions_updated_at
BEFORE UPDATE ON customer_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_customer_subscriptions_updated_at();

-- Comments for documentation
COMMENT ON TABLE customer_subscriptions IS 'VIP subscription tiers for customers with DodoPayments integration';
COMMENT ON COLUMN customer_subscriptions.tier IS 'Customer tier: general (free) or vip (paid)';
COMMENT ON COLUMN customer_subscriptions.discount_rate IS 'Discount percentage applied at checkout (e.g., 10.00 = 10%)';
COMMENT ON COLUMN customer_subscriptions.rewards_multiplier IS 'Rewards points multiplier (e.g., 2.00 = 2x points)';
COMMENT ON COLUMN customer_subscriptions.features IS 'JSONB object containing tier-specific features (early access, exclusive deals, etc.)';
COMMENT ON COLUMN customer_subscriptions.cancel_at_period_end IS 'If true, subscription will be cancelled at current_period_end';
