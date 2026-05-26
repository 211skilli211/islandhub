'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from '@/lib/toast';

interface MemoryStatus {
    contextSizeInBytes: number;
    lastUpdated: string | null;
    sqliteRecords: {
        api_endpoints: number;
        db_schemas: number;
    };
    systemReady: boolean;
}

interface AgentMemory {
    id: number;
    memory_type: string;
    content: string;
    similarity?: number;
    created_at: string;
}

export default function MemoryDashboard() {
    const [status, setStatus] = useState<MemoryStatus | null>(null);
    const [files, setFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string>('projects/main_context.md');
    const [fileContent, setFileContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [logs, setLogs] = useState<string>('System initialized. Awaiting commands...');
    const [isActionRunning, setIsActionRunning] = useState(false);
    const [gatewayStatus, setGatewayStatus] = useState<{ online: boolean; url: string }>({ online: false, url: '' });
    
    const [activeTab, setActiveTab] = useState<'files' | 'vector' | 'skills'>('files');
    const [vectorMemories, setVectorMemories] = useState<AgentMemory[]>([]);
    const [vectorQuery, setVectorQuery] = useState('');
    const [skills, setSkills] = useState<any[]>([]);

    const loadData = async () => {
        try {
            const [statusRes, filesRes, gatewayRes, skillsRes] = await Promise.all([
                api.get('/agent/memory/status'),
                api.get('/agent/memory/files'),
                api.get('/agent/status'),
                api.get('/agent/skills')
            ]);
            setStatus(statusRes.data);
            setFiles(filesRes.data.files || []);
            setGatewayStatus(gatewayRes.data.gateway);
            setSkills(skillsRes.data.skills || []);

            // Load user's vector memories
            try {
                const memoriesRes = await api.get('/agent/memories');
                setVectorMemories(memoriesRes.data.memories || []);
            } catch { }

            // Initial file load
            loadFile('projects/main_context.md');
        } catch (error) {
            console.error('Failed to load memory data:', error);
            toast.error('Connection interrupted: ReMeLight fallback active');
        } finally {
            setIsLoading(false);
        }
    };

    const searchVectorMemory = async () => {
        if (!vectorQuery.trim()) return;
        try {
            const res = await api.get('/agent/memories', {
                params: {
                    query: vectorQuery,
                    limit: 10,
                    threshold: 0.7
                }
            });
            setVectorMemories(res.data.memories || []);
        } catch (error) {
            toast.error('Search failed');
        }
    };

    const storeMemory = async (type: string, content: string) => {
        try {
            await api.post('/agent/memories', {
                memory_type: type,
                content,
                metadata: { source: 'admin_dashboard' }
            });
            toast.success('Memory stored');
            loadData();
        } catch (error) {
            toast.error('Failed to store memory');
        }
    };

    const executeSkill = async (skillName: string, input: any) => {
        try {
            const res = await api.post('/agent/execute', {
                skill: skillName,
                input
            });
            toast.success(`${skillName} executed`);
            return res.data;
        } catch (error: any) {
            toast.error(error?.response?.data?.error || 'Execution failed');
            return null;
        }
    };

    const loadFile = async (filename: string) => {
        try {
            setSelectedFile(filename);
            const res = await api.get(`/agent/memory/file/${filename}`);
            setFileContent(res.data.content);
        } catch (error) {
            toast.error('Failed to load neural node');
        }
    };

    const saveFile = async () => {
        setIsSaving(true);
        try {
            await api.post(`/agent/memory/file/${selectedFile}`, { content: fileContent });
            toast.success('Neural weights persisted');
            setLogs(prev => `[${new Date().toLocaleTimeString()}] Saved ${selectedFile}\n` + prev);
        } catch (error) {
            toast.error('Persistence failure');
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (endpoint: '/agent/memory/compact' | '/agent/memory/sync', actionName: string) => {
        setIsActionRunning(true);
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => `[${timestamp}] Initiating ${actionName} protocol...\n` + prev);

        try {
            const res = await api.post(endpoint);
            const endTimestamp = new Date().toLocaleTimeString();
            setLogs(prev => `[${endTimestamp}] ${actionName} SUCCESS.\n` + (res.data.log || 'Operation completed.') + '\n' + prev);
            toast.success(`${actionName} optimized.`);
            await loadData();
        } catch (error: any) {
            const msg = error.response?.data?.log || error.response?.data?.error || error.message;
            setLogs(prev => `[${timestamp}] ${actionName} SKIPPED: ZeroClaw gateway offline - using LLM fallback.\n` + prev);
            toast.error('Sync skipped - using direct LLM mode');
        } finally {
            setIsActionRunning(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary animate-pulse">Synchronizing Neural Weights...</p>
            </div>
        );
    }

    const kbSize = status ? (status.contextSizeInBytes / 1024).toFixed(2) : '0.00';
    const contextUsagePercent = Math.min(100, (status?.contextSizeInBytes || 0) / (100 * 1024) * 100); // 100KB arbitrary limit for viz

    return (
        <div className="p-1 space-y-8 animate-in fade-in duration-700">
            {/* Tab Navigation for Memory Types */}
            <div className="flex p-1 bg-surface-elevated dark:bg-ink-primary rounded-2xl border border-border-primary dark:border-border-primary">
                {[
                    { id: 'files', label: 'Neural Files', icon: '📁' },
                    { id: 'vector', label: 'Vector Memory', icon: '🔍' },
                    { id: 'skills', label: 'Agent Skills', icon: '⚡' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'bg-accent-500 text-white' : 'text-ink-tertiary hover:text-ink-secondary'}`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'vector' && (
                <div className="bg-surface-elevated dark:bg-ink-primary rounded-3xl p-6 border border-border-primary dark:border-border-primary">
                    <div className="flex gap-4 mb-6">
                        <input
                            type="text"
                            value={vectorQuery}
                            onChange={(e) => setVectorQuery(e.target.value)}
                            placeholder="Search vector memories (semantic search)..."
                            className="flex-1 px-4 py-3 bg-surface-secondary dark:bg-surface-tertiary rounded-xl text-sm"
                        />
                        <button onClick={searchVectorMemory} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase">
                            Search
                        </button>
                    </div>
                    
                    {vectorMemories.length > 0 ? (
                        <div className="space-y-3">
                            {vectorMemories.map((mem, i) => (
                                <div key={i} className="p-4 bg-surface-secondary dark:bg-surface-tertiary rounded-xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black uppercase text-accent-400">{mem.memory_type}</span>
                                        {mem.similarity && (
                                            <span className="text-[10px] text-ink-tertiary">{Math.round(mem.similarity * 100)}% match</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-ink-secondary dark:text-ink-tertiary">{mem.content.substring(0, 200)}...</p>
                                    <p className="text-[8px] text-ink-tertiary mt-2">{new Date(mem.created_at).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-ink-tertiary">
                            <span className="text-4xl mb-4 block">🔍</span>
                            <p className="text-sm">No vector memories found. Use the search or store memories.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'skills' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map((skill: any, i: number) => (
                        <div key={i} className="bg-surface-elevated dark:bg-ink-primary rounded-2xl p-6 border border-border-primary dark:border-border-primary hover:border-teal-500/30 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-black text-ink-primary dark:text-white">{skill.skill_name}</h4>
                                <span className="text-[10px] px-3 py-1 bg-surface-secondary dark:bg-surface-tertiary rounded-full uppercase font-bold text-ink-tertiary0">{skill.category}</span>
                            </div>
                            <p className="text-sm text-ink-tertiary0 mb-4">{skill.description}</p>
                            <button 
                                onClick={() => executeSkill(skill.skill_name, { test: true })}
                                className="w-full py-2 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase"
                            >
                                Test Skill
                            </button>
                        </div>
                    ))}
                    {skills.length === 0 && (
                        <div className="col-span-2 text-center py-10 text-ink-tertiary">
                            <span className="text-4xl mb-4 block">⚡</span>
                            <p className="text-sm">No skills available. Skills load from the agent_skills table.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'files' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Metrics Panel */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Primary Metric: Context */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-ink-primary rounded-3xl p-6 border border-border-primary shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <span className="text-4xl text-accent-400">🧠</span>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-500/80 mb-6 font-mono">Context Buffer</h4>
                        <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-black text-white">{kbSize}</span>
                            <span className="text-xs font-bold text-ink-tertiary0 tracking-widest uppercase">KB</span>
                        </div>

                        <div className="h-1.5 w-full bg-surface-tertiary rounded-full overflow-hidden mb-4">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${contextUsagePercent}%` }}
                                className={`h-full rounded-full ${contextUsagePercent > 80 ? 'bg-sand-500/50' : 'bg-accent-500/100'}`}
                            />
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-bold text-ink-tertiary0 uppercase font-mono">
                            <span>Last Updated</span>
                            <span className="text-ink-tertiary">{status?.lastUpdated ? new Date(status.lastUpdated).toLocaleTimeString() : '---'}</span>
                        </div>
                    </motion.div>

                    {/* File Explorer Sidebar */}
                    <div className="bg-surface-elevated dark:bg-ink-primary rounded-3xl p-6 border border-border-primary dark:border-border-primary shadow-sm flex flex-col h-[600px] overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink-tertiary font-mono">Memory Map</h4>
                            <div className={`p-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase flex items-center gap-1.5 ${gatewayStatus.online ? 'bg-emerald-500/100/10 text-emerald-400' : 'bg-[#e11d48]/50/10 text-[#e11d48]'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${gatewayStatus.online ? 'bg-emerald-500/100 animate-pulse' : 'bg-[#e11d48]/50'}`} />
                                ZeroClaw {gatewayStatus.online ? 'Linked' : 'Offline'}
                            </div>
                        </div>
                        <div className="space-y-6 overflow-y-auto grow custom-scrollbar pr-2">
                            {/* Grouping logic: Three Tiers */}
                            {[
                                { id: 'projects', label: 'Long-Term Storage', icon: '🏛️', desc: 'Neural Core & Project Context' },
                                { id: 'scripts', label: 'Medium-Term Memory', icon: '🧠', desc: 'Active Automation & Scripts' },
                                { id: 'logs', label: 'Short-Term Buffer', icon: '🌩️', desc: 'Transient Logs & RPC Streams' }
                            ].map(tier => {
                                const tierFiles = files.filter(f => f.startsWith(`${tier.id}/`));
                                if (tierFiles.length === 0) return null;

                                return (
                                    <div key={tier.id} className="space-y-3">
                                        <div className="px-3">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-ink-primary dark:text-ink-tertiary flex items-center gap-2">
                                                <span>{tier.icon}</span> {tier.label}
                                            </h5>
                                            <p className="text-[8px] font-medium text-ink-tertiary uppercase tracking-tight ml-6">{tier.desc}</p>
                                        </div>
                                        <div className="space-y-1">
                                            {tierFiles.map(file => (
                                                <button
                                                    key={file}
                                                    onClick={() => loadFile(file)}
                                                    className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all ${selectedFile === file ? 'bg-accent-500/100/10 text-accent-400 dark:text-accent-400 border border-teal-500/20 shadow-inner scale-[1.02]' : 'hover:bg-surface-secondary dark:hover:bg-surface-elevated/5 opacity-70 hover:opacity-100 hover:translate-x-1'}`}
                                                >
                                                    <span className="text-base">{file.endsWith('.md') ? '📄' : file.endsWith('.txt') ? '📝' : '⚙️'}</span>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[10px] font-black truncate tracking-tight uppercase">{file.split('/').pop()}</span>
                                                        <span className="text-[8px] opacity-50 truncate italic">
                                                            {file.includes('main_context') ? 'Core Identity' : 'Neural Node'}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Ungrouped files */}
                            {files.filter(f => !f.includes('/')).length > 0 && (
                                <div className="space-y-2">
                                    <h5 className="text-[9px] font-black uppercase tracking-widest text-ink-tertiary0 px-3">Root Files</h5>
                                    {files.filter(f => !f.includes('/')).map(file => (
                                        <button
                                            key={file}
                                            onClick={() => loadFile(file)}
                                            className={`w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-all ${selectedFile === file ? 'bg-accent-500/100/10 text-accent-400 dark:text-accent-400 border border-teal-500/20 shadow-inner' : 'hover:bg-surface-secondary dark:hover:bg-surface-elevated/5 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                                        >
                                            <span className="text-lg">📄</span>
                                            <span className="text-[10px] font-bold truncate tracking-tight">{file}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Integrated IDE */}
                <div className="lg:col-span-9 flex flex-col gap-6 h-[750px]">
                    <div className="bg-ink-primary rounded-[2.5rem] border border-border-primary shadow-2xl flex flex-col h-full overflow-hidden">
                        {/* IDE Header */}
                        <div className="px-8 py-5 flex items-center justify-between border-b border-white/5 bg-ink-primary/50 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2 mr-4">
                                    <div className="w-3 h-3 rounded-full bg-[#e11d48]/50 shadow-lg shadow-rose-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-sand-500/50 shadow-lg shadow-amber-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/100 shadow-lg shadow-emerald-500/20" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-ink-tertiary0 leading-none mb-1">Editing Neural Node</span>
                                    <span className="text-xs font-bold text-ink-tertiary font-mono italic">{selectedFile}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={saveFile}
                                    disabled={isSaving}
                                    className="px-6 py-2.5 bg-accent-500 hover:bg-accent-500/100 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-teal-600/20"
                                >
                                    {isSaving ? 'Persisting...' : 'Commit Changes'}
                                </button>
                            </div>
                        </div>

                        {/* Split Editor / Logs */}
                        <div className="grow flex flex-col">
                            {/* Main Editor */}
                            <div className="grow p-8 bg-slate-950/30">
                                <textarea
                                    value={fileContent}
                                    onChange={e => setFileContent(e.target.value)}
                                    spellCheck={false}
                                    className="w-full h-full bg-transparent font-mono text-sm text-ink-tertiary outline-none resize-none leading-relaxed custom-scrollbar selection:bg-accent-500/100/30"
                                    placeholder="Neural node is empty. Populate with knowledge..."
                                />
                            </div>

                            {/* Procedure Console */}
                            <div className="h-64 border-t border-white/5 bg-slate-950 flex flex-col">
                                <div className="px-8 py-3 flex items-center justify-between bg-ink-primary/40">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-accent-500/100 animate-pulse shadow-glow" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary0">Telemetry Stream</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleAction('/agent/memory/compact', 'Compact')} className="text-[9px] font-black uppercase tracking-widest text-sand-500 hover:text-sand-400">Compaction</button>
                                        <button onClick={() => handleAction('/agent/memory/sync', 'Sync')} className="text-[9px] font-black uppercase tracking-widest text-[#a5b4fc]0 hover:text-[#818cf8]">Sync</button>
                                    </div>
                                </div>
                                <div className="grow p-6 overflow-y-auto font-mono text-[10px] leading-loose custom-scrollbar bg-black/40">
                                    {logs.split('\n').map((line, i) => (
                                        <div key={i} className={`${line.includes('SUCCESS') ? 'text-accent-400' : line.includes('FAILED') ? 'text-[#fb7185]' : line.includes('Saved') ? 'text-[#818cf8]' : 'text-ink-tertiary0'}`}>
                                            {line}
                                        </div>
                                    ))}
                                    <div className="text-emerald-400 animate-pulse">_</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}
