'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import PostCard from '@/components/social/PostCard';
import PostComposer from '@/components/social/PostComposer';
import AdSpace from '@/components/advertising/AdSpace';
import { Search, TrendingUp, Users, Calendar, MapPin, ChevronRight, Plus, Hash, Flame, Clock, Star } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All Posts', icon: '✨' },
    { id: 'general', label: 'General', icon: '📢' },
    { id: 'food', label: 'Food & Dining', icon: '🍽️' },
    { id: 'deals', label: 'Hot Deals', icon: '🔥' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'housing', label: 'Housing', icon: '🏠' },
    { id: 'transport', label: 'Transport', icon: '🚕' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'community', label: 'Community', icon: '🌴' },
];

const QUICK_LINKS = [
    { href: '/community/groups', label: 'Groups', icon: '👥', desc: 'Join local communities', color: 'from-indigo-500 to-violet-600' },
    { href: '/community/events', label: 'Events', icon: '📅', desc: "What's happening", color: 'from-violet-500 to-purple-600' },
    { href: '/community/stories', label: 'Stories', icon: '⚡', desc: 'Island moments', color: 'from-amber-500 to-orange-600' },
    { href: '/community/marketplace', label: 'Marketplace', icon: '🏪', desc: 'Buy & sell locally', color: 'from-teal-500 to-emerald-600' },
];

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [showComposer, setShowComposer] = useState(false);

    useEffect(() => {
        fetchPosts();
        fetchStores();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts?limit=50');
            setPosts(Array.isArray(res.data) ? res.data : (res.data.posts || []));
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await api.get('/stores?limit=8');
            const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
            setStores(rawData.map((s: any) => ({
                id: s.store_id || s.id,
                name: s.name || s.business_name,
                logo_url: s.logo_url,
                category: s.category,
                slug: s.slug,
                rating: s.rating,
            })));
        } catch { /* silent */ }
    };

    const handlePostCreated = useCallback((newPost: any) => {
        setPosts(prev => [newPost, ...prev]);
        setShowComposer(false);
    }, []);

    const filteredPosts = useMemo(() => {
        let result = [...posts];

        if (activeCategory !== 'all') {
            result = result.filter(p => p.category === activeCategory);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.title || '').toLowerCase().includes(q) ||
                (p.content || '').toLowerCase().includes(q) ||
                (p.user_name || '').toLowerCase().includes(q)
            );
        }

        switch (sortBy) {
            case 'popular': result.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)); break;
            case 'trending': result.sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0))); break;
            case 'recent': default: result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break;
        }

        return result;
    }, [posts, activeCategory, searchQuery, sortBy]);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <HeroBackground pageKey="community" fallbackTitle="Community" className="min-h-[40vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
                        <span className="text-lg">🏝️</span>
                        <span className="text-white/90 text-sm font-medium">Your neighborhood, connected</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Island <span className="bg-gradient-to-r from-amber-300 via-teal-300 to-indigo-300 bg-clip-text text-transparent">Community</span>
                    </h1>
                    <p className="text-lg text-white/80 mb-8 font-medium max-w-xl mx-auto">Share discoveries, find your people, and be part of what makes our island special.</p>
                    <div className="relative max-w-lg mx-auto">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search posts, people, topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-xl border border-white/20"
                        />
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar — Navigation */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Explore</h3>
                            <div className="space-y-1">
                                {QUICK_LINKS.map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${link.color} flex items-center justify-center text-white text-sm shrink-0`}>
                                            {link.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{link.label}</div>
                                            <div className="text-[10px] text-slate-400 truncate">{link.desc}</div>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 mb-3">Categories</h3>
                            <div className="space-y-0.5">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all ${
                                            activeCategory === cat.id
                                                ? 'bg-teal-50 text-teal-700'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="text-sm">{cat.icon}</span>
                                        <span className={`text-xs font-bold ${activeCategory === cat.id ? 'text-teal-700' : 'text-slate-600'}`}>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Ad */}
                        <AdSpace spaceName="community_sidebar" className="h-48 rounded-2xl overflow-hidden shadow-sm" hideOnEmpty />
                    </aside>

                    {/* Center — Feed */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Sort + Compose Toggle */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-1 p-1 bg-white rounded-xl border border-slate-200">
                                {([
                                    { id: 'recent' as const, label: 'Recent', icon: <Clock size={13} /> },
                                    { id: 'popular' as const, label: 'Popular', icon: <Star size={13} /> },
                                    { id: 'trending' as const, label: 'Trending', icon: <Flame size={13} /> },
                                ]).map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSortBy(opt.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            sortBy === opt.id ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowComposer(!showComposer)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    showComposer ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200'
                                }`}
                            >
                                <Plus size={16} />
                                New Post
                            </button>
                        </div>

                        {/* Composer */}
                        <AnimatePresence>
                            {showComposer && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <PostComposer onPostCreated={handlePostCreated} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Posts Feed */}
                        <div className="space-y-6">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-8 animate-pulse">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-slate-200" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-slate-200 rounded" />
                                                    <div className="w-20 h-3 bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="w-full h-4 bg-slate-200 rounded" />
                                                <div className="w-3/4 h-4 bg-slate-100 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredPosts.length > 0 ? (
                                <>
                                    {filteredPosts.map((post, idx) => (
                                        <motion.div
                                            key={post.post_id || idx}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <PostCard post={post} />
                                        </motion.div>
                                    ))}
                                    {filteredPosts.length >= 20 && (
                                        <div className="text-center py-6">
                                            <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                                                Load More Posts
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                                    <div className="text-5xl mb-4">🌊</div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">
                                        {searchQuery ? 'No results found' : 'No posts yet'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        {searchQuery
                                            ? `No posts matching "${searchQuery}". Try different keywords.`
                                            : 'Be the first to share something with the community!'}
                                    </p>
                                    {!searchQuery && (
                                        <button
                                            onClick={() => setShowComposer(true)}
                                            className="px-6 py-3 bg-teal-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-700 transition-colors"
                                        >
                                            🚀 Create First Post
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar — Trending + Businesses */}
                    <aside className="lg:col-span-3 space-y-6">
                        {/* Trending Topics */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center gap-2 px-2 mb-3">
                                <TrendingUp size={16} className="text-amber-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trending</h3>
                            </div>
                            <div className="space-y-1">
                                {['#IslandLife', '#StKitts', '#LocalFood', '#BeachDay', '#CaribbeanVibes', '#SmallBusiness'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSearchQuery(tag.replace('#', ''))}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <Hash size={14} className="text-slate-400 shrink-0" />
                                        <span className="text-xs font-bold text-slate-700 truncate">{tag}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Businesses */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Users size={16} className="text-teal-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Local Businesses</h3>
                                </div>
                                <Link href="/stores" className="text-[10px] font-bold text-teal-600 hover:underline">View all</Link>
                            </div>
                            <div className="space-y-2">
                                {stores.slice(0, 5).map(store => (
                                    <Link
                                        key={store.id}
                                        href={`/store/${store.slug}`}
                                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {store.logo_url ? (
                                                <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-sm">🏪</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-slate-900 truncate">{store.name}</div>
                                            <div className="text-[10px] text-slate-400 truncate">{store.category}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Community Stats */}
                        <div className="bg-gradient-to-br from-teal-600 to-indigo-600 rounded-2xl p-5 text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-3">Community Pulse</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xl font-black">{posts.length}</div>
                                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Posts</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xl font-black">{stores.length}</div>
                                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Businesses</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xl font-black">48</div>
                                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Groups</div>
                                </div>
                                <div className="bg-white/10 rounded-xl p-3 text-center">
                                    <div className="text-xl font-black">156</div>
                                    <div className="text-[9px] font-bold text-white/70 uppercase tracking-widest">Events</div>
                                </div>
                            </div>
                        </div>

                        {/* Ad */}
                        <AdSpace spaceName="marketplace_sidebar" className="h-48 rounded-2xl overflow-hidden shadow-sm" hideOnEmpty />
                    </aside>
                </div>
            </div>
        </main>
    );
}
