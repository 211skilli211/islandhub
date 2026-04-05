-- Push Notification System Tables
-- Migration: 050_push_notifications.sql

-- Device tokens for push notifications
CREATE TABLE IF NOT EXISTS device_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL,  -- 'ios', 'android', 'web', 'desktop'
    device_name VARCHAR(100),
    device_id VARCHAR(100),
    app_version VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(token);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);

-- Push notification templates
CREATE TABLE IF NOT EXISTS push_templates (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    body_template TEXT NOT NULL,
    data_template JSONB DEFAULT '{}',
    icon VARCHAR(200),
    badge_count INTEGER DEFAULT 1,
    sound VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Push notification history
CREATE TABLE IF NOT EXISTS push_notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending',  -- pending, sent, delivered, failed
    device_token VARCHAR(500),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_push_notifications_user ON push_notifications(user_id);
CREATE INDEX idx_push_notifications_status ON push_notifications(status);
CREATE INDEX idx_push_notifications_date ON push_notifications(created_at DESC);

-- Insert default push templates
INSERT INTO push_templates (event_type, title, body_template, icon, sound) VALUES
    ('dispatch_offer', '🚕 New Ride Request!', 'Pickup: {{pickup}} | Fare: ${{fare}}', 'icon_car', 'ringtone'),
    ('driver_assigned', '🚗 Driver Assigned', 'Your driver is on the way! ETA: {{eta}} mins', 'icon_driver', 'default'),
    ('trip_status_update', '📍 Trip Update', 'Your trip status: {{status}}', 'icon_map', 'default'),
    ('trip_completed', '✅ Trip Completed', 'Thank you for riding! Rate your experience.', 'icon_star', 'default'),
    ('new_message', '💬 New Message', '{{sender}}: {{message}}', 'icon_chat', 'message'),
    ('order_update', '📦 Order Update', 'Your order status: {{status}}', 'icon_package', 'default'),
    ('promotion', '🎉 Special Offer!', '{{title}} - {{description}}', 'icon_gift', 'promo'),
    ('earnings_update', '💰 Earnings Update', 'You earned ${{amount}} today!', 'icon_money', 'default')
ON CONFLICT (event_type) DO NOTHING;

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_push_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_templates
    BEFORE UPDATE ON push_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_push_template_timestamp();

COMMENT ON TABLE device_tokens IS 'Device tokens for push notifications across platforms';
COMMENT ON TABLE push_templates IS 'Template library for push notifications';
COMMENT ON TABLE push_notifications IS 'History of sent push notifications';