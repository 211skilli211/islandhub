-- Migration: Driver Payouts Table
-- Date: 2026-02-02

CREATE TABLE IF NOT EXISTS driver_payouts (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    delivery_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_driver_payouts_driver ON driver_payouts(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_payouts_status ON driver_payouts(status);
CREATE INDEX IF NOT EXISTS idx_driver_payouts_delivery ON driver_payouts(delivery_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_driver_payouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_driver_payouts_updated_at_trigger
    BEFORE UPDATE ON driver_payouts
    FOR EACH ROW
    EXECUTE FUNCTION update_driver_payouts_updated_at();