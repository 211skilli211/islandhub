'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import ChatWindow from '@/components/ChatWindow';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

export default function MessageCenter() {
    const { user } = useAuthStore();
    const searchParams = useSearchParams();
    const initialOtherUserId = searchParams.get('userId');
    const initialOtherUserName = searchParams.get('userName');

    const [conversations, setConversations] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages/me');
            setConversations(res.data);

            // If coming from a listing, auto-select that vendor
            if (initialOtherUserId && !selectedUser) {
                const otherId = parseInt(initialOtherUserId);
                // Check if already have a conversation
                const existing = res.data.find((c: any) => c.other_user_id === otherId);
                if (existing) {
                    setSelectedUser(existing);
                } else {
                    setSelectedUser({
                        other_user_id: otherId,
                        other_user_name: initialOtherUserName || 'Vendor'
                    });
                }
            } else if (res.data.length > 0 && !selectedUser) {
                setSelectedUser(res.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch conversations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [initialOtherUserId]);

    if (loading) return (
        <div className="h-[500px] flex items-center justify-center bg-surface-secondary/50 rounded-[3rem]">
            <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-[#14b8a6] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-black text-ink-tertiary uppercase tracking-widest text-[10px]">Opening Secure Channel...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-surface-elevated h-[600px] rounded-[3rem] flex border border-border-primary overflow-hidden">
            
            <div className="w-80 border-r border-border-primary flex flex-col bg-surface-elevated">
                <div className="p-8 border-b border-border-primary flex items-center justify-between">
                    <h2 className="text-xl font-black text-ink-primary tracking-tight">Inbox</h2>
                    <span className="bg-[#14b8a6]/10 text-[#14b8a6] text-[10px] font-black px-2 py-1 rounded-md">{conversations.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {conversations.length === 0 && !initialOtherUserId ? (
                        <div className="p-12 text-center opacity-40">
                            <EmojiIcon emoji="📬" size={40} className="text-4xl mb-4" />
                            <p className="font-bold italic text-ink-tertiary text-sm leading-relaxed">Your inbox is empty.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50 text-left">
                            {initialOtherUserId && !conversations.find(c => c.other_user_id === parseInt(initialOtherUserId)) && (
                                <button
                                    onClick={() => setSelectedUser({ other_user_id: parseInt(initialOtherUserId), other_user_name: initialOtherUserName })}
                                    className={`w-full p-6 text-left transition-all ${selectedUser?.other_user_id === parseInt(initialOtherUserId) ? 'bg-[#14b8a6]/10/50 border-r-4 border-[#14b8a6]' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#14b8a6] rounded-2xl flex items-center justify-center text-white font-black text-sm">
                                            {initialOtherUserName?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-ink-primary truncate text-sm">{initialOtherUserName}</h3>
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Starting New Chat</p>
                                        </div>
                                    </div>
                                </button>
                            )}

                            {conversations.map((conv) => (
                                <button
                                    key={conv.other_user_id}
                                    onClick={() => setSelectedUser(conv)}
                                    className={`w-full p-6 text-left transition-all group ${selectedUser?.other_user_id === conv.other_user_id ? 'bg-[#14b8a6]/10/50 border-r-4 border-[#14b8a6]' : 'hover:bg-surface-secondary/50'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-surface-secondary group-hover:bg-[#14b8a6]/15 rounded-2xl flex items-center justify-center text-ink-tertiary group-hover:text-[#14b8a6] font-black transition-colors shadow-inner text-sm">
                                            {conv.other_user_name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-black text-ink-primary truncate text-xs">{conv.other_user_name}</h3>
                                                <span className="text-[8px] font-black text-ink-tertiary uppercase tracking-widest">
                                                    {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-ink-tertiary font-medium truncate italic opacity-80">
                                                {conv.last_message || 'Start chatting...'}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            
            <div className="flex-1 bg-surface-secondary/20">
                {selectedUser ? (
                    <ChatWindow
                        otherUserId={selectedUser.other_user_id}
                        otherUserName={selectedUser.other_user_name}
                        currentUser={user}
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                        <div className="w-20 h-20 bg-surface-elevated rounded-full flex items-center justify-center text-3xl shadow-xl shadow-black/10/50 mb-8 border border-border-primary">
                            💬
                        </div>
                        <h3 className="text-2xl font-black text-ink-primary tracking-tight mb-4 italic uppercase">Island Comms</h3>
                        <p className="text-ink-tertiary font-medium max-w-md leading-relaxed italic text-sm">
                            Real-time encrypted messaging for secure island commerce.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
