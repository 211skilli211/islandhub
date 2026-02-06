-- Phase 8: Performance Indexing
-- Adding indexes for frequently queried foreign keys in subscription and audit tables

-- Vendor Subscriptions
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_vendor_id ON vendor_subscriptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_subscriptions_status ON vendor_subscriptions(status);

-- Customer Subscriptions
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_user_id ON customer_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_status ON customer_subscriptions(status);

-- Campaign Creator Subscriptions
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_user_id ON campaign_creator_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_creator_subscriptions_status ON campaign_creator_subscriptions(status);

-- Audit Logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
