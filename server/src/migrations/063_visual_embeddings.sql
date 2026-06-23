-- Migration: Add visual embeddings table for PixelRAG visual search
-- Stores screenshot tile embeddings for each listing's images
-- Uses pgvector for efficient similarity search (falls back to manual calculation if extension unavailable)

-- Create pgvector extension if available (PostgreSQL 16+ on Neon)
CREATE EXTENSION IF NOT EXISTS vector;

-- Visual embeddings table
CREATE TABLE IF NOT EXISTS visual_embeddings (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(1024) NOT NULL,
    embedding vector(256),  -- 256-dimensional embedding (PixelRAG tile embedding size)
    tile_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(listing_id, tile_index)
);

-- Index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_visual_embeddings_listing ON visual_embeddings(listing_id);
CREATE INDEX IF NOT EXISTS idx_visual_embeddings_created ON visual_embeddings(created_at);

-- HNSW index for cosine similarity (pgvector)
-- This enables sub-millisecond nearest-neighbor queries
DO $$
BEGIN
    -- Try to create HNSW index; fall back to IVFFlat if not supported
    CREATE INDEX IF NOT EXISTS idx_visual_embeddings_hnsw 
    ON visual_embeddings USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 200);
EXCEPTION WHEN OTHERS THEN
    -- Fall back to IVFFlat for older pgvector versions
    CREATE INDEX IF NOT EXISTS idx_visual_embeddings_ivfflat 
    ON visual_embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
END
$$;

-- Function to find similar listings by visual similarity
CREATE OR REPLACE FUNCTION find_similar_listings(
    query_listing_id INTEGER,
    match_count INTEGER DEFAULT 10
) RETURNS TABLE (
    listing_id INTEGER,
    title VARCHAR,
    image_url VARCHAR,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.title,
        (SELECT x.url FROM jsonb_to_recordset(COALESCE(l.photos, '[]'::jsonb)) AS x(url text) LIMIT 1),
        1 - (source.embedding <=> target.embedding) AS similarity
    FROM visual_embeddings target
    CROSS JOIN visual_embeddings source
    JOIN listings l ON source.listing_id = l.id
    WHERE target.listing_id = query_listing_id
      AND source.listing_id != query_listing_id
      AND l.status = 'active'
    ORDER BY source.embedding <=> target.embedding
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
