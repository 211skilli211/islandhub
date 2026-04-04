'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import MemoryDashboard from './MemoryDashboard';
import toast from 'react-hot-toast';

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
        online: 'bg-teal-500 shadow-teal-500/20',
        offline: 'bg-rose-500 shadow-rose-500/20',
        unknown: 'bg-amber-500 shadow-amber-500/20',
    };
    return (
        <span className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-full border border-slate-100 dark:border-white/5">
            <span className={`w-1.5 h-1.5 rounded-full ${colors[status] || colors.unknown} ${status === 'online' ? 'animate-pulse' : ''} shadow-lg`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{status}</span>
        </span>
    );
}

const sectionIcons: Record<string, string> = {
    status: '📡',
    chat: '💬',
    agents: '🤖',
    teams: '👥',
    providers: '🔑',
    memory: '🧠',
    audit: '📜',
    settings: '⚙️',
};

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
        { role: 'agent', content: 'Neural Bridge established. Admin permissions verified. How shall we proceed?' }
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

    // Gateway Control
    const [gatewayEnabled, setGatewayEnabled] = useState(true);
    const [testingProvider, setTestingProvider] = useState<string | null>(null);

    // Memory Stats
    const [memoryStats, setMemoryStats] = useState<{
        l1: number; l2: number; l3: number; l4: number;
    }>({ l1: 0, l2: 0, l3: 0, l4: 0 });

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
    }, [sysConfig]);

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

    // Chat history fetcher
    const loadChatHistory = useCallback(async (agentId: string) => {
        try {
            const res = await api.get(`/agent/chat/history/${agentId}`);
            if (res.data.messages && res.data.messages.length > 0) {
                setChatMessages(res.data.messages.map((m: any) => ({
                    role: m.role,
                    content: m.content
                })));
            } else {
                setChatMessages([{ role: 'agent', content: `Neural Bridge established with ${agentId}. Admin permissions verified.` }]);
            }
        } catch {
            setChatMessages([{ role: 'agent', content: 'Neural Bridge established. History retrieval failed.' }]);
        }
    }, []);

    // Workflows (Swarms)
    const [workflows, setWorkflows] = useState<any[]>([]);
    const fetchWorkflows = useCallback(async () => {
        try {
            const res = await api.get('/agent/workflows');
            setWorkflows(res.data.workflows || []);
        } catch { }
    }, []);

    useEffect(() => {
        fetchStatus();
        fetchAgentConfigs();
        fetchProviders();
        fetchAudit();
        fetchSettings();
        fetchWorkflows();
        fetchMemoryStats();
    }, []);

    useEffect(() => {
        if (chatAgent) {
            loadChatHistory(chatAgent);
        }
    }, [chatAgent, loadChatHistory]);

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
                content: res.data.reply || 'Request processed. Neural weights synchronized.',
            }]);
        } catch {
            setChatMessages(prev => [...prev, { role: 'agent', content: 'Connection timeout. Verify engine status and provider credentials.' }]);
            toast.error('AI Bridge Interrupted');
        } finally {
            setChatTyping(false);
        }
    };

    // ─── Agent CRUD ─────────────────────────────────────────
    const saveAgent = async (agent: Partial<AgentConfig> & { agent_id: string }) => {
        try {
            if (agentConfigs.find(a => a.agent_id === agent.agent_id)) {
                await api.put(`/agent/configs/${agent.agent_id}`, agent);
                toast.success('Neural prompt updated.');
            } else {
                await api.post('/agent/configs', agent);
                toast.success('Agent initialized.');
            }
            fetchAgentConfigs();
            setEditingAgent(null);
            setShowNewAgent(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Initialization failed');
        }
    };

    const toggleAgent = async (agentId: string, isActive: boolean) => {
        await api.put(`/agent/configs/${agentId}`, { is_active: !isActive });
        toast.success(isActive ? 'Agent suspended' : 'Agent resumed');
        fetchAgentConfigs();
    };

    // ─── Provider CRUD ──────────────────────────────────────
    const updateProviderKey = async (providerName: string) => {
        if (!newApiKey) return;
        try {
            await api.put(`/agent/providers/${providerName}`, { api_key: newApiKey });
            toast.success('Credentials encrypted.');
            setNewApiKey('');
            setEditingProvider(null);
            fetchProviders();
            fetchStatus();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Encryption failed');
        }
    };

    const addProvider = async () => {
        if (!newProviderData.provider_name || !newProviderData.display_name || !newProviderData.api_key) {
            toast.error('Partial metadata detected. Complete all fields.');
            return;
        }
        try {
            await api.post('/agent/providers', newProviderData);
            setNewProviderData({ provider_name: '', display_name: '', api_key: '', api_base_url: '', models_available: [], rate_limit_rpm: 60, monthly_budget_usd: 100 });
            setShowNewProvider(false);
            toast.success('New provider bridged.');
            fetchProviders();
            fetchStatus();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Bridging failed');
        }
    };

    // Test Provider Connection
    const testProviderConnection = async (providerName: string) => {
        setTestingProvider(providerName);
        try {
            const res = await api.post(`/agent/providers/${providerName}/test`);
            toast.success(res.data.message || 'Connection successful');
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Connection failed');
        } finally {
            setTestingProvider(null);
        }
    };

    // Toggle Provider Active State
    const toggleProvider = async (provider: Provider) => {
        try {
            await api.put(`/agent/providers/${provider.provider_name}`, { is_active: !provider.is_active });
            toast.success(provider.is_active ? 'Provider disconnected' : 'Provider connected');
            fetchProviders();
            fetchStatus();
        } catch (err: any) {
            toast.error(err?.response?.data?.error || 'Toggle failed');
        }
    };

    // Gateway Toggle
    const toggleGateway = () => {
        setGatewayEnabled(!gatewayEnabled);
        toast.success(`ZeroClaw Gateway ${gatewayEnabled ? 'disabled - using LLM fallback' : 'enabled'}`);
    };

    // Memory Layer Controls
    const clearMemoryLayer = async (layer: string) => {
        if (!confirm(`Clear ${layer} memory? This cannot be undone.`)) return;
        try {
            await api.post('/agent/memory/clear', { layer });
            toast.success(`${layer} memory cleared`);
        } catch (err: any) {
            toast.error('Clear failed - gateway may be offline');
        }
    };

    const fetchMemoryStats = async () => {
        try {
            const res = await api.get('/agent/memories', { params: { limit: 1 } });
            setMemoryStats(prev => ({ ...prev, l3: res.data.memories?.length || 0 }));
        } catch { }
    };

    // ─── Settings ───────────────────────────────────────────
    const saveSettings = async () => {
        try {
            await api.put('/agent/settings', { settings });
            toast.success('Global parameters updated.');
            fetchSettings();
        } catch {
            toast.error('Sync failed.');
        }
    };

    // ─── Sections Config ────────────────────────────────────
    const sections = [
        { id: 'status', label: 'Monitor' },
        { id: 'chat', label: 'Console' },
        { id: 'agents', label: 'Neurons' },
        { id: 'teams', label: 'Swarms' },
        { id: 'providers', label: 'Bridges' },
        { id: 'memory', label: 'ReMeLight' },
        { id: 'audit', label: 'Ledger' },
        { id: 'settings', label: 'Core' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* High-Tech Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full -mr-20 -mt-20 group-hover:bg-teal-500/10 transition-colors" />

                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">Neural Control Center</h2>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Provider</span>
                            <StatusBadge status={providerReady ? 'online' : 'offline'} />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-md">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gateway</span>
                            <StatusBadge status={gatewayOnline ? 'online' : 'offline'} />
                        </div>
                        <button 
                            onClick={toggleGateway}
                            className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                                gatewayEnabled 
                                    ? 'bg-teal-500/20 border-teal-500 text-teal-400' 
                                    : 'bg-rose-500/20 border-rose-500 text-rose-400'
                            }`}
                        >
                            {gatewayEnabled ? '● ON' : '○ OFF'}
                        </button>
                    </div>
                </div>

                <div className="relative z-10 flex gap-3">
                    <button
                        onClick={() => { fetchStatus(); fetchAgentConfigs(); fetchProviders(); toast.success('Telemetry synchronized.'); }}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 active:scale-95"
                    >
                        Sync Telemetry
                    </button>
                    <button
                        onClick={() => setActiveSection('chat')}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                    >
                        Access Console
                    </button>
                </div>
            </div>

            {/* Premium Navigation */}
            <div className="flex p-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-x-auto custom-scrollbar no-scrollbar">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id as any)}
                        className={`flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 min-w-[120px] ${activeSection === s.id
                            ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-lg'
                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        <span className="text-sm">{(sectionIcons as any)[s.id]}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Section Content with Animation */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* ─── STATUS ───────────────────────────────────── */}
                        {activeSection === 'status' && (
                            <div className="space-y-8">
                                {!providerReady && (
                                    <div className="p-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-3xl text-xs font-bold text-rose-600 flex items-center gap-4">
                                        <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white text-xl">⚠️</div>
                                        <div>
                                            <p className="uppercase tracking-widest font-black">Bridge Disconnected</p>
                                            <p className="text-rose-500/70">No AI provider keys detected. Platform intelligence is currently offline.</p>
                                        </div>
                                        <button onClick={() => setActiveSection('providers')} className="ml-auto px-4 py-2 bg-rose-600 text-white rounded-xl uppercase tracking-tighter shadow-lg shadow-rose-600/20">Configure Bridge</button>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Intelligence Level', value: sysConfig.autonomyLevel, icon: '🛡️', color: 'text-slate-800 dark:text-white' },
                                        { label: 'Daily Cap', value: `$${sysConfig.dailyLimitUsd}`, icon: '☀️', color: 'text-teal-600' },
                                        { label: 'Monthly Cap', value: `$${sysConfig.monthlyLimitUsd}`, icon: '🌙', color: 'text-indigo-600' },
                                        { label: 'Utilized (MTD)', value: `$${sysConfig.monthlySpend?.toFixed(4) || '0.00'}`, icon: '📊', color: 'text-rose-600' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 rounded-4xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                                            <div className="text-2xl mb-4 group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                            <p className={`text-2xl font-black capitalize ${stat.color}`}>{stat.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {agents.map(agent => (
                                        <div key={agent.name} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] p-1 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all relative overflow-hidden">
                                            <div className="p-7">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:rotate-6 transition-transform">
                                                        {agent.icon}
                                                    </div>
                                                    <StatusBadge status={agent.status} />
                                                </div>

                                                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-1">{agent.displayName}</h4>
                                                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-6">{agent.model}</p>

                                                <div className="grid grid-cols-2 gap-4 mb-8">
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Messages</p>
                                                        <p className="text-sm font-black text-teal-600">{agent.interactions24h}</p>
                                                    </div>
                                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Utilization</p>
                                                        <p className="text-sm font-black text-indigo-600">${(agent.cost24h || 0).toFixed(4)}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => { setChatAgent(agent.name); setActiveSection('chat'); setConversationId(''); setChatMessages([{ role: 'agent', content: `Secure tunnel to ${agent.displayName} initialized. Access level: Root.` }]); }}
                                                    className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                                                >
                                                    Open Uplink
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── CHAT ─────────────────────────────────────── */}
                        {activeSection === 'chat' && (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[700px]">
                                {/* Sidebar for Agents */}
                                <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800 p-6 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 px-2">Active Channels</h4>
                                    <div className="space-y-1">
                                        {agentConfigs.filter(a => a.is_active).map(a => (
                                            <button
                                                key={a.agent_id}
                                                onClick={() => { setChatAgent(a.agent_id); setConversationId(''); }}
                                                className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all ${chatAgent === a.agent_id ? 'bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-white/5' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                            >
                                                <span className="text-xl">{a.icon}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 truncate">{a.display_name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Main Conversation */}
                                <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950/20">
                                    {/* Sub-header */}
                                    <div className="px-8 py-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-lg shadow-teal-500/50" />
                                            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">Encypted Session: {chatAgent}</span>
                                        </div>
                                        <button onClick={() => { setConversationId(''); setChatMessages([{ role: 'agent', content: 'Session history purged. Neural bridge reset.' }]); }} className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Purge History</button>
                                    </div>

                                    <div ref={chatScrollRef} className="flex-1 p-8 space-y-6 overflow-y-auto custom-scrollbar">
                                        {chatMessages.map((m, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                key={i}
                                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] px-6 py-4 rounded-3xl shadow-sm text-sm font-medium leading-relaxed ${m.role === 'user'
                                                    ? 'bg-slate-900 text-white rounded-tr-none shadow-xl shadow-slate-900/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                                                    }`}>
                                                    {m.content}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {chatTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-800 flex gap-2">
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" />
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                        <form onSubmit={handleChat} className="flex gap-4 max-w-5xl mx-auto">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Inject command instruction packet..."
                                                className="flex-1 px-8 py-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm font-medium border-2 border-transparent focus:border-indigo-500 outline-none transition-all dark:text-white"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!chatInput.trim() || chatTyping}
                                                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest disabled:opacity-50 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
                                            >
                                                Inject
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── AGENTS & PROMPTS ─────────────────────────── */}
                        {activeSection === 'agents' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                                    <div>
                                        <h3 className="text-white font-black text-lg">Neural Registry</h3>
                                        <p className="text-[10px] text-slate-500 tracking-widest uppercase">Manage {agentConfigs.length} initialized entities</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowNewAgent(true); setEditingAgent({ id: 0, agent_id: '', display_name: '', description: '', model: 'anthropic/claude-sonnet-4', system_prompt: '', temperature: 0.5, max_tokens: 4096, tools: [], allowed_roles: ['customer'], is_system: false, is_active: true, autonomy_level: 'supervised', icon: '🤖', color: '#0ea5e9' }); }}
                                        className="px-8 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        + Initialize New Neuron
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {agentConfigs.map(agent => (
                                        <div key={agent.agent_id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
                                            <div className="flex items-center justify-between mb-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
                                                        {agent.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="font-black text-xl text-slate-900 dark:text-white leading-none">{agent.display_name}</h4>
                                                            {agent.is_system && <span className="text-[9px] bg-slate-100 dark:bg-white/5 rounded-full px-3 py-1 font-black text-slate-500 tracking-widest uppercase">System Core</span>}
                                                        </div>
                                                        <p className="text-[10px] font-mono text-slate-400 leading-none tracking-widest uppercase">{agent.agent_id} / {agent.model}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${agent.is_active ? 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400' : 'bg-rose-50 text-rose-600'}`}>
                                                        {agent.is_active ? 'Online' : 'Suspended'}
                                                    </div>
                                                    <button onClick={() => toggleAgent(agent.agent_id, agent.is_active)} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">
                                                        {agent.is_active ? 'Suspend' : 'Resume'}
                                                    </button>
                                                    <button onClick={() => setEditingAgent(agent)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                                                        Modify
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
                                                <div>
                                                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Capabilities Descriptor</h5>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{agent.description}</p>
                                                </div>
                                                <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 overflow-hidden group">
                                                    <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 flex justify-between">
                                                        <span>System Prompt</span>
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Neural Code</span>
                                                    </h5>
                                                    <p className="text-[10px] text-slate-500 font-mono line-clamp-3 leading-relaxed">{agent.system_prompt}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── MEMORY DASHBOARD ─────────────────────────── */}
                        {activeSection === 'memory' && (
                            <MemoryDashboard />
                        )}

                        {/* ─── AUDIT & OTHER SECTIONS (Retained legacy or upgraded) ─── */}
                        {['audit', 'settings', 'providers', 'teams'].includes(activeSection) && (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl">
                                {activeSection === 'audit' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-black text-2xl text-slate-900 dark:text-white">Neural Ledger</h3>
                                            <button onClick={fetchAudit} className="text-[10px] text-teal-600 font-black uppercase tracking-widest bg-teal-50 dark:bg-teal-500/10 px-4 py-2 rounded-xl">Sync Ledger</button>
                                        </div>
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {auditLogs.length === 0 ? (
                                                <div className="p-20 text-center text-slate-400 opacity-50">No ledger entries detected in this epoch.</div>
                                            ) : (
                                                auditLogs.map(log => (
                                                    <div key={log.id} className="py-5 flex items-center gap-6 group hover:bg-slate-50 dark:hover:bg-white/5 px-4 rounded-2xl transition-all">
                                                        <span className="text-[10px] font-mono text-slate-300">#{log.id}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">{log.action?.replace(/_/g, ' ')}</span>
                                                            <span className="text-[10px] font-bold text-slate-400 italic">By {log.admin_name || 'System Core'}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-300 ml-auto font-mono">{new Date(log.created_at).toLocaleString()}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeSection === 'settings' && (
                                    <div className="space-y-10 max-w-4xl">
                                        <div>
                                            <h3 className="font-black text-2xl text-slate-900 dark:text-white mb-2">Core Parameters</h3>
                                            <p className="text-sm text-slate-500">Global weights and governance protocols for all intelligence entities.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {Object.entries(settings).map(([key, value]) => (
                                                <div key={key} className="space-y-3">
                                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{key.replace(/_/g, ' ')}</label>
                                                    {key === 'autonomy_level' ? (
                                                        <select disabled={user?.role !== 'super-admin'} value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-2 border-transparent focus:border-teal-500 font-bold dark:text-white outline-none transition-all">
                                                            <option value="supervised">Human-in-the-Loop</option>
                                                            <option value="semi">Hybrid-Autonomous</option>
                                                            <option value="full">Full Convergence</option>
                                                        </select>
                                                    ) : (
                                                        <input disabled={user?.role !== 'super-admin'} value={value} onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm border-2 border-transparent focus:border-teal-500 font-bold dark:text-white outline-none transition-all" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={saveSettings} className="px-12 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl shadow-slate-900/20 active:scale-95 transition-all">
                                            Update System Core
                                        </button>
                                    </div>
                                )}

                                {activeSection === 'providers' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Neural Bridges</h3>
                                            <button onClick={() => setShowNewProvider(!showNewProvider)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">{showNewProvider ? 'Close Terminal' : 'Open Connection'}</button>
                                        </div>

                                        {showNewProvider && (
                                            <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-4xl border border-indigo-500/30 animate-in slide-in-from-top-4 duration-500">
                                                <h4 className="text-sm font-black text-indigo-500 uppercase tracking-widest mb-6">Initialize New Bridge Tunnel</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                                    <input placeholder="Provider ID (e.g. openrouter)" className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-xs font-mono dark:text-white" value={newProviderData.provider_name} onChange={e => setNewProviderData({ ...newProviderData, provider_name: e.target.value })} />
                                                    <input placeholder="Display Name (e.g. OpenRouter Core)" className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-xs font-bold dark:text-white" value={newProviderData.display_name} onChange={e => setNewProviderData({ ...newProviderData, display_name: e.target.value })} />
                                                    <input placeholder="API Base URL (optional)" className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-xs font-mono dark:text-white" value={newProviderData.api_base_url} onChange={e => setNewProviderData({ ...newProviderData, api_base_url: e.target.value })} />
                                                    <input placeholder="API Secret Key" type="password" className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-xs font-mono dark:text-white" value={newProviderData.api_key} onChange={e => setNewProviderData({ ...newProviderData, api_key: e.target.value })} />
                                                </div>
                                                <button onClick={addProvider} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">Authorize and Bind Bridge</button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 gap-6">
                                            {providers.map(p => (
                                                <div key={p.provider_name} className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] border border-slate-100 dark:border-white/5 hover:ring-2 hover:ring-teal-500/20 transition-all">
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div>
                                                            <h4 className="text-xl font-black dark:text-white mb-1">{p.display_name}</h4>
                                                            <span className="text-[10px] font-mono text-slate-400 tracking-widest uppercase italic">{p.api_base_url || 'Internal Mesh'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button 
                                                                onClick={() => toggleProvider(p)}
                                                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${
                                                                    p.is_active 
                                                                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' 
                                                                        : 'bg-teal-100 text-teal-600 hover:bg-teal-200'
                                                                }`}
                                                            >
                                                                {p.is_active ? 'Disconnect' : 'Connect'}
                                                            </button>
                                                            <StatusBadge status={p.is_active && p.has_api_key ? 'online' : 'offline'} />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-8 mb-8">
                                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl">
                                                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Throughput</p>
                                                            <p className="text-lg font-black dark:text-white">{p.rate_limit_rpm} <span className="text-[10px] font-bold text-slate-500 opacity-50">RPM</span></p>
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl">
                                                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Budget Allocation</p>
                                                            <p className="text-lg font-black text-teal-600">${p.monthly_budget_usd}</p>
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl">
                                                            <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Neural Models</p>
                                                            <p className="text-lg font-black text-indigo-500">{(p.models_available || []).length}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <button 
                                                            onClick={() => testProviderConnection(p.provider_name)}
                                                            disabled={testingProvider === p.provider_name}
                                                            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                        >
                                                            {testingProvider === p.provider_name ? 'Testing...' : 'Test Connection'}
                                                        </button>
                                                        {editingProvider === p.provider_name ? (
                                                            <div className="flex gap-2 flex-1 bg-white dark:bg-slate-900 p-2 rounded-2xl ring-2 ring-teal-500/30">
                                                                <input 
                                                                    type="password" 
                                                                    value={newApiKey} 
                                                                    onChange={(e) => setNewApiKey(e.target.value)} 
                                                                    placeholder="API Key..." 
                                                                    className="flex-1 bg-transparent px-4 py-2 text-sm font-mono outline-none dark:text-white" 
                                                                />
                                                                <button onClick={() => updateProviderKey(p.provider_name)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase">Save</button>
                                                                <button onClick={() => { setEditingProvider(null); setNewApiKey(''); }} className="px-3 py-2 text-[10px] font-black uppercase text-slate-400">✕</button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                onClick={() => setEditingProvider(p.provider_name)} 
                                                                className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                                                            >
                                                                {p.has_api_key ? 'Update Key' : 'Add Key'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ─── SWARMS (WORKFLOWS) ────────────────────────── */}
                                {activeSection === 'teams' && (
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-center bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-xl">
                                            <div>
                                                <h3 className="text-2xl font-black text-white">Neural Swarm Matrix</h3>
                                                <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Coordination layer for multi-agent procedures</p>
                                            </div>
                                            <button className="px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-teal-600/20">
                                                + Initialize New Procedure
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {workflows.length === 0 ? (
                                                <div className="col-span-full py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 text-center opacity-50">
                                                    <div className="text-4xl mb-4">🕸️</div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active procedures detected in the matrix</p>
                                                </div>
                                            ) : (
                                                workflows.map(wf => (
                                                    <div key={wf.workflow_id} className="bg-white dark:bg-slate-900 rounded-4xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl">🔗</div>
                                                            <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-[8px] font-black uppercase tracking-widest rounded-full">Operational</span>
                                                        </div>
                                                        <h4 className="text-lg font-black dark:text-white mb-2">{wf.name}</h4>
                                                        <p className="text-xs text-slate-500 mb-6 line-clamp-2">{wf.description}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex -space-x-3">
                                                                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 shadow-sm" />)}
                                                            </div>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase ml-2">{JSON.parse(wf.steps || '[]').length} Stages</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Editing Agent Modal (Persistent across tabs if needed, but usually tied to Agents tab) */}
            {editingAgent && activeSection === 'agents' && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-100 flex items-center justify-center p-8 overflow-y-auto" onClick={() => { setEditingAgent(null); setShowNewAgent(false); }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-5xl w-full p-10 shadow-2xl relative border border-slate-100 dark:border-white/5"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal content ... (Similar to before but with improved inputs) */}
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                    {showNewAgent ? 'Initialize Entity' : `Modify Neural Pattern: ${editingAgent.display_name}`}
                                </h3>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Entity configuration and personality architecture</p>
                            </div>
                            <button onClick={() => { setEditingAgent(null); setShowNewAgent(false); }} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full hover:rotate-90 transition-transform">✕</button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Left: Metadata */}
                            <div className="space-y-8">
                                <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-3xl space-y-6">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Icon Representation</label>
                                        <input value={editingAgent.icon} onChange={e => setEditingAgent({ ...editingAgent, icon: e.target.value })} maxLength={4}
                                            className="w-full h-24 bg-white dark:bg-slate-900 rounded-2xl text-center text-5xl outline-none focus:ring-4 ring-indigo-500/10 transition-all border border-slate-100 dark:border-white/5 shadow-inner" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Display name</label>
                                        <input value={editingAgent.display_name} onChange={e => setEditingAgent({ ...editingAgent, display_name: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl text-sm font-bold dark:text-white border border-slate-100 dark:border-white/5" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Unified Identifier</label>
                                        <input value={editingAgent.agent_id} disabled={!showNewAgent} onChange={e => setEditingAgent({ ...editingAgent, agent_id: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-mono dark:text-slate-400 border border-slate-100 dark:border-white/5 disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Language Model Base</label>
                                        <input value={editingAgent.model} onChange={e => setEditingAgent({ ...editingAgent, model: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl text-xs font-mono dark:text-slate-200 border border-slate-100 dark:border-white/5" />
                                    </div>
                                </div>
                            </div>

                            {/* Center/Right: Prompts & Skills */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-2">
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400">Neural Directive (System Prompt)</label>
                                        <span className="text-[9px] font-mono text-indigo-500">Character & Skill Protocol</span>
                                    </div>
                                    <textarea
                                        value={editingAgent.system_prompt}
                                        onChange={e => setEditingAgent({ ...editingAgent, system_prompt: e.target.value })}
                                        rows={18}
                                        className="w-full p-8 bg-slate-50 dark:bg-black/20 rounded-4xl text-[11px] font-mono leading-relaxed outline-none focus:ring-4 ring-indigo-500/5 transition-all dark:text-slate-300 border border-slate-100 dark:border-white/5 custom-scrollbar"
                                        placeholder="Define the core logic, personality, and behavioral constraints..."
                                    />
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Temperature: {editingAgent.temperature}</label>
                                            <input type="range" min="0" max="1" step="0.1" value={editingAgent.temperature} onChange={e => setEditingAgent({ ...editingAgent, temperature: parseFloat(e.target.value) })} className="w-full accent-indigo-500" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Response Token Limit</label>
                                            <input type="number" value={editingAgent.max_tokens} onChange={e => setEditingAgent({ ...editingAgent, max_tokens: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-black/20 rounded-xl text-xs font-mono dark:text-white border border-slate-100 dark:border-white/5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-6 border-t border-slate-50 dark:border-slate-800">
                                    <button onClick={() => saveAgent(editingAgent)}
                                        className="flex-1 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/20 active:scale-95 transition-all">
                                        Initialize Entity Logic
                                    </button>
                                    <button onClick={() => { setEditingAgent(null); setShowNewAgent(false); }}
                                        className="px-10 py-5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-100 transition-all">
                                        Discard Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
