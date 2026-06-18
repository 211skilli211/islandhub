-- Add subscription override fields for admin manual overrides
-- Allows admins to grant free months/periods to vendors

-- Vendor subscriptions
ALTER TABLE vendor_subscriptions 
ADD COLUMN IF NOT EXISTS subscription_override_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by_user_id INTEGER;

-- Customer subscriptions  
ALTER TABLE customer_subscriptions
ADD COLUMN IF NOT EXISTS subscription_override_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by_user_id INTEGER;

-- Campaign creator subscriptions
ALTER TABLE campaign_creator_subscriptions
ADD COLUMN IF NOT EXISTS subscription_override_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS override_reason TEXT,
ADD COLUMN IF NOT EXISTS override_by_user_id INTEGER;

-- Add foreign key for override_by_user_id if users table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE vendor_subscriptions 
        ADD CONSTRAINT fk_vendor_override_user 
        FOREIGN KEY (override_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
        
        ALTER TABLE customer_subscriptions 
        ADD CONSTRAINT fk_customer_override_user 
        FOREIGN KEY (override_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
        
        ALTER TABLE campaign_creator_subscriptions 
        ADD CONSTRAINT fk_creator_override_user 
        FOREIGN KEY (override_by_user_id) REFERENCES users(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create index for override dates
CREATE INDEX IF NOT EXISTS idx_vendor_subscription_override 
ON vendor_subscriptions(subscription_override_end_date);

CREATE INDEX IF NOT EXISTS idx_customer_subscription_override 
ON customer_subscriptions(subscription_override_end_date);

CREATE INDEX IF NOT EXISTS idx_creator_subscription_override 
ON campaign_creator_subscriptions(subscription_override_end_date);
