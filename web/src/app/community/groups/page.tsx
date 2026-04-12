'use client';
// refresh

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

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
}

const categories = [
    { id: 'all', name: 'All Groups', icon: '🌟' },
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'activities', name: 'Beach Activities', icon: '🏖️' },
    { id: 'events', name: 'Local Events', icon: '🎉' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'arts', name: 'Arts & Culture', icon: '🎨' },
];

export default function GroupsPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedCategory !== 'all') params.append('category', selectedCategory);
                params.append('limit', '20');

                const response = await api.get(`/groups?${params.toString()}`);
                setGroups(response.data || response || []);
            } catch (error) {
                console.error('Failed to fetch groups:', error);
                // Sample data for demo
                setGroups(getSampleGroups());
            } finally {
                setIsLoading(false);
            }
        };
        fetchGroups();
    }, [selectedCategory]);

    const getSampleGroups = (): Group[] => [
        {
            id: 1,
            name: 'Island Foodies',
            description: 'Share recipes, discover local restaurants, and connect with food lovers across the island.',
            cover_image_url: '',
            privacy: 'public',
            member_count: 1250,
            post_count: 342,
            is_member: false,
            created_at: '2025-06-15'
        },
        {
            id: 2,
            name: 'Water Sports Enthusiasts',
            description: 'From surfing to diving, share your aquatic adventures and find new spots to explore.',
            cover_image_url: '',
            privacy: 'public',
            member_count: 890,
            post_count: 156,
            is_member: true,
            created_at: '2025-08-20'
        },
        {
            id: 3,
            name: 'Local Business Network',
            description: 'Connect with local entrepreneurs, share tips, and grow your island business together.',
            cover_image_url: '',
            privacy: 'public',
            member_count: 567,
            post_count: 89,
            is_member: false,
            created_at: '2025-10-01'
        },
        {
            id: 4,
            name: 'Beach Cleanup Crew',
            description: 'Join our monthly beach cleanup events and help keep our shores beautiful.',
            cover_image_url: '',
            privacy: 'public',
            member_count: 234,
            post_count: 45,
            is_member: false,
            created_at: '2025-11-10'
        },
        {
            id: 5,
            name: 'Island Artists Collective',
            description: 'Showcase your art, collaborate with fellow creators, and celebrate island culture.',
            cover_image_url: '',
            privacy: 'public',
            member_count: 345,
            post_count: 78,
            is_member: false,
            created_at: '2025-12-05'
        },
        {
            id: 6,
            name: 'Real Estate & Rentals',
            description: 'Find your dream home or list your property. Connect with trusted agents and landlords.',
            cover_image_url: '',
            privacy: 'private',
            member_count: 678,
            post_count: 123,
            is_member: false,
            created_at: '2026-01-01'
        }
    ];

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoinGroup = async (groupId: number) => {
        try {
            await api.post(`/groups/${groupId}/join`);
            setGroups(groups.map(g =>
                g.id === groupId
                    ? { ...g, is_member: true, member_count: g.member_count + 1 }
                    : g
            ));
        } catch (error) {
            console.error('Failed to join group:', error);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <HeroBackground pageKey="community" className="py-16">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10"
                    >
                        Community Groups 🌴
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        Join Island Communities
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50 text-xl max-w-2xl mx-auto mb-12 font-medium opacity-80 leading-relaxed"
                    >
                        Connect with people who share your interests and passions
                    </motion.p>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 py-12">
                {/* Search and Create */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="relative flex-1 max-w-md">
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-6 py-4 bg-white rounded-2xl border border-slate-200 font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-8 py-4 bg-linear-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        + Create Group
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === category.id
                                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-white text-slate-500 hover:bg-slate-100'
                                }`}
                        >
                            {category.icon} {category.name}
                        </button>
                    ))}
                </div>

                {/* Groups Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white rounded-[3rem] h-80 animate-pulse">
                                <div className="h-40 bg-slate-200 rounded-t-[3rem]"></div>
                                <div className="p-8">
                                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                                    <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredGroups.map((group, index) => (
                            <motion.div
                                key={group.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-teal-500/10 transition-all group"
                            >
                                {/* Cover Image */}
                                <div className="h-40 bg-linear-to-br from-teal-400 to-teal-600 relative overflow-hidden">
                                    {group.cover_image_url ? (
                                        <img src={group.cover_image_url} alt={group.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                            {group.privacy === 'private' ? '🔒' : group.privacy === 'invite_only' ? '👥' : '🌴'}
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                                        {group.privacy === 'public' && '🌎 Public'}
                                        {group.privacy === 'private' && '🔒 Private'}
                                        {group.privacy === 'invite_only' && '👥 Invite Only'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8">
                                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                                        {group.name}
                                    </h3>
                                    <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2">
                                        {group.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-4 text-xs font-bold text-slate-400">
                                            <span>👥 {group.member_count.toLocaleString()} members</span>
                                            <span>📝 {group.post_count} posts</span>
                                        </div>
                                        {group.is_member ? (
                                            <Link
                                                href={`/community/groups/${group.id}`}
                                                className="px-6 py-2 bg-teal-50 text-teal-600 rounded-xl font-black text-xs uppercase tracking-widest"
                                            >
                                                View
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={() => handleJoinGroup(group.id)}
                                                className="px-6 py-2 bg-teal-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-teal-700 transition-colors"
                                            >
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {filteredGroups.length === 0 && !isLoading && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-medium text-lg">No groups found matching your search</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 text-teal-600 font-black text-sm uppercase tracking-widest hover:underline"
                        >
                            Create the first one →
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}
