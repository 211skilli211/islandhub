import { Router, Request, Response } from 'express';
import { pool } from '../config/db';
import { authenticateJWT, isAdmin } from '../middleware/authMiddleware';
import { chatWithAgent, getAgentFromDB, saveConversationMessage, getAgentSetting, updateAgentSetting } from '../services/llmService';
import { v4 as uuidv4 } from 'uuid';
import MemoryService from '../services/memoryService';
import { generateEmbedding } from '../services/embeddingService';
import { moderateContent } from '../controllers/moderationController';
import { getVendorCompliance } from '../controllers/complianceController';

const router = Router();

/**
 * Agent Gateway Routes — LIVE
 * All chat goes through the LLM service (OpenRouter → DB-backed agents).
 * Follows Context7 best practices: RBAC, audit-all, least privilege.
 */

const ZEROCLAW_GATEWAY = process.env.ZEROCLAW_GATEWAY_URL || 'http://localhost:3001';

// ────────────────────────────────────────────────────────
// Helper: Log all agent interactions to audit_logs
// ────────────────────────────────────────────────────────
async function logAgentInteraction(
    userId: number | null,
    action: string,
    details: Record<string, any>
) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, table_name, new_values, created_at)
             VALUES ($1, $2, 'agent_interactions', $3, NOW())`,
            [userId, action, JSON.stringify(details)]
        );
    } catch (err) {
        console.error('Failed to log agent interaction:', err);
    }
}

// ────────────────────────────────────────────────────────
// POST /api/agent/chat — Customer chat (public, optional auth)
// ────────────────────────────────────────────────────────
router.post('/chat', async (req: Request, res: Response) => {
    const { message, agent, conversationId, context } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const agentId = agent || 'customer_service';
    const convId = conversationId || uuidv4();
    const userId = context?.userId || null;

    const result = await chatWithAgent(agentId, message, convId, userId, {
        role: 'customer',
        source: 'floating_chat',
    });

    await logAgentInteraction(userId, 'agent_chat', {
        agent: agentId,
        message_length: message.length,
        role: 'customer',
        conversationId: convId,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
    });

    res.json({ ...result, conversationId: convId });
});

// ────────────────────────────────────────────────────────
// POST /api/agent/chat/vendor — Vendor chat (auth required)
// ────────────────────────────────────────────────────────
router.post('/chat/vendor', authenticateJWT, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user || !['vendor', 'admin', 'super-admin'].includes(user.role)) {
        return res.status(403).json({ error: 'Vendor role required' });
    }

    const { message, conversationId, context } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const convId = conversationId || uuidv4();
    const result = await chatWithAgent('vendor_helper', message, convId, user.id, {
        role: user.role,
        source: 'vendor_panel',
    });

    await logAgentInteraction(user.id, 'agent_chat_vendor', {
        agent: 'vendor_helper',
        message_length: message.length,
        role: user.role,
        conversationId: convId,
        tokensUsed: result.tokensUsed,
    });

    res.json({ ...result, conversationId: convId });
});

// ────────────────────────────────────────────────────────
// POST /api/agent/chat/admin — Admin chat (admin role required)
// ────────────────────────────────────────────────────────
router.post('/chat/admin', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { message, agent, conversationId } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const agentId = agent || 'admin_console';
    const convId = conversationId || uuidv4();

    const result = await chatWithAgent(agentId, message, convId, user.id, {
        role: user.role,
        source: 'admin_command_center',
    });

    await logAgentInteraction(user.id, 'agent_chat_admin', {
        agent: agentId,
        message_length: message.length,
        role: user.role,
        conversationId: convId,
        tokensUsed: result.tokensUsed,
        costUsd: result.costUsd,
    });

    res.json({ ...result, conversationId: convId });
});

// ────────────────────────────────────────────────────────
// GET /api/agent/chat/history/:agentId — Get chat history
// ────────────────────────────────────────────────────────
router.get('/chat/history/:agentId', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;
        const limit = parseInt(req.query.limit as string) || 50;

        const result = await pool.query(
            `SELECT role, content, created_at, tokens_used, cost_usd
             FROM agent_conversations
             WHERE agent_id = $1
             ORDER BY created_at DESC
             LIMIT $2`,
            [agentId, limit]
        );

        res.json({ messages: result.rows.reverse() });
    } catch (error) {
        console.error('Failed to fetch chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// ────────────────────────────────────────────────────────
// POST /api/agent/chat/moderator — Moderator chat
// ────────────────────────────────────────────────────────
router.post('/chat/moderator', authenticateJWT, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user || !['moderator', 'admin', 'super-admin'].includes(user.role)) {
        return res.status(403).json({ error: 'Moderator role required' });
    }

    const { message, conversationId } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    const convId = conversationId || uuidv4();
    const result = await chatWithAgent('directory_manager', message, convId, user.id, {
        role: user.role,
        source: 'moderator_panel',
    });

    await logAgentInteraction(user.id, 'agent_chat_moderator', {
        agent: 'directory_manager',
        message_length: message.length,
        role: user.role,
        conversationId: convId,
    });

    res.json({ ...result, conversationId: convId });
});

// ════════════════════════════════════════════════════════
// AGENT MANAGEMENT ENDPOINTS (Admin only)
// ════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────
// GET /api/agent/configs — List all agent configurations
// ────────────────────────────────────────────────────────
router.get('/configs', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, agent_id, display_name, description, model, system_prompt, 
                    temperature, max_tokens, tools, allowed_roles, is_system, is_active, 
                    autonomy_level, icon, color, created_at, updated_at
             FROM agent_configs 
             ORDER BY is_system DESC, display_name ASC`
        );
        res.json({ agents: result.rows });
    } catch (error) {
        console.error('Failed to list agents:', error);
        res.status(500).json({ error: 'Failed to list agents' });
    }
});

// ────────────────────────────────────────────────────────
// GET /api/agent/configs/:agentId — Get single agent config
// ────────────────────────────────────────────────────────
router.get('/configs/:agentId', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM agent_configs WHERE agent_id = $1',
            [req.params.agentId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        res.json({ agent: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get agent' });
    }
});

// ────────────────────────────────────────────────────────
// POST /api/agent/configs — Create a new agent
// ────────────────────────────────────────────────────────
router.post('/configs', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== 'super-admin' && user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin role required to create agents' });
    }

    const { agent_id, display_name, description, model, system_prompt, temperature, max_tokens, tools, allowed_roles, icon, color, autonomy_level } = req.body;

    if (!agent_id || !display_name || !system_prompt) {
        return res.status(400).json({ error: 'agent_id, display_name, and system_prompt are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO agent_configs (agent_id, display_name, description, model, system_prompt, temperature, max_tokens, tools, allowed_roles, is_system, icon, color, autonomy_level, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, $10, $11, $12, $13)
             RETURNING *`,
            [
                agent_id, display_name, description || '',
                model || 'anthropic/claude-sonnet-4', system_prompt,
                temperature || 0.5, max_tokens || 4096,
                tools || [], allowed_roles || ['customer'],
                icon || '🤖', color || '#0ea5e9',
                autonomy_level || 'supervised',
                user.id,
            ]
        );

        await logAgentInteraction(user.id, 'agent_created', {
            agent_id,
            display_name,
            model: model || 'anthropic/claude-sonnet-4',
            createdBy: user.email,
        });

        res.status(201).json({ agent: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: `Agent "${agent_id}" already exists` });
        }
        console.error('Failed to create agent:', error);
        res.status(500).json({ error: 'Failed to create agent' });
    }
});

// ────────────────────────────────────────────────────────
// PUT /api/agent/configs/:agentId — Update agent config (including prompt)
// ────────────────────────────────────────────────────────
router.put('/configs/:agentId', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { agentId } = req.params;
    const { display_name, description, model, system_prompt, temperature, max_tokens, tools, allowed_roles, is_active, icon, color, autonomy_level } = req.body;

    try {
        const result = await pool.query(
            `UPDATE agent_configs SET
                display_name = COALESCE($1, display_name),
                description = COALESCE($2, description),
                model = COALESCE($3, model),
                system_prompt = COALESCE($4, system_prompt),
                temperature = COALESCE($5, temperature),
                max_tokens = COALESCE($6, max_tokens),
                tools = COALESCE($7, tools),
                allowed_roles = COALESCE($8, allowed_roles),
                is_active = COALESCE($9, is_active),
                icon = COALESCE($10, icon),
                color = COALESCE($11, color),
                autonomy_level = COALESCE($12, autonomy_level),
                updated_at = NOW()
             WHERE agent_id = $13
             RETURNING *`,
            [display_name, description, model, system_prompt, temperature, max_tokens, tools, allowed_roles, is_active, icon, color, autonomy_level, agentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        await logAgentInteraction(user.id, 'agent_updated', {
            agent_id: agentId,
            changes: req.body,
            updatedBy: user.email,
        });

        res.json({ agent: result.rows[0] });
    } catch (error) {
        console.error('Failed to update agent:', error);
        res.status(500).json({ error: 'Failed to update agent' });
    }
});

// ────────────────────────────────────────────────────────
// DELETE /api/agent/configs/:agentId — Delete a custom agent (not system)
// ────────────────────────────────────────────────────────
router.delete('/configs/:agentId', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== 'super-admin') {
        return res.status(403).json({ error: 'Super-admin required to delete agents' });
    }

    try {
        const agent = await pool.query('SELECT is_system FROM agent_configs WHERE agent_id = $1', [req.params.agentId]);
        if (agent.rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
        if (agent.rows[0].is_system) return res.status(403).json({ error: 'Cannot delete system agents' });

        await pool.query('DELETE FROM agent_configs WHERE agent_id = $1', [req.params.agentId]);

        await logAgentInteraction(user.id, 'agent_deleted', {
            agent_id: req.params.agentId,
            deletedBy: user.email,
        });

        res.json({ success: true, message: `Agent "${req.params.agentId}" deleted.` });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});

// ════════════════════════════════════════════════════════
// PROVIDER CREDENTIAL ENDPOINTS (Super-admin only)
// ════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────
// GET /api/agent/providers — List all providers
// ────────────────────────────────────────────────────────
router.get('/providers', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, provider_name, display_name, api_base_url, is_active, 
                    models_available, rate_limit_rpm, monthly_budget_usd, current_month_spend,
                    LENGTH(api_key_encrypted) > 0 as has_api_key,
                    created_at, updated_at
             FROM agent_provider_credentials
             ORDER BY display_name ASC`
        );
        res.json({ providers: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to list providers' });
    }
});

// ────────────────────────────────────────────────────────
// POST /api/agent/providers — Add a new provider
// ────────────────────────────────────────────────────────
router.post('/providers', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== 'super-admin') {
        return res.status(403).json({ error: 'Super-admin required' });
    }

    const { provider_name, display_name, api_key, api_base_url, models_available, rate_limit_rpm, monthly_budget_usd } = req.body;

    if (!provider_name || !display_name || !api_key) {
        return res.status(400).json({ error: 'provider_name, display_name, and api_key are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO agent_provider_credentials (provider_name, display_name, api_key_encrypted, api_base_url, models_available, rate_limit_rpm, monthly_budget_usd, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
             RETURNING id, provider_name, display_name, api_base_url, is_active, models_available`,
            [provider_name, display_name, api_key, api_base_url || '', models_available || [], rate_limit_rpm || 60, monthly_budget_usd || 100]
        );

        await logAgentInteraction(user.id, 'provider_added', {
            provider: provider_name,
            addedBy: user.email,
        });

        res.status(201).json({ provider: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: `Provider "${provider_name}" already exists` });
        }
        res.status(500).json({ error: 'Failed to add provider' });
    }
});

// ────────────────────────────────────────────────────────
// PUT /api/agent/providers/:providerName — Update provider (incl. API key)
// ────────────────────────────────────────────────────────
router.put('/providers/:providerName', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== 'super-admin') {
        return res.status(403).json({ error: 'Super-admin required' });
    }

    const { api_key, api_base_url, is_active, models_available, rate_limit_rpm, monthly_budget_usd } = req.body;

    try {
        // Build dynamic update — only change fields that are provided
        const updates: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (api_key !== undefined) { updates.push(`api_key_encrypted = $${idx++}`); params.push(api_key); }
        if (api_base_url !== undefined) { updates.push(`api_base_url = $${idx++}`); params.push(api_base_url); }
        if (is_active !== undefined) { updates.push(`is_active = $${idx++}`); params.push(is_active); }
        if (models_available !== undefined) { updates.push(`models_available = $${idx++}`); params.push(models_available); }
        if (rate_limit_rpm !== undefined) { updates.push(`rate_limit_rpm = $${idx++}`); params.push(rate_limit_rpm); }
        if (monthly_budget_usd !== undefined) { updates.push(`monthly_budget_usd = $${idx++}`); params.push(monthly_budget_usd); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push(`updated_at = NOW()`);
        params.push(req.params.providerName);

        const result = await pool.query(
            `UPDATE agent_provider_credentials SET ${updates.join(', ')} WHERE provider_name = $${idx}
             RETURNING id, provider_name, display_name, api_base_url, is_active, models_available, LENGTH(api_key_encrypted) > 0 as has_api_key`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Provider not found' });
        }

        await logAgentInteraction(user.id, 'provider_updated', {
            provider: req.params.providerName,
            updatedFields: Object.keys(req.body).filter(k => k !== 'api_key'),
            updatedBy: user.email,
        });

        res.json({ provider: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update provider' });
    }
});

// ════════════════════════════════════════════════════════
// WORKFLOW ENDPOINTS
// ════════════════════════════════════════════════════════

// GET /api/agent/workflows — List workflows
router.get('/workflows', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM agent_workflows ORDER BY created_at DESC`
        );
        res.json({ workflows: result.rows });
    } catch {
        res.status(500).json({ error: 'Failed to list workflows' });
    }
});

// POST /api/agent/workflows — Create workflow
router.post('/workflows', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { workflow_id, name, description, steps } = req.body;

    if (!workflow_id || !name || !steps) {
        return res.status(400).json({ error: 'workflow_id, name, and steps are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO agent_workflows (workflow_id, name, description, steps, created_by)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [workflow_id, name, description || '', JSON.stringify(steps), user.id]
        );

        await logAgentInteraction(user.id, 'workflow_created', { workflow_id, name });
        res.status(201).json({ workflow: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ error: `Workflow "${workflow_id}" already exists` });
        }
        res.status(500).json({ error: 'Failed to create workflow' });
    }
});

// ════════════════════════════════════════════════════════
// SETTINGS ENDPOINTS
// ════════════════════════════════════════════════════════

// GET /api/agent/settings — Get all agent settings
router.get('/settings', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM agent_settings ORDER BY key');
        const settings: Record<string, string> = {};
        result.rows.forEach((r: any) => { settings[r.key] = r.value; });
        res.json({ settings });
    } catch {
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

// PUT /api/agent/settings — Update settings (super-admin only)
router.put('/settings', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (user.role !== 'super-admin') {
        return res.status(403).json({ error: 'Super-admin required to modify settings' });
    }

    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: 'settings object is required' });
    }

    try {
        for (const [key, value] of Object.entries(settings)) {
            await updateAgentSetting(key, String(value), user.id);
        }

        await logAgentInteraction(user.id, 'settings_updated', {
            keys: Object.keys(settings),
            updatedBy: user.email,
        });

        res.json({ success: true, message: 'Settings updated' });
    } catch {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

// ════════════════════════════════════════════════════════
// STATUS & AUDIT ENDPOINTS
// ════════════════════════════════════════════════════════

// GET /api/agent/status — Agent health & status dashboard
router.get('/status', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        // Get agents from DB
        const agentsResult = await pool.query(
            `SELECT agent_id, display_name, model, is_active, icon, autonomy_level
             FROM agent_configs WHERE is_active = TRUE ORDER BY is_system DESC, display_name`
        );

        // Check ZeroClaw gateway
        const healthCheck = await fetch(`${ZEROCLAW_GATEWAY}/health`).catch(() => null);
        const gatewayOnline = healthCheck?.ok || false;

        // Check if provider has API key
        const providerResult = await pool.query(
            `SELECT provider_name, LENGTH(api_key_encrypted) > 0 as has_key, is_active
             FROM agent_provider_credentials WHERE is_active = TRUE LIMIT 1`
        );
        const providerReady = providerResult.rows.length > 0 && providerResult.rows[0].has_key;

        // Get 24h interaction counts
        const activityResult = await pool.query(
            `SELECT agent_id,
                    COUNT(*) as interaction_count,
                    MAX(created_at) as last_active,
                    SUM(tokens_used) as total_tokens,
                    SUM(cost_usd) as total_cost
             FROM agent_conversations
             WHERE created_at > NOW() - INTERVAL '24 hours'
             GROUP BY agent_id`
        );
        const activityMap: Record<string, any> = {};
        activityResult.rows.forEach((r: any) => {
            activityMap[r.agent_id] = {
                interactions24h: parseInt(r.interaction_count),
                lastActive: r.last_active,
                tokens24h: parseInt(r.total_tokens || '0'),
                cost24h: parseFloat(r.total_cost || '0'),
            };
        });

        // Get settings
        const settingsResult = await pool.query('SELECT key, value FROM agent_settings');
        const settings: Record<string, string> = {};
        settingsResult.rows.forEach((r: any) => { settings[r.key] = r.value; });

        // Get total spend this month
        const spendResult = await pool.query(
            `SELECT COALESCE(SUM(cost_usd), 0) as monthly_spend
             FROM agent_conversations
             WHERE role = 'agent' AND created_at > date_trunc('month', NOW())`
        );

        const agents = agentsResult.rows.map((agent: any) => ({
            name: agent.agent_id,
            displayName: agent.display_name,
            model: agent.model,
            icon: agent.icon,
            autonomyLevel: agent.autonomy_level,
            status: providerReady ? 'online' : (gatewayOnline ? 'online' : 'offline'),
            interactions24h: activityMap[agent.agent_id]?.interactions24h || 0,
            lastActive: activityMap[agent.agent_id]?.lastActive || null,
            tokens24h: activityMap[agent.agent_id]?.tokens24h || 0,
            cost24h: activityMap[agent.agent_id]?.cost24h || 0,
        }));

        res.json({
            gateway: { url: ZEROCLAW_GATEWAY, online: gatewayOnline },
            provider: {
                ready: providerReady,
                name: providerResult.rows[0]?.provider_name || 'none',
            },
            agents,
            config: {
                autonomyLevel: settings['autonomy_level'] || 'supervised',
                dailyLimitUsd: parseFloat(settings['daily_budget_usd'] || '50'),
                monthlyLimitUsd: parseFloat(settings['monthly_budget_usd'] || '500'),
                monthlySpend: parseFloat(spendResult.rows[0]?.monthly_spend || '0'),
            },
        });
    } catch (error) {
        console.error('Agent status check failed:', error);
        res.json({
            gateway: { url: ZEROCLAW_GATEWAY, online: false },
            provider: { ready: false, name: 'none' },
            agents: [],
            config: { autonomyLevel: 'supervised', dailyLimitUsd: 50, monthlyLimitUsd: 500, monthlySpend: 0 },
        });
    }
});

// GET /api/agent/audit — Agent audit log
router.get('/audit', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    try {
        const result = await pool.query(
            `SELECT al.*, u.name as admin_name, u.email as admin_email
             FROM audit_logs al
             LEFT JOIN users u ON al.user_id = u.user_id
             WHERE al.action LIKE 'agent_%'
             ORDER BY al.created_at DESC
             LIMIT $1 OFFSET $2`,
            [limit, offset]
        );

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM audit_logs WHERE action LIKE 'agent_%'`
        );

        res.json({
            logs: result.rows,
            total: parseInt(countResult.rows[0].count),
            limit,
            offset,
        });
    } catch (error) {
        console.error('Agent audit query failed:', error);
        res.status(500).json({ error: 'Failed to fetch agent audit logs' });
    }
});

// GET /api/agent/spend — Spend summary
router.get('/spend', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT 
                date_trunc('day', created_at) as day,
                agent_id,
                COUNT(*) as messages,
                SUM(tokens_used) as tokens,
                SUM(cost_usd) as cost
             FROM agent_conversations
             WHERE created_at > NOW() - INTERVAL '30 days'
             GROUP BY day, agent_id
             ORDER BY day DESC`
        );
        res.json({ spend: result.rows });
    } catch {
        res.status(500).json({ error: 'Failed to get spend data' });
    }
});

// ────────────────────────────────────────────────────────
// ReMeLight Hybrid Memory System API (Admin Only)
// ────────────────────────────────────────────────────────
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec);

// Move require to a safer place or use dynamic import with check
let sqlite3: any = null;
try {
    sqlite3 = require('sqlite3');
} catch (e) {
    console.warn('sqlite3 module not found. SQLite features will be disabled.');
}

const MEMORY_ROOT = path.join(__dirname, '../../..', 'memory');
const MAIN_CONTEXT_PATH = path.join(MEMORY_ROOT, 'projects', 'main_context.md');
const SCRIPTS_DIR = path.join(MEMORY_ROOT, 'scripts');
const DB_PATH = path.join(MEMORY_ROOT, 'technical_data.db');

// Recursive helper to list all .md and .txt files in memory root
function getAllMemoryFiles(dir: string, baseDir: string = MEMORY_ROOT): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllMemoryFiles(filePath, baseDir));
        } else if (file.endsWith('.md') || file.endsWith('.txt') || file.endsWith('.json')) {
            results.push(path.relative(baseDir, filePath));
        }
    });
    return results;
}

// GET /api/agent/memory/status — ReMeLight metrics
router.get('/memory/status', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        let contextSize = 0;
        let lastUpdated = null;
        if (fs.existsSync(MAIN_CONTEXT_PATH)) {
            const stats = fs.statSync(MAIN_CONTEXT_PATH);
            contextSize = stats.size;
            lastUpdated = stats.mtime;
        }

        let endpointsCount = 0;
        let schemasCount = 0;

        if (sqlite3 && fs.existsSync(DB_PATH)) {
            const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY);

            const getCount = (table: string): Promise<number> => new Promise((resolve) => {
                db.get(`SELECT COUNT(*) as count FROM ${table}`, (err: any, row: any) => {
                    resolve(err ? 0 : row?.count || 0);
                });
            });

            endpointsCount = await getCount('api_endpoints');
            schemasCount = await getCount('db_schemas');
            db.close();
        } else {
            console.warn('SQLite DB not found or sqlite3 not loaded:', { exists: fs.existsSync(DB_PATH), loaded: !!sqlite3 });
        }

        res.json({
            contextSizeInBytes: contextSize,
            lastUpdated,
            sqliteRecords: {
                api_endpoints: endpointsCount,
                db_schemas: schemasCount
            },
            systemReady: !!sqlite3 && fs.existsSync(DB_PATH)
        });
    } catch (error: any) {
        console.error('Memory status check failed:', error);
        res.status(500).json({ error: 'Failed to get memory status', details: error.message });
    }
});

// GET /api/agent/memory/context — Read main_context.md
router.get('/memory/context', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        if (!fs.existsSync(MAIN_CONTEXT_PATH)) {
            return res.json({ content: '# Context File Not Found\nRun the start routine or ReMeLight initialization.' });
        }
        const content = fs.readFileSync(MAIN_CONTEXT_PATH, 'utf-8');
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read context' });
    }
});

// POST /api/agent/memory/compact — Trigger compact_memory.js
router.post('/memory/compact', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        await logAgentInteraction((req as any).user?.id || null, 'memory_compaction_triggered', {});
        const { stdout, stderr } = await execPromise(`node compact_memory.js`, { cwd: SCRIPTS_DIR });
        res.json({ success: true, log: stdout || stderr });
    } catch (error: any) {
        console.error('Compaction failed:', error);
        res.status(500).json({ error: 'Compaction script failed', log: error.message });
    }
});

// GET /api/agent/memory/sync — Trigger zeroclaw_sync.js
router.post('/memory/sync', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        await logAgentInteraction((req as any).user?.id || null, 'zeroclaw_sync_triggered', {});
        const { stdout, stderr } = await execPromise(`node zeroclaw_sync.js`, { cwd: SCRIPTS_DIR });
        res.json({ success: true, log: stdout || stderr });
    } catch (error: any) {
        console.error('Sync failed:', error);
        res.status(500).json({ error: 'Sync script failed', log: error.message });
    }
});

// ────────────────────────────────────────────────────────
// Memory File Management (New in Phase 6)
// ────────────────────────────────────────────────────────

// GET /api/agent/memory/files — List all memory files
router.get('/memory/files', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const files = getAllMemoryFiles(MEMORY_ROOT);
        res.json({ files });
    } catch (error) {
        res.status(500).json({ error: 'Failed to list memory files' });
    }
});

// GET /api/agent/memory/file/:filename(*) — Read memory file
router.get('/memory/file/:filename(*)', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const filePath = path.join(MEMORY_ROOT, req.params.filename);
        if (!filePath.startsWith(MEMORY_ROOT)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const content = fs.readFileSync(filePath, 'utf-8');
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// POST /api/agent/memory/file/:filename(*) — Update memory file
router.post('/memory/file/:filename(*)', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const { content } = req.body;
        const filePath = path.join(MEMORY_ROOT, req.params.filename);
        if (!filePath.startsWith(MEMORY_ROOT)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        fs.writeFileSync(filePath, content, 'utf-8');

        await logAgentInteraction((req as any).user?.id || null, 'memory_file_updated', {
            file: req.params.filename,
            size: content.length
        });

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update file' });
    }
});

// ════════════════════════════════════════════════════════
// NEW: Memory Service Endpoints (L1-L4)
// ════════════════════════════════════════════════════════

// POST /api/agent/memories - Store new memory
router.post('/memories', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { memory_type, content, metadata } = req.body;

        if (!memory_type || !content) {
            return res.status(400).json({ error: 'memory_type and content are required' });
        }

        const memoryId = await MemoryService.remember(user.id, memory_type, content, metadata);

        // Record as episodic event for learning
        await MemoryService.recordEvent(
            'memory_stored',
            'user',
            user.id,
            `Stored ${memory_type}: ${content.substring(0, 100)}...`,
            'resolved',
            { memory_id: memoryId }
        );

        res.json({ success: true, memory_id: memoryId });
    } catch (error) {
        console.error('Failed to store memory:', error);
        res.status(500).json({ error: 'Failed to store memory' });
    }
});

// GET /api/agent/memories - Recall similar memories
router.get('/memories', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { query, memory_types, threshold, limit } = req.query;

        if (!query) {
            // Return user's recent memories
            const memories = await MemoryService.getUserMemories(user.id);
            return res.json({ memories });
        }

        // Semantic search
        const memories = await MemoryService.recall(String(query), {
            user_id: user.id,
            memory_types: memory_types ? String(memory_types).split(',') : undefined,
            threshold: threshold ? parseFloat(String(threshold)) : 0.7,
            limit: limit ? parseInt(String(limit)) : 5,
        });

        res.json({ memories });
    } catch (error) {
        console.error('Failed to recall memories:', error);
        res.status(500).json({ error: 'Failed to recall memories' });
    }
});

// POST /api/agent/recall - Semantic search across all memories
router.post('/recall', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const { query, entity_type, limit } = req.body;

        const events = await MemoryService.getSimilarEvents(query, entity_type);
        
        res.json({ events: events.slice(0, limit || 10) });
    } catch (error) {
        console.error('Failed to recall events:', error);
        res.status(500).json({ error: 'Failed to recall events' });
    }
});

// POST /api/agent/learn - Record decision outcome for learning
router.post('/learn', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { event_type, entity_type, entity_id, summary, outcome, details } = req.body;

        if (!event_type || !entity_type || !entity_id || !summary || !outcome) {
            return res.status(400).json({ error: 'event_type, entity_type, entity_id, summary, and outcome are required' });
        }

        const eventId = await MemoryService.recordEvent(
            event_type,
            entity_type,
            entity_id,
            summary,
            outcome,
            details
        );

        res.json({ success: true, event_id: eventId });
    } catch (error) {
        console.error('Failed to record event:', error);
        res.status(500).json({ error: 'Failed to record event' });
    }
});

// ════════════════════════════════════════════════════════
// NEW: Skill-Based Endpoints (Pre-Moderation, Compliance Helper, etc.)
// ════════════════════════════════════════════════════════

// POST /api/agent/execute - Execute specific skill
router.post('/execute', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const { skill, input, context } = req.body;

        if (!skill || !input) {
            return res.status(400).json({ error: 'skill and input are required' });
        }

        let result: any = null;

        switch (skill) {
            case 'pre_moderation':
                // Content pre-screening
                const moderation = await moderateContent(input.content || input);
                
                // Record for learning
                await MemoryService.recordEvent(
                    'content_moderated',
                    'listing',
                    input.listing_id || 0,
                    `Moderated: ${input.content?.substring(0, 50) || 'text'}...`,
                    moderation.flagged ? 'escalated' : 'resolved',
                    { flagged: moderation.flagged, categories: moderation.categories }
                );
                
                result = {
                    action: moderation.flagged ? 'flag' : 'approve',
                    confidence: moderation.flagged ? 0.9 : 0.95,
                    categories: moderation.categories,
                    suggestion: moderation.flagged 
                        ? 'Content flagged for human review'
                        : 'Content appears safe, auto-approved'
                };
                break;

            case 'vendor_onboarding':
                // Vendor onboarding guidance
                const onboardingMemories = await MemoryService.recall('vendor onboarding rejected compliance', {
                    user_id: user.id,
                    memory_types: ['compliance_pattern', 'error_recovery'],
                    limit: 3
                });

                result = {
                    message: 'Welcome to IslandHub! Let\'s get your vendor profile set up.',
                    step: context?.currentStep || 1,
                    previousIssues: onboardingMemories.map(m => ({
                        issue: m.content,
                        similarity: m.similarity
                    })),
                    suggestions: [
                        'Complete your business profile',
                        'Verify your identity (KYC)',
                        'Submit compliance documents'
                    ]
                };
                break;

            case 'compliance_helper':
                // Post-rejection guidance
                const { rejection_reason, jurisdiction } = input;
                
                const complianceMemories = await MemoryService.getSimilarEvents(
                    `${rejection_reason} ${jurisdiction} compliance fix`,
                    'vendor'
                );

                result = {
                    message: `I can help you address this ${rejection_reason} issue.`,
                    guidance: getComplianceGuidance(rejection_reason, jurisdiction),
                    similarIssues: complianceMemories.slice(0, 3).map(e => ({
                        summary: e.summary,
                        outcome: e.outcome
                    }))
                };
                break;

            case 'listing_optimizer':
                // SEO and pricing suggestions
                const listingMemories = await MemoryService.recall('successful listing optimization', {
                    limit: 3
                });

                result = {
                    suggestions: generateListingSuggestions(input),
                    successfulPatterns: listingMemories.map(m => m.content)
                };
                break;

            case 'error_recovery':
                // Context-aware error fix
                const { error_code, user_action } = input;
                
                const errorMemories = await MemoryService.getSimilarEvents(
                    `error ${error_code} resolved fix`,
                    'user'
                );

                result = {
                    possibleCauses: getErrorCauses(error_code),
                    suggestedFixes: getErrorFixes(error_code),
                    similarResolutions: errorMemories.filter(e => e.outcome === 'resolved').slice(0, 3).map(e => ({
                        summary: e.summary,
                        details: e.details
                    }))
                };
                break;

            default:
                return res.status(400).json({ error: `Unknown skill: ${skill}` });
        }

        res.json({ skill, result });
    } catch (error) {
        console.error('Failed to execute skill:', error);
        res.status(500).json({ error: 'Failed to execute skill' });
    }
});

// Helper functions for skill implementations
function getComplianceGuidance(rejectionReason: string, jurisdiction: string): string {
    const guidance: Record<string, Record<string, string>> = {
        insurance_insufficient: {
            'JM': 'Jamaica requires minimum JMD 1M (XCD equivalent) liability coverage. Contact Saga Insurance or JMMB Insurance for approved rates.',
            'BB': 'Barbados requires BBD 500K minimum. Contact Caribbean Insurance services.',
            'default': 'Contact your local insurance provider for requirements specific to your business type.'
        },
        business_license_missing: {
            'JM': 'Apply at Jamaica Companies Office (OCOJ). Required: ID, business name, tax registration.',
            'BB': 'Apply at Corporate Affairs and Intellectual Property Office.',
            'default': 'Contact your local Companies Office or business registry.'
        },
        kyc_incomplete: {
            'JM': 'Submit government-issued ID (passport/driver\'s license) and proof of address (utility bill within 3 months).',
            'default': 'Submit clear, valid ID and recent proof of address.'
        }
    };

    return guidance[rejectionReason]?.[jurisdiction] || guidance[rejectionReason]?.default || 
           'Please review the rejection email for specific requirements.';
}

function generateListingSuggestions(listing: any): string[] {
    const suggestions: string[] = [];
    
    if (!listing.title || listing.title.length < 10) {
        suggestions.push('Add a descriptive title (20+ characters) with key details like location and type.');
    }
    
    if (!listing.description || listing.description.length < 50) {
        suggestions.push('Write a detailed description (100+ words) highlighting unique features and amenities.');
    }
    
    if (!listing.price) {
        suggestions.push('Set a competitive price - research similar listings in your area.');
    }
    
    if (!listing.images || listing.images.length < 3) {
        suggestions.push('Add high-quality photos (5+ recommended) showing different angles and features.');
    }
    
    if (!listing.location) {
        suggestions.push('Specify your exact location/neighborhood for better search visibility.');
    }
    
    return suggestions.length > 0 ? suggestions : ['Your listing looks good! Consider adding more photos.'];
}

function getErrorCauses(errorCode: string): string[] {
    const causes: Record<string, string[]> = {
        'VALIDATION_ERROR': ['Missing required fields', 'Invalid data format', 'Character limit exceeded'],
        'PAYMENT_FAILED': ['Card declined', 'Network timeout', 'Insufficient funds'],
        'UPLOAD_FAILED': ['File too large', 'Unsupported format', 'Connection interrupted'],
        'NOT_FOUND': ['Item no longer available', 'Link expired', 'Deleted by owner'],
        'PERMISSION_DENIED': ['Session expired', 'Role restriction', 'Not logged in']
    };
    return causes[errorCode] || ['Unknown error occurred'];
}

function getErrorFixes(errorCode: string): string[] {
    const fixes: Record<string, string[]> = {
        'VALIDATION_ERROR': ['Check all required fields', 'Remove special characters', 'Stay within character limits'],
        'PAYMENT_FAILED': ['Try another payment method', 'Contact your bank', 'Use a different card'],
        'UPLOAD_FAILED': ['Reduce file size below 5MB', 'Use JPG/PNG format', 'Retry with stable connection'],
        'NOT_FOUND': ['Refresh the page', 'Search for similar items', 'Contact support'],
        'PERMISSION_DENIED': ['Log in again', 'Check your subscription', 'Contact support']
    };
    return fixes[errorCode] || ['Please try again or contact support.'];
}

// GET /api/agent/skills - List available skills
router.get('/skills', authenticateJWT, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT skill_name, description, category, is_active 
             FROM agent_skills 
             WHERE is_active = TRUE`
        );
        res.json({ skills: result.rows });
    } catch (error) {
        console.error('Failed to list skills:', error);
        res.status(500).json({ error: 'Failed to list skills' });
    }
});

// GET /api/agent/memories/user/:userId - Get memories for specific user (admin only)
router.get('/memories/user/:userId', authenticateJWT, isAdmin, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { memory_type, limit } = req.query;

        const memories = await MemoryService.getUserMemories(
            parseInt(userId),
            memory_type as string,
            limit ? parseInt(String(limit)) : 20
        );

        res.json({ memories });
    } catch (error) {
        console.error('Failed to get user memories:', error);
        res.status(500).json({ error: 'Failed to get user memories' });
    }
});

export default router;
