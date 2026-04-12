-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- L3: Long-term memory table (Neon PostgreSQL + pgvector)
CREATE TABLE IF NOT EXISTS agent_memories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    memory_type VARCHAR(50) NOT NULL,  -- 'vendor_profile', 'compliance_pattern', 'interaction', 'error_recovery', 'listing_insight'
    content TEXT NOT NULL,
    embedding VECTOR(1536),            -- OpenAI ada-002 dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for semantic search (HNSW - optimized for speed)
CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding 
ON agent_memories USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index for user queries
CREATE INDEX IF NOT EXISTS idx_agent_memories_user_id ON agent_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_type ON agent_memories(memory_type);

-- L4: Episodic events (key decisions, rejections, successes)
CREATE TABLE IF NOT EXISTS episodic_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,  -- 'compliance_rejection', 'listing_approved', 'error_resolved', 'fraud_detected'
    entity_type VARCHAR(50) NOT NULL, -- 'vendor', 'listing', 'user', 'review'
    entity_id INTEGER NOT NULL,
    summary TEXT NOT NULL,
    embedding VECTOR(1536),
    outcome VARCHAR(20) NOT NULL,    -- 'success', 'failure', 'escalated', 'resolved'
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_episodic_entity ON episodic_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_episodic_outcome ON episodic_events(outcome);
CREATE INDEX IF NOT EXISTS idx_episodic_embedding ON episodic_events USING hnsw (embedding vector_cosine_ops);

-- Short-term cache for L2 (in-memory + fallback to DB)
CREATE TABLE IF NOT EXISTS short_term_cache (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    embedding VECTOR(1536),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent skill definitions (metadata for available skills)
CREATE TABLE IF NOT EXISTS agent_skills (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50),            -- 'vendor', 'content', 'operations'
    parameters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default skills
INSERT INTO agent_skills (skill_name, description, category) VALUES
    ('vendor_onboarding', 'Guide vendors through setup process', 'vendor'),
    ('compliance_helper', 'Post-rejection guidance for vendors', 'vendor'),
    ('listing_optimizer', 'SEO and pricing suggestions for listings', 'vendor'),
    ('pre_moderation', 'Auto-screen content before human review', 'content'),
    ('error_recovery', 'Context-aware error fix suggestions', 'operations'),
    ('fraud_detection', 'Identify suspicious patterns', 'content')
ON CONFLICT (skill_name) DO NOTHING;

-- Decision log for learning
CREATE TABLE IF NOT EXISTS agent_decisions (
    id SERIAL PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL,
    input_data JSONB NOT NULL,
    decision VARCHAR(50) NOT NULL,   -- 'approved', 'rejected', 'flagged', 'suggested'
    confidence FLOAT,
    human_override BOOLEAN DEFAULT FALSE,
    override_reason TEXT,
    user_feedback JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_decisions_skill ON agent_decisions(skill_name);
CREATE INDEX IF NOT EXISTS idx_agent_decisions_created ON agent_decisions(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for agent_memories
DROP TRIGGER IF EXISTS update_agent_memories_updated ON agent_memories;
CREATE TRIGGER update_agent_memories_updated
    BEFORE UPDATE ON agent_memories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE agent_memories IS 'Long-term memory for AI agents using pgvector semantic search';
COMMENT ON TABLE episodic_events IS 'Key events for pattern learning and decision tracking';
COMMENT ON TABLE short_term_cache IS 'Short-term cache for recent interactions (7-30 days)';
COMMENT ON TABLE agent_skills IS 'Available agent skills and their configurations';
COMMENT ON TABLE agent_decisions IS 'Decision log for continuous learning and improvement';