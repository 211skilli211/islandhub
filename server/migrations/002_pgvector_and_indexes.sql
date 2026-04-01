-- IslandHub Database Enhancements
-- PGVector, Indexes, Soft Deletes
-- Run this against your Neon PostgreSQL database

-- Enable PGVector extension for semantic search (AI agents)
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- SOFT DELETE COLUMNS - Add to key tables
-- =====================================================

-- Listings soft delete
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Users soft delete  
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Vendors soft delete
ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Stores soft delete
ALTER TABLE stores
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Orders soft delete
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Listings indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_type_status ON listings(type, status);
CREATE INDEX IF NOT EXISTS idx_listings_creator_id ON listings(creator_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active) WHERE is_active IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_deleted_at ON listings(deleted_at) WHERE deleted_at IS NOT NULL;

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active IS NOT NULL;

-- Vendors indexes
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_vendor_id ON stores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active) WHERE is_active IS NOT NULL;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_listing_id ON orders(listing_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- =====================================================
-- PGVector EMBEDDING COLUMNS FOR RAG/AI
-- =====================================================

-- Add embedding column to listings for semantic search
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for vector similarity search (Cosine distance)
CREATE INDEX IF NOT EXISTS idx_listings_embedding ON listings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- =====================================================
-- AUTOMATIC TIMESTAMP TRIGGERS
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to key tables
CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATA QUALITY FUNCTIONS
-- =====================================================

-- Function to soft delete listings
CREATE OR REPLACE FUNCTION soft_delete_listing(p_listing_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE listings 
    SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE 
    WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to restore soft-deleted listings
CREATE OR REPLACE FUNCTION restore_listing(p_listing_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE listings 
    SET deleted_at = NULL, is_active = TRUE 
    WHERE id = p_listing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get active listings only
CREATE OR REPLACE FUNCTION get_active_listings()
RETURNS TABLE (
    id INT,
    type VARCHAR(20),
    title VARCHAR(200),
    description TEXT,
    price DECIMAL(12,2),
    creator_id INT,
    category VARCHAR(50),
    status VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.type, l.title, l.description, l.price, l.creator_id, l.category, l.status
    FROM listings l
    WHERE l.is_active = TRUE AND l.deleted_at IS NULL
    ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- AUDIT LOG IMPROVEMENTS
-- =====================================================

-- Add index on audit_logs for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- =====================================================
-- COMMENTARY
-- =====================================================

COMMENT ON COLUMN listings.deleted_at IS 'Soft delete timestamp - NULL means not deleted';
COMMENT ON COLUMN listings.is_active IS 'Active status - FALSE for soft deleted records';
COMMENT ON COLUMN listings.embedding IS 'PGVector embedding for semantic search (1536 dimensions for OpenAI text-embedding-3)';

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

SELECT 
    'PGVector Extension' as check_name,
    CASE WHEN pg_extension_exists('vector') THEN 'PASS' ELSE 'FAIL' END as status
UNION ALL
SELECT 
    'Listings soft delete columns' as check_name,
    CASE WHEN column_exists('listings', 'deleted_at') AND column_exists('listings', 'is_active') THEN 'PASS' ELSE 'FAIL' END
UNION ALL
SELECT 
    'Indexes created' as check_name,
    (SELECT COUNT(*)::text FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'listings' AND indexname LIKE 'idx_%' )