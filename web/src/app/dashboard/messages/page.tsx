'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';

// Dynamic import for ChatWindow with loading skeleton
const ChatWindow = dynamicImport(
    () => import('@/components/ChatWindow'),
    {
        loading: () => (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Chat...</p>
            </div>
        ),
        ssr: false // Chat needs WebSocket connection
    }
);

function MessageCenterPage() {
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Opening Secure Channel...</p>
            </div>
        </div>
    );

    return (
        <main className="h-screen bg-slate-50 flex flex-col">

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 overflow-hidden py-8">
                <div className="bg-white h-full rounded-[3rem] shadow-2xl shadow-indigo-100/20 flex border border-slate-100 overflow-hidden">

                    {/* Inbox Sidebar */}
                    <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inbox</h2>
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2 py-1 rounded-md">{conversations.length}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 && !initialOtherUserId ? (
                                <div className="p-12 text-center opacity-40">
                                    <div className="text-4xl mb-4">📬</div>
                                    <p className="font-bold italic text-slate-400 text-sm leading-relaxed">Your inbox is empty. Start a conversation with a vendor!</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {/* New conversation placeholder if needed */}
                                    {initialOtherUserId && !conversations.find(c => c.other_user_id === parseInt(initialOtherUserId)) && (
                                        <button
                                            onClick={() => setSelectedUser({ other_user_id: parseInt(initialOtherUserId), other_user_name: initialOtherUserName })}
                                            className={`w-full p-8 text-left transition-all ${selectedUser?.other_user_id === parseInt(initialOtherUserId) ? 'bg-indigo-50/50 border-r-4 border-indigo-500' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black">
                                                    {initialOtherUserName?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-slate-900 truncate">{initialOtherUserName}</h3>
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Starting New Chat</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.other_user_id}
                                            onClick={() => setSelectedUser(conv)}
                                            className={`w-full p-8 text-left transition-all group ${selectedUser?.other_user_id === conv.other_user_id ? 'bg-indigo-50/50 border-r-4 border-indigo-500' : 'hover:bg-slate-50/50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-100 group-hover:bg-indigo-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-indigo-600 font-black transition-colors shadow-inner">
                                                    {conv.other_user_name.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className="font-black text-slate-900 truncate text-sm">{conv.other_user_name}</h3>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                            {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-medium truncate italic opacity-80">
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

                    {/* Chat Area */}
                    <div className="flex-1 bg-slate-50/20">
                        {selectedUser ? (
                            <ChatWindow
                                otherUserId={selectedUser.other_user_id}
                                otherUserName={selectedUser.other_user_name}
                                currentUser={user}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-xl shadow-slate-200/50 mb-8 border border-slate-50">
                                    💬
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Secure Island Messaging</h3>
                                <p className="text-slate-500 font-medium max-w-md leading-relaxed italic">
                                    Connect directly with verified vendors to discuss custom orders, booking availability, or local recommendations.
                                </p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}

export default function MessagesPage() {
    return (
        <Suspense
            fallback={
                <div className="h-full flex flex-col items-center justify-center bg-slate-50">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"></div>
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Messages...</p>
                </div>
            }
        >
            <MessageCenterPage />
        </Suspense>
    );
}
