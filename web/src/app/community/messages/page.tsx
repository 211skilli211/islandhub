'use client';
// refresh

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Conversation {
    id: number;
    type: 'direct' | 'group';
    name?: string;
    last_message: string;
    last_message_at: string;
    unread_count: number;
    participants: {
        user_id: number;
        name: string;
        profile_photo_url: string;
    }[];
    is_online: boolean;
}

interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    sender_name: string;
    content: string;
    created_at: string;
    is_read: boolean;
    attachments?: { type: string; url: string }[];
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const currentUserId = 1; // Would come from auth context

    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/conversations');
                setConversations(response.data || response || []);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
                setConversations(getSampleConversations());
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            const fetchMessages = async () => {
                try {
                    const response = await api.get(`/conversations/${selectedConversation.id}/messages`);
                    setMessages(response.data || response || []);
                    scrollToBottom();
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                    setMessages(getSampleMessages(selectedConversation.id));
                }
            };
            fetchMessages();
        }
    }, [selectedConversation]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getSampleConversations = (): Conversation[] => [
        {
            id: 1,
            type: 'direct',
            name: 'Maria Santos',
            last_message: 'Thanks for the recommendation! 😊',
            last_message_at: '2026-03-05T14:30:00',
            unread_count: 2,
            participants: [
                { user_id: 1, name: 'Maria Santos', profile_photo_url: '' },
                { user_id: currentUserId, name: 'You', profile_photo_url: '' }
            ],
            is_online: true
        },
        {
            id: 2,
            type: 'direct',
            name: 'James Wilson',
            last_message: 'The beach cleanup was amazing! See you next time',
            last_message_at: '2026-03-05T10:15:00',
            unread_count: 0,
            participants: [
                { user_id: 2, name: 'James Wilson', profile_photo_url: '' },
                { user_id: currentUserId, name: 'You', profile_photo_url: '' }
            ],
            is_online: false
        },
        {
            id: 3,
            type: 'group',
            name: 'Island Foodies',
            last_message: 'Sarah: Who wants to try the new restaurant tonight?',
            last_message_at: '2026-03-05T12:00:00',
            unread_count: 5,
            participants: [
                { user_id: 3, name: 'Sarah Chen', profile_photo_url: '' },
                { user_id: 4, name: 'Mike Rivera', profile_photo_url: '' },
                { user_id: 5, name: 'Lisa Thompson', profile_photo_url: '' }
            ],
            is_online: true
        },
        {
            id: 4,
            type: 'direct',
            name: 'David Park',
            last_message: 'Your catering service was a hit at the event!',
            last_message_at: '2026-03-04T18:45:00',
            unread_count: 0,
            participants: [
                { user_id: 6, name: 'David Park', profile_photo_url: '' },
                { user_id: currentUserId, name: 'You', profile_photo_url: '' }
            ],
            is_online: true
        },
        {
            id: 5,
            type: 'group',
            name: 'Beach Cleanup Crew',
            last_message: 'Mike: Great work everyone! We collected 50 bags of trash',
            last_message_at: '2026-03-04T14:20:00',
            unread_count: 1,
            participants: [
                { user_id: 4, name: 'Mike Rivera', profile_photo_url: '' },
                { user_id: 7, name: 'Anna Lee', profile_photo_url: '' },
                { user_id: 8, name: 'Tom Brown', profile_photo_url: '' }
            ],
            is_online: false
        }
    ];

    const getSampleMessages = (conversationId: number): Message[] => [
        {
            id: 1,
            conversation_id: conversationId,
            sender_id: 2,
            sender_name: 'Maria Santos',
            content: 'Hi! I saw your post about the beach cleanup. I would love to join!',
            created_at: '2026-03-05T14:00:00',
            is_read: true
        },
        {
            id: 2,
            conversation_id: conversationId,
            sender_id: currentUserId,
            sender_name: 'You',
            content: 'That\'s awesome! We meet every Saturday at 8am at South Beach',
            created_at: '2026-03-05T14:05:00',
            is_read: true
        },
        {
            id: 3,
            conversation_id: conversationId,
            sender_id: 2,
            sender_name: 'Maria Santos',
            content: 'Perfect! I\'ll bring some extra bags and gloves',
            created_at: '2026-03-05T14:15:00',
            is_read: true
        },
        {
            id: 4,
            conversation_id: conversationId,
            sender_id: currentUserId,
            sender_name: 'You',
            content: 'Great idea! See you this Saturday 👊',
            created_at: '2026-03-05T14:20:00',
            is_read: true
        },
        {
            id: 5,
            conversation_id: conversationId,
            sender_id: 2,
            sender_name: 'Maria Santos',
            content: 'Thanks for the recommendation! 😊',
            created_at: '2026-03-05T14:30:00',
            is_read: false
        }
    ];

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const tempMessage: Message = {
            id: Date.now(),
            conversation_id: selectedConversation.id,
            sender_id: currentUserId,
            sender_name: 'You',
            content: newMessage.trim(),
            created_at: new Date().toISOString(),
            is_read: true
        };

        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        scrollToBottom();

        try {
            await api.post(`/conversations/${selectedConversation.id}/messages`, {
                content: newMessage.trim()
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const getOtherParticipant = (conversation: Conversation) => {
        if (conversation.type === 'group') return null;
        return conversation.participants.find(p => p.user_id !== currentUserId);
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <HeroBackground pageKey="community" className="py-12">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-surface-elevated/10 backdrop-blur-xl rounded-full text-accent-300 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10"
                    >
                        Messages 💬
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter"
                    >
                        Your Conversations
                    </motion.h1>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-surface-elevated rounded-[3rem] overflow-hidden border border-border-primary shadow-xl">
                    <div className="flex h-[70vh]">
                        
                        <div className={`w-full md:w-96 border-r border-border-primary flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
                            
                            <div className="p-6 border-b border-border-primary">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-black text-ink-primary">Messages</h2>
                                    <button
                                        onClick={() => setShowNewChat(true)}
                                        className="w-10 h-10 bg-accent-500 text-white rounded-full flex items-center justify-center text-xl hover:bg-accent-600 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search conversations..."
                                    className="w-full px-4 py-3 bg-surface-primary rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent-400/20"
                                />
                            </div>

                            
                            <div className="flex-1 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="flex gap-4 animate-pulse">
                                                <div className="w-12 h-12 bg-surface-tertiary rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-surface-tertiary rounded w-1/3 mb-2"></div>
                                                    <div className="h-3 bg-surface-secondary rounded w-2/3"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    conversations.map(conversation => {
                                        const otherUser = getOtherParticipant(conversation);
                                        return (
                                            <button
                                                key={conversation.id}
                                                onClick={() => setSelectedConversation(conversation)}
                                                className={`w-full p-4 flex items-center gap-4 hover:bg-surface-primary transition-colors border-b border-border-primary ${selectedConversation?.id === conversation.id ? 'bg-accent-500/10' : ''
                                                    }`}
                                            >
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-surface-tertiary rounded-full flex items-center justify-center text-xl">
                                                        {otherUser ? '👤' : '<EmojiIcon emoji="👥" size=16 />'}
                                                    </div>
                                                    {conversation.is_online && (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent-500/100 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="font-black text-ink-primary truncate">
                                                            {conversation.name || 'Group Chat'}
                                                        </span>
                                                        <span className="text-xs font-bold text-ink-tertiary">
                                                            {formatTime(conversation.last_message_at)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-ink-tertiary truncate">{conversation.last_message}</p>
                                                </div>
                                                {conversation.unread_count > 0 && (
                                                    <div className="w-6 h-6 bg-accent-500 text-white rounded-full flex items-center justify-center text-xs font-black">
                                                        {conversation.unread_count}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        
                        <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
                            {selectedConversation ? (
                                <>
                                    
                                    <div className="p-6 border-b border-border-primary flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="md:hidden text-ink-tertiary"
                                        >
                                            ←
                                        </button>
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center text-lg">
                                                {selectedConversation.type === 'group' ? '👥' : '<EmojiIcon emoji="👤" size=16 />'}
                                            </div>
                                            {selectedConversation.is_online && (
                                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent-500/100 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-black text-ink-primary">{selectedConversation.name}</h3>
                                            <p className="text-xs text-ink-tertiary">
                                                {selectedConversation.is_online ? 'Online' : 'Offline'}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="w-10 h-10 bg-surface-secondary rounded-full flex items-center justify-center text-ink-tertiary hover:bg-surface-tertiary transition-colors">
                                                📞
                                            </button>
                                            <button className="w-10 h-10 bg-surface-secondary rounded-full flex items-center justify-center text-ink-tertiary hover:bg-surface-tertiary transition-colors">
                                                📹
                                            </button>
                                        </div>
                                    </div>

                                    
                                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                        {messages.map(message => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[70%] ${message.sender_id === currentUserId
                                                    ? 'bg-accent-500 text-white rounded-3xl rounded-tr-md'
                                                    : 'bg-surface-secondary text-ink-primary rounded-3xl rounded-tl-md'
                                                    } px-6 py-3`}>
                                                    {message.sender_id !== currentUserId && (
                                                        <p className="text-xs font-black mb-1 opacity-70">{message.sender_name}</p>
                                                    )}
                                                    <p className="text-sm font-medium">{message.content}</p>
                                                    <p className={`text-[10px] mt-1 ${message.sender_id === currentUserId ? 'text-accent-200' : 'text-ink-tertiary'
                                                        }`}>
                                                        {formatTime(message.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    
                                    <div className="p-6 border-t border-border-primary">
                                        <div className="flex items-center gap-4">
                                            <button className="w-10 h-10 bg-surface-secondary rounded-full flex items-center justify-center text-ink-tertiary hover:bg-surface-tertiary transition-colors">
                                                📎
                                            </button>
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Type a message..."
                                                className="flex-1 px-6 py-3 bg-surface-secondary rounded-full text-sm font-medium outline-none focus:ring-2 focus:ring-accent-400/20"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!newMessage.trim()}
                                                className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center text-xl hover:bg-accent-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ➤
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center text-5xl mx-auto mb-4">
                                            💬
                                        </div>
                                        <h3 className="text-xl font-black text-ink-primary mb-2">Select a conversation</h3>
                                        <p className="text-ink-tertiary font-medium">Choose from your existing conversations or start a new one</p>
                                        <button
                                            onClick={() => setShowNewChat(true)}
                                            className="mt-6 px-8 py-3 bg-accent-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-accent-600 transition-colors"
                                        >
                                            New Message
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            
            <AnimatePresence>
                {showNewChat && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowNewChat(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-surface-elevated rounded-[3rem] p-8 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <h3 className="text-2xl font-black text-ink-primary mb-6">New Message</h3>
                            <input
                                type="text"
                                placeholder="Search for users..."
                                className="w-full px-6 py-4 bg-surface-primary rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-accent-400/20 mb-4"
                            />
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {['Maria Santos', 'James Wilson', 'Sarah Chen', 'Mike Rivera', 'David Park'].map(name => (
                                    <button
                                        key={name}
                                        onClick={() => {
                                            setShowNewChat(false);
                                            // Would navigate to new conversation
                                        }}
                                        className="w-full p-4 flex items-center gap-4 hover:bg-surface-primary rounded-2xl transition-colors"
                                    >
                                        <EmojiIcon emoji="👤" size=16 className="w-10 h-10 bg-surface-tertiary rounded-full flex items-center justify-center" />
                                        <span className="font-bold text-ink-primary">{name}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="mt-6 w-full py-3 text-ink-tertiary font-bold"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
