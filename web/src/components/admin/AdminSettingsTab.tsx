'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ThemeSettingsPanel from './ThemeSettingsPanel';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface AdminSettingsTabProps {
    settings: any;
    setSettings: (settings: any) => void;
    saveSettings: () => void;
    savingSettings: boolean;
    settingsTab: 'general' | 'theme' | 'vendor' | 'moderation' | 'export';
    setSettingsTab: (tab: 'general' | 'theme' | 'vendor' | 'moderation' | 'export') => void;
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
                <div key={key} className="flex items-center justify-between p-4 bg-surface-secondary dark:bg-surface-tertiary/50 rounded-2xl border border-border-primary dark:border-border-primary/50">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary dark:text-ink-tertiary mb-1 block">
                            {key.replace(/_/g, ' ')}
                        </label>
                        <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Toggle {key.split('_').slice(1).join(' ')} status</p>
                    </div>
                    <button
                        onClick={() => setSettings({ ...settings, [key]: !boolVal })}
                        className={`w-14 h-8 rounded-full relative transition-all duration-300 ${boolVal ? 'bg-accent-500/100' : 'bg-surface-tertiary dark:bg-surface-tertiary'}`}
                    >
                        <motion.div
                            animate={{ x: boolVal ? 24 : 4 }}
                            className="absolute top-1 left-0 w-6 h-6 bg-surface-elevated rounded-full shadow-sm"
                        />
                    </button>
                </div>
            );
        }

        return (
            <div key={key} className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary dark:text-ink-tertiary px-1">
                    {key.replace(/_/g, ' ')}
                </label>
                <div className="relative group">
                    <input
                        type="text"
                        value={value as string}
                        onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                        className="w-full p-4 bg-surface-secondary dark:bg-surface-tertiary/50 rounded-2xl focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 border-2 border-transparent outline-none transition-all dark:text-ink-tertiary"
                        placeholder={`Enter ${key.replace(/_/g, ' ')}...`}
                    />
                    <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                        <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest">Editing</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-surface-elevated dark:bg-ink-primary rounded-4xl border border-border-primary dark:border-border-primary overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
            
            <div className="w-full md:w-64 bg-surface-secondary/50 dark:bg-surface-tertiary/30 border-r border-border-primary dark:border-border-primary p-6 space-y-2">
                <div className="mb-8 px-2">
                    <h3 className="text-lg font-black text-ink-primary dark:text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-accent-500/100 rounded-full" />
                        Settings
                    </h3>
                </div>

                {['general', 'theme', 'vendor', 'moderation', 'export'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSettingsTab(tab as any)}
                        className={`w-full px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all ${settingsTab === tab
                                ? 'bg-surface-elevated dark:bg-surface-tertiary text-accent-400 dark:text-accent-400 shadow-sm border border-border-primary dark:border-border-primary'
                                : 'text-ink-tertiary hover:text-ink-secondary dark:hover:text-ink-tertiary'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            
            <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[800px]">
                <div className="max-w-3xl">
                    <div className="mb-10">
                        <h2 className="text-2xl font-black text-ink-primary dark:text-white capitalize mb-2">{settingsTab} Configurations</h2>
                        <p className="text-ink-tertiary dark:text-ink-tertiary text-sm">Manage your platform's {settingsTab} behavior and global variables.</p>
                    </div>

                    {settingsTab === 'export' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <button
                                onClick={() => handleExport('users')}
                                className="group p-8 bg-surface-secondary dark:bg-surface-tertiary/50 rounded-3xl border border-border-primary dark:border-border-primary hover:border-teal-500 transition-all text-left"
                            >
                                <EmojiIcon emoji="📊" size=16 className="w-12 h-12 rounded-2xl bg-[#14b8a6]/100/10 text-[#a5b4fc]0 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-ink-primary dark:text-white uppercase text-xs tracking-widest mb-1">Export User Directory</h4>
                                <p className="text-ink-tertiary text-[10px]">Download all registered users as CSV.</p>
                            </button>
                            <button
                                onClick={() => handleExport('listings')}
                                className="group p-8 bg-surface-secondary dark:bg-surface-tertiary/50 rounded-3xl border border-border-primary dark:border-border-primary hover:border-teal-500 transition-all text-left"
                            >
                                <EmojiIcon emoji="🏺" size=16 className="w-12 h-12 rounded-2xl bg-accent-500/100/10 text-accent-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" />
                                <h4 className="font-black text-ink-primary dark:text-white uppercase text-xs tracking-widest mb-1">Export Marketplace</h4>
                                <p className="text-ink-tertiary text-[10px]">Download all active listings as CSV.</p>
                            </button>
                        </div>
                    ) : settingsTab === 'theme' ? (
                        <ThemeSettingsPanel />
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

                            <div className="pt-10 mt-10 border-t border-border-primary dark:border-border-primary flex items-center justify-between">
                                <div className="text-xs text-ink-tertiary dark:text-ink-tertiary">
                                    Last saved: {new Date().toLocaleDateString()}
                                </div>
                                <button
                                    onClick={saveSettings}
                                    disabled={savingSettings}
                                    className="px-10 py-5 bg-accent-500 hover:bg-accent-500/100 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 active:scale-95"
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
