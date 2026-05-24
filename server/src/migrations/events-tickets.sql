-- Events and QR Ticket System Migration
-- Run this on your Neon PostgreSQL database

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  venue VARCHAR(255),
  address TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  category VARCHAR(50) DEFAULT 'community',
  image_url VARCHAR(500),
  banner_url VARCHAR(500),
  organizer_id INTEGER REFERENCES users(id),
  organizer_name VARCHAR(255),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
  total_capacity INTEGER DEFAULT 100,
  tickets_sold INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket tiers (pricing levels per event)
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 100,
  sold INTEGER DEFAULT 0,
  description TEXT,
  perks TEXT[] DEFAULT '{}',
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tickets (purchased tickets with QR codes)
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  tier_id INTEGER REFERENCES ticket_tiers(id),
  user_id INTEGER REFERENCES users(id),
  qr_code VARCHAR(500),
  qr_token VARCHAR(128) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'refunded', 'expired')),
  holder_name VARCHAR(255),
  holder_email VARCHAR(255),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event_id ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_qr_token ON tickets(qr_token);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event_id ON ticket_tiers(event_id);

-- Sample event for testing
INSERT INTO events (title, description, venue, address, start_date, end_date, category, organizer_id, status, total_capacity, tickets_sold)
VALUES (
  'Caribbean Music Festival 2026',
  'The biggest music festival in the Caribbean! Three days of live performances, food vendors, and cultural experiences.',
  'Warner Park Sporting Complex',
  'Basseterre, St. Kitts',
  NOW() + INTERVAL '30 days',
  NOW() + INTERVAL '33 days',
  'music',
  2,
  'published',
  5000,
  0
);

-- Sample ticket tiers for the festival
INSERT INTO ticket_tiers (event_id, name, price, quantity, description, perks)
SELECT id, 'General Admission', 75.00, 3000, 'Access to all general areas', '{"Main stage access", "Food court", "Festival merch discount"}'
FROM events WHERE title = 'Caribbean Music Festival 2026';

INSERT INTO ticket_tiers (event_id, name, price, quantity, description, perks)
SELECT id, 'VIP Experience', 200.00, 1500, 'VIP area with premium viewing', '{"VIP lounge", "Complimentary drinks", "Meet & greet", "Priority parking"}'
FROM events WHERE title = 'Caribbean Music Festival 2026';

INSERT INTO ticket_tiers (event_id, name, price, quantity, description, perks)
SELECT id, 'Platinum Table', 500.00, 500, 'Private table for 8 with bottle service', '{"Private table", "Bottle service", "Dedicated host", "Backstage tour", "All VIP perks"}'
FROM events WHERE title = 'Caribbean Music Festival 2026';
