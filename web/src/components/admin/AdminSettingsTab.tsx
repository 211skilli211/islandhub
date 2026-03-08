'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface AdminSettingsTabProps {
    settings: any;
    setSettings: (settings: any) => void;
    saveSettings: () => void;
    savingSettings: boolean;
    settingsTab: 'general' | 'vendor' | 'moderation' | 'export';
    setSettingsTab: (tab: 'general' | 'vendor' | 'moderation' | 'export') => void;
    handleExport: (type: string) => void;
}

export default function AdminSettingsTab({
    settings,
    setSettings,
    saveSettings,
    savingSettings,
    settingsTab,
    setSettingsTab,
    handleExport
}: AdminSettingsTabProps) {

    const renderSettingInput = (key: string, value: any) => {
        const isBoolean = typeof value === 'boolean' || value === 'true' || value === 'false';

        if (isBoolean) {
            const boolVal = typeof value === 'boolean' ? value : value === 'true';
            return (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1 block">
                            {key.replace(/_/g, ' ')}
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Toggle {key.split('_').slice(1).join(' ')} status</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, [key]: !boolVal })}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${boolVal ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <motion.div
                            animate={{ x: boolVal ? 24 : 4 }}
                            className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-sm"
                        />
                    </button>
                </div>
            );
        }

        return (
            <div key={key} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-1">
                    {key.replace(/_/g, ' ')}
                </label>
                <div className="relative group">
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 border-2 border-transparent outline-none transition-all dark:text-slate-200"
                        placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Editing</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800 p-6 space-y-2">
                <div className="mb-8 px-2">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-teal-500 rounded-full" />
                        Settings
                    </h3>
                </div>

                {['general', 'vendor', 'moderation', 'export'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSettingsTab(tab as any)}
                        className={`w-full px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === tab
                                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-sm border border-slate-100 dark:border-slate-700'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[800px]">
                <div className="max-w-3xl">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white capitalize mb-2">{settingsTab} Configurations</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your platform's {settingsTab} behavior and global variables.</p>
                    </div>

                    {settingsTab === 'export' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleExport('users')}
                                className="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-teal-500 transition-all text-left"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">📊</div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-1">Export User Directory</h4>
                                <p className="text-slate-500 text-[10px]">Download all registered users as CSV.</p>
                            </button>
                            <button
                                onClick={() => handleExport('listings')}
                                className="group p-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-teal-500 transition-all text-left"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">🏺</div>
                                <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest mb-1">Export Marketplace</h4>
                                <p className="text-slate-500 text-[10px]">Download all active listings as CSV.</p>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(settings).filter(([k]) => {
                                    if (settingsTab === 'general') return k.startsWith('site_') || k.startsWith('contact_') || k.startsWith('maintenance');
                                    if (settingsTab === 'vendor') return k.startsWith('vendor_') || k.startsWith('fee_') || k.startsWith('force_kyc');
                                    if (settingsTab === 'moderation') return k.startsWith('mod_') || k.startsWith('detailed_audit');
                                    return false;
                                }).map(([key, value]) => renderSettingInput(key, value))}
                            </div>

                            <div className="pt-10 mt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                    Last saved: {new Date().toLocaleDateString()}
                                </div>
                                <button
                                    onClick={saveSettings}
                                    disabled={savingSettings}
                                    className="px-10 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {savingSettings ? 'Synchronizing...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
