'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import { Search, Users, Calendar, Lock, Globe, Plus, MessageCircle, MapPin, ChevronRight, Shield, Crown, Sparkles, Check } from 'lucide-react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Group {
    id: number;
    name: string;
    description: string;
    cover_image_url: string;
    privacy: 'public' | 'private' | 'invite_only';
    member_count: number;
    post_count: number;
    is_member: boolean;
    is_admin?: boolean;
    created_at: string;
    category?: string;
    recent_posts?: number;
    online_count?: number;
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
    { id: 'tech', name: 'Tech', icon: '💻' },
    { id: 'music', name: 'Music', icon: '🎵' },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState<'discover' | 'my_groups'>('discover');

    useEffect(() => {
        fetchGroups();
    }, [selectedCategory]);

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== 'all') params.append('category', selectedCategory);
            params.append('limit', '30');
            const response = await api.get(`/groups?${params.toString()}`);
            const data = response.data || response;
            if (Array.isArray(data) && data.length > 0) setGroups(data);
            else setGroups(getSampleGroups());
        } catch {
            setGroups(getSampleGroups());
        } finally { setIsLoading(false); }
    };

    const getSampleGroups = (): Group[] => [
        { id: 1, name: 'Island Foodies', description: 'Share recipes, discover local restaurants, and connect with food lovers across the island. Weekly potlucks and cooking challenges!', cover_image_url: '', privacy: 'public', member_count: 1250, post_count: 342, is_member: false, created_at: '2025-06-15', category: 'food', recent_posts: 12, online_count: 34 },
        { id: 2, name: 'Water Sports Enthusiasts', description: 'From surfing to diving, share your aquatic adventures and find new spots. Gear rentals and group excursions available.', cover_image_url: '', privacy: 'public', member_count: 890, post_count: 156, is_member: true, is_admin: true, created_at: '2025-08-20', category: 'activities', recent_posts: 8, online_count: 22 },
        { id: 3, name: 'Local Business Network', description: 'Connect with local entrepreneurs, share tips, and grow your island business. Monthly networking events and workshops.', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 89, is_member: false, created_at: '2025-10-01', category: 'business', recent_posts: 5, online_count: 18 },
        { id: 4, name: 'Beach Cleanup Crew', description: 'Join monthly beach cleanup events and help keep our shores beautiful. All supplies provided — just bring your enthusiasm!', cover_image_url: '', privacy: 'public', member_count: 234, post_count: 45, is_member: false, created_at: '2025-11-10', category: 'community', recent_posts: 3, online_count: 8 },
        { id: 5, name: 'Island Artists Collective', description: 'Showcase your art, collaborate with fellow creators, and celebrate island culture through exhibitions and workshops.', cover_image_url: '', privacy: 'public', member_count: 345, post_count: 78, is_member: false, created_at: '2025-12-05', category: 'arts', recent_posts: 6, online_count: 15 },
        { id: 6, name: 'Real Estate & Rentals', description: 'Find your dream home or list your property with trusted agents. Market insights, tips, and exclusive listings for members.', cover_image_url: '', privacy: 'private', member_count: 678, post_count: 123, is_member: false, created_at: '2026-01-01', category: 'community', recent_posts: 9, online_count: 28 },
        { id: 7, name: 'Caribbean Tech Hub', description: 'For developers, designers, and tech enthusiasts in the Caribbean. Code reviews, job postings, and hackathons.', cover_image_url: '', privacy: 'public', member_count: 189, post_count: 34, is_member: true, created_at: '2026-02-15', category: 'tech', recent_posts: 4, online_count: 12 },
        { id: 8, name: 'St. Kitts Music Scene', description: 'Live music, open mic nights, and local bands. Share your performances and discover upcoming shows.', cover_image_url: '', privacy: 'public', member_count: 456, post_count: 67, is_member: false, created_at: '2026-03-01', category: 'music', recent_posts: 7, online_count: 20 },
    ];

    const myGroups = groups.filter(g => g.is_member);
    const discoverGroups = groups.filter(g => !g.is_member);

    const filteredGroups = (viewMode === 'my_groups' ? myGroups : discoverGroups).filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/join`);
            setGroups(groups.map(g => g.id === groupId ? { ...g, is_member: true, member_count: g.member_count + 1 } : g));
        } catch { /* silent */ }
    };

    const handleLeaveGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/leave`);
            setGroups(groups.map(g => g.id === groupId ? { ...g, is_member: false, member_count: g.member_count - 1 } : g));
        } catch { /* silent */ }
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* Header */}
            <div className="bg-gradient-to-br from-surface-elevated to-surface-secondary border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    👥 Groups
                                </span>
                                <span className="text-xs text-tertiary font-semibold">{groups.length} groups available</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                                Find Your <span className="text-accent-400">Community</span>
                            </h1>
                            <p className="text-sm text-tertiary mt-1">Join local groups and connect with people who share your interests.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search groups..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-56 pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-sm text-primary placeholder:text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20"
                            >
                                <Plus size={14} />
                                Create Group
                            </button>
                        </div>
                    </div>

                    {/* View mode tabs */}
                    <div className="flex items-center gap-1 bg-surface-elevated rounded-xl border border-border-primary p-1 mt-6 w-fit">
                        <button onClick={() => setViewMode('discover')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                viewMode === 'discover' ? 'bg-accent-500 text-white shadow-sm' : 'text-tertiary hover:text-primary'
                            }`}>
                            <Sparkles size={14} /> Discover
                        </button>
                        <button onClick={() => setViewMode('my_groups')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                viewMode === 'my_groups' ? 'bg-accent-500 text-white shadow-sm' : 'text-tertiary hover:text-primary'
                            }`}>
                            <Users size={14} /> My Groups {myGroups.length > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-accent-500/20 text-accent-500 text-[9px] flex items-center justify-center">{myGroups.length}</span>}
                        </button>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mt-4 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/15'
                                        : 'bg-surface-elevated text-tertiary border border-border-primary hover:bg-surface-secondary'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span className="hidden sm:inline">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Group grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-surface-secondary animate-pulse rounded-2xl" />)}
                    </div>
                ) : filteredGroups.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredGroups.map((group, idx) => (
                            <motion.div key={group.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:shadow-xl hover:border-accent-500/20 transition-all group h-full flex flex-col">
                                    {/* Cover image */}
                                    <div className="h-32 bg-gradient-to-br from-accent-400 via-cyan-400 to-accent-600 relative overflow-hidden">
                                        {group.cover_image_url ? (
                                            <img src={group.cover_image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl">
                                                {categories.find(c => c.id === group.category)?.icon || '👥'}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        
                                        {/* Privacy badge */}
                                        <div className="absolute top-3 right-3">
                                            {group.privacy === 'private' ? (
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold uppercase"><Lock size={10} /> Private</span>
                                            ) : group.privacy === 'invite_only' ? (
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold uppercase"><Shield size={10} /> Invite Only</span>
                                            ) : (
                                                <span className="flex items-center gap-1 px-2.5 py-1 bg-black/40 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold uppercase"><Globe size={10} /> Public</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Group name & admin badge */}
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-black text-primary group-hover:text-accent-400 transition-colors">{group.name}</h3>
                                            {group.is_admin && <Crown size={14} className="text-amber-400 shrink-0" />}
                                        </div>
                                        <p className="text-xs text-tertiary line-clamp-2 mb-3 flex-1">{group.description}</p>

                                        {/* Stats */}
                                        <div className="flex items-center justify-between text-[10px] text-tertiary mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1 font-bold"><Users size={12} /> {group.member_count.toLocaleString()}</span>
                                                <span className="flex items-center gap-1 font-bold"><MessageCircle size={12} /> {group.post_count}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {group.recent_posts && (
                                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-[8px] font-bold">{group.recent_posts} new today</span>
                                                )}
                                                {group.online_count && (
                                                    <span className="flex items-center gap-1 text-[9px]">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {group.online_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {group.is_member ? (
                                                <>
                                                    <Link href={`/community/groups/${group.id}`}
                                                        className="flex-1 py-2.5 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20">
                                                        View Group
                                                    </Link>
                                                    <button onClick={() => handleLeaveGroup(group.id)}
                                                        className="px-4 py-2.5 bg-surface-secondary text-tertiary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-tertiary hover:text-secondary transition-colors">
                                                        Leave
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleJoinGroup(group.id)}
                                                        className="flex-1 py-2.5 bg-accent-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-600 transition-colors shadow-sm shadow-accent-500/20 flex items-center justify-center gap-1.5">
                                                        <Plus size={12} /> Join Group
                                                    </button>
                                                    <Link href={`/community/groups/${group.id}`}
                                                        className="px-4 py-2.5 bg-surface-secondary rounded-xl text-tertiary hover:bg-surface-tertiary transition-colors">
                                                        <ChevronRight size={14} />
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-16 text-center">
                        <EmojiIcon emoji="👥" size={48} className="text-5xl mb-4" />
                        <h3 className="text-xl font-black text-primary mb-2">No groups found</h3>
                        <p className="text-sm text-tertiary mb-6">
                            {viewMode === 'my_groups' ? "You haven't joined any groups yet. Discover some!" : 'Try a different search or category.'}
                        </p>
                        {viewMode === 'my_groups' ? (
                            <button onClick={() => setViewMode('discover')} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors">
                                Discover Groups
                            </button>
                        ) : (
                            <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors">
                                Create Group
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}