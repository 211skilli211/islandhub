-- IslandHub Marketplace Migration
-- Creates new tables for the expanded marketplace functionality

-- Listings table: Unified table for campaigns, rentals, products, and services
CREATE TABLE listings (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) CHECK (type IN ('campaign', 'rental', 'product', 'service')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2), -- NULL for donations/campaigns
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50),
    goal_amount DECIMAL(12,2), -- For campaigns
    current_amount DECIMAL(12,2) DEFAULT 0, -- For campaigns
    currency VARCHAR(10) DEFAULT 'XCD',
    status VARCHAR(20) CHECK (status IN ('draft','active','completed','cancelled','sold')) DEFAULT 'draft',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Platform commission %
    subscription_tier VARCHAR(20), -- For premium listings
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table: Updated to support multiple listing types and payment providers
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'XCD',
    payment_method VARCHAR(50),
    payment_provider VARCHAR(20) CHECK (payment_provider IN ('wipay', 'paypal', 'kyrrex', 'dodopay')) DEFAULT 'wipay',
    external_id VARCHAR(255), -- Gateway transaction ID
    crypto_currency VARCHAR(10), -- BTC, ETH, etc.
    status VARCHAR(20) CHECK (status IN ('pending','completed','failed','refunded')) DEFAULT 'pending',
    is_donation BOOLEAN DEFAULT FALSE, -- For hybrid flows
    commission_amount DECIMAL(12,2), -- Platform cut
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Updates table: For campaign progress updates
CREATE TABLE campaign_updates (
    id SERIAL PRIMARY KEY,
    listing_id INT REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
    creator_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs table: For compliance and transparency
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin Settings table: For storing global platform settings
CREATE TABLE admin_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);