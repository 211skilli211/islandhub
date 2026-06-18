-- Migration: Add preset AI providers
-- Run: psql -d $DATABASE_URL -f 051_add_preset_providers.sql

-- First ensure the table exists (may have been created in 043)
CREATE TABLE IF NOT EXISTS agent_provider_credentials (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    api_key_encrypted TEXT NOT NULL DEFAULT '',
    api_base_url VARCHAR(500) DEFAULT '',
    is_active BOOLEAN DEFAULT TRUE,
    models_available TEXT[] DEFAULT '{}',
    rate_limit_rpm INTEGER DEFAULT 60,
    monthly_budget_usd NUMERIC(10,2) DEFAULT 100.00,
    current_month_spend NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add preset providers with predefined models
INSERT INTO agent_provider_credentials (provider_name, display_name, api_base_url, api_key_encrypted, models_available, rate_limit_rpm, monthly_budget_usd, is_active) VALUES
(
    'relevance',
    'Relevance AI',
    'https://api.relevance.ai/v1',
    '',
    ARRAY[
        ' Relevance-2',
        ' Relevance-2-finetuned',
        ' microsoft/deepseek-ai/DeepSeek-V3'
    ],
    60,
    100,
    FALSE
),
(
    'openai',
    'OpenAI',
    'https://api.openai.com/v1',
    '',
    ARRAY[
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4-turbo',
        'gpt-4',
        'gpt-3.5-turbo',
        'o1',
        'o1-mini',
        'o3',
        'o3-mini'
    ],
    500,
    500,
    FALSE
),
(
    'openrouter',
    'OpenRouter',
    'https://openrouter.ai/api/v1',
    '',
    ARRAY[
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3.5-haiku',
        'anthropic/claude-opus-4',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'google/gemini-pro',
        'google/gemini-flash',
        'meta-llama/llama-3.3-70b-instruct',
        'meta-llama/llama-3.1-8b-instruct',
        'mistralai/mistral-7b-instruct',
        'deepseek/deepseek-chat',
        'deepseek/deepseek-coder',
        'qwen/qwen-2-72b',
        'microsoft/phi-4',
        'nvidia/llama-3.1-nemotron-70b-instruct'
    ],
    200,
    200,
    TRUE
),
(
    'anthropic',
    'Anthropic',
    'https://api.anthropic.com/v1',
    '',
    ARRAY[
        'claude-sonnet-4-20250514',
        'claude-3.5-sonnet-20241022',
        'claude-3.5-haiku-20241022',
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307'
    ],
    50,
    300,
    FALSE
),
(
    'moonshot',
    'Moonshot AI',
    'https://api.moonshot.cn/v1',
    '',
    ARRAY[
        'moonshot-v1-8k',
        'moonshot-v1-32k',
        'moonshot-v1-128k',
        'moonshot-v1-8k-vision-preview',
        'moonshot-v1-32k-vision-preview'
    ],
    60,
    100,
    FALSE
),
(
    'deepseek',
    'DeepSeek',
    'https://api.deepseek.com/v1',
    '',
    ARRAY[
        'deepseek-chat',
        'deepseek-coder',
        'deepseek-reasoner'
    ],
    100,
    150,
    FALSE
),
(
    'azure',
    'Azure OpenAI',
    'https://your-resource.openai.azure.com/openai/deployments',
    '',
    ARRAY[
        'gpt-4o',
        'gpt-4-turbo',
        'gpt-35-turbo'
    ],
    300,
    400,
    FALSE
),
(
    'google_vertex',
    'Google Vertex AI',
    'https://us-central1-aiplatform.googleapis.com/v1',
    '',
    ARRAY[
        'gemini-2.0-pro',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
    ],
    200,
    300,
    FALSE
),
(
    'aws_bedrock',
    'AWS Bedrock',
    'https://bedrock-runtime.us-east-1.amazonaws.com',
    '',
    ARRAY[
        'anthropic.claude-3-sonnet',
        'anthropic.claude-3-haiku',
        'meta.llama3-70b',
        'meta.llama3-8b',
        'ai21.j2-mid',
        'cohere.command-r-plus'
    ],
    500,
    500,
    FALSE
),
(
    'cohere',
    'Cohere',
    'https://api.cohere.ai/v1',
    '',
    ARRAY[
        'command-r-plus',
        'command-r',
        'command',
        'c4ai-command-r-plus'
    ],
    100,
    100,
    FALSE
)
ON CONFLICT (provider_name) DO NOTHING;

-- Create index
CREATE INDEX IF NOT EXISTS idx_provider_name ON agent_provider_credentials(provider_name);