'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import dynamicImport from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// Dynamic import for ChatWindow with loading skeleton
const ChatWindow = dynamicImport(
    () => import('@/components/ChatWindow'),
    {
        loading: () => (
            <div className="h-full flex flex-col items-center justify-center bg-surface-primary">
                <div className="animate-spin h-12 w-12 border-4 border-[#14b8a6] border-t-transparent rounded-full mb-4"></div>
                <p className="font-black text-ink-tertiary uppercase tracking-widest text-xs">Loading Chat...</p>
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
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const [newChatUser, setNewChatUser] = useState('');
    const [newChatMessage, setNewChatMessage] = useState('');

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

    const startNewConversation = async () => {
        if (!newChatUser.trim()) return;
        try {
            const res = await api.post('/messaging/conversations', {
                participant_name: newChatUser,
                initial_message: newChatMessage || 'Hi, I\'d like to connect!'
            });
            if (res.data.conversation) {
                setSelectedUser(res.data.conversation);
                setShowNewChat(false);
                setNewChatUser('');
                setNewChatMessage('');
                fetchConversations();
            }
        } catch (err) {
            console.error('Failed to start conversation', err);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.other_user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000);
        return () => clearInterval(interval);
    }, [initialOtherUserId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-surface-primary">
            <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-[#14b8a6] border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-black text-ink-tertiary uppercase tracking-widest text-xs">Opening Secure Channel...</p>
            </div>
        </div>
    );

    return (
        <main className="h-screen bg-surface-primary flex flex-col">

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 overflow-hidden py-8">
                <div className="bg-surface-elevated h-full rounded-[3rem] shadow-2xl shadow-teal-100/20 flex border border-border-primary overflow-hidden">

                    
                    <div className="w-80 border-r border-border-primary flex flex-col bg-surface-elevated">
                        <div className="p-6 border-b border-border-primary">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-black text-ink-primary tracking-tight">Messages</h2>
                                <button 
                                    onClick={() => setShowNewChat(true)}
                                    className="p-2 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full px-4 py-2 bg-surface-primary border border-border-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                                />
                                <EmojiIcon emoji="🔍" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                            </div>
                        </div>
                        
                        
                        {showNewChat && (
                            <div className="p-4 border-b border-border-primary bg-accent-500/10">
                                <p className="text-sm font-bold text-accent-600 mb-3">Start New Conversation</p>
                                <input
                                    type="text"
                                    value={newChatUser}
                                    onChange={(e) => setNewChatUser(e.target.value)}
                                    placeholder="User name or email..."
                                    className="w-full px-3 py-2 mb-2 bg-surface-elevated border border-border-primary rounded-lg text-sm"
                                />
                                <textarea
                                    value={newChatMessage}
                                    onChange={(e) => setNewChatMessage(e.target.value)}
                                    placeholder="Initial message..."
                                    className="w-full px-3 py-2 mb-2 bg-surface-elevated border border-border-primary rounded-lg text-sm"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button 
                                        onClick={startNewConversation}
                                        className="flex-1 py-2 bg-accent-500 text-white rounded-lg text-sm font-bold"
                                    >
                                        Start Chat
                                    </button>
                                    <button 
                                        onClick={() => setShowNewChat(false)}
                                        className="px-4 py-2 text-ink-tertiary text-sm"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div className="flex-1 overflow-y-auto">
                            {filteredConversations.length === 0 && !initialOtherUserId ? (
                                <div className="p-12 text-center opacity-40">
                                    <EmojiIcon emoji="📬" size={40} className="text-4xl mb-4" />
                                    <p className="font-bold italic text-ink-tertiary text-sm leading-relaxed">
                                        {searchQuery ? 'No matches found' : 'Your inbox is empty. Start a conversation!'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    
                                    {initialOtherUserId && !conversations.find(c => c.other_user_id === parseInt(initialOtherUserId)) && (
                                        <button
                                            onClick={() => setSelectedUser({ other_user_id: parseInt(initialOtherUserId), other_user_name: initialOtherUserName })}
                                            className={`w-full p-8 text-left transition-all ${selectedUser?.other_user_id === parseInt(initialOtherUserId) ? 'bg-[#14b8a6]/10/50 border-r-4 border-[#14b8a6]' : ''}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#14b8a6] rounded-2xl flex items-center justify-center text-white font-black">
                                                    {initialOtherUserName?.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-ink-primary truncate">{initialOtherUserName}</h3>
                                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Starting New Chat</p>
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {filteredConversations.map((conv) => (
                                        <div key={conv.other_user_id} className="relative group">
                                            <button
                                                onClick={() => setSelectedUser(conv)}
                                                className={`w-full p-6 text-left transition-all group ${selectedUser?.other_user_id === conv.other_user_id ? 'bg-accent-500/10/50 border-r-4 border-teal-500' : 'hover:bg-surface-primary/50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-colors ${
                                                        conv.unread_count > 0 ? 'bg-accent-500 text-white' : 'bg-surface-secondary text-ink-tertiary group-hover:bg-accent-500/15 group-hover:text-accent-400'
                                                    }`}>
                                                        {conv.other_user_name?.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <h3 className="font-bold text-ink-primary truncate text-sm">{conv.other_user_name}</h3>
                                                            <span className="text-[8px] text-ink-tertiary uppercase">
                                                                {new Date(conv.last_message_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-ink-tertiary font-medium truncate">
                                                            {conv.last_message || 'Start chatting...'}
                                                        </p>
                                                    </div>
                                                    {conv.unread_count > 0 && (
                                                        <span className="bg-accent-500/100 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); /* TODO: show settings menu */ }}
                                                className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 text-ink-tertiary hover:text-ink-secondary transition-opacity"
                                            >
                                                ⚙️
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    
                    <div className="flex-1 bg-surface-primary/20">
                        {selectedUser ? (
                            <ChatWindow
                                otherUserId={selectedUser.other_user_id}
                                otherUserName={selectedUser.other_user_name}
                                currentUser={user}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                <div className="w-24 h-24 bg-surface-elevated rounded-full flex items-center justify-center text-4xl shadow-xl shadow-black/10/50 mb-8 border border-border-primary">
                                    💬
                                </div>
                                <h3 className="text-3xl font-black text-ink-primary tracking-tight mb-4">Secure Island Messaging</h3>
                                <p className="text-ink-tertiary font-medium max-w-md leading-relaxed italic">
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
                <div className="h-full flex flex-col items-center justify-center bg-surface-primary">
                    <div className="animate-spin h-12 w-12 border-4 border-[#14b8a6] border-t-transparent rounded-full mb-4"></div>
                    <p className="font-black text-ink-tertiary uppercase tracking-widest text-xs">Loading Messages...</p>
                </div>
            }
        >
            <MessageCenterPage />
        </Suspense>
    );
}
