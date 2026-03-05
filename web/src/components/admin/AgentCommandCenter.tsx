'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import MemoryDashboard from './MemoryDashboard';

// ─── Types ──────────────────────────────────────────────────
interface AgentConfig {
    id: number;
    agent_id: string;
    display_name: string;
    description: string;
    model: string;
    system_prompt: string;
    temperature: number;
    max_tokens: number;
    tools: string[];
    allowed_roles: string[];
    is_system: boolean;
    is_active: boolean;
    autonomy_level: string;
    icon: string;
    color: string;
}

interface AgentStatus {
    name: string;
    displayName: string;
    model: string;
    icon: string;
    status: 'online' | 'offline' | 'unknown';
    interactions24h: number;
    lastActive: string | null;
    tokens24h: number;
    cost24h: number;
}

interface Provider {
    id: number;
    provider_name: string;
    display_name: string;
    api_base_url: string;
    has_api_key: boolean;
    is_active: boolean;
    models_available: string[];
    rate_limit_rpm: number;
    monthly_budget_usd: number;
    current_month_spend: number;
}

interface AuditEntry {
    id: number;
    action: string;
    admin_name: string;
    new_values: any;
    created_at: string;
}

interface SystemConfig {
    autonomyLevel: string;
    dailyLimitUsd: number;
    monthlyLimitUsd: number;
    monthlySpend: number;
}

// ─── Sub-components ─────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        online: 'bg-emerald-500',
        offline: 'bg-red-500',
        unknown: 'bg-amber-500',
    };
    return (
        <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${colors[status] || colors.unknown} ${status === 'online' ? 'animate-pulse' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
        </span>
    );
}

// ─── Main Component ─────────────────────────────────────────

export default function AgentCommandCenter() {
    const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState<'status' | 'chat' | 'agents' | 'teams' | 'providers' | 'memory' | 'audit' | 'settings'>('status');
    const [loading, setLoading] = useState(true);

    // Status
    const [agents, setAgents] = useState<AgentStatus[]>([]);
    const [sysConfig, setSysConfig] = useState<SystemConfig>({ autonomyLevel: 'supervised', dailyLimitUsd: 50, monthlyLimitUsd: 500, monthlySpend: 0 });
    const [gatewayOnline, setGatewayOnline] = useState(false);
    const [providerReady, setProviderReady] = useState(false);

    // Chat
    const [chatAgent, setChatAgent] = useState('admin_console');
    const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([
        { role: 'agent', content: 'Admin Console active. What would you like to do?' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [chatTyping, setChatTyping] = useState(false);
    const [conversationId, setConversationId] = useState('');
    const chatScrollRef = useRef<HTMLDivElement>(null);

    // Agent configs (from DB)
    const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
    const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);
    const [showNewAgent, setShowNewAgent] = useState(false);

    // Providers
    const [providers, setProviders] = useState<Provider[]>([]);
    const [editingProvider, setEditingProvider] = useState<string | null>(null);
    const [newApiKey, setNewApiKey] = useState('');
    const [showNewProvider, setShowNewProvider] = useState(false);
    const [newProviderData, setNewProviderData] = useState({
        provider_name: '', display_name: '', api_key: '', api_base_url: '',
        models_available: [] as string[], rate_limit_rpm: 60, monthly_budget_usd: 100,
    });

    // Audit
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

    // Settings
    const [settings, setSettings] = useState<Record<string, string>>({});

    // ─── Data Fetching ──────────────────────────────────────
    const fetchStatus = useCallback(async () => {
        try {
            const res = await api.get('/agent/status');
            setAgents(res.data.agents || []);
            setSysConfig(res.data.config || sysConfig);
            setGatewayOnline(res.data.gateway?.online || false);
            setProviderReady(res.data.provider?.ready || false);
        } catch {
            setGatewayOnline(false);
            setProviderReady(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAgentConfigs = useCallback(async () => {
        try {
            const res = await api.get('/agent/configs');
            setAgentConfigs(res.data.agents || []);
        } catch { }
    }, []);

    const fetchProviders = useCallback(async () => {
        try {
            const res = await api.get('/agent/providers');
            setProviders(res.data.providers || []);
        } catch { }
    }, []);

    const fetchAudit = useCallback(async () => {
        try {
            const res = await api.get('/agent/audit?limit=30');
            setAuditLogs(res.data.logs || []);
        } catch { }
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get('/agent/settings');
            setSettings(res.data.settings || {});
        } catch { }
    }, []);

    useEffect(() => {
        fetchStatus();
        fetchAgentConfigs();
        fetchProviders();
        fetchAudit();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [chatMessages, chatTyping]);

    // ─── Chat ───────────────────────────────────────────────
    const handleChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const msg = chatInput.trim();
        setChatMessages(prev => [...prev, { role: 'user', content: msg }]);
        setChatInput('');
        setChatTyping(true);

        try {
            const res = await api.post('/agent/chat/admin', {
                message: msg,
                agent: chatAgent,
                conversationId,
            });
            if (res.data.conversationId && !conversationId) {
                setConversationId(res.data.conversationId);
            }
            setChatMessages(prev => [...prev, {
                role: 'agent',
                content: res.data.reply || 'Processed.',
            }]);
        } catch {
            setChatMessages(prev => [...prev, { role: 'agent', content: 'Connection issue. Check provider credentials in Settings.' }]);
        } finally {
            setChatTyping(false);
        }
    };

    // ─── Agent CRUD ─────────────────────────────────────────
    const saveAgent = async (agent: Partial<AgentConfig> & { agent_id: string }) => {
        try {
            if (agentConfigs.find(a => a.agent_id === agent.agent_id)) {
                await api.put(`/agent/configs/${agent.agent_id}`, agent);
            } else {
                await api.post('/agent/configs', agent);
            }
            fetchAgentConfigs();
            setEditingAgent(null);
            setShowNewAgent(false);
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Failed to save agent');
        }
    };

    const toggleAgent = async (agentId: string, isActive: boolean) => {
        await api.put(`/agent/configs/${agentId}`, { is_active: !isActive });
        fetchAgentConfigs();
    };

    // ─── Provider CRUD ──────────────────────────────────────
    const updateProviderKey = async (providerName: string) => {
        if (!newApiKey) return;
        try {
            await api.put(`/agent/providers/${providerName}`, { api_key: newApiKey });
            setNewApiKey('');
            setEditingProvider(null);
            fetchProviders();
            fetchStatus();
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Failed to update');
        }
    };

    const addProvider = async () => {
        if (!newProviderData.provider_name || !newProviderData.display_name || !newProviderData.api_key) {
            alert('Provider ID, Display Name, and API Key are required');
            return;
        }
        try {
            await api.post('/agent/providers', newProviderData);
            setNewProviderData({ provider_name: '', display_name: '', api_key: '', api_base_url: '', models_available: [], rate_limit_rpm: 60, monthly_budget_usd: 100 });
            setShowNewProvider(false);
            fetchProviders();
            fetchStatus();
        } catch (err: any) {
            alert(err?.response?.data?.error || 'Failed to add provider');
        }
    };

    // ─── Settings ───────────────────────────────────────────
    const saveSettings = async () => {
        try {
            await api.put('/agent/settings', { settings });
            fetchSettings();
        } catch { }
    };

    // ─── Sections Config ────────────────────────────────────
    const sections = [
        { id: 'status', label: '📡 Status' },
        { id: 'chat', label: '💬 Chat' },
        { id: 'agents', label: '🤖 Agents & Prompts' },
        { id: 'teams', label: '👥 Teams' },
        { id: 'providers', label: '🔑 Providers' },
        { id: 'memory', label: '🧠 Memory' },
        { id: 'audit', label: '📜 Audit' },
        { id: 'settings', label: '⚙️ Settings' },
    ];

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Agent Command Center</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium flex items-center gap-3">
                        Provider: <StatusBadge status={providerReady ? 'online' : 'offline'} />
                        <span className="mx-1">•</span>
                        ZeroClaw: <StatusBadge status={gatewayOnline ? 'online' : 'offline'} />
                    </p>
                </div>
                <button onClick={() => { fetchStatus(); fetchAgentConfigs(); fetchProviders(); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 transition-colors">
                    ↻ Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1 border border-slate-100 dark:border-slate-700 overflow-x-auto">
                {sections.map(s => (
                    <button key={s.id} onClick={() => setActiveSection(s.id as any)}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap px-3 ${activeSection === s.id ? 'bg-slate-900 dark:bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* ─── STATUS ───────────────────────────────────── */}
            {activeSection === 'status' && (
                <div className="space-y-6">
                    {!providerReady && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm font-bold text-amber-800 dark:text-amber-200">
                            ⚠️ No AI provider configured. Go to <button onClick={() => setActiveSection('providers')} className="underline">Providers</button> to add an API key.
                        </div>
                    )}

                    <div className="grid grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Autonomy</p>
                            <p className="text-xl font-black text-slate-800 dark:text-white capitalize">{sysConfig.autonomyLevel}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Daily Budget</p>
                            <p className="text-xl font-black text-teal-600">${sysConfig.dailyLimitUsd}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Budget</p>
                            <p className="text-xl font-black text-indigo-600">${sysConfig.monthlyLimitUsd}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Month Spend</p>
                            <p className="text-xl font-black text-rose-600">${sysConfig.monthlySpend?.toFixed(4) || '0.00'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map(agent => (
                            <div key={agent.name} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                        <span>{agent.icon}</span> {agent.displayName}
                                    </h4>
                                    <StatusBadge status={agent.status} />
                                </div>
                                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                    <p>Model: <span className="font-bold text-slate-700 dark:text-slate-300">{agent.model}</span></p>
                                    <p>24h: <span className="font-bold text-teal-600">{agent.interactions24h}</span> msgs, <span className="font-bold text-indigo-600">{agent.tokens24h?.toLocaleString() || 0}</span> tokens</p>
                                    <p>Cost 24h: <span className="font-bold text-rose-600">${(agent.cost24h || 0).toFixed(4)}</span></p>
                                </div>
                                <button onClick={() => { setChatAgent(agent.name); setActiveSection('chat'); setConversationId(''); setChatMessages([{ role: 'agent', content: `Connected to ${agent.displayName}. How can I help?` }]); }}
                                    className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-50 hover:text-teal-600 transition-colors">
                                    Open Chat →
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ─── CHAT ─────────────────────────────────────── */}
            {activeSection === 'chat' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden" style={{ height: '500px' }}>
                    <div className="p-3 bg-slate-900 text-white flex items-center gap-3 border-b border-slate-700">
                        <span className="text-lg">🛡️</span>
                        <select value={chatAgent} onChange={(e) => { setChatAgent(e.target.value); setConversationId(''); setChatMessages([{ role: 'agent', content: `Switched to ${e.target.value}. How can I help?` }]); }}
                            className="bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-lg px-3 py-1.5 border border-slate-600">
                            {agentConfigs.filter(a => a.is_active).map(a => (
                                <option key={a.agent_id} value={a.agent_id}>{a.icon} {a.display_name}</option>
                            ))}
                        </select>
                        <span className="text-[10px] opacity-50 flex-1 text-right">Live • All interactions audited</span>
                    </div>

                    <div ref={chatScrollRef} className="p-4 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-900/50" style={{ height: 'calc(100% - 120px)' }}>
                        {chatMessages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium whitespace-pre-wrap ${m.role === 'user'
                                    ? 'bg-slate-800 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-none'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {chatTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-600 flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleChat} className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-2">
                        <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Enter command or question..."
                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-medium border-transparent focus:ring-2 focus:ring-slate-200 transition-all dark:text-white" />
                        <button type="submit" disabled={!chatInput.trim()} className="px-5 py-2.5 bg-slate-900 dark:bg-teal-600 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:bg-slate-700 transition-colors">
                            Send
                        </button>
                    </form>
                </div>
            )}

            {/* ─── AGENTS & PROMPTS ─────────────────────────── */}
            {activeSection === 'agents' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">All Agents ({agentConfigs.length})</h3>
                        <button onClick={() => { setShowNewAgent(true); setEditingAgent({ id: 0, agent_id: '', display_name: '', description: '', model: 'anthropic/claude-sonnet-4', system_prompt: '', temperature: 0.5, max_tokens: 4096, tools: [], allowed_roles: ['customer'], is_system: false, is_active: true, autonomy_level: 'supervised', icon: '🤖', color: '#0ea5e9' }); }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700">
                            + New Agent
                        </button>
                    </div>

                    {/* Agent List */}
                    <div className="space-y-3">
                        {agentConfigs.map(agent => (
                            <div key={agent.agent_id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{agent.icon}</span>
                                        <div>
                                            <h4 className="font-black text-sm text-slate-800 dark:text-white flex items-center gap-2">
                                                {agent.display_name}
                                                {agent.is_system && <span className="text-[9px] bg-slate-200 dark:bg-slate-600 rounded px-1.5 py-0.5 font-bold text-slate-500 dark:text-slate-300">SYSTEM</span>}
                                            </h4>
                                            <p className="text-[10px] font-mono text-slate-400">{agent.agent_id} • {agent.model} • temp: {agent.temperature}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${agent.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                                            {agent.is_active ? 'Active' : 'Paused'}
                                        </span>
                                        <button onClick={() => toggleAgent(agent.agent_id, agent.is_active)} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[9px] font-black uppercase text-slate-500">
                                            {agent.is_active ? 'Pause' : 'Resume'}
                                        </button>
                                        <button onClick={() => setEditingAgent(agent)} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                                            Edit Prompt & Config
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mb-1">{agent.description}</p>
                                <p className="text-[10px] text-slate-400 line-clamp-2 font-mono bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">{agent.system_prompt.substring(0, 200)}...</p>
                            </div>
                        ))}
                    </div>

                    {/* Edit/Create Agent Modal */}
                    {editingAgent && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setEditingAgent(null); setShowNewAgent(false); }}>
                            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                                <h3 className="font-black text-xl text-slate-800 dark:text-white mb-1">
                                    {showNewAgent ? 'Create New Agent' : `Edit: ${editingAgent.display_name}`}
                                </h3>
                                <p className="text-xs text-slate-400 mb-6">Configure the agent's identity, skills (prompt), and model.</p>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Agent ID</label>
                                        <input value={editingAgent.agent_id} disabled={!showNewAgent} onChange={e => setEditingAgent({ ...editingAgent, agent_id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Display Name</label>
                                        <input value={editingAgent.display_name} onChange={e => setEditingAgent({ ...editingAgent, display_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Model</label>
                                        <select value={editingAgent.model} onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white">
                                            <optgroup label="🆓 Free Language Models">
                                                <option value="google/gemma-3-12b-it:free">Gemma 3 12B (Google) — Free</option>
                                                <option value="qwen/qwen3-4b:free">Qwen 3 4B — Free</option>
                                                <option value="nvidia/nemotron-3-nano-30b-a3b:free">Nemotron Nano 30B (NVIDIA) — Free</option>
                                                <option value="z-ai/glm-4.5-air:free">GLM 4.5 Air — Free</option>
                                                <option value="arcee-ai/trinity-large-preview:free">Trinity Large (Arcee) — Free</option>
                                                <option value="deepseek/deepseek-r1:free">DeepSeek R1 — Free</option>
                                                <option value="meta-llama/llama-4-maverick:free">Llama 4 Maverick (Meta) — Free</option>
                                                <option value="microsoft/phi-4-reasoning-plus:free">Phi-4 Reasoning+ (MS) — Free</option>
                                            </optgroup>
                                            <optgroup label="🧠 Reasoning & Research">
                                                <option value="qwen/qwen3-vl-235b-a22b-thinking">Qwen 3 VL 235B Thinking — Paid</option>
                                                <option value="openai/o3-mini">O3 Mini (OpenAI) — Paid</option>
                                                <option value="google/gemini-2.5-pro-preview">Gemini 2.5 Pro — Paid</option>
                                                <option value="google/gemini-2.5-flash-preview">Gemini 2.5 Flash — Paid</option>
                                            </optgroup>
                                            <optgroup label="💎 Premium Language">
                                                <option value="anthropic/claude-sonnet-4">Claude Sonnet 4 — Paid</option>
                                                <option value="anthropic/claude-opus-4">Claude Opus 4 — Paid</option>
                                                <option value="openai/gpt-4o">GPT-4o — Paid</option>
                                            </optgroup>
                                            <optgroup label="🎨 Specialty: Image / Voice">
                                                <option value="bytedance-seed/seedream-4.5">SeeDream 4.5 (Image Gen) — Paid</option>
                                                <option value="openai/gpt-image-1">GPT Image 1 (Image Gen) — Paid</option>
                                                <option value="openai/gpt-4o-mini-tts">GPT-4o Mini TTS (Voice) — Paid</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Temperature ({editingAgent.temperature})</label>
                                        <input type="range" min="0" max="1" step="0.1" value={editingAgent.temperature} onChange={e => setEditingAgent({ ...editingAgent, temperature: parseFloat(e.target.value) })} className="w-full" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Icon</label>
                                        <input value={editingAgent.icon} onChange={e => setEditingAgent({ ...editingAgent, icon: e.target.value })} maxLength={4}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-600 dark:text-white text-center text-2xl" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Max Tokens</label>
                                        <input type="number" value={editingAgent.max_tokens} onChange={e => setEditingAgent({ ...editingAgent, max_tokens: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</label>
                                    <input value={editingAgent.description} onChange={e => setEditingAgent({ ...editingAgent, description: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                </div>

                                {/* System Prompt — The Core Skill */}
                                <div className="mb-4">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                                        System Prompt <span className="text-indigo-500">(Agent Skill / Personality)</span>
                                    </label>
                                    <textarea value={editingAgent.system_prompt} onChange={e => setEditingAgent({ ...editingAgent, system_prompt: e.target.value })}
                                        rows={12}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white resize-y font-mono leading-relaxed" />
                                    <p className="text-[10px] text-slate-400 mt-1">This is the agent's core skill definition. Include: personality, capabilities, constraints, and response style.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Allowed Tools (comma-separated)</label>
                                        <input value={editingAgent.tools.join(', ')} onChange={e => setEditingAgent({ ...editingAgent, tools: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Allowed Roles (comma-separated)</label>
                                        <input value={editingAgent.allowed_roles.join(', ')} onChange={e => setEditingAgent({ ...editingAgent, allowed_roles: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => saveAgent(editingAgent)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-colors">
                                        {showNewAgent ? '+ Create Agent' : 'Save Changes'}
                                    </button>
                                    <button onClick={() => { setEditingAgent(null); setShowNewAgent(false); }}
                                        className="px-6 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-200">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── TEAMS (placeholder) ──────────────────────── */}
            {activeSection === 'teams' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-8 text-center">
                    <p className="text-4xl mb-4">👥</p>
                    <h3 className="font-black text-lg text-slate-800 dark:text-white mb-2">Team Workflows</h3>
                    <p className="text-sm text-slate-400">Multi-agent team coordination coming with ZeroClaw integration. Agents can be coordinated through chat for now.</p>
                </div>
            )}

            {/* ─── PROVIDERS ────────────────────────────────── */}
            {activeSection === 'providers' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-sm uppercase tracking-widest text-slate-400">AI Providers</h3>
                        <button onClick={() => setShowNewProvider(!showNewProvider)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700">
                            {showNewProvider ? '✕ Cancel' : '+ Add Provider'}
                        </button>
                    </div>

                    {/* Add New Provider Form */}
                    {showNewProvider && (
                        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 space-y-4">
                            <h4 className="font-black text-sm text-indigo-800 dark:text-indigo-200">New Provider</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Provider ID</label>
                                    <input value={newProviderData.provider_name} onChange={e => setNewProviderData({ ...newProviderData, provider_name: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                        placeholder="e.g. anthropic_direct"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Display Name</label>
                                    <input value={newProviderData.display_name} onChange={e => setNewProviderData({ ...newProviderData, display_name: e.target.value })}
                                        placeholder="e.g. Anthropic Direct"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">API Base URL</label>
                                    <input value={newProviderData.api_base_url} onChange={e => setNewProviderData({ ...newProviderData, api_base_url: e.target.value })}
                                        placeholder="https://api.anthropic.com/v1"
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">API Key</label>
                                    <input type="password" value={newProviderData.api_key} onChange={e => setNewProviderData({ ...newProviderData, api_key: e.target.value })}
                                        placeholder="sk-..."
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Budget (USD)</label>
                                    <input type="number" value={newProviderData.monthly_budget_usd} onChange={e => setNewProviderData({ ...newProviderData, monthly_budget_usd: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rate Limit (RPM)</label>
                                    <input type="number" value={newProviderData.rate_limit_rpm} onChange={e => setNewProviderData({ ...newProviderData, rate_limit_rpm: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available Models (comma-separated)</label>
                                <input value={newProviderData.models_available.join(', ')} onChange={e => setNewProviderData({ ...newProviderData, models_available: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                    placeholder="anthropic/claude-sonnet-4, anthropic/claude-opus-4"
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white font-mono" />
                            </div>
                            <button onClick={addProvider}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-colors">
                                + Create Provider
                            </button>
                        </div>
                    )}

                    {providers.map(p => (
                        <div key={p.provider_name} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h4 className="font-black text-base text-slate-800 dark:text-white">{p.display_name}</h4>
                                    <p className="text-[10px] font-mono text-slate-400">{p.api_base_url || 'No URL set'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${p.has_api_key ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                                        {p.has_api_key ? 'Key Set ✓' : 'No Key'}
                                    </span>
                                    <StatusBadge status={p.is_active && p.has_api_key ? 'online' : 'offline'} />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Rate Limit</p>
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{p.rate_limit_rpm} RPM</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Monthly Budget</p>
                                    <p className="text-sm font-bold text-teal-600">${p.monthly_budget_usd}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Available Models</p>
                                    <p className="text-[10px] font-mono text-slate-500">{(p.models_available || []).length} models</p>
                                </div>
                            </div>

                            {/* Models list */}
                            {(p.models_available || []).length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-1">
                                    {(p.models_available || []).map((m: string) => (
                                        <span key={m} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-900 rounded text-[9px] font-mono text-slate-500 dark:text-slate-400">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* API Key Editor */}
                            {editingProvider === p.provider_name ? (
                                <div className="flex gap-2">
                                    <input type="password" value={newApiKey} onChange={e => setNewApiKey(e.target.value)} placeholder="sk-or-v1-..." autoFocus
                                        className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 dark:text-white font-mono" />
                                    <button onClick={() => updateProviderKey(p.provider_name)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase">Save</button>
                                    <button onClick={() => { setEditingProvider(null); setNewApiKey(''); }} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-black uppercase text-slate-500">Cancel</button>
                                </div>
                            ) : (
                                <button onClick={() => setEditingProvider(p.provider_name)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                    {p.has_api_key ? '🔑 Update API Key' : '🔑 Add API Key'}
                                </button>
                            )}
                        </div>
                    ))}

                    {providers.length === 0 && (
                        <div className="text-center p-8 text-slate-400">
                            <p>No providers configured. Click "Add Provider" to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── MEMORY DASHBOARD ─────────────────────────── */}
            {activeSection === 'memory' && (
                <MemoryDashboard />
            )}

            {/* ─── AUDIT ────────────────────────────────────── */}
            {activeSection === 'audit' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-black text-sm text-slate-800 dark:text-white">Agent Audit Log</h3>
                        <button onClick={fetchAudit} className="text-xs text-teal-600 font-black uppercase tracking-widest">↻ Refresh</button>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-700 max-h-96 overflow-y-auto">
                        {auditLogs.length === 0 ? (
                            <p className="p-8 text-center text-sm text-slate-400">No agent interactions recorded yet.</p>
                        ) : (
                            auditLogs.map(log => (
                                <div key={log.id} className="p-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <span className="text-xs font-mono text-slate-400">#{log.id}</span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                                        {log.action?.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{log.admin_name || 'System'}</span>
                                    <span className="text-xs text-slate-400 ml-auto font-mono">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* ─── SETTINGS ─────────────────────────────────── */}
            {activeSection === 'settings' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6 space-y-6">
                    <div>
                        <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1">Agent System Settings</h3>
                        <p className="text-xs text-slate-400">
                            {user?.role === 'super-admin' ? 'Full control enabled. Changes are saved to database.' : '⚠️ Read-only. Super-admin role required.'}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {Object.entries(settings).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{key.replace(/_/g, ' ')}</label>
                                {key === 'autonomy_level' ? (
                                    <select disabled={user?.role !== 'super-admin'} value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 font-bold dark:text-white disabled:opacity-50">
                                        <option value="supervised">Supervised — Requires approval</option>
                                        <option value="semi">Semi-Autonomous — Routine actions auto-approved</option>
                                        <option value="full">Full Autonomous — Decides independently</option>
                                    </select>
                                ) : (
                                    <input disabled={user?.role !== 'super-admin'} value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                                        className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm border border-slate-200 dark:border-slate-600 font-bold dark:text-white disabled:opacity-50" />
                                )}
                            </div>
                        ))}
                    </div>

                    {user?.role === 'super-admin' && (
                        <button onClick={saveSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-700 transition-colors">
                            Save Settings
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
