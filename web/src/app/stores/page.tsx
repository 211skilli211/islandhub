'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import ListingCard from '@/components/ListingCard';

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
    is_featured?: boolean;
}

const HUBS = [
    { id: 'all', label: 'All Stores', icon: '🏝️', color: 'teal', href: '/stores' },
    { id: 'food', label: 'Food', icon: '🍽️', color: 'orange', href: '/food', categories: ['Food', 'food'] },
    { id: 'retail', label: 'Products', icon: '🛍️', color: 'teal', href: '/products', categories: ['Retail', 'product'] },
    { id: 'services', label: 'Services', icon: '🛠️', color: 'violet', href: '/services', categories: ['Services', 'service', 'Professional'] },
    { id: 'rental', label: 'Rentals', icon: '🏠', color: 'cyan', href: '/rentals', categories: ['Rental', 'rent'] },
    { id: 'tours', label: 'Tours', icon: '🗺️', color: 'amber', href: '/tours', subtypes: ['tour_operator', 'charter'] },
    { id: 'transport', label: 'Transport', icon: '🚕', color: 'yellow', href: '/transport', subtypes: ['taxi', 'delivery', 'transport'] },
    { id: 'campaigns', label: 'Campaigns', icon: '❤️', color: 'pink', href: '/campaigns' },
];

function getHubForStore(store: Store): string {
    const cat = (store.category || '').toLowerCase();
    const sub = (store.subtype || '').toLowerCase();

    if (cat === 'food' || cat === 'restaurant') return 'food';
    if (cat === 'retail' || cat === 'product') return 'retail';
    if (cat === 'services' || cat === 'professional' || cat === 'service') return 'services';
    if (cat === 'rental' || cat === 'rent') return 'rental';
    if (sub === 'tour_operator' || sub === 'charter' || sub === 'tour') return 'tours';
    if (sub === 'taxi' || sub === 'delivery' || sub === 'transport') return 'transport';
    return 'services';
}

function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const hub = HUBS.find(h => h.id === getHubForStore(store)) || HUBS[0];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
                style={{ borderColor: `${store.branding_color || '#e2e8f0'}20` }}
            >
                <div className="relative h-32 overflow-hidden">
                    {store.banner_url ? (
                        <img src={getImageUrl(store.banner_url)} alt={storeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${store.branding_color || '#64748b'}15, ${store.branding_color || '#64748b'}30)` }}>
                            <span className="text-3xl opacity-40">{hub.icon}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: store.branding_color || '#64748b' }}>
                            {hub.label}
                        </span>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                        <span className="text-yellow-500 text-[10px]">★</span>
                        <span className="text-[10px] font-bold text-slate-700">{rating}</span>
                    </div>
                    <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-lg bg-white">
                        {store.logo_url ? (
                            <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-white uppercase" style={{ backgroundColor: store.branding_color || '#64748b' }}>
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
                <div className="pt-6 pb-4 px-4">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 mb-1">{storeName}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">{store.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{store.subtype?.replace(/_/g, ' ') || hub.label}</span>
                        <span className="text-[11px] font-bold text-teal-600 group-hover:translate-x-1 transition-transform">View →</span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function StoresPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeHub, setActiveHub] = useState('all');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                setAllStores(rawData.map((s: any) => ({
                    id: s.store_id || s.id,
                    store_id: s.store_id,
                    name: s.name || s.business_name,
                    business_name: s.business_name,
                    description: s.description,
                    logo_url: s.logo_url,
                    banner_url: s.banner_url,
                    branding_color: s.branding_color || '#64748b',
                    category: s.category,
                    subtype: s.subtype,
                    slug: s.slug,
                    rating: s.rating,
                    is_featured: s.is_featured,
                })));
            } catch (error) {
                console.error('Failed to fetch stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        let stores = allStores;

        if (activeHub !== 'all') {
            const hub = HUBS.find(h => h.id === activeHub);
            if (hub) {
                stores = stores.filter(s => {
                    const cat = (s.category || '').toLowerCase();
                    const sub = (s.subtype || '').toLowerCase();
                    if (hub.categories) return hub.categories.some(c => cat === c.toLowerCase());
                    if (hub.subtypes) return hub.subtypes.some(t => sub === t.toLowerCase());
                    return false;
                });
            }
        }

        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }

        return stores;
    }, [allStores, activeHub, searchTerm]);

    const hubCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allStores.length };
        for (const hub of HUBS) {
            if (hub.id === 'all') continue;
            counts[hub.id] = allStores.filter(s => {
                const cat = (s.category || '').toLowerCase();
                const sub = (s.subtype || '').toLowerCase();
                if (hub.categories) return hub.categories.some(c => cat === c.toLowerCase());
                if (hub.subtypes) return hub.subtypes.some(t => sub === t.toLowerCase());
                return false;
            }).length;
        }
        return counts;
    }, [allStores]);

    return (
        <main className="min-h-screen bg-white">
            <HeroBackground pageKey="marketplace" fallbackTitle="All Stores" className="min-h-[40vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">All <span className="text-teal-400">Stores</span></h1>
                    <p className="text-lg text-white/80 mb-6 font-medium">Browse all vendors across every hub.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search stores, categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-xl border border-white/20" />
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Hub Filter Bar */}
            <section className="bg-slate-50 border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {HUBS.map(hub => (
                            <Link
                                key={hub.id}
                                href={hub.href}
                                onClick={(e) => { if (hub.id !== 'all') { e.preventDefault(); setActiveHub(hub.id); } }}
                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                                    activeHub === hub.id
                                        ? 'bg-teal-500 text-white shadow-lg'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-teal-300 hover:bg-teal-50'
                                }`}
                            >
                                <span>{hub.icon}</span>
                                <span>{hub.label}</span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeHub === hub.id ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    {loading ? '…' : hubCounts[hub.id] || 0}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Store Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!loading && filteredStores.length === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🏝️</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No stores found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or browse a different hub.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveHub('all'); }} className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">
                            View All Stores
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {filteredStores.map((store, index) => (
                            <StoreCard key={store.store_id || store.id} store={store} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (<div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />))}
                    </div>
                )}
            </div>
        </main>
    );
}
