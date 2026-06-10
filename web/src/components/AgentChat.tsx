'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { getAgentProfile, shouldShowFloatingChat, type AgentProfile } from '@/lib/agentConfig';
import api from '@/lib/api';

interface ChatMessage {
    role: 'user' | 'agent';
    content: string;
    timestamp: Date;
    agentName?: string;
}

interface AgentChatProps {
    hubMode?: boolean;
    onHubClose?: () => void;
}

export default function AgentChat({ hubMode = false, onHubClose }: AgentChatProps) {
    const { user } = useAuthStore();
    const profile = getAgentProfile(user?.role);
    const showFloating = shouldShowFloatingChat(user?.role);

    const [isOpen, setIsOpen] = useState(hubMode); // Open by default in hub mode
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'agent', content: profile.greeting, timestamp: new Date(), agentName: profile.displayName }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Close handler that accounts for hub mode
    const handleClose = () => {
        if (hubMode && onHubClose) {
            onHubClose();
        } else {
            setIsOpen(false);
        }
    };

    // Update greeting when role changes
    useEffect(() => {
        setMessages([{
            role: 'agent',
            content: profile.greeting,
            timestamp: new Date(),
            agentName: profile.displayName
        }]);
        setConversationId('');
    }, [user?.role]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // Don't render if user is not logged in, or should have a dedicated panel instead
    if (!user || (!showFloating && !hubMode)) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await api.post(`/agent${profile.endpoint}`, {
                message: userMsg,
                agent: profile.agent,
                conversationId,
                context: {
                    userId: user?.id,
                    role: user?.role || 'guest',
                },
            });

            if (res.data.conversationId && !conversationId) {
                setConversationId(res.data.conversationId);
            }

            setMessages(prev => [...prev, {
                role: 'agent',
                content: res.data.reply || 'I processed your request.',
                timestamp: new Date(),
                agentName: profile.displayName
            }]);
        } catch {
            setMessages(prev => [...prev, {
                role: 'agent',
                content: "I'm having trouble connecting right now. Please try again in a moment!",
                timestamp: new Date(),
                agentName: profile.displayName
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const accentClasses = {
        teal: {
            header: 'bg-accent-500',
            bubble: 'bg-accent-500',
            ring: 'focus:ring-teal-100 focus:border-accent-400',
            btn: 'bg-accent-500 hover:bg-accent-600 shadow-accent-500/10',
            toggle: 'bg-accent-500 shadow-accent-500/15',
            pulse: 'bg-[#e11d48]/50',
        },
        amber: {
            header: 'bg-sand-500',
            bubble: 'bg-sand-500',
            ring: 'focus:ring-amber-100 focus:border-amber-500',
            btn: 'bg-sand-500 hover:bg-sand-600 shadow-amber-100',
            toggle: 'bg-sand-500 shadow-amber-200',
            pulse: 'bg-accent-500/100',
        },
    };

    const colors = accentClasses[profile.accentColor as keyof typeof accentClasses] || accentClasses.teal;

    return (
        <div className={hubMode ? "" : "fixed bottom-24 lg:bottom-6 right-6 z-10000"}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`mb-4 w-80 sm:w-96 bg-surface-elevated rounded-3xl shadow-2xl border border-border-primary flex flex-col overflow-hidden ${hubMode ? "absolute bottom-0 right-0 z-10002" : ""}`}
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className={`p-4 ${colors.header} text-white flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-surface-elevated/20 rounded-full flex items-center justify-center border-2 border-surface-elevated/30 text-lg">
                                    {profile.icon}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm uppercase tracking-wider">{profile.displayName}</h3>
                                    <p className="text-[10px] opacity-80 font-bold">
                                        {user ? `${user.role} mode` : 'Guest mode'} • Always here to help
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-surface-elevated/10 rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-secondary/50"
                        >
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${m.role === 'user'
                                        ? `${colors.bubble} text-white rounded-tr-none shadow-md`
                                        : 'bg-surface-tertiary text-ink-secondary border border-border-primary dark:border-border-primary rounded-tl-none shadow-sm'
                                        }`}>
                                        {m.agentName && m.role === 'agent' && (
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-50 block mb-1">
                                                {m.agentName}
                                            </span>
                                        )}
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-surface-tertiary p-3 rounded-2xl rounded-tl-none border border-border-primary dark:border-border-primary flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-surface-tertiary rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-border-primary bg-surface-elevated">
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={profile.placeholder}
                                    className={`flex-1 px-4 py-3 bg-surface-secondary border-transparent rounded-2xl text-sm font-medium focus:ring-2 ${colors.ring} transition-all dark:text-white`}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className={`p-3 ${colors.btn} text-white rounded-2xl font-black transition-all shadow-lg disabled:opacity-50`}
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

            {!hubMode && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-16 h-16 ${colors.toggle} rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-border-primary relative`}
                >
                    {isOpen ? (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    ) : (
                        <div className="relative">
                            <span className="text-2xl">{profile.icon}</span>
                            {!isOpen && (
                                <span className={`absolute -top-1 -right-1 w-4 h-4 ${colors.pulse} border-2 border-white rounded-full animate-pulse`} />
                            )}
                        </div>
                    )}
                </motion.button>
            )}
        </div>
    );
}
