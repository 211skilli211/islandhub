-- Facebook Commerce Sync Log
-- Tracks product sync status between IslandHub and Facebook Commerce Catalog

CREATE TABLE IF NOT EXISTS facebook_sync_log (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    facebook_product_id VARCHAR(255),
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, synced, failed, retry
    retailer_id VARCHAR(255),
    error_code INTEGER,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for finding failed items that need retry
CREATE INDEX IF NOT EXISTS idx_facebook_sync_status ON facebook_sync_log(status, retry_count);
CREATE INDEX IF NOT EXISTS idx_facebook_sync_product ON facebook_sync_log(product_id);
CREATE INDEX IF NOT EXISTS idx_facebook_sync_retailer ON facebook_sync_log(retailer_id);

-- Facebook vendor connection tokens
-- Stores OAuth tokens for vendors who connect their own Facebook accounts
CREATE TABLE IF NOT EXISTS facebook_vendor_connections (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(store_id) ON DELETE CASCADE,
    facebook_user_id VARCHAR(255),
    access_token TEXT NOT NULL,
    token_expires_at TIMESTAMP,
    facebook_page_id VARCHAR(255),
    facebook_catalog_id VARCHAR(255),
    permissions TEXT[], -- e.g., ['catalog_management', 'pages_read_engagement']
    status VARCHAR(20) DEFAULT 'active', -- active, expired, revoked
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facebook_vendor_store ON facebook_vendor_connections(store_id);
