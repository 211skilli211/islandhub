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

function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    );
}

function LeafIcon() {
    return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.77 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    );
}

function MapPinIcon() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function DurationIcon() {
    return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

function getCategoryGradient(catId: string): string {
    switch (catId) {
        case 'land': return 'from-green-600 to-emerald-700';
        case 'sea': return 'from-teal-500 to-cyan-700';
        case 'adventure': return 'from-lime-500 to-green-700';
        case 'charter': return 'from-emerald-600 to-teal-700';
        default: return 'from-green-500 to-emerald-600';
    }
}

function getCategoryAccent(catId: string): string {
    switch (catId) {
        case 'land': return 'bg-green-100 text-green-700';
        case 'sea': return 'bg-accent-500/15 text-accent-500';
        case 'adventure': return 'bg-lime-100 text-lime-700';
        case 'charter': return 'bg-emerald-100 text-emerald-700';
        default: return 'bg-green-100 text-green-700';
    }
}

function TourCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const catId = categorizeStore(store);
    const catGradient = getCategoryGradient(catId);
    const catAccent = getCategoryAccent(catId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -8 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-surface-elevated rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 border border-green-50 hover:border-green-200"
            >
                <div className="relative h-52 overflow-hidden rounded-t-3xl">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${catGradient} flex items-center justify-center`}>
                            <div className="text-center">
                                <span className="text-6xl drop-shadow-lg">🌿</span>
                                <p className="text-white/80 text-sm font-semibold mt-2">Island Adventure</p>
                            </div>
                        </div>
                    )}
                    {/* Gradient overlay at bottom for name */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 bg-surface-elevated/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                        <span className="text-green-600">
                            <StarIcon />
                        </span>
                        <span className="text-xs font-bold text-slate-800">{rating}</span>
                    </div>

                    {/* Category tag */}
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${catGradient} text-white shadow-md`}>
                            {catId === 'land' && '🥾'}
                            {catId === 'sea' && '🌊'}
                            {catId === 'adventure' && '🧗'}
                            {catId === 'charter' && '⛵'}
                            <span className="ml-1">{TOUR_CATEGORIES.find(c => c.id === catId)?.title || catId}</span>
                        </span>
                    </div>

                    {/* Tour name overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-black text-white drop-shadow-lg leading-tight line-clamp-2 group-hover:text-green-200 transition-colors">
                            {storeName}
                        </h3>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-sm text-ink-tertiary line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                        {store.description || 'Unforgettable island experiences await. Discover hidden gems and breathtaking views.'}
                    </p>

                    {/* Info row */}
                    <div className="flex items-center gap-4 mb-4 text-ink-tertiary">
                        <div className="flex items-center gap-1.5">
                            <span className="text-green-500"><ClockIcon /></span>
                            <span className="text-xs font-medium">Full Day</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-green-500"><MapPinIcon /></span>
                            <span className="text-xs font-medium">Island Wide</span>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-green-50">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">From</span>
                            <p className="text-lg font-black text-ink-primary">Best Price</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/25 hover:shadow-green-500/40 group-hover:from-green-600 group-hover:to-emerald-700 transition-all">
                            Explore
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
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
                        branding_color: s.branding_color || '#22c55e',
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
        <main className="min-h-screen bg-surface-elevated">
            {/* ===== HERO ===== */}
            <HeroBackground pageKey="tour-hub" fallbackTitle="Explore the Islands" className="min-h-[52vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    {/* Decorative leaf icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 shadow-xl shadow-green-500/30 mb-6"
                    >
                        <LeafIcon />
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 drop-shadow-lg">
                        <span className="text-white">Explore the </span>
                        <span className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-transparent">Islands</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 font-medium drop-shadow">Curated adventures from local guides — trek volcanoes, dive reefs, and sail sunset coasts.</p>

                    {/* Search bar with green accents */}
                    <div className="relative max-w-lg mx-auto">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400">
                            <SearchIcon />
                        </span>
                        <input
                            type="text"
                            placeholder="Search tours, experiences, destinations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-surface-elevated/95 backdrop-blur-sm rounded-2xl text-ink-primary font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-2xl shadow-green-900/20 border border-white/20"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-500/25 hover:from-green-600 hover:to-emerald-700 transition-all">
                            Search
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent">
                                {loading ? '—' : totalStores}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Unique Tours</div>
                        </div>
                        <div className="w-px h-10 bg-surface-elevated/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                                {TOUR_CATEGORIES.length - 1}
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Categories</div>
                        </div>
                        <div className="w-px h-10 bg-surface-elevated/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black bg-gradient-to-r from-teal-300 to-green-400 bg-clip-text text-transparent">
                                4.9
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Avg Rating</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* ===== CATEGORY FILTER ===== */}
            <section className="bg-gradient-to-b from-green-50/80 to-white border-b border-green-100 sticky top-0 z-30 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                        {TOUR_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shadow-sm ${
                                        activeCategory === cat.id
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25 scale-105'
                                            : 'bg-surface-elevated text-ink-secondary border border-green-100 hover:border-green-300 hover:bg-green-50 hover:text-green-700'
                                    }`}
                                >
                                    <span className="text-base">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        activeCategory === cat.id
                                            ? 'bg-surface-elevated/20 text-white'
                                            : 'bg-green-50 text-green-600'
                                    }`}>
                                        {loading ? '…' : count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ===== BRAND MARQUEE ===== */}
            {!loading && totalStores > 0 && <BrandMarquee type="brand" />}

            {/* ===== TOUR CARDS ===== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Empty state */}
                {!loading && totalStores === 0 && (
                    <div className="text-center py-24">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-50 mb-6">
                            <span className="text-4xl">🌿</span>
                        </div>
                        <h3 className="text-2xl font-black text-ink-primary mb-2">No tours found</h3>
                        <p className="text-ink-tertiary mb-8 max-w-md mx-auto">Try adjusting your search or explore all tour categories to find your next island adventure.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                            className="px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25"
                        >
                            View All Tours
                        </button>
                    </div>
                )}

                {/* Filtered / search results */}
                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                                    <span className="text-white text-sm">
                                        {TOUR_CATEGORIES.find(c => c.id === activeCategory)?.icon || '🔍'}
                                    </span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-ink-primary">
                                        {activeCategory !== 'all' ? TOUR_CATEGORIES.find(c => c.id === activeCategory)?.title : 'Search Results'}
                                    </h2>
                                    <p className="text-xs text-ink-tertiary font-medium">{totalStores} experience{totalStores !== 1 ? 's' : ''} found</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredStores.map((store, idx) => (
                                    <TourCard key={store.store_id || store.id} store={store} index={idx} />
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    /* Category sections */
                    TOUR_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-14">
                                {/* Section header with green icon container */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${getCategoryGradient(cat.id)} shadow-lg`}>
                                            <span className="text-xl">{cat.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-ink-primary">{cat.title}</h2>
                                            <p className="text-xs text-ink-tertiary font-medium">{cat.desc}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-4 py-2 rounded-xl ${getCategoryAccent(cat.id)}`}>
                                        {loading ? '…' : `${stores.length} tour${stores.length !== 1 ? 's' : ''}`}
                                    </span>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="rounded-3xl overflow-hidden border border-green-50">
                                                <div className="h-52 bg-gradient-to-br from-green-100 to-emerald-50 animate-pulse" />
                                                <div className="p-5 space-y-3">
                                                    <div className="h-4 bg-green-50 rounded-full w-3/4 animate-pulse" />
                                                    <div className="h-3 bg-green-50 rounded-full w-full animate-pulse" />
                                                    <div className="h-3 bg-green-50 rounded-full w-2/3 animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {stores.map((store, idx) => (
                                            <TourCard key={store.store_id || store.id} store={store} index={idx} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            {/* ===== CTA: BECOME A GUIDE ===== */}
            <section className="relative overflow-hidden">
                {/* Background with nature pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700" />
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px), radial-gradient(circle at 60% 80%, white 1px, transparent 1px)`,
                    backgroundSize: '60px 60px, 80px 80px, 100px 100px'
                }} />
                <div className="absolute top-0 right-0 w-96 h-96 bg-surface-elevated/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative max-w-4xl mx-auto text-center py-20 px-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-elevated/15 backdrop-blur-sm border border-white/20 mb-8"
                    >
                        <span className="text-3xl">🌴</span>
                    </motion.div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
                        Lead Tours &<br />
                        <span className="bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200 bg-clip-text text-transparent">
                            Share Your Island
                        </span>
                    </h2>
                    <p className="text-white/75 text-lg mb-10 font-medium max-w-xl mx-auto leading-relaxed">
                        Turn your passion into income. Guide visitors through hidden trails, secret beaches, and unforgettable adventures.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/become-vendor"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-elevated text-green-700 font-black rounded-2xl hover:bg-green-50 transition-all shadow-2xl shadow-black/20 text-sm uppercase tracking-wider group"
                        >
                            Become a Guide
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <Link
                            href="/become-vendor"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-surface-elevated/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl hover:bg-surface-elevated/20 transition-all text-sm"
                        >
                            Learn More
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-8 mt-12 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                            Verified Guides
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            Top Rated
                        </span>
                        <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                            Best Price
                        </span>
                    </div>
                </div>
            </section>
        </main>
    );
}
