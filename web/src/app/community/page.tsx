'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import PostCard from '@/components/social/PostCard';
import PostComposer from '@/components/social/PostComposer';
import AdSpace from '@/components/advertising/AdSpace';
import { Search, TrendingUp, Users, Plus, Hash, Flame, Clock, Star } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '✨' },
    { id: 'general', label: 'General', icon: '📢' },
    { id: 'food', label: 'Food', icon: '🍽️' },
    { id: 'deals', label: 'Deals', icon: '🔥' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'services', label: 'Services', icon: '🛠️' },
    { id: 'housing', label: 'Housing', icon: '🏠' },
    { id: 'transport', label: 'Transport', icon: '🚕' },
    { id: 'jobs', label: 'Jobs', icon: '💼' },
    { id: 'community', label: 'Community', icon: '🌴' },
];

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
    const [searchQuery, setSearchQuery] = useState('');
    const [showComposer, setShowComposer] = useState(false);

    useEffect(() => { fetchPosts(); fetchStores(); }, []);

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
        if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
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
        <div className="w-full">
            {/* Category Filter — horizontal scroll */}
            <div className="w-full bg-surface-primary border-b border-border-primary">
                <div className="px-4 sm:px-6 lg:px-8 py-2 flex gap-2 overflow-x-auto scrollbar-thin">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                                activeCategory === cat.id
                                    ? 'bg-accent-500 text-white border-accent-500'
                                    : 'bg-surface-elevated text-ink-secondary border-border-primary hover:border-accent-300'
                            }`}>
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content — Facebook-style: Feed + Right sidebar */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Center — Feed (2/3 width) */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Sort + Compose Toggle */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex gap-1 p-1 bg-surface-elevated rounded-lg border border-border-primary">
                                {([
                                    { id: 'recent' as const, label: 'Recent', icon: <Clock size={12} /> },
                                    { id: 'popular' as const, label: 'Popular', icon: <Star size={12} /> },
                                    { id: 'trending' as const, label: 'Trending', icon: <Flame size={12} /> },
                                ]).map(opt => (
                                    <button key={opt.id} onClick={() => setSortBy(opt.id)}
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                                            sortBy === opt.id ? 'bg-accent-500 text-white' : 'text-ink-tertiary hover:text-ink-secondary'
                                        }`}>
                                        {opt.icon}
                                        <span className="hidden sm:inline">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => setShowComposer(!showComposer)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                    showComposer ? 'bg-surface-secondary text-ink-secondary' : 'bg-accent-500 text-white hover:bg-accent-600'
                                }`}>
                                <Plus size={14} />
                                <span className="hidden sm:inline">New Post</span>
                            </button>
                        </div>

                        {/* Composer */}
                        <AnimatePresence>
                            {showComposer && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                    <PostComposer onPostCreated={handlePostCreated} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Posts Feed */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-8 animate-pulse">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-full bg-surface-tertiary" />
                                                <div className="space-y-2">
                                                    <div className="w-32 h-4 bg-surface-tertiary rounded" />
                                                    <div className="w-20 h-3 bg-surface-tertiary/50 rounded" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="w-full h-4 bg-surface-tertiary rounded" />
                                                <div className="w-3/4 h-4 bg-surface-tertiary/50 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredPosts.length > 0 ? (
                                <>
                                    {filteredPosts.map((post, idx) => (
                                        <motion.div key={post.post_id || idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                                            <PostCard post={post} />
                                        </motion.div>
                                    ))}
                                    {filteredPosts.length >= 20 && (
                                        <div className="text-center py-6">
                                            <button className="px-6 py-3 bg-surface-elevated border border-border-primary rounded-xl text-xs font-bold uppercase tracking-widest text-ink-tertiary hover:bg-surface-secondary transition-colors">Load More</button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-12 text-center">
                                    <div className="text-5xl mb-4">🌊</div>
                                    <h3 className="text-lg font-black text-ink-primary mb-2">{searchQuery ? 'No results found' : 'No posts yet'}</h3>
                                    <p className="text-sm text-ink-tertiary mb-6">{searchQuery ? `No posts matching "${searchQuery}".` : 'Be the first to share something!'}</p>
                                    {!searchQuery && (
                                        <button onClick={() => setShowComposer(true)} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent-600 transition-colors">🚀 Create First Post</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar — Trending + Businesses (1/3 width) */}
                    <aside className="lg:col-span-1 space-y-4">
                        {/* Trending */}
                        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 shadow-sm">
                            <div className="flex items-center gap-2 px-2 mb-3">
                                <TrendingUp size={15} className="text-sand-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Trending</h3>
                            </div>
                            <div className="space-y-0.5">
                                {['#IslandLife', '#StKitts', '#LocalFood', '#BeachDay', '#CaribbeanVibes', '#SmallBusiness'].map(tag => (
                                    <button key={tag} onClick={() => setSearchQuery(tag.replace('#', ''))}
                                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-secondary transition-colors text-left">
                                        <Hash size={13} className="text-ink-tertiary shrink-0" />
                                        <span className="text-xs font-bold text-ink-secondary truncate">{tag}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Businesses */}
                        <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 shadow-sm">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <Users size={15} className="text-accent-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Local Businesses</h3>
                                </div>
                                <Link href="/stores" className="text-[10px] font-bold text-accent-500 hover:underline">View all</Link>
                            </div>
                            <div className="space-y-2">
                                {stores.slice(0, 5).map(store => (
                                    <Link key={store.id} href={`/store/${store.slug}`}
                                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-secondary transition-colors">
                                        <div className="w-9 h-9 rounded-lg bg-surface-secondary overflow-hidden shrink-0 flex items-center justify-center">
                                            {store.logo_url ? <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" /> : <span className="text-sm">🏪</span>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold text-ink-primary truncate">{store.name}</div>
                                            <div className="text-[10px] text-ink-tertiary truncate">{store.category}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Ad */}
                        <AdSpace spaceName="community_sidebar" className="h-40 rounded-2xl overflow-hidden shadow-sm" hideOnEmpty />

                        {/* Community Stats */}
                        <div className="bg-gradient-to-br from-accent-600 to-brand-600 rounded-2xl p-4 text-white">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-3">Community Pulse</h3>
                            <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/10 rounded-lg p-2.5 text-center">
                            <div className="text-lg font-black">{posts.length}</div>
                            <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Posts</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 text-center">
                            <div className="text-lg font-black">{stores.length}</div>
                            <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Businesses</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 text-center">
                            <div className="text-lg font-black">—</div>
                            <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Groups</div>
                        </div>
                        <div className="bg-white/10 rounded-lg p-2.5 text-center">
                            <div className="text-lg font-black">—</div>
                            <div className="text-[8px] font-bold text-white/70 uppercase tracking-widest">Events</div>
                        </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
