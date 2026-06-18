
-- Migration: Revenue and Orders
-- Date: 2026-01-23

CREATE TABLE revenue_orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id),
  vendor_id INTEGER REFERENCES vendors(id),
  listing_id INTEGER REFERENCES listings(id),
  amount NUMERIC(10,2) NOT NULL,
  commission NUMERIC(10,2) DEFAULT 0,
  net_revenue NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  transaction_id TEXT, -- Stripe/PayPal session ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_revenue_orders_vendor ON revenue_orders(vendor_id);
CREATE INDEX idx_revenue_orders_user ON revenue_orders(user_id);
CREATE INDEX idx_revenue_orders_status ON revenue_orders(status);
