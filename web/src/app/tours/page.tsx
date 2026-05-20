'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import BrandMarquee from '@/components/BrandMarquee';

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

const TOUR_CATEGORIES = [
    { id: 'all', title: 'All Tours', icon: '🗺️', subtypes: [] },
    { id: 'land', title: 'Land Tours', icon: '🥾', desc: 'Hiking, history & nature', subtypes: ['land', 'hiking', 'history', 'nature', 'culture', 'rail'] },
    { id: 'sea', title: 'Sea & Water', icon: '🌊', desc: 'Snorkeling, sailing & fishing', subtypes: ['sea', 'snorkeling', 'sailing', 'fishing', 'diving'] },
    { id: 'adventure', title: 'Adventure', icon: '🧗', desc: 'Zip-lining, ATV & extreme', subtypes: ['adventure', 'zipline', 'atv', 'extreme'] },
    { id: 'charter', title: 'Charters', icon: '⛵', desc: 'Private boat & yacht charters', subtypes: ['charter', 'yacht', 'private_boat'] },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of TOUR_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'land';
}

function TourCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -6 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300"
            >
                <div className="relative h-48 overflow-hidden">
                    {store.banner_url ? (
                        <img src={getImageUrl(store.banner_url)} alt={storeName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center">
                            <span className="text-5xl">🗺️</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 flex items-center gap-1">
                        <span className="text-yellow-500">★</span> {rating}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-black text-white drop-shadow-lg line-clamp-1">{storeName}</h3>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3 min-h-[2rem]">
                        {store.description || 'Unforgettable island experiences await.'}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Available</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white text-[11px] font-bold rounded-lg group-hover:bg-amber-600 transition-colors">
                            Book Tour →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ToursHubPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const stores: Store[] = rawData
                    .filter((s: any) => {
                        const subtype = (s.subtype || '').toLowerCase();
                        return subtype === 'tour_operator' || subtype === 'tour' || subtype === 'charter';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#f59e0b',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch tour stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        let stores = allStores;
        if (activeCategory !== 'all') {
            stores = stores.filter(s => categorizeStore(s) === activeCategory);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q)
            );
        }
        return stores;
    }, [allStores, activeCategory, searchTerm]);

    const storesByCategory = useMemo(() => {
        const map: Record<string, Store[]> = {};
        for (const cat of TOUR_CATEGORIES) { map[cat.id] = []; }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-white">
            <HeroBackground pageKey="tour-hub" fallbackTitle="Island Experiences" className="min-h-[50vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Island <span className="text-amber-400">Experiences</span></h1>
                    <p className="text-lg text-white/80 mb-8 font-medium">Discover curated adventures — from volcano treks to private charters.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search tours, experiences..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-xl border border-white/20" />
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-center"><div className="text-2xl font-black text-white">{loading ? '—' : totalStores}</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Tours</div></div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center"><div className="text-2xl font-black text-white">{TOUR_CATEGORIES.length - 1}</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Types</div></div>
                    </div>
                </motion.div>
            </HeroBackground>

            <section className="bg-slate-50 border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {TOUR_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            return (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300 hover:bg-amber-50'}`}>
                                    <span>{cat.icon}</span><span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>{loading ? '…' : count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {!loading && totalStores > 0 && <BrandMarquee type="brand" />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!loading && totalStores === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🗺️</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No tours found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or browse all tour types.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">View All Tours</button>
                    </div>
                )}

                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStores.map((store, idx) => (<TourCard key={store.store_id || store.id} store={store} index={idx} />))}
                        </div>
                    )
                ) : (
                    TOUR_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <div><h2 className="text-xl font-bold text-slate-900">{cat.title}</h2><p className="text-xs text-slate-500">{cat.desc}</p></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{loading ? '…' : stores.length}</span>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => (<div key={i} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />))}</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{stores.map((store, idx) => (<TourCard key={store.store_id || store.id} store={store} index={idx} />))}</div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            <section className="py-16 px-6 bg-gradient-to-br from-amber-500 to-orange-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Lead Tours & Experiences?</h2>
                    <p className="text-white/80 text-lg mb-8 font-medium">Share your island expertise and earn by leading unforgettable adventures.</p>
                    <Link href="/become-vendor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-700 font-bold rounded-2xl hover:bg-amber-50 transition-colors shadow-xl text-sm uppercase tracking-wider">Become a Guide →</Link>
                </div>
            </section>
        </main>
    );
}
