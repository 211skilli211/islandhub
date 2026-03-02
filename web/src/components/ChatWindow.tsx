'use client';

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    message_id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
    is_read: boolean;
    attachment_url?: string;
    order_id?: number;
}

interface ChatWindowProps {
    otherUserId: number;
    otherUserName: string;
    currentUser: any;
    orderId?: number;
}

export default function ChatWindow({ otherUserId, otherUserName, currentUser, orderId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await api.get(`/api/messages/conversation/${otherUserId}`);
            setMessages(res.data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling for now
        return () => clearInterval(interval);
    }, [otherUserId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await api.post('/messages', {
                receiver_id: otherUserId,
                content: newMessage,
                order_id: orderId
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-indigo-100/20">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black">
                        {otherUserName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-tight">{otherUserName}</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online
                        </p>
                    </div>
                </div>
                {orderId && (
                    <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-2">
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tight italic text-nowrap">Order #{orderId}</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30"
            >
                {loading ? (
                    <div className="text-center py-20 font-black text-slate-300 uppercase tracking-widest text-[10px]">Encrypting Connection...</div>
                ) : messages.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium italic">Start the conversation!</div>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m.message_id}
                            className={`flex ${m.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[70%] p-5 rounded-3xl font-medium shadow-sm ${m.sender_id === currentUser.id
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                }`}>
                                {m.content}
                                {m.attachment_url && (
                                    <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                                        <img src={m.attachment_url} className="max-w-full h-auto" alt="Attachment" />
                                    </div>
                                )}
                                <div className={`text-[8px] mt-2 font-black uppercase tracking-widest ${m.sender_id === currentUser.id ? 'text-indigo-200' : 'text-slate-400'
                                    }`}>
                                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {m.order_id && <span className="ml-2">• Order #{m.order_id}</span>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-slate-100 bg-white">
                <div className="relative flex gap-2">
                    <button
                        type="button"
                        className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-all"
                        onClick={() => {/* TODO: Implement attachment upload */ }}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </button>
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full pl-6 pr-20 py-5 bg-slate-50 border-transparent rounded-[2rem] text-slate-900 font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="absolute right-3 top-3 bottom-3 px-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
