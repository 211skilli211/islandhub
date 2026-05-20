'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface Campaign {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    images?: string[];
    photos?: string[];
    goal_amount?: number;
    raised_amount?: number;
    currency?: string;
    status?: string;
    slug?: string;
    store_name?: string;
    store_logo?: string;
    end_date?: string;
    created_at?: string;
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [events, setEvents] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'campaigns' | 'events'>('campaigns');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [campaignsRes, eventsRes] = await Promise.all([
                    api.get('/listings?type=campaign&limit=20').catch(() => ({ data: [] })),
                    api.get('/listings?type=event&limit=20').catch(() => ({ data: [] })),
                ]);
                const campaignData = Array.isArray(campaignsRes.data) ? campaignsRes.data : (campaignsRes.data?.listings || []);
                const eventData = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data?.listings || []);
                setCampaigns(campaignData);
                setEvents(eventData);
            } catch (error) {
                console.error('Failed to fetch campaigns/events:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const currentItems = activeTab === 'campaigns' ? campaigns : events;

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return currentItems;
        const q = searchTerm.toLowerCase();
        return currentItems.filter((item: Campaign) =>
            (item.title || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.store_name || '').toLowerCase().includes(q)
        );
    }, [currentItems, searchTerm]);

    const getProgress = (item: Campaign) => {
        if (!item.goal_amount || !item.raised_amount) return 0;
        return Math.min(100, Math.round((item.raised_amount / item.goal_amount) * 100));
    };

    return (
        <main className="min-h-screen bg-white">
            <HeroBackground pageKey="campaigns" fallbackTitle="Campaigns & Events" className="min-h-[50vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Campaigns & <span className="text-pink-400">Events</span></h1>
                    <p className="text-lg text-white/80 mb-8 font-medium">Support community causes, discover events and get e-tickets.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search campaigns, events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-xl border border-white/20" />
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Tab Switcher */}
            <section className="bg-slate-50 border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'campaigns' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-pink-300'}`}
                        >
                            ❤️ Campaigns ({campaigns.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'events' ? 'bg-pink-500 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-pink-300'}`}
                        >
                            🎟️ Events & E-Tickets ({events.length})
                        </button>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">{activeTab === 'campaigns' ? '❤️' : '🎟️'}</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab} found</h3>
                        <p className="text-slate-500 mb-6">{searchTerm ? 'Try adjusting your search.' : 'Check back soon for new campaigns and events.'}</p>
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="px-6 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-colors">
                                Clear Search
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredItems.map((item: Campaign, index: number) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                            >
                                <Link
                                    href={item.slug ? `/listings/${item.slug}` : `/listings/${item.id}`}
                                    className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-pink-200 transition-all duration-300"
                                >
                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={getImageUrl(
                                                item.image_url ||
                                                (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '') ||
                                                (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : '')
                                            )}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-pink-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                                {activeTab === 'campaigns' ? 'Campaign' : 'Event'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-base font-bold text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1 mb-1">{item.title}</h3>
                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 min-h-[2rem]">{item.description}</p>

                                        {activeTab === 'campaigns' && item.goal_amount && (
                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>${item.raised_amount || 0} raised</span>
                                                    <span>{getProgress(item)}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all" style={{ width: `${getProgress(item)}%` }} />
                                                </div>
                                                <div className="text-[10px] text-slate-400 mt-1">Goal: ${item.goal_amount}</div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-2 border-t border-slate-500">
                                            {item.store_name && (
                                                <div className="flex items-center gap-1.5">
                                                    {item.store_logo && <img src={getImageUrl(item.store_logo)} alt="" className="w-5 h-5 rounded-full object-cover" />}
                                                    <span className="text-[10px] font-semibold text-slate-500">{item.store_name}</span>
                                                </div>
                                            )}
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-500 text-white text-[11px] font-bold rounded-lg group-hover:bg-pink-600 transition-colors">
                                                {activeTab === 'campaigns' ? 'Donate' : 'Get Tickets'} →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (<div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />))}
                    </div>
                )}
            </div>

            <section className="py-16 px-6 bg-gradient-to-br from-pink-600 to-rose-700">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Start a Campaign or Event</h2>
                    <p className="text-white/80 text-lg mb-8 font-medium">Raise funds for your cause or sell tickets to your event.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/become-vendor" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-pink-700 font-bold rounded-2xl hover:bg-pink-50 transition-colors shadow-xl text-sm uppercase tracking-wider">Launch Campaign →</Link>
                        <Link href="/campaigns/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-pink-700 text-white font-bold rounded-2xl hover:bg-pink-800 transition-colors shadow-xl text-sm uppercase tracking-wider border-2 border-pink-400">Create Event →</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
