/**
 * LLM Service — Direct OpenRouter Integration
 * Calls the active provider's API when ZeroClaw gateway is unavailable.
 * Supports conversation history, token tracking, and cost estimation.
 */

import { pool } from '../config/db';

// ─── Types ──────────────────────────────────────────────────
interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface LLMResponse {
    reply: string;
    model: string;
    tokensUsed: number;
    costUsd: number;
    metadata: Record<string, any>;
}

interface AgentProfile {
    agent_id: string;
    display_name: string;
    model: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    tools: string[];
}

// Pricing per million tokens (input/output) for common models
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
    // ── Free Models ──────────────────────────────
    'google/gemma-3-12b-it:free': { input: 0, output: 0 },
    'qwen/qwen3-4b:free': { input: 0, output: 0 },
    'nvidia/nemotron-3-nano-30b-a3b:free': { input: 0, output: 0 },
    'z-ai/glm-4.5-air:free': { input: 0, output: 0 },
    'arcee-ai/trinity-large-preview:free': { input: 0, output: 0 },
    'deepseek/deepseek-r1:free': { input: 0, output: 0 },
    'meta-llama/llama-4-maverick:free': { input: 0, output: 0 },
    'microsoft/phi-4-reasoning-plus:free': { input: 0, output: 0 },
    // ── Reasoning / Research ─────────────────────
    'qwen/qwen3-vl-235b-a22b-thinking': { input: 1.0, output: 4.0 },
    'openai/o3-mini': { input: 1.1, output: 4.4 },
    'google/gemini-2.5-pro-preview': { input: 1.25, output: 10.0 },
    'google/gemini-2.5-flash-preview': { input: 0.15, output: 0.6 },
    // ── General Paid ─────────────────────────────
    'anthropic/claude-sonnet-4': { input: 3.0, output: 15.0 },
    'anthropic/claude-opus-4': { input: 15.0, output: 75.0 },
    'openai/gpt-4o': { input: 2.5, output: 10.0 },
    // ── Specialty: Image / Voice / TTS ───────────
    'bytedance-seed/seedream-4.5': { input: 0, output: 0.02 },
    'openai/gpt-image-1': { input: 5.0, output: 40.0 },
    'openai/gpt-4o-mini-tts': { input: 0.6, output: 2.4 },
};

// ─── Core Functions ─────────────────────────────────────────

/**
 * Get the active provider's API key, preferring DB over .env fallback.
 */
async function getProviderCredentials(): Promise<{
    apiKey: string;
    baseUrl: string;
    provider: string;
}> {
    try {
        // Try DB first
        const result = await pool.query(
            `SELECT provider_name, api_key_encrypted, api_base_url 
             FROM agent_provider_credentials 
             WHERE is_active = TRUE 
             ORDER BY provider_name 
             LIMIT 1`
        );

        if (result.rows.length > 0 && result.rows[0].api_key_encrypted) {
            return {
                apiKey: result.rows[0].api_key_encrypted,
                baseUrl: result.rows[0].api_base_url || 'https://openrouter.ai/api/v1',
                provider: result.rows[0].provider_name,
            };
        }
    } catch (err) {
        console.warn('Could not fetch provider credentials from DB:', err);
    }

    // Fallback to .env
    return {
        apiKey: process.env.OPENROUTER_API_KEY || '',
        baseUrl: 'https://openrouter.ai/api/v1',
        provider: 'openrouter',
    };
}

/**
 * Get an agent's profile from the database.
 */
export async function getAgentFromDB(agentId: string): Promise<AgentProfile | null> {
    try {
        const result = await pool.query(
            `SELECT agent_id, display_name, model, system_prompt, temperature, max_tokens, tools
             FROM agent_configs
             WHERE agent_id = $1 AND is_active = TRUE`,
            [agentId]
        );
        return result.rows[0] || null;
    } catch (err) {
        console.error(`Failed to load agent ${agentId}:`, err);
        return null;
    }
}

/**
 * Fetch recent conversation history for context.
 */
async function getConversationHistory(
    conversationId: string,
    limit: number = 20
): Promise<LLMMessage[]> {
    try {
        const result = await pool.query(
            `SELECT role, content FROM agent_conversations
             WHERE conversation_id = $1
             ORDER BY created_at ASC
             LIMIT $2`,
            [conversationId, limit]
        );
        return result.rows.map((r: any) => ({
            role: r.role === 'agent' ? 'assistant' as const : r.role,
            content: r.content,
        }));
    } catch {
        return [];
    }
}

/**
 * Save a message to conversation history.
 */
export async function saveConversationMessage(
    conversationId: string,
    userId: number | null,
    agentId: string,
    role: string,
    content: string,
    tokensUsed: number = 0,
    model: string = '',
    costUsd: number = 0,
    metadata: Record<string, any> = {}
): Promise<void> {
    try {
        await pool.query(
            `INSERT INTO agent_conversations (conversation_id, user_id, agent_id, role, content, tokens_used, model_used, cost_usd, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [conversationId, userId, agentId, role, content, tokensUsed, model, costUsd, JSON.stringify(metadata)]
        );
    } catch (err) {
        console.error('Failed to save conversation message:', err);
    }
}

/**
 * Estimate cost for a completion.
 */
function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[model] || { input: 3.0, output: 15.0 };
    return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

/**
 * Check if the current spend is within budget.
 */
async function isWithinBudget(): Promise<{ ok: boolean; dailySpend: number; monthlySpend: number }> {
    try {
        const settings = await pool.query(
            `SELECT key, value FROM agent_settings WHERE key IN ('daily_budget_usd', 'monthly_budget_usd')`
        );
        const settingsMap: Record<string, string> = {};
        settings.rows.forEach((r: any) => { settingsMap[r.key] = r.value; });

        const dailyBudget = parseFloat(settingsMap['daily_budget_usd'] || '50');
        const monthlyBudget = parseFloat(settingsMap['monthly_budget_usd'] || '500');

        const spendResult = await pool.query(
            `SELECT 
                COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN cost_usd ELSE 0 END), 0) as daily_spend,
                COALESCE(SUM(CASE WHEN created_at > NOW() - INTERVAL '1 month' THEN cost_usd ELSE 0 END), 0) as monthly_spend
             FROM agent_conversations
             WHERE role = 'agent'`
        );

        const dailySpend = parseFloat(spendResult.rows[0]?.daily_spend || '0');
        const monthlySpend = parseFloat(spendResult.rows[0]?.monthly_spend || '0');

        return {
            ok: dailySpend < dailyBudget && monthlySpend < monthlyBudget,
            dailySpend,
            monthlySpend,
        };
    } catch {
        return { ok: true, dailySpend: 0, monthlySpend: 0 };
    }
}

/**
 * Main function: Chat with an agent via the LLM provider.
 */
export async function chatWithAgent(
    agentId: string,
    userMessage: string,
    conversationId: string,
    userId: number | null = null,
    extraContext: Record<string, any> = {}
): Promise<LLMResponse> {
    // 1. Load agent profile from DB
    const agent = await getAgentFromDB(agentId);
    if (!agent) {
        return {
            reply: `Agent "${agentId}" is not configured. Please contact the platform administrator.`,
            model: 'none',
            tokensUsed: 0,
            costUsd: 0,
            metadata: { error: 'agent_not_found' },
        };
    }

    // 2. Check budget limits
    const budget = await isWithinBudget();
    if (!budget.ok) {
        return {
            reply: 'The AI budget limit has been reached. Please contact the platform administrator to increase the budget.',
            model: agent.model,
            tokensUsed: 0,
            costUsd: 0,
            metadata: { error: 'budget_exceeded', ...budget },
        };
    }

    // 3. Get provider credentials
    const creds = await getProviderCredentials();
    if (!creds.apiKey) {
        return {
            reply: 'No AI provider is configured. Please add an API key in the Agent Center settings.',
            model: agent.model,
            tokensUsed: 0,
            costUsd: 0,
            metadata: { error: 'no_api_key' },
        };
    }

    // 4. Build conversation messages
    const history = await getConversationHistory(conversationId);
    const messages: LLMMessage[] = [
        { role: 'system', content: agent.system_prompt },
        ...history,
        { role: 'user', content: userMessage },
    ];

    // 5. Save user message to history
    await saveConversationMessage(conversationId, userId, agentId, 'user', userMessage);

    // 6. Call the LLM API
    try {
        const response = await fetch(`${creds.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${creds.apiKey}`,
                'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
                'X-Title': 'IslandHub Agent System',
            },
            body: JSON.stringify({
                model: agent.model,
                messages,
                temperature: Number(agent.temperature) || 0.5,
                max_tokens: Number(agent.max_tokens) || 4096,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`LLM API error (${response.status}):`, errorText);
            return {
                reply: `I'm experiencing a technical issue (${response.status}). Please try again shortly.`,
                model: agent.model,
                tokensUsed: 0,
                costUsd: 0,
                metadata: { error: 'api_error', status: response.status, details: errorText.substring(0, 200) },
            };
        }

        const data = await response.json();
        const replyContent = data.choices?.[0]?.message?.content || 'I processed your request but have no response to share.';
        const usage = data.usage || {};
        const inputTokens = usage.prompt_tokens || 0;
        const outputTokens = usage.completion_tokens || 0;
        const totalTokens = inputTokens + outputTokens;
        const costUsd = estimateCost(agent.model, inputTokens, outputTokens);

        // 7. Save assistant reply to history
        await saveConversationMessage(
            conversationId, userId, agentId, 'agent', replyContent,
            totalTokens, agent.model, costUsd,
            { inputTokens, outputTokens, provider: creds.provider }
        );

        return {
            reply: replyContent,
            model: agent.model,
            tokensUsed: totalTokens,
            costUsd,
            metadata: {
                inputTokens,
                outputTokens,
                provider: creds.provider,
                conversationId,
            },
        };
    } catch (error) {
        console.error('LLM call failed:', error);
        return {
            reply: 'I\'m having trouble connecting to the AI service. Please check that the provider credentials are configured correctly in Agent Center settings.',
            model: agent.model,
            tokensUsed: 0,
            costUsd: 0,
            metadata: { error: 'connection_failed', message: String(error) },
        };
    }
}

/**
 * Get a setting value from agent_settings table.
 */
export async function getAgentSetting(key: string): Promise<string | null> {
    try {
        const result = await pool.query(
            'SELECT value FROM agent_settings WHERE key = $1',
            [key]
        );
        return result.rows[0]?.value || null;
    } catch {
        return null;
    }
}

/**
 * Update a setting value.
 */
export async function updateAgentSetting(
    key: string,
    value: string,
    userId: number | null = null
): Promise<void> {
    await pool.query(
        `INSERT INTO agent_settings (key, value, updated_by, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_by = $3, updated_at = NOW()`,
        [key, value, userId]
    );
}
