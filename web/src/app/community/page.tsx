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
    { id: 'groups', label: 'Groups', icon: '👥', desc: 'Join local interest groups', gradient: 'from-blue-500 to-indigo-600' },
    { id: 'events', label: 'Events', icon: '📅', desc: "What's happening nearby", gradient: 'from-green-500 to-emerald-600' },
    { id: 'classifieds', label: 'Classifieds', icon: '📋', desc: 'Buy, sell and trade locally', gradient: 'from-amber-500 to-orange-600' },
    { id: 'announcements', label: 'Announcements', icon: '📢', desc: 'Community news and updates', gradient: 'from-pink-500 to-rose-600' },
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
        <main className="min-h-screen bg-white">
            <HeroBackground pageKey="community" fallbackTitle="Community" className="min-h-[50vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Island <span className="text-emerald-400">Community</span></h1>
                    <p className="text-lg text-white/80 mb-8 font-medium">Connect with locals, discover events and join the conversation.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search community..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-xl border border-white/20" />
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Community Sections */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {COMMUNITY_SECTIONS.map(section => (
                        <Link
                            key={section.id}
                            href={`/community/${section.id}`}
                            className={`p-6 rounded-2xl text-center bg-gradient-to-br ${section.gradient} text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group`}
                        >
                            <div className="text-4xl mb-3">{section.icon}</div>
                            <h3 className="font-bold text-lg">{section.label}</h3>
                            <p className="text-sm mt-1 opacity-80">{section.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Community Stores */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Community Stores</h2>
                <p className="text-gray-500 mb-8">Local businesses active in the community</p>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1,2,3,4].map(i => (<div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <AnimatePresence>
                            {filteredStores.map((store, index) => (
                                <motion.div key={store.store_id || store.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <Link href={`/store/${store.slug}`}>
                                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-emerald-200 transition-all group h-full">
                                            <div className="h-36 overflow-hidden relative">
                                                {store.banner_url ? (
                                                    <img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center">
                                                        <span className="text-4xl">🏝️</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3">
                                                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{store.category}</span>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {store.logo_url && (<img src={getImageUrl(store.logo_url)} alt="" className="w-8 h-8 rounded-lg object-cover border border-slate-100" />)}
                                                    <h3 className="font-bold text-sm text-slate-900 truncate flex-1">{store.name}</h3>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2">{store.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🏝️</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No stores found</h3>
                        <p className="text-gray-500">Try adjusting your search</p>
                    </div>
                )}
            </section>

            <section className="bg-gradient-to-r from-emerald-600 to-teal-700 py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-white mb-4">Join the community</h2>
                    <p className="text-emerald-100 mb-8">List your business, connect with locals and grow together.</p>
                    <Link href="/become-vendor" className="inline-block bg-white text-emerald-700 font-bold px-8 py-4 rounded-xl hover:bg-emerald-50 transition-all shadow-lg">Join Now →</Link>
                </div>
            </section>
        </main>
    );
}
