'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { getAgentProfile, shouldShowFloatingChat, isVendorAgent, AGENT_PROFILES } from '@/lib/agentConfig';
import AgentChat from './AgentChat';
import FloatingActionMenu from './FloatingActionMenu';
import VendorAssistant from './dashboard/VendorAssistant';




export default function FloatingHub() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'none' | 'chat' | 'menu' | 'vendor'>('none');

    const { user } = useAuthStore();
    const pathname = usePathname();
    const profile = getAgentProfile(user?.role);
    const showChat = shouldShowFloatingChat(user?.role);
    const showVendorAssistant = isVendorAgent(user?.role);


    if (!user) return null;

    // Visibility logic from consolidated components
    const isAdminOrVendorPage = pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard/vendor');
    const showMenu = !isAdminOrVendorPage || user?.role === 'admin' || user?.role === 'super-admin';

    if (!showChat && !showMenu && !showVendorAssistant) return null;


    const toggleHub = () => {
        setIsOpen(!isOpen);
        if (isOpen) setActiveTab('none');
    };

    return (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-10000 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && activeTab === 'none' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="mb-4 flex flex-col gap-3 items-end"
                    >
                        {showChat && (
                            <button
                                onClick={() => setActiveTab('chat')}
                                className="flex items-center gap-3 px-4 py-3 bg-surface-secondary text-ink-primary rounded-2xl shadow-xl border border-border-primary hover:scale-105 transition-transform group"
                            >
                                <span className="font-bold text-sm">Talk to {profile.displayName}</span>
                                <span className="text-xl bg-accent-500/100/10 p-2 rounded-xl group-hover:bg-accent-500/100/20 transition-colors">{profile.icon}</span>
                            </button>
                        )}
                        {showVendorAssistant && (
                            <button
                                onClick={() => setActiveTab('vendor')}
                                className="flex items-center gap-3 px-4 py-3 bg-surface-secondary text-ink-primary rounded-2xl shadow-xl border border-border-primary hover:scale-105 transition-transform group"
                            >
                                <span className="font-bold text-sm">Open Store Assistant</span>
                                <span className="text-xl bg-[#14b8a6]/100/10 p-2 rounded-xl group-hover:bg-[#14b8a6]/100/20 transition-colors">{AGENT_PROFILES?.vendor?.icon || '🏪'}</span>
                            </button>
                        )}
                        {showMenu && (
                            <button
                                onClick={() => setActiveTab('menu')}
                                className="flex items-center gap-3 px-4 py-3 bg-surface-secondary text-ink-primary rounded-2xl shadow-xl border border-border-primary hover:scale-105 transition-transform group"
                            >
                                <span className="font-bold text-sm">Quick Actions</span>
                                <span className="text-xl bg-[#14b8a6]/100/10 p-2 rounded-xl group-hover:bg-[#14b8a6]/100/20 transition-colors">⚡</span>
                            </button>
                        )}

                    </motion.div>
                )}
            </AnimatePresence>

            
            <div className="relative">
                {activeTab === 'chat' && (
                    <div className="absolute bottom-0 right-0">
                        <AgentHubChatWrapper onClose={() => setActiveTab('none')} />
                    </div>
                )}
                {activeTab === 'vendor' && (
                    <div className="absolute bottom-0 right-0">
                        <VendorAssistant hubMode={true} onHubClose={() => setActiveTab('none')} />
                    </div>
                )}
                {activeTab === 'menu' && (

                    <div className="absolute bottom-0 right-0">
                        <AgentHubMenuWrapper onClose={() => setActiveTab('none')} />
                    </div>
                )}
            </div>

            
            {activeTab === 'none' && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleHub}
                    className="w-[52px] h-[52px] bg-gradient-to-br from-teal-500 via-teal-600 to-teal-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-border-primary relative z-10001"
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.svg
                                key="close"
                                initial={{ rotate: -90, opacity: 0 }}
                                animate={{ rotate: 0, opacity: 1 }}
                                exit={{ rotate: 90, opacity: 0 }}
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </motion.svg>
                        ) : (
                            <motion.div
                                key="hub"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                className="flex items-center justify-center p-1"
                            >
                                <span className="text-xl">🏝️</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!isOpen && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-400 border-2 border-white dark:border-border-primary rounded-full animate-pulse" />
                    )}
                </motion.button>
            )}
        </div>
    );
}

// Minimal wrappers to reuse existing components but with close buttons and positioning adjustments
function AgentHubChatWrapper({ onClose }: { onClose: () => void }) {
    // We can't easily modify AgentChat's internal state from here without changing its structure
    // So we'll render it as is, but we need to ensure its toggle button is hidden or replaced.
    // For now, I'll recommend refactoring AgentChat to take props or creating a version specifically for the hub.
    // Since I'm an agent, I'll modify AgentChat to support a 'hubMode' prop.
    return <AgentChat hubMode={true} onHubClose={onClose} />;
}

function AgentHubMenuWrapper({ onClose }: { onClose: () => void }) {
    return <FloatingActionMenu hubMode={true} onHubClose={onClose} />;
}
