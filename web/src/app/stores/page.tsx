'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
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
    is_featured?: boolean;
}

interface HubConfig {
    id: string;
    label: string;
    icon: string;
    color: string;
    description: string;
    href: string;
    categories?: string[];
    subtypes?: string[];
}

const HUBS: HubConfig[] = [
    { id: 'all', label: 'All Stores', icon: '🏝️', color: 'teal', description: 'Browse every vendor on IslandHub', href: '/stores' },
    { id: 'food', label: 'Food & Drink', icon: '🍽️', color: 'orange', description: 'Kitchens, restaurants, cafés & grills', href: '/food', categories: ['Food', 'food'] },
    { id: 'retail', label: 'Shopping', icon: '🛍️', color: 'emerald', description: 'Shops, boutiques & specialty goods', href: '/products', categories: ['Retail', 'product'] },
    { id: 'services', label: 'Services', icon: '🛠️', color: 'blue', description: 'Professional, auto, health & marine', href: '/services', categories: ['Services', 'service', 'Professional'] },
    { id: 'rental', label: 'Rentals', icon: '🏠', color: 'amber', description: 'Stays, vehicles & equipment', href: '/rentals', categories: ['Rental', 'rent'] },
    { id: 'tours', label: 'Tours', icon: '🗺️', color: 'green', description: 'Land, sea & adventure tours', href: '/tours', subtypes: ['tour_operator', 'charter'] },
    { id: 'transport', label: 'Transport', icon: '🚕', color: 'sky', description: 'Ride hailing, delivery & charters', href: '/transport', subtypes: ['taxi', 'delivery', 'transport'] },
    { id: 'campaigns', label: 'Campaigns', icon: '❤️', color: 'rose', description: 'Community fundraisers & causes', href: '/campaigns' },
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

function getHubColor(color: string): Record<string, string> {
    const map: Record<string, Record<string, string>> = {
        teal:   { bg: 'bg-teal-500',   light: 'bg-teal-50',   text: 'text-teal-600',   border: 'border-teal-200', ring: 'ring-teal-200', gradient: 'from-teal-500 to-cyan-500' },
        orange: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', ring: 'ring-orange-200', gradient: 'from-orange-500 to-red-500' },
        emerald:{ bg: 'bg-emerald-500',light: 'bg-emerald-50',text: 'text-emerald-600',border:'border-emerald-200', ring:'ring-emerald-200', gradient:'from-emerald-500 to-teal-500' },
        blue:   { bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   ring: 'ring-blue-200',   gradient: 'from-blue-500 to-indigo-500' },
        amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  ring: 'ring-amber-200',  gradient: 'from-amber-500 to-orange-500' },
        green:  { bg: 'bg-green-500',  light: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200',  ring: 'ring-green-200',  gradient: 'from-green-500 to-emerald-500' },
        sky:    { bg: 'bg-sky-500',    light: 'bg-sky-50',    text: 'text-sky-600',    border: 'border-sky-200',    ring: 'ring-sky-200',    gradient: 'from-sky-500 to-blue-500' },
        rose:   { bg: 'bg-rose-500',   light: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-200',   ring: 'ring-rose-200',   gradient: 'from-rose-500 to-pink-500' },
    };
    return map[color] || map.teal;
}

// ─── Store Card ───────────────────────────────────────────────────────────────
function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const hub = HUBS.find(h => h.id === getHubForStore(store)) || HUBS[0];
    const colors = getHubColor(hub.color);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
                style={{ borderColor: `${store.branding_color || '#e2e8f0'}20` }}
            >
                {/* Banner */}
                <div className="relative h-36 overflow-hidden">
                    {store.banner_url ? (
                        <img src={getImageUrl(store.banner_url) || undefined} alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${store.branding_color || '#64748b'}15, ${store.branding_color || '#64748b'}30)` }}>
                            <span className="text-4xl opacity-40">{hub.icon}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Hub badge */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                            style={{ backgroundColor: store.branding_color || '#64748b' }}>
                            {hub.label}
                        </span>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <span className="text-yellow-500 text-xs">★</span>
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{rating}</span>
                    </div>

                    {/* Logo overlap */}
                    <div className="absolute -bottom-5 left-3 w-12 h-12 rounded-xl overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg bg-white dark:bg-slate-800">
                        {store.logo_url ? (
                            <img src={getImageUrl(store.logo_url) || undefined} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-white uppercase"
                                style={{ backgroundColor: store.branding_color || '#64748b' }}>
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="pt-7 pb-4 px-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-1 mb-1">
                        {storeName}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed min-h-[2rem]">
                        {store.description}
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-700">
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            {store.subtype?.replace(/_/g, ' ') || hub.label}
                        </span>
                        <span className={`text-[11px] font-bold ${colors.text} group-hover:translate-x-1 transition-transform`}>
                            Visit →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Hub Showcase Section ─────────────────────────────────────────────────────
function HubShowcaseSection({ hub, stores, loading }: { hub: HubConfig; stores: Store[]; loading: boolean }) {
    const colors = getHubColor(hub.color);
    const [showAll, setShowAll] = useState(false);
    const displayed = showAll ? stores : stores.slice(0, 4);

    if (loading) {
        return (
            <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />)}
                </div>
            </section>
        );
    }

    if (stores.length === 0) return null;

    return (
        <section className="mb-12" id={`hub-${hub.id}`}>
            <div className={`flex items-center justify-between mb-5 ${colors.light} dark:bg-slate-800/50 px-5 py-4 rounded-2xl ${colors.border} dark:border-slate-700`}>
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{hub.icon}</span>
                    <div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{hub.label}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{hub.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${colors.gradient} text-white shadow-sm`}>
                        {stores.length} {stores.length === 1 ? 'store' : 'stores'}
                    </span>
                    {stores.length > 4 && (
                        <button onClick={() => setShowAll(!showAll)}
                            className={`text-xs font-bold ${colors.text} hover:underline underline-offset-2 ml-2`}>
                            {showAll ? 'Show less' : `View all ${stores.length} →`}
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayed.map((store, idx) => (
                    <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                ))}
            </div>
            {showAll && stores.length > 4 && (
                <div className="text-center mt-6">
                    <button onClick={() => setShowAll(false)}
                        className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
                        ↑ Show less
                    </button>
                </div>
            )}
        </section>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoresPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeHub, setActiveHub] = useState('all');

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handleHubClick = useCallback((e: React.MouseEvent, hubId: string) => {
        e.preventDefault();
        if (hubId === 'all') {
            setActiveHub('all');
            setSearchTerm('');
            return;
        }
        setActiveHub(hubId);
        // Scroll to hub section
        const el = document.getElementById(`hub-${hubId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const handleSearch = useCallback(() => {
        if (debouncedSearch.trim()) {
            setActiveHub('all');
            // Scroll to store grid
            const el = document.getElementById('all-stores-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [debouncedSearch]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    }, [handleSearch]);

    // Filter stores
    const filteredStores = useMemo(() => {
        let stores = allStores;

        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }

        return stores;
    }, [allStores, debouncedSearch]);

    // Group stores by hub (when no search active)
    const storesByHub = useMemo(() => {
        const map: Record<string, Store[]> = {};
        for (const hub of HUBS) map[hub.id] = [];
        for (const store of (debouncedSearch.trim() ? filteredStores : allStores)) {
            const hubId = getHubForStore(store);
            if (map[hubId]) map[hubId].push(store);
        }
        return map;
    }, [allStores, filteredStores, debouncedSearch]);

    const hubCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allStores.length };
        for (const hub of HUBS) {
            if (hub.id === 'all') continue;
            counts[hub.id] = storesByHub[hub.id]?.length || 0;
        }
        return counts;
    }, [storesByHub, allStores.length]);

    const totalSearchResults = filteredStores.length;
    const isSearching = debouncedSearch.trim().length > 0;
    const featuredStores = allStores.filter(s => s.is_featured);

    return (
        <main className="min-h-screen bg-white dark:bg-slate-900">
            {/* Hero */}
            <HeroBackground pageKey="marketplace" fallbackTitle="All Stores" className="min-h-[45vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        All <span className="text-teal-400">Stores</span>
                    </h1>
                    <p className="text-lg text-white/80 mb-6 font-medium">
                        Browse every vendor across every hub on IslandHub
                    </p>

                    {/* Search */}
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search stores, categories, services..."
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-12 pr-24 py-3.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl text-slate-900 dark:text-white font-medium placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-xl border border-white/20" />
                        <button onClick={handleSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-colors">
                            Search
                        </button>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Hub Filter Bar */}
            <section className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {HUBS.map(hub => {
                            const colors = getHubColor(hub.color);
                            return (
                                <button key={hub.id} onClick={(e) => handleHubClick(e, hub.id)}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                                        activeHub === hub.id
                                            ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
                                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-slate-600'
                                    }`}>
                                    <span>{hub.icon}</span>
                                    <span>{hub.label}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                        activeHub === hub.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-600'
                                    }`}>
                                        {loading ? '…' : hubCounts[hub.id] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="all-stores-grid">

                {/* Search results mode */}
                {isSearching && (
                    <>
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-extrabold text-slate-800 dark:text-white">{totalSearchResults}</span> results for &quot;<span className="font-extrabold text-teal-600">{debouncedSearch}</span>&quot;
                            </p>
                            <button onClick={() => { setSearchTerm(''); }}
                                className="text-xs font-bold text-teal-600 hover:underline">Clear search</button>
                        </div>

                        {totalSearchResults === 0 ? (
                            <div className="text-center py-20">
                                <span className="text-6xl mb-4 block">🏝️</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No stores found</h3>
                                <p className="text-slate-500 mb-6">Try adjusting your search or browse by hub below.</p>
                                <button onClick={() => setSearchTerm('')}
                                    className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">
                                    Browse All Stores
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {filteredStores.map((store, index) => (
                                        <StoreCard key={store.store_id || store.id} store={store} index={index} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </>
                )}

                {/* Hub showcase mode (no search) */}
                {!isSearching && !activeHub && (
                    <>
                        {/* Featured stores */}
                        {featuredStores.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-3 mb-5 px-5 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl">
                                    <span className="text-3xl">⭐</span>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-white">Featured Stores</h2>
                                        <p className="text-xs text-white/70">Hand-picked by the IslandHub team</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {featuredStores.map((store, idx) => (
                                        <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Hub sections */}
                        {HUBS.filter(h => h.id !== 'all').map(hub => (
                            <HubShowcaseSection key={hub.id} hub={hub} stores={storesByHub[hub.id] || []} loading={loading} />
                        ))}

                        {/* Loading skeleton */}
                        {loading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading && allStores.length === 0 && (
                            <div className="text-center py-20">
                                <span className="text-6xl mb-4 block">🏪</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No stores yet</h3>
                                <p className="text-slate-500 mb-6">Be the first to join IslandHub!</p>
                                <Link href="/become-vendor"
                                    className="inline-block px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors">
                                    Become a Vendor
                                </Link>
                            </div>
                        )}
                    </>
                )}

                {/* Single hub view */}
                {!isSearching && activeHub !== 'all' && (
                    <>
                        {(() => {
                            const hub = HUBS.find(h => h.id === activeHub);
                            if (!hub) return null;
                            const stores = storesByHub[activeHub] || [];
                            return (
                                <HubShowcaseSection hub={hub} stores={stores} loading={loading} />
                            );
                        })()}
                    </>
                )}
            </div>
        </main>
    );
}
