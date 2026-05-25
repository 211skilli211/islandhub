-- Crypto payments table
CREATE TABLE IF NOT EXISTS crypto_payments (
    id SERIAL PRIMARY KEY,
    payment_id VARCHAR(255) UNIQUE NOT NULL,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    coin VARCHAR(10) NOT NULL,
    amount_xcd DECIMAL(12, 2) NOT NULL,
    crypto_amount VARCHAR(50) NOT NULL,
    exchange_rate DECIMAL(20, 12) NOT NULL,
    payment_address VARCHAR(255) NOT NULL,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, expired, failed
    confirmations INTEGER DEFAULT 0,
    required_confirmations INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crypto_payments_order ON crypto_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_status ON crypto_payments(status);
CREATE INDEX IF NOT EXISTS idx_crypto_payments_address ON crypto_payments(payment_address);
