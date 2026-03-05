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

export default function AgentChat() {
    const { user } = useAuthStore();
    const profile = getAgentProfile(user?.role);
    const showFloating = shouldShowFloatingChat(user?.role);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'agent', content: profile.greeting, timestamp: new Date(), agentName: profile.displayName }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

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
    if (!user || !showFloating) return null;

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
            header: 'bg-teal-600',
            bubble: 'bg-teal-600',
            ring: 'focus:ring-teal-100 focus:border-teal-500',
            btn: 'bg-teal-600 hover:bg-teal-700 shadow-teal-100',
            toggle: 'bg-teal-600 shadow-teal-200',
            pulse: 'bg-rose-500',
        },
        amber: {
            header: 'bg-amber-600',
            bubble: 'bg-amber-600',
            ring: 'focus:ring-amber-100 focus:border-amber-500',
            btn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-100',
            toggle: 'bg-amber-600 shadow-amber-200',
            pulse: 'bg-teal-500',
        },
    };

    const colors = accentClasses[profile.accentColor as keyof typeof accentClasses] || accentClasses.teal;

    return (
        <div className="fixed bottom-6 right-6 z-9999">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className={`p-4 ${colors.header} text-white flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 text-lg">
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
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/50"
                        >
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${m.role === 'user'
                                        ? `${colors.bubble} text-white rounded-tr-none shadow-md`
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-none shadow-sm'
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
                                    <div className="bg-white dark:bg-slate-700 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-600 flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <div className="relative flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={profile.placeholder}
                                    className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-transparent rounded-2xl text-sm font-medium focus:ring-2 ${colors.ring} transition-all dark:text-white`}
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

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-16 h-16 ${colors.toggle} rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-slate-800 relative`}
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
        </div>
    );
}
