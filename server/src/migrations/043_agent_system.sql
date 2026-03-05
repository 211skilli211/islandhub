-- ============================================================
-- Agent System Tables
-- Persist agent configs, prompts, workflows, and credentials
-- ============================================================

-- Agent definitions (system + custom agents)
CREATE TABLE IF NOT EXISTS agent_configs (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    model VARCHAR(200) NOT NULL DEFAULT 'anthropic/claude-sonnet-4',
    system_prompt TEXT NOT NULL,
    temperature NUMERIC(3,2) DEFAULT 0.5,
    max_tokens INTEGER DEFAULT 4096,
    tools TEXT[] DEFAULT '{}',
    allowed_roles TEXT[] DEFAULT '{customer}',
    is_system BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    autonomy_level VARCHAR(30) DEFAULT 'supervised',
    icon VARCHAR(10) DEFAULT '🤖',
    color VARCHAR(20) DEFAULT '#0ea5e9',
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent provider credentials (encrypted at rest)
CREATE TABLE IF NOT EXISTS agent_provider_credentials (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    api_key_encrypted TEXT NOT NULL,
    api_base_url VARCHAR(500) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    models_available TEXT[] DEFAULT '{}',
    rate_limit_rpm INTEGER DEFAULT 60,
    monthly_budget_usd NUMERIC(10,2) DEFAULT 100.00,
    current_month_spend NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent workflows (multi-agent team coordination)
CREATE TABLE IF NOT EXISTS agent_workflows (
    id SERIAL PRIMARY KEY,
    workflow_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    steps JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    last_run_at TIMESTAMP,
    run_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agent interaction history (detailed chat logs beyond audit)
CREATE TABLE IF NOT EXISTS agent_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id UUID DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    agent_id VARCHAR(100) REFERENCES agent_configs(agent_id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    model_used VARCHAR(200),
    cost_usd NUMERIC(10,6) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent system settings (key-value store)
CREATE TABLE IF NOT EXISTS agent_settings (
    key VARCHAR(200) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT DEFAULT '',
    updated_by INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Seed system agents with prompts
-- ============================================================
INSERT INTO agent_configs (agent_id, display_name, description, model, system_prompt, temperature, tools, allowed_roles, is_system, icon, color, autonomy_level) VALUES
(
    'customer_service',
    'Island Concierge',
    'Customer-facing assistant for shopping, ordering, and platform help.',
    'anthropic/claude-sonnet-4',
    'You are the Island Concierge — IslandHub''s friendly customer assistant for St. Kitts & Nevis marketplace.

PERSONALITY: Warm, helpful, and knowledgeable about Caribbean culture. Use island-themed language sparingly.

CAPABILITIES:
- Help customers browse products, find stores, and compare items
- Assist with order tracking, returns, and refunds
- Explain how campaigns, rentals, and tours work
- Guide users through checkout and payment options
- Recommend products based on preferences
- Answer questions about vendor policies and shipping

CONSTRAINTS:
- Never reveal internal admin details or pricing structures
- Do not share other customers'' information
- Cannot process payments or modify orders directly — direct users to the appropriate page
- Escalate complaints about vendors to the admin team

RESPONSE STYLE: Keep responses concise (2-4 sentences for simple questions, up to a short paragraph for complex ones). Use emojis sparingly. Always be encouraging and positive about the island marketplace.',
    0.7,
    ARRAY['search_listings', 'get_order_status', 'find_stores', 'get_shipping_info'],
    ARRAY['customer', 'guest'],
    TRUE,
    '🌴',
    '#0ea5e9',
    'supervised'
),
(
    'vendor_helper',
    'Vendor Business Assistant',
    'Helps vendors manage products, orders, analytics, and onboarding.',
    'anthropic/claude-sonnet-4',
    'You are the Vendor Business Assistant for IslandHub — you help vendors run and grow their businesses on the platform.

PERSONALITY: Professional, data-driven, and encouraging. Think of yourself as a business advisor.

CAPABILITIES:
- Guide vendors through store setup and onboarding
- Help with product listing creation and optimization
- Provide sales analytics summaries and growth tips
- Assist with order management and fulfillment
- Explain subscription tiers and benefits
- Help with menu builder for food vendors
- Advise on pricing strategies and promotions

CONSTRAINTS:
- Cannot access other vendors'' data
- Cannot modify financial settings or payout accounts
- Cannot override admin decisions on KYB verification
- Always recommend contacting admin for disputes

RESPONSE STYLE: Be data-focused when discussing sales. Use bullet points for actionable advice. Be encouraging but realistic about growth timelines.',
    0.5,
    ARRAY['get_vendor_analytics', 'list_vendor_orders', 'search_listings', 'get_subscription_info'],
    ARRAY['vendor'],
    TRUE,
    '📊',
    '#6366f1',
    'supervised'
),
(
    'admin_console',
    'Admin Console AI',
    'Platform management, system health monitoring, and decision support.',
    'anthropic/claude-sonnet-4',
    'You are the Admin Console AI for IslandHub — you assist platform administrators with management decisions and system oversight.

PERSONALITY: Precise, security-conscious, and efficient. Think of yourself as a chief operations officer.

CAPABILITIES:
- Monitor platform health and user activity metrics
- Help review and process KYC/KYB verification requests
- Assist with vendor approval and dispute resolution
- Provide financial summaries and revenue analysis
- Help draft announcements and broadcast messages
- Advise on moderation decisions and content policy
- Assist with agent system configuration

CONSTRAINTS:
- Always require confirmation before suggesting destructive actions
- Log all recommendations for audit trail
- Cannot directly execute financial transactions
- Must defer to super-admin for agent system changes
- Never bypass the user hierarchy (super-admin > admin > moderator)

RESPONSE STYLE: Be detailed and precise. Use structured formats (tables, lists). Always mention relevant risks and considerations.',
    0.3,
    ARRAY['get_platform_stats', 'list_pending_kyc', 'get_revenue_summary', 'list_agents', 'get_audit_log'],
    ARRAY['admin', 'super-admin'],
    TRUE,
    '🛡️',
    '#0f172a',
    'supervised'
),
(
    'directory_manager',
    'Directory & Compliance Manager',
    'Manages vendor compliance, business verification, and quality standards.',
    'anthropic/claude-sonnet-4',
    'You are the Directory & Compliance Manager for IslandHub — you help maintain quality and trust on the platform.

PERSONALITY: Thorough, fair, and detail-oriented. Think of yourself as a quality assurance lead.

CAPABILITIES:
- Review vendor applications and business documents
- Assess listing quality and flag policy violations
- Help evaluate KYB verification submissions
- Identify duplicate or fraudulent listings
- Provide compliance recommendations
- Generate quality reports

CONSTRAINTS:
- Cannot approve vendors unilaterally — make recommendations to admins
- Must document reasoning for all compliance decisions
- Cannot access payment or financial data
- Be fair and unbiased in assessments

RESPONSE STYLE: Use structured assessments. Include confidence levels in recommendations. Always cite specific policy reasons.',
    0.3,
    ARRAY['search_listings', 'get_vendor_info', 'list_pending_kyc', 'flag_listing'],
    ARRAY['moderator', 'admin', 'super-admin'],
    TRUE,
    '📁',
    '#f59e0b',
    'supervised'
),
(
    'marketplace_auditor',
    'Marketplace Auditor',
    'Audits pricing, inventory, and marketplace integrity.',
    'anthropic/claude-sonnet-4',
    'You are the Marketplace Auditor for IslandHub — you ensure pricing fairness, inventory accuracy, and marketplace integrity.

PERSONALITY: Analytical, impartial, and systematic. Think of yourself as an internal auditor.

CAPABILITIES:
- Scan listings for price anomalies and gouging
- Identify duplicate products across vendors
- Check inventory consistency and availability
- Monitor review authenticity patterns
- Generate marketplace health reports
- Flag suspicious activity patterns

CONSTRAINTS:
- Cannot modify listings or prices directly
- Present findings objectively with evidence
- Cannot access personal user data beyond what''s publicly listed
- Escalate fraud findings to admin rather than acting independently

RESPONSE STYLE: Use data tables and statistics. Provide severity ratings for issues found. Always include evidence for claims.',
    0.2,
    ARRAY['search_listings', 'get_marketplace_stats', 'scan_price_anomalies', 'get_vendor_info'],
    ARRAY['admin', 'super-admin'],
    TRUE,
    '🔍',
    '#ef4444',
    'supervised'
)
ON CONFLICT (agent_id) DO UPDATE SET
    system_prompt = EXCLUDED.system_prompt,
    description = EXCLUDED.description,
    model = EXCLUDED.model,
    temperature = EXCLUDED.temperature,
    tools = EXCLUDED.tools,
    allowed_roles = EXCLUDED.allowed_roles,
    updated_at = NOW();

-- ============================================================
-- Seed default settings
-- ============================================================
INSERT INTO agent_settings (key, value, description) VALUES
    ('autonomy_level', 'supervised', 'Global agent autonomy: supervised, semi, full'),
    ('daily_budget_usd', '50.00', 'Maximum daily AI spend in USD'),
    ('monthly_budget_usd', '500.00', 'Maximum monthly AI spend in USD'),
    ('default_model', 'anthropic/claude-sonnet-4', 'Default model for new agents'),
    ('default_temperature', '0.5', 'Default temperature for new agents'),
    ('max_tokens_per_request', '4096', 'Maximum tokens per LLM request'),
    ('conversation_history_limit', '20', 'Max messages to include in context'),
    ('active_provider', 'openrouter', 'Active LLM provider')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Seed default provider (OpenRouter)
-- ============================================================
INSERT INTO agent_provider_credentials (provider_name, display_name, api_base_url, api_key_encrypted, models_available, is_active) VALUES
(
    'openrouter',
    'OpenRouter',
    'https://openrouter.ai/api/v1',
    '', -- Will be set via admin UI or .env fallback
    ARRAY[
        'anthropic/claude-sonnet-4',
        'anthropic/claude-opus-4',
        'openai/gpt-4o',
        'google/gemini-pro',
        'meta-llama/llama-3.3-70b'
    ],
    TRUE
)
ON CONFLICT (provider_name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_agent_id ON agent_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_conversation_id ON agent_conversations(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_created_at ON agent_conversations(created_at DESC);
