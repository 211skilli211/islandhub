'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { getAgentProfile, AGENT_GATEWAY_URL } from '@/lib/agentConfig';
import api from '@/lib/api';

interface ChatMessage {
    role: 'user' | 'agent';
    content: string;
}

const QUICK_ACTIONS = [
    { label: '📦 Inventory Help', prompt: 'Help me manage my inventory — what products need attention?' },
    { label: '📊 Sales Analytics', prompt: 'Show me a summary of my recent sales performance.' },
    { label: '🚚 Order Issues', prompt: 'Do I have any pending or problematic orders?' },
    { label: '📋 Onboarding Steps', prompt: 'What steps do I still need to complete for full onboarding?' },
    { label: '💳 Payment Setup', prompt: 'Help me configure my payment settings.' },
    { label: '📢 Promotions', prompt: 'How can I promote my listings and get more visibility?' },
];

interface VendorAssistantProps {
    hubMode?: boolean;
    onHubClose?: () => void;
}

export default function VendorAssistant({ hubMode = false, onHubClose }: VendorAssistantProps = {}) {
    const { user } = useAuthStore();
    const profile = getAgentProfile('vendor');
    const [isOpen, setIsOpen] = useState(hubMode);

    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'agent', content: profile.greeting }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Don't render if user is not a vendor
    if (user?.role !== 'vendor') return null;

    const sendMessage = async (msg: string) => {
        if (!msg.trim()) return;
        setMessages(prev => [...prev, { role: 'user', content: msg }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post('/agent/chat/vendor', {
                message: msg,
                conversationId,
                context: { userId: user?.id, role: 'vendor' },
            });
            if (res.data.conversationId && !conversationId) {
                setConversationId(res.data.conversationId);
            }
            setMessages(prev => [...prev, { role: 'agent', content: res.data.reply || 'Processed.' }]);
        } catch {
            setMessages(prev => [...prev, { role: 'agent', content: "I'm having trouble connecting. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <>
            
            {!hubMode && (
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`fixed bottom-24 lg:bottom-6 right-6 z-9999 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-xl border-2 transition-all ${isOpen
                        ? 'bg-[#14b8a6] text-white border-[#14b8a6]'
                        : 'bg-[#14b8a6] text-white border-white/20 hover:bg-[#14b8a6]'
                        }`}
                >
                    <span className="text-lg">{profile.icon}</span>
                    <span className="font-black text-xs uppercase tracking-widest">{isOpen ? 'Close' : 'Assistant'}</span>
                    {!isOpen && <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />}
                </motion.button>
            )}

            
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className={`fixed top-0 right-0 bottom-0 w-96 bg-surface-elevated dark:bg-ink-primary border-l border-border-primary dark:border-border-primary shadow-2xl flex flex-col ${hubMode ? 'z-10002' : 'z-40'}`}
                    >
                        
                        <div className="p-5 bg-[#14b8a6] text-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-surface-elevated/20 rounded-xl flex items-center justify-center text-xl border border-white/30">
                                        {profile.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase tracking-wider">{profile.displayName}</h3>
                                        <p className="text-[10px] opacity-80 font-bold">Your AI-powered business assistant</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => hubMode && onHubClose ? onHubClose() : setIsOpen(false)}
                                    className="p-2 hover:bg-surface-elevated/10 rounded-xl transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            
                            <div className="flex flex-wrap gap-1.5">
                                {QUICK_ACTIONS.map(qa => (
                                    <button
                                        key={qa.label}
                                        onClick={() => sendMessage(qa.prompt)}
                                        className="px-2.5 py-1 bg-surface-elevated/15 hover:bg-surface-elevated/25 rounded-lg text-[10px] font-bold transition-colors"
                                    >
                                        {qa.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-secondary dark:bg-surface-tertiary/50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${m.role === 'user'
                                        ? 'bg-[#14b8a6] text-white rounded-tr-none'
                                        : 'bg-surface-elevated dark:bg-surface-tertiary text-ink-secondary dark:text-ink-tertiary border border-border-primary dark:border-border-primary rounded-tl-none shadow-sm'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-surface-elevated dark:bg-surface-tertiary p-3 rounded-2xl rounded-tl-none border border-border-primary dark:border-border-primary flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        
                        <form onSubmit={handleSend} className="p-4 border-t border-border-primary dark:border-border-primary bg-surface-elevated dark:bg-ink-primary">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={profile.placeholder}
                                    className="flex-1 px-4 py-3 bg-surface-secondary dark:bg-surface-tertiary rounded-xl text-sm font-medium border-transparent focus:ring-2 focus:ring-teal-100 focus:border-[#14b8a6] transition-all dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="p-3 bg-[#14b8a6] text-white rounded-xl hover:bg-[#14b8a6] transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
