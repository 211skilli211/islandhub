'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MemoryStatus {
    contextSizeInBytes: number;
    lastUpdated: string | null;
    sqliteRecords: {
        api_endpoints: number;
        db_schemas: number;
    };
}

export default function MemoryDashboard() {
    const [status, setStatus] = useState<MemoryStatus | null>(null);
    const [context, setContext] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<string>('Ready.');
    const [isActionRunning, setIsActionRunning] = useState(false);

    const loadData = async () => {
        try {
            const [statusRes, contextRes] = await Promise.all([
                api.get('/agent/memory/status'),
                api.get('/agent/memory/context')
            ]);
            setStatus(statusRes.data);
            setContext(contextRes.data.content);
        } catch (error) {
            console.error('Failed to load memory data:', error);
            toast.error('Failed to connect to ReMeLight API');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (endpoint: '/agent/memory/compact' | '/agent/memory/sync', actionName: string) => {
        setIsActionRunning(true);
        setLogs(`> Triggering ${actionName}...\n`);
        try {
            const res = await api.post(endpoint);
            setLogs(prev => prev + `\n[SUCCESS]\n${res.data.log}`);
            toast.success(`${actionName} completed.`);
            await loadData(); // refresh status
        } catch (error: any) {
            const msg = error.response?.data?.log || error.message;
            setLogs(prev => prev + `\n[FAILED]\n${msg}`);
            toast.error(`${actionName} failed.`);
        } finally {
            setIsActionRunning(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-slate-500">Loading ReMeLight Memory System...</div>;
    }

    const kbSize = status ? (status.contextSizeInBytes / 1024).toFixed(2) : '0.00';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Status Cards */}
                <div className="w-full md:w-1/3 flex flex-col gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="text-xl">🧠</span> Context File Size
                        </h3>
                        <p className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-teal-500 to-indigo-500">
                            {kbSize} <span className="text-sm text-slate-500">KB</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                            Last Updated: {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString() : 'Never'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                            <span className="text-xl">🗄️</span> SQLite Technical Data (Dense)
                        </h3>
                        <div className="flex justify-between items-center text-sm mb-1 mt-4">
                            <span className="text-slate-600 dark:text-slate-400">API Endpoints Indexed</span>
                            <span className="font-mono font-bold">{status?.sqliteRecords.api_endpoints}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 dark:text-slate-400">DB Schemas Indexed</span>
                            <span className="font-mono font-bold">{status?.sqliteRecords.db_schemas}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-xl">⚙️</span> ReMeLight Controls
                        </h3>
                        <div className="flex justify-end gap-2 flex-col">
                            <button
                                onClick={() => handleAction('/agent/memory/compact', 'Compaction')}
                                disabled={isActionRunning}
                                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>📄</span> Token Compaction
                            </button>
                            <button
                                onClick={() => handleAction('/agent/memory/sync', 'ZeroClaw Sync')}
                                disabled={isActionRunning}
                                className="w-full px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>🔄</span> Sync ZeroClaw Gateway
                            </button>
                        </div>
                    </div>

                    {/* Minimal Console output */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-inner grow">
                        <div className="text-xs font-mono text-emerald-400 mb-2 border-b border-slate-800 pb-1 w-full text-left">System Output</div>
                        <pre className="text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                            {logs}
                        </pre>
                    </div>
                </div>

                {/* Main Context Viewer */}
                <div className="w-full md:w-2/3 flex flex-col">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm grow flex flex-col h-full min-h-[500px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="text-xl">📝</span> Live Context (main_context.md)
                            </h3>
                            <button onClick={loadData} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                ↻ Refresh
                            </button>
                        </div>

                        <div className="grow bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 overflow-y-auto custom-scrollbar">
                            <pre className="font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {context}
                            </pre>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
