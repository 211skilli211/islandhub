'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'feed' | 'events' | 'stories'>('feed');
    const [banners, setBanners] = useState<any[]>([]);
    const [trendingServices, setTrendingServices] = useState<any[]>([]);
    const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, serviceRes, campaignRes] = await Promise.all([
                    api.get('/promotions/active?location=community_hero'),
                    api.get('/listings?type=service&limit=3'),
                    api.get('/listings?type=campaign&limit=3')
                ]);
                setBanners(bannerRes.data);
                setTrendingServices(serviceRes.data);
                setActiveCampaigns(campaignRes.data);
            } catch (e) {
                console.error("Community fetch error", e);
            }
        }
        fetchData();
    }, []);

    // Social posts will be fetched from API

    const sampleEvents = [
        { id: 1, title: 'Island Food Festival', date: '2026-02-15', location: 'Downtown Market', attendees: 234 },
        { id: 2, title: 'Beach Cleanup Day', date: '2026-02-20', location: 'South Beach', attendees: 89 },
    ];

    const sampleStories = [
        { id: 1, author: 'Maria Santos', story: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months!', avatar: '👩‍🍳' },
        { id: 2, author: 'James Wilson', story: 'Found the perfect vacation rental for my family through this platform. Amazing experience!', avatar: '🏖️' },
    ];

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
                                    className="space-y-8"
                                >
                                    {/* Social feed will be populated with real posts from API */}
                                    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-12 text-center">
                                        <p className="text-slate-400 font-medium">Community feed will be populated with real posts</p>
                                    </div>
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
                                    {sampleEvents.map(event => (
                                        <div key={event.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8 group hover:shadow-xl transition-all">
                                            <div>
                                                <span className="px-4 py-1 bg-teal-50 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Upcoming Event</span>
                                                <h3 className="text-3xl font-black text-slate-900 mb-2">{event.title}</h3>
                                                <div className="flex gap-6 text-sm font-bold text-slate-400">
                                                    <span>📅 {event.date}</span>
                                                    <span>📍 {event.location}</span>
                                                </div>
                                            </div>
                                            <button className="px-10 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-100 hover:bg-teal-700 active:scale-95 transition-all">
                                                RSVP NOW
                                            </button>
                                        </div>
                                    ))}
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
                                    {sampleStories.map(story => (
                                        <div key={story.id} className="p-12 bg-white rounded-[4rem] border border-slate-100 relative group">
                                            <div className="absolute top-10 right-10 text-8xl text-slate-50 font-black opacity-50 italic">"</div>
                                            <div className="flex items-center gap-8">
                                                <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center text-5xl shadow-inner">{story.avatar}</div>
                                                <div>
                                                    <p className="text-2xl text-slate-700 font-medium italic mb-6 leading-relaxed">"{story.story}"</p>
                                                    <p className="font-black text-teal-900 uppercase tracking-widest">— {story.author}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
