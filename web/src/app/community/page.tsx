'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface Store {
    id: number;
    store_id?: number;
    name: string;
    business_name?: string;
    description: string;
    logo_url?: string;
    banner_url?: string;
    branding_color?: string;
    category: string;
    subtype: string;
    slug: string;
    rating?: number;
}

const COMMUNITY_SECTIONS = [
    { id: 'groups', label: 'Groups', icon: '👥', desc: 'Join local interest groups', gradient: 'from-indigo-500 to-violet-600', members: '2.4k members' },
    { id: 'events', label: 'Events', icon: '📅', desc: "What's happening nearby", gradient: 'from-violet-500 to-purple-600', members: '1.8k members' },
    { id: 'classifieds', label: 'Classifieds', icon: '📋', desc: 'Buy, sell and trade locally', gradient: 'from-purple-500 to-fuchsia-600', members: '3.1k members' },
    { id: 'announcements', label: 'Announcements', icon: '📢', desc: 'Community news and updates', gradient: 'from-indigo-600 to-purple-700', members: '5.2k members' },
];

export default function CommunityPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const stores: Store[] = rawData.map((s: any) => ({
                    id: s.store_id || s.id,
                    store_id: s.store_id,
                    name: s.name || s.business_name,
                    business_name: s.business_name,
                    description: s.description,
                    logo_url: s.logo_url,
                    banner_url: s.banner_url,
                    branding_color: s.branding_color || '#059669',
                    category: s.category,
                    subtype: s.subtype,
                    slug: s.slug,
                    rating: s.rating,
                }));
                setStores(stores);
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        if (!searchTerm.trim()) return stores;
        const q = searchTerm.toLowerCase();
        return stores.filter(s =>
            (s.name || s.business_name || '').toLowerCase().includes(q) ||
            (s.description || '').toLowerCase().includes(q) ||
            (s.category || '').toLowerCase().includes(q)
        );
    }, [stores, searchTerm]);

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <HeroBackground pageKey="community" fallbackTitle="Community" className="min-h-[55vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
                        <span className="text-lg">🏝️</span>
                        <span className="text-white/90 text-sm font-medium">Your neighborhood, connected</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Your Island <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-purple-300 bg-clip-text text-transparent">Community</span>
                    </h1>
                    <p className="text-lg text-white/80 mb-8 font-medium max-w-xl mx-auto">Connect with neighbors, discover local events, and be part of what makes our island special.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search community..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-xl border border-white/20" />
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Community Sections */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Explore Your Community</h2>
                    <p className="text-slate-500">Find your people, find your place</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    {COMMUNITY_SECTIONS.map(section => (
                        <Link
                            key={section.id}
                            href={`/community/${section.id}`}
                            className={`relative p-7 rounded-2xl text-center bg-gradient-to-br ${section.gradient} text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden`}
                        >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                            <div className="relative z-10">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{section.icon}</div>
                                <h3 className="font-bold text-lg mb-1">{section.label}</h3>
                                <p className="text-sm opacity-80 mb-3">{section.desc}</p>
                                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold opacity-90">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                    {section.members}
                                </div>
                                <button className="mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold px-5 py-2 rounded-full transition-all duration-200 group-hover:bg-white/30">
                                    Join →
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Community Stats Bar */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
                    <div className="text-center">
                        <div className="text-2xl font-black text-indigo-600">12.5k</div>
                        <div className="text-xs text-slate-500 font-medium">Active Members</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 hidden md:block" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-violet-600">48</div>
                        <div className="text-xs text-slate-500 font-medium">Local Groups</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 hidden md:block" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-purple-600">156</div>
                        <div className="text-xs text-slate-500 font-medium">Events This Month</div>
                    </div>
                    <div className="w-px h-10 bg-slate-200 hidden md:block" />
                    <div className="text-center">
                        <div className="text-2xl font-black text-fuchsia-600">89%</div>
                        <div className="text-xs text-slate-500 font-medium">Satisfaction</div>
                    </div>
                </div>
            </section>

            {/* Community Stores */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-1">Community Businesses</h2>
                        <p className="text-slate-500">Local shops and services loved by neighbors</p>
                    </div>
                    <Link href="/stores" className="hidden md:inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors">
                        View all <span>→</span>
                    </Link>
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1,2,3,4].map(i => (<div key={i} className="h-72 bg-slate-100 animate-pulse rounded-2xl" />))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredStores.map((store, index) => (
                                <motion.div key={store.store_id || store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <Link href={`/store/${store.slug}`}>
                                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300 group h-full">
                                            <div className="h-40 overflow-hidden relative">
                                                {store.banner_url ? (
                                                    <img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 flex items-center justify-center">
                                                        <span className="text-5xl">🏝️</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">{store.category}</span>
                                                </div>
                                                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                                                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    <span className="text-xs font-bold text-slate-700">{store.rating || '4.8'}</span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {store.logo_url && (<img src={getImageUrl(store.logo_url)} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm" />)}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-sm text-slate-900 truncate">{store.name}</h3>
                                                        <p className="text-[11px] text-indigo-500 font-medium">{store.subtype || 'Local Business'}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[12px] text-slate-500 line-clamp-2 mb-3">{store.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Island Local
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-indigo-600 group-hover:text-indigo-700 transition-colors">Visit →</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                        <div className="text-6xl mb-4">🏝️</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No stores found</h3>
                        <p className="text-gray-500">Try adjusting your search</p>
                    </div>
                )}
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700" />
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl" />
                </div>
                <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
                        <span className="text-sm">✨</span>
                        <span className="text-white/90 text-xs font-medium">Growing every day</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Be Part of Something Special</h2>
                    <p className="text-indigo-100 mb-10 max-w-xl mx-auto text-lg">List your business, connect with neighbors, and grow together with our island community.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/become-vendor" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-xl hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                            <span>Join the Community</span>
                            <span>→</span>
                        </Link>
                        <Link href="/about" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all border border-white/20">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
