-- Migration 036: Financial & Payout Ecosystem

-- 1. Partner Wallets (Vendors & Drivers)
CREATE TABLE IF NOT EXISTS partner_wallets (
    wallet_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    store_id INTEGER REFERENCES stores(store_id) ON DELETE SET NULL, -- Null for drivers
    partner_type VARCHAR(20) NOT NULL CHECK (partner_type IN ('vendor', 'driver')),
    balance DECIMAL(15, 2) DEFAULT 0,
    withdrawable_balance DECIMAL(15, 2) DEFAULT 0,
    pending_payouts DECIMAL(15, 2) DEFAULT 0,
    lifetime_earnings DECIMAL(15, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, partner_type, store_id)
);

-- 2. Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
    transaction_id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL REFERENCES partner_wallets(wallet_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'delivery_fee', 'commission', 'payout', 'refund', 'adjustment', 'subscription_reward', 'tip')),
    reference_type VARCHAR(50), -- e.g. 'order', 'listing', 'payout_request'
    reference_id INTEGER, -- ID of the related order or request
    balance_before DECIMAL(15, 2),
    balance_after DECIMAL(15, 2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- 3. Payout Requests
CREATE TABLE IF NOT EXISTS payout_requests (
    request_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id INTEGER NOT NULL REFERENCES partner_wallets(wallet_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    payout_method VARCHAR(50) NOT NULL, -- 'bank_transfer', 'paypal', 'crypto', 'wipay'
    payout_details JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected', 'cancelled')),
    transaction_id INTEGER REFERENCES wallet_transactions(transaction_id),
    processed_at TIMESTAMP,
    processed_by INTEGER REFERENCES users(user_id),
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Review Replies (for Point 4)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply_text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS replied_by INTEGER REFERENCES users(user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partner_wallets_user_id ON partner_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
