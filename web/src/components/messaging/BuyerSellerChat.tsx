'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/auth';

interface Conversation {
    id: number;
    conversation_id: string;
    participant_id: number;
    participant_name: string;
    participant_avatar?: string;
    listing_id?: number;
    listing_title?: string;
    last_message?: string;
    last_message_at: string;
    unread_count: number;
}

interface Message {
    id: number;
    message_id: string;
    conversation_id: string;
    sender_id: number;
    sender_name: string;
    content: string;
    created_at: string;
    is_read: boolean;
}

interface BuyerSellerChatProps {
    listingId?: number;
    sellerId?: number;
    initialMessage?: string;
    onClose?: () => void;
}

export default function BuyerSellerChat({ listingId, sellerId, initialMessage, onClose }: BuyerSellerChatProps) {
    const { user } = useAuthStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (activeConversation) {
            fetchMessages(activeConversation);
        }
    }, [activeConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messaging/conversations');
            setConversations(res.data.conversations || []);
        } catch (err) {
            console.error('Failed to fetch conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            const res = await api.get(`/messaging/conversations/${conversationId}/messages`);
            setMessages(res.data.messages || []);
        } catch (err) {
            console.error('Failed to fetch messages:', err);
        }
    };

    const startNewConversation = async () => {
        if (!listingId || !sellerId) return;
        try {
            const res = await api.post('/messaging/conversations', {
                participant_id: sellerId,
                listing_id: listingId,
                initial_message: initialMessage || 'Hi, I\'m interested in your listing!'
            });
            setActiveConversation(res.data.conversation.conversation_id);
            fetchConversations();
            toast.success('Conversation started');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to start conversation');
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConversation) return;
        
        setSending(true);
        try {
            await api.post('/messaging/messages', {
                conversation_id: activeConversation,
                content: newMessage.trim()
            });
            setNewMessage('');
            fetchMessages(activeConversation);
        } catch (err) {
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (days === 1) return 'Yesterday';
        if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Messages</h3>
                {onClose && (
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
                        <span className="text-xl">✕</span>
                    </button>
                )}
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Conversation List */}
                <div className="w-1/3 border-r border-slate-100 dark:border-slate-800 overflow-y-auto">
                    {listingId && sellerId && (
                        <button
                            onClick={startNewConversation}
                            className="w-full p-4 mx-auto m-4 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span>💬</span> New Conversation
                        </button>
                    )}
                    
                    {conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm">No conversations yet</div>
                    ) : (
                        conversations.map(conv => (
                            <button
                                key={conv.conversation_id}
                                onClick={() => setActiveConversation(conv.conversation_id)}
                                className={`w-full p-4 text-left border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                                    activeConversation === conv.conversation_id ? 'bg-teal-50 dark:bg-teal-900/20 border-l-4 border-l-teal-500' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                        {conv.participant_name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{conv.participant_name}</span>
                                            {conv.unread_count > 0 && (
                                                <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{conv.unread_count}</span>
                                            )}
                                        </div>
                                        {conv.listing_title && (
                                            <p className="text-[10px] text-slate-500 truncate">{conv.listing_title}</p>
                                        )}
                                        {conv.last_message && (
                                            <p className="text-xs text-slate-400 truncate mt-1">{conv.last_message}</p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Message Thread */}
                <div className="flex-1 flex flex-col">
                    {activeConversation ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {messages.map(msg => (
                                    <div key={msg.message_id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] ${msg.sender_id === user?.id ? 'order-2' : 'order-1'}`}>
                                            <div className={`px-5 py-3 rounded-3xl ${
                                                msg.sender_id === user?.id 
                                                    ? 'bg-teal-600 text-white rounded-br-md' 
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-md'
                                            }`}>
                                                <p className="text-sm">{msg.content}</p>
                                            </div>
                                            <p className={`text-[10px] text-slate-400 mt-2 ${msg.sender_id === user?.id ? 'text-right' : 'text-left'}`}>
                                                {formatTime(msg.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={sendMessage} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm outline-none focus:border-teal-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !newMessage.trim()}
                                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            Select a conversation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}