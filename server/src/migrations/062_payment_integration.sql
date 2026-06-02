-- Migration: Payment Integration (Phase 1)
-- Run: psql -d $DATABASE_URL -f 062_payment_integration.sql
-- Shared DB: IslandHub + IBT Solutions + Co-operative Federation
-- Scope: ALL platform entities — vendors, service providers, co-op members, drivers, tour operators

-- Payment terminals (sub-merchants across ALL platform entities)
CREATE TABLE IF NOT EXISTS payment_terminals (
    id SERIAL PRIMARY KEY,
    terminal_id VARCHAR(100) UNIQUE NOT NULL,

    -- Polymorphic entity reference
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('vendor', 'service_provider', 'coop_member', 'driver', 'tour_operator')),
    entity_id INTEGER NOT NULL,

    terminal_type VARCHAR(20) NOT NULL DEFAULT 'sub_account' CHECK (terminal_type IN ('sub_account', 'payment_link')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
    display_name VARCHAR(200),
    fygaro_account_id VARCHAR(100),

    -- Settlement destination (for sub-payouts)
    payout_bank_name VARCHAR(200),
    payout_account_last4 VARCHAR(4),
    payout_routing VARCHAR(9),
    payout_swift VARCHAR(11),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_terminals_entity ON payment_terminals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_terminals_status ON payment_terminals(status);
CREATE INDEX IF NOT EXISTS idx_terminals_terminal_id ON payment_terminals(terminal_id);

-- Transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,

    terminal_id INTEGER REFERENCES payment_terminals(id),
    order_id VARCHAR(100),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('vendor', 'service_provider', 'coop_member', 'driver', 'tour_operator')),
    entity_id INTEGER NOT NULL,

    -- Amount (stored in cents to avoid floating point)
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XCD',
    fee_cents INTEGER DEFAULT 0,
    net_cents INTEGER NOT NULL,

    -- Payment method
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('nfc_tap', 'qr_code', 'card_entry')),

    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'declined', 'refunded', 'failed')),
    decline_reason VARCHAR(200),

    -- Gateway response (tokenized — no raw card data)
    gateway_response JSONB,
    gateway_signature VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,

    -- Metadata
    device_info JSONB,
    receipt_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_transactions_terminal ON payment_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_transactions_entity ON payment_transactions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON payment_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_order ON payment_transactions(order_id);

-- Settlement batches (from gateway)
CREATE TABLE IF NOT EXISTS payment_settlements (
    id SERIAL PRIMARY KEY,
    settlement_id VARCHAR(100) UNIQUE NOT NULL,
    settlement_date DATE NOT NULL,
    total_amount_cents INTEGER NOT NULL,
    total_fees_cents INTEGER NOT NULL,
    net_amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'XCD',
    transaction_count INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    bank_reference VARCHAR(100),
    reconciliation_status VARCHAR(20) DEFAULT 'unreconciled' CHECK (reconciliation_status IN ('unreconciled', 'reconciled', 'discrepancy')),
    raw_report JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settlements_date ON payment_settlements(settlement_date);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON payment_settlements(status);

-- Payout ledger (internal tracking)
CREATE TABLE IF NOT EXISTS payout_ledger (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('vendor', 'service_provider', 'coop_member', 'driver', 'tour_operator')),
    entity_id INTEGER NOT NULL,
    transaction_id INTEGER REFERENCES payment_transactions(id),
    settlement_id INTEGER REFERENCES payment_settlements(id),

    -- Amount breakdown
    gross_amount_cents INTEGER NOT NULL,
    gateway_fee_cents INTEGER NOT NULL,
    platform_fee_cents INTEGER DEFAULT 0,
    net_amount_cents INTEGER NOT NULL,

    -- Payout status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'processing', 'completed', 'failed')),
    payout_method VARCHAR(20) DEFAULT 'bank_transfer' CHECK (payout_method IN ('bank_transfer', 'manual', 'wallet')),
    bank_account_last4 VARCHAR(4),
    bank_routing VARCHAR(9),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_payout_entity ON payout_ledger(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON payout_ledger(status);
CREATE INDEX IF NOT EXISTS idx_payout_settlement ON payout_ledger(settlement_id);

-- Webhook log (audit + retry)
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    signature VARCHAR(500),
    processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhooks_event ON payment_webhooks(event_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed ON payment_webhooks(processed);

-- Terminal configuration
CREATE TABLE IF NOT EXISTS terminal_config (
    id SERIAL PRIMARY KEY,
    terminal_id INTEGER REFERENCES payment_terminals(id) UNIQUE,
    daily_limit_cents INTEGER DEFAULT 500000,
    single_txn_limit_cents INTEGER DEFAULT 100000,
    require_pin BOOLEAN DEFAULT FALSE,
    receipt_email VARCHAR(255),
    receipt_phone VARCHAR(20),
    custom_branding JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_terminal_config_terminal ON terminal_config(terminal_id);
