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

const EVENT_CATEGORIES = [
    { id: 'concert', label: 'Concert', icon: '🎵' },
    { id: 'festival', label: 'Festival', icon: '🎪' },
    { id: 'workshop', label: 'Workshop', icon: '🛠️' },
    { id: 'fundraiser', label: 'Fundraiser', icon: '💜' },
];

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=400&fit=crop',
];

function getFallbackImage(id: number): string {
    return FALLBACK_IMAGES[id % FALLBACK_IMAGES.length];
}

function formatEventDate(dateStr?: string): string {
    if (!dateStr) {
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 7);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Date TBA';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatEventTime(dateStr?: string): string {
    if (!dateStr) {
        const hours = [6, 7, 8, 12, 14, 17, 18, 19, 20];
        const h = hours[Math.floor(Math.random() * hours.length)];
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h > 12 ? h - 12 : h;
        return `${h12}:00 ${ampm}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Time TBA';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function getMonthDay(dateStr?: string): { month: string; day: string } {
    if (!dateStr) {
        const d = new Date();
        d.setDate(d.getDate() + Math.floor(Math.random() * 60) + 7);
        return {
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            day: String(d.getDate()),
        };
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
        const fallback = new Date();
        return {
            month: fallback.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            day: String(fallback.getDate()),
        };
    }
    return {
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: String(d.getDate()),
    };
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
            {/* ─── HERO ─── */}
            <HeroBackground pageKey="campaigns" fallbackTitle="Campaigns & Events" className="min-h-[460px]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-3xl mx-auto text-center"
                >
                    {/* Decorative pill */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full border border-white/20 mb-6"
                    >
                        <span className="text-sm">🎉</span>
                        <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">Discover &amp; Experience</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-lg leading-tight">
                        Events &amp;{' '}
                        <span className="bg-gradient-to-r from-pink-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">
                            Campaigns
                        </span>
                    </h1>
                    <p className="text-base md:text-lg text-white/75 mb-10 font-medium max-w-xl mx-auto">
                        Get tickets to amazing events or support causes that matter. All in one place.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2">
                            <svg className="w-5 h-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search events, campaigns, venues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-white/95 backdrop-blur-md rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400/60 shadow-2xl shadow-purple-900/20 border border-white/10 text-sm"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{campaigns.length}</div>
                            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Campaigns</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{events.length}</div>
                            <div className="text-[10px] font-semibold text-white/50 uppercase tracking-widest">Events</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* ─── CATEGORY FILTER / TAB BAR ─── */}
            <section className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm shadow-purple-500/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('campaigns')}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                    activeTab === 'campaigns'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                                💜 Campaigns
                                <span className="ml-1.5 text-[10px] opacity-70">({campaigns.length})</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                                    activeTab === 'events'
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-purple-300 hover:text-purple-600'
                                }`}
                            >
                                🎟️ Events
                                <span className="ml-1.5 text-[10px] opacity-70">({events.length})</span>
                            </button>
                        </div>

                        {/* Event Category Badges (only when events tab is active) */}
                        {activeTab === 'events' && (
                            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                                {EVENT_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold hover:bg-purple-100 hover:border-purple-200 transition-all duration-200 whitespace-nowrap"
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ─── MAIN CONTENT ─── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Section Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-900">
                        {activeTab === 'campaigns' ? '💜 Active Campaigns' : '🎟️ Upcoming Events'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        {activeTab === 'campaigns'
                            ? 'Support these causes and make a difference.'
                            : filteredItems.length > 0
                                ? `${filteredItems.length} event${filteredItems.length !== 1 ? 's' : ''} found`
                                : 'Discover events happening soon.'}
                    </p>
                </div>

                {/* Empty State */}
                {!loading && filteredItems.length === 0 && (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                            <span className="text-5xl">{activeTab === 'campaigns' ? '💜' : '🎟️'}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">
                            No {activeTab} found
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
                            {searchTerm
                                ? 'Try adjusting your search terms or browse all categories.'
                                : 'Check back soon — new campaigns and events are being added regularly.'}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors text-sm"
                                >
                                    Clear Search
                                </button>
                            )}
                            <Link
                                href="/campaigns/new"
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all text-sm shadow-lg shadow-purple-500/25"
                            >
                                Create {activeTab === 'campaigns' ? 'Campaign' : 'Event'} →
                            </Link>
                        </div>
                    </div>
                )}

                {/* ─── Event Cards Grid ─── */}
                {activeTab === 'events' && filteredItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredItems.map((item: Campaign, index: number) => {
                                const dateInfo = getMonthDay(item.end_date || item.created_at);
                                const eventDate = formatEventDate(item.end_date || item.created_at);
                                const eventTime = formatEventTime(item.end_date || item.created_at);
                                const imgSrc = getImageUrl(
                                    item.image_url ||
                                    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '') ||
                                    (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : '')
                                ) || getFallbackImage(item.id);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -6 }}
                                    >
                                        <Link
                                            href={item.slug ? `/listings/${item.slug}` : `/listings/${item.id}`}
                                            className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
                                        >
                                            {/* Image with Date Badge */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={imgSrc}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = getFallbackImage(item.id);
                                                    }}
                                                />
                                                {/* Gradient overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                                {/* Date Badge */}
                                                <div className="absolute top-4 left-4 bg-white rounded-xl overflow-hidden shadow-lg shadow-black/20 text-center w-[60px]">
                                                    <div className="bg-purple-500 text-white text-[10px] font-bold py-1 uppercase tracking-wider">
                                                        {dateInfo.month}
                                                    </div>
                                                    <div className="py-1.5">
                                                        <span className="text-xl font-black text-slate-900">{dateInfo.day}</span>
                                                    </div>
                                                </div>

                                                {/* Category Badge */}
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-purple-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                    Event
                                                </div>

                                                {/* Bottom gradient info */}
                                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                                    {item.store_name && (
                                                        <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1">
                                                            {item.store_logo && (
                                                                <img
                                                                    src={getImageUrl(item.store_logo)}
                                                                    alt=""
                                                                    className="w-4 h-4 rounded-full object-cover ring-1 ring-white/30"
                                                                />
                                                            )}
                                                            <span className="text-[11px] font-semibold text-white">{item.store_name}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
                                                    {item.title}
                                                </h3>

                                                {/* Event Meta */}
                                                <div className="flex flex-col gap-1.5 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-slate-600">{eventDate} · {eventTime}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <span className="text-xs font-medium text-slate-600 line-clamp-1">
                                                            {item.store_name ? `at ${item.store_name}` : 'Venue TBA'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Entry</span>
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl group-hover:from-purple-600 group-hover:to-pink-600 transition-all shadow-md shadow-purple-500/20">
                                                        Get Tickets
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* ─── Campaign Cards Grid ─── */}
                {activeTab === 'campaigns' && filteredItems.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredItems.map((item: Campaign, index: number) => {
                                const imgSrc = getImageUrl(
                                    item.image_url ||
                                    (Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : '') ||
                                    (Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : '')
                                ) || getFallbackImage(item.id + 3);

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -6 }}
                                    >
                                        <Link
                                            href={item.slug ? `/listings/${item.slug}` : `/listings/${item.id}`}
                                            className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-200 transition-all duration-300"
                                        >
                                            {/* Image */}
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={imgSrc}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = getFallbackImage(item.id + 3);
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                                                {/* Campaign Badge */}
                                                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-purple-500/30">
                                                    Campaign
                                                </div>

                                                {/* Deadline badge */}
                                                {item.end_date && (
                                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-full">
                                                        Ends {formatEventDate(item.end_date).split(',')[0]}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5">
                                                <h3 className="text-[15px] font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                                                    {item.description}
                                                </p>

                                                {/* Progress Bar */}
                                                {item.goal_amount && (
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                                                            <span className="text-purple-600">${item.raised_amount || 0} raised</span>
                                                            <span className="text-slate-400">{getProgress(item)}%</span>
                                                        </div>
                                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                                style={{ width: `${getProgress(item)}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 mt-1 font-medium">
                                                            Goal: ${item.goal_amount}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                                    {item.store_name && (
                                                        <div className="flex items-center gap-2">
                                                            {item.store_logo && (
                                                                <img src={getImageUrl(item.store_logo)} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200" />
                                                            )}
                                                            <span className="text-[11px] font-semibold text-slate-500 line-clamp-1">{item.store_name}</span>
                                                        </div>
                                                    )}
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl group-hover:from-purple-600 group-hover:to-pink-600 transition-all shadow-md shadow-purple-500/20 ml-auto">
                                                        Donate
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}

                {/* Loading Skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                <div className="h-48 bg-slate-100 animate-pulse" />
                                <div className="p-5 space-y-3">
                                    <div className="h-4 bg-slate-100 rounded-full w-3/4 animate-pulse" />
                                    <div className="h-3 bg-slate-100 rounded-full w-full animate-pulse" />
                                    <div className="h-3 bg-slate-100 rounded-full w-2/3 animate-pulse" />
                                    <div className="h-8 bg-slate-100 rounded-xl w-full animate-pulse mt-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── CTA FOOTER ─── */}
            <section className="relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-600 to-pink-600" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                }} />
                <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative max-w-4xl mx-auto text-center py-20 px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/15 mb-6">
                            <span className="text-sm">✨</span>
                            <span className="text-xs font-bold text-white/80 uppercase tracking-widest">Get Started</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
                            Ready to create your<br />
                            own <span className="bg-gradient-to-r from-pink-300 to-violet-300 bg-clip-text text-transparent">event</span>?
                        </h2>
                        <p className="text-white/65 text-base md:text-lg mb-10 max-w-xl mx-auto font-medium">
                            Raise funds for your cause or sell tickets to your event. Reach thousands of people in minutes.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/become-vendor"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-purple-700 font-black rounded-2xl hover:bg-purple-50 transition-colors shadow-2xl shadow-black/20 text-sm uppercase tracking-wider"
                            >
                                💜 Launch Campaign
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/campaigns/new"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-black rounded-2xl hover:bg-white/20 transition-colors shadow-2xl shadow-black/20 text-sm uppercase tracking-wider border-2 border-white/20"
                            >
                                🎟️ Create Event
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
