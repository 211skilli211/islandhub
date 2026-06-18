'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import { Search, Users, Calendar, Lock, Globe, Plus, MessageCircle, MapPin, ChevronRight } from 'lucide-react';

interface Group {
    id: number;
    name: string;
    description: string;
    cover_image_url: string;
    privacy: 'public' | 'private' | 'invite_only';
    member_count: number;
    post_count: number;
    is_member: boolean;
    created_at: string;
    category?: string;
}

const categories = [
    { id: 'all', name: 'All Groups', icon: '🌟' },
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'activities', name: 'Activities', icon: '🏖️' },
    { id: 'events', name: 'Events', icon: '🎉' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'arts', name: 'Arts', icon: '🎨' },
    { id: 'community', name: 'Community', icon: '🌴' },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, [selectedCategory]);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            params.append('limit', '20');
            const response = await api.get(`/groups?${params.toString()}`);
            setGroups(response.data || response || []);
        } catch {
            // Fallback sample data
            setGroups([
                { id: 1, name: 'Island Foodies', description: 'Share recipes, discover local restaurants, and connect with food lovers across the island.', cover_image_url: '', privacy: 'public', member_count: 1250, post_count: 342, is_member: false, created_at: '2025-06-15', category: 'food' },
                { id: 2, name: 'Water Sports Enthusiasts', description: 'From surfing to diving, share your aquatic adventures and find new spots.', cover_image_url: '', privacy: 'public', member_count: 890, post_count: 156, is_member: true, created_at: '2025-08-20', category: 'activities' },
                { id: 3, name: 'Local Business Network', description: 'Connect with local entrepreneurs, share tips, and grow your island business.', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 89, is_member: false, created_at: '2025-10-01', category: 'business' },
                { id: 4, name: 'Beach Cleanup Crew', description: 'Join monthly beach cleanup events and help keep our shores beautiful.', cover_image_url: '', privacy: 'public', member_count: 234, post_count: 45, is_member: false, created_at: '2025-11-10', category: 'community' },
                { id: 5, name: 'Island Artists Collective', description: 'Showcase your art, collaborate with fellow creators, and celebrate island culture.', cover_image_url: '', privacy: 'public', member_count: 345, post_count: 78, is_member: false, created_at: '2025-12-05', category: 'arts' },
                { id: 6, name: 'Real Estate & Rentals', description: 'Find your dream home or list your property with trusted agents.', cover_image_url: '', privacy: 'private', member_count: 678, post_count: 123, is_member: false, created_at: '2026-01-01', category: 'community' },
            ]);
        } finally { setIsLoading(false); }
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/join`);
            setGroups(groups.map(g => g.id === groupId ? { ...g, is_member: true, member_count: g.member_count + 1 } : g));
        } catch { /* silent */ }
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <HeroBackground pageKey="community" className="py-16">
                <div className="max-w-7xl mx-auto relative z-30 text-center px-4">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-block px-4 py-2 bg-surface-elevated/10 backdrop-blur-xl rounded-full text-accent-300 text-[10px] font-black uppercase tracking-[0.3em] mb-6 border border-white/10">
                        Community Groups 🌴
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
                        Find Your People
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-accent-50 text-lg max-w-xl mx-auto mb-8 font-medium opacity-80">
                        Join local groups, connect with neighbors who share your interests.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative max-w-md mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                        <input type="text" placeholder="Search groups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated/95 backdrop-blur-sm rounded-2xl text-ink-primary font-medium placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-xl" />
                    </motion.div>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/15' : 'bg-surface-elevated text-ink-tertiary border border-border-primary hover:bg-surface-primary'}`}>
                                <span>{cat.icon}</span>
                                <span className="hidden sm:inline">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-surface-tertiary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface-tertiary transition-colors shrink-0">
                        <Plus size={14} />
                        Create Group
                    </button>
                </div>

                
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-surface-secondary animate-pulse rounded-2xl" />)}
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredGroups.map((group, idx) => (
                            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all group h-full flex flex-col">
                                    
                                    <div className="h-32 bg-gradient-to-br from-teal-400 via-cyan-400 to-teal-500 relative overflow-hidden">
                                        {group.cover_image_url ? (
                                            <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/30 text-6xl">
                                                {categories.find(c => c.id === group.category)?.icon || '👥'}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                        <div className="absolute top-3 right-3">
                                            {group.privacy === 'private' ? (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold uppercase"><Lock size={10} /> Private</span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold uppercase"><Globe size={10} /> Public</span>
                                            )}
                                        </div>
                                    </div>

                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-base font-black text-ink-primary mb-1.5 group-hover:text-accent-400 transition-colors">{group.name}</h3>
                                        <p className="text-xs text-ink-tertiary line-clamp-2 mb-4 flex-1">{group.description}</p>

                                        <div className="flex items-center justify-between text-[10px] text-ink-tertiary mb-4">
                                            <span className="flex items-center gap-1 font-bold"><Users size={12} /> {group.member_count.toLocaleString()} members</span>
                                            <span className="flex items-center gap-1 font-bold"><MessageCircle size={12} /> {group.post_count} posts</span>
                                        </div>

                                        <div className="flex gap-2">
                                            {group.is_member ? (
                                                <Link href={`/community/groups/${group.id}`} className="flex-1 py-2.5 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-accent-600 transition-colors">
                                                    View Group
                                                </Link>
                                            ) : (
                                                <button onClick={() => handleJoinGroup(group.id)} className="flex-1 py-2.5 bg-surface-tertiary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-tertiary transition-colors">
                                                    Join Group
                                                </button>
                                            )}
                                            <Link href={`/community/groups/${group.id}`} className="px-3 py-2.5 bg-surface-secondary rounded-xl text-ink-tertiary hover:bg-surface-tertiary transition-colors">
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-12 text-center">
                        <div className="text-5xl mb-4">👥</div>
                        <h3 className="text-lg font-black text-ink-primary mb-2">No groups found</h3>
                        <p className="text-sm text-ink-tertiary mb-6">Try a different search or create a new group!</p>
                        <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent-600">Create Group</button>
                    </div>
                )}
            </section>
        </main>
    );
}
