'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import AdSpace from '@/components/advertising/AdSpace';
import PostComposer from '@/components/social/PostComposer';
import PostCard from '@/components/social/PostCard';
import FollowButton from '@/components/social/FollowButton';

interface Post {
    post_id: number;
    user_id: number;
    title: string;
    content: string;
    media_url: string | null;
    media_type: string | null;
    category: string | null;
    visibility?: string;
    created_at: string;
    user_name: string;
    user_photo: string | null;
    profile_photo_url?: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    is_liked?: boolean;
    is_bookmarked?: boolean;
    user_liked?: boolean;
    user_bookmarked?: boolean;
    media?: string[];
}

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'stories' | 'groups'>('feed');
    const [banners, setBanners] = useState<any[]>([]);
    const [trendingServices, setTrendingServices] = useState<any[]>([]);
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, serviceRes, campaignRes, postsRes, eventsRes, storiesRes] = await Promise.all([
                    api.get('/promotions/active?location=community_hero'),
                    api.get('/listings?type=service&limit=3'),
                    api.get('/listings?type=campaign&limit=3'),
                    api.get('/posts?limit=20'),
                    api.get('/community-events?upcoming=true&limit=5'),
                    api.get('/stories/feed')
                ]);
                setBanners(bannerRes.data || []);
                setTrendingServices(serviceRes.data || []);
                setActiveCampaigns(campaignRes.data || []);
                setPosts(postsRes.data || postsRes || []);
                setEvents(eventsRes.data || eventsRes || []);
                setStories(storiesRes.data || storiesRes || []);
            } catch (e) {
                console.error('Community fetch error', e);
                // Set sample data if API fails
                setSampleData();
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const setSampleData = () => {
        setEvents([
            { id: 1, title: 'Island Food Festival', date: '2026-02-15', location: 'Downtown Market', attendees: 234 },
            { id: 2, title: 'Beach Cleanup Day', date: '2026-02-20', location: 'South Beach', attendees: 89 },
        ]);
        setStories([
            { id: 1, author: 'Maria Santos', story: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months!', avatar: '👩‍🍳' },
            { id: 2, author: 'James Wilson', story: 'Found the perfect vacation rental for my family through this platform. Amazing experience!', avatar: '🏖️' },
        ]);
    };

    const handlePostCreated = (newPost: Post) => {
        setPosts(prev => [newPost, ...prev]);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <HeroBackground pageKey="community" className="py-24">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full text-teal-300 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-white/10"
                    >
                        Connected & Vibrant 🌴
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter"
                    >
                        {banners.length > 0 ? banners[0].title : 'Island Community'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50 text-xl max-w-2xl mx-auto mb-12 font-medium opacity-80 leading-relaxed"
                    >
                        {banners.length > 0 ? banners[0].description : 'Share your story, connect with neighbors, celebrate island life'}
                    </motion.p>

                    <div className="flex justify-center gap-4 flex-wrap">
                        {[
                            { id: 'feed', label: 'Feed', icon: '💬' },
                            { id: 'events', label: 'Events', icon: '📅' },
                            { id: 'stories', label: 'Stories', icon: '⭐' },
                            { id: 'groups', label: 'Groups', icon: '👥' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-10 py-4 rounded-4xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                                    ? 'bg-white text-teal-900 shadow-2xl scale-105'
                                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                                    }`}
                            >
                                {tab.icon} {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </HeroBackground>

            <section className="max-w-7xl mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Feed Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'feed' && (
                                <motion.div
                                    key="feed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Post Composer */}
                                    <PostComposer onPostCreated={handlePostCreated} />

                                    {/* Posts Feed */}
                                    {isLoading ? (
                                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                            <div className="animate-pulse">
                                                <div className="h-4 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
                                                <div className="h-20 bg-slate-100 rounded-xl"></div>
                                            </div>
                                        </div>
                                    ) : posts.length > 0 ? (
                                        posts.map((post: Post) => (
                                            <PostCard key={post.post_id} post={post} />
                                        ))
                                    ) : (
                                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                            <p className="text-slate-400 font-medium mb-4">No posts yet. Be the first to share!</p>
                                            <Link href="/community/feed" className="text-teal-600 font-black text-sm uppercase tracking-widest hover:underline">
                                                View All Posts →
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'events' && (
                                <motion.div
                                    key="events"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-6"
                                >
                                    {events.length > 0 ? events.map((event: any) => (
                                        <div key={event.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all">
                                            <div>
                                                <span className="px-4 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Upcoming Event</span>
                                                <h3 className="text-3xl font-black text-slate-900 mb-2">{event.title}</h3>
                                                <div className="flex gap-6 text-sm font-bold text-slate-400">
                                                    <span>📅 {event.date}</span>
                                                    <span>📍 {event.location}</span>
                                                    <span>👥 {event.attendees || 0} attending</span>
                                                </div>
                                            </div>
                                            <button className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all">
                                                RSVP NOW
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                            <p className="text-slate-400 font-medium">No upcoming events</p>
                                        </div>
                                    )}
                                    <Link href="/community/events" className="block text-center text-teal-600 font-black text-sm uppercase tracking-widest hover:underline mt-4">
                                        View All Events →
                                    </Link>
                                </motion.div>
                            )}

                            {activeTab === 'stories' && (
                                <motion.div
                                    key="stories"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="space-y-8"
                                >
                                    {stories.length > 0 ? stories.map((story: any) => (
                                        <div key={story.id} className="p-12 bg-white rounded-[4rem] border border-slate-100 relative group">
                                            <div className="absolute top-10 right-10 text-8xl text-slate-50 font-black opacity-50 italic">"</div>
                                            <div className="flex items-center gap-8">
                                                <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner">
                                                    {story.avatar || '👤'}
                                                </div>
                                                <div>
                                                    <p className="text-2xl text-slate-700 font-medium italic mb-6 leading-relaxed">"{story.story || story.content}"</p>
                                                    <p className="font-black text-teal-900 uppercase tracking-widest">— {story.author || story.user_name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                            <p className="text-slate-400 font-medium">No stories yet</p>
                                        </div>
                                    )}
                                    <Link href="/community/stories" className="block text-center text-teal-600 font-black text-sm uppercase tracking-widest hover:underline mt-4">
                                        View All Stories →
                                    </Link>
                                </motion.div>
                            )}

                            {activeTab === 'groups' && (
                                <motion.div
                                    key="groups"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-linear-to-r from-teal-500 to-teal-600 p-10 rounded-[3rem] text-white">
                                        <h3 className="text-3xl font-black mb-4">Join Island Communities</h3>
                                        <p className="text-teal-100 mb-6">Connect with people who share your interests</p>
                                        <Link href="/community/groups" className="inline-block px-8 py-4 bg-white text-teal-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-lg transition-all">
                                            Browse Groups
                                        </Link>
                                    </div>
                                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                        <p className="text-slate-400 font-medium">Explore groups for:</p>
                                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                                            {['Food & Dining', 'Beach Activities', 'Local Events', 'Business', 'Sports', 'Arts'].map(tag => (
                                                <span key={tag} className="px-4 py-2 bg-slate-50 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Quick Nav */}
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                            <h3 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-[0.2em]">Quick Navigation</h3>
                            <div className="space-y-3">
                                <Link href="/campaigns" className="block p-5 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">🎯 Campaigns Hub</Link>
                                <Link href="/stores" className="block p-5 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">🛍️ Marketplace</Link>
                                <Link href="/rentals" className="block p-5 bg-slate-50 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-teal-50 hover:text-teal-600 transition-all">🏖️ Rentals</Link>
                            </div>
                        </div>

                        {/* Sidebar Advertisement */}
                        <div className="rounded-[4rem] overflow-hidden">
                            <AdSpace spaceName="community_sidebar" className="h-[600px]" />
                        </div>

                        {/* Active Campaigns Sidebar */}
                        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl">
                            <h3 className="font-black mb-8 uppercase text-xs tracking-[0.2em] text-teal-500">Live Campaigns</h3>
                            <div className="space-y-8">
                                {activeCampaigns.map(c => (
                                    <Link key={c.id} href={`/campaigns/${c.id}`} className="block group">
                                        <p className="text-sm font-black text-white group-hover:text-teal-400 transition-colors mb-3 line-clamp-1">{c.title}</p>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-teal-500 h-full rounded-full" style={{ width: '45%' }} />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-widest text-white/30">
                                            <span>45% Funded</span>
                                            <span>${c.goal_amount?.toLocaleString()} Goal</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Trending Services Sidebar */}
                        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100">
                            <h4 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-[0.2em]">Trending Services</h4>
                            <div className="space-y-8">
                                {trendingServices.map(s => (
                                    <Link key={s.id} href={`/listings/${s.id}`} className="flex items-center gap-4 group">
                                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">🛠</div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">{s.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Starting at ${s.price}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
