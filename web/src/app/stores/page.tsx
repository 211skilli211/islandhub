'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import { Search, MapPin, Star, Plus, User, LogOut, Home, Menu, Bell, ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';

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
    location?: string;
    listing_count?: number;
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
    { id: 'all', label: 'All Stores', icon: '🏝️', color: 'brand', description: 'Browse every vendor on IslandHub', href: '/stores' },
    { id: 'food', label: 'Food & Drink', icon: '🍽️', color: 'coral', description: 'Kitchens, restaurants, cafés & grills', href: '/food', categories: ['Food', 'food'] },
    { id: 'retail', label: 'Shopping', icon: '🛍️', color: 'accent', description: 'Shops, boutiques & specialty goods', href: '/products', categories: ['Retail', 'product'] },
    { id: 'services', label: 'Services', icon: '🛠️', color: 'brand', description: 'Professional, auto, health & marine', href: '/services', categories: ['Services', 'service', 'Professional'] },
    { id: 'rental', label: 'Rentals', icon: '🏠', color: 'sand', description: 'Stays, vehicles & equipment', href: '/rentals', categories: ['Rental', 'rent'] },
    { id: 'tours', label: 'Tours', icon: '🗺️', color: 'palm', description: 'Land, sea & adventure tours', href: '/tours', subtypes: ['tour_operator', 'charter'] },
    { id: 'transport', label: 'Transport', icon: '🚕', color: 'accent', description: 'Ride hailing, delivery & charters', href: '/transport', subtypes: ['taxi', 'delivery', 'transport'] },
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

// ─── Store Card ───────────────────────────────────────────────────────────────
function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const hub = HUBS.find(h => h.id === getHubForStore(store)) || HUBS[0];
    const storeColor = store.branding_color || '#06b6d4';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ y: -4 }}
        >
            <Link href={`/store/${store.slug}`}
                className="group block bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                {/* Banner */}
                <div className="relative h-32 overflow-hidden">
                    {store.banner_url ? (
                        <img src={getImageUrl(store.banner_url) || undefined} alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${storeColor}15, ${storeColor}30)` }}>
                            <span className="text-4xl opacity-40">{hub.icon}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Hub badge */}
                    <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow-sm"
                            style={{ backgroundColor: storeColor }}>
                            {hub.label}
                        </span>
                    </div>
                    {/* Rating */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface-elevated/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <Star size={10} className="text-sand-500 fill-sand-500" />
                        <span className="text-[11px] font-bold text-ink-primary">{rating}</span>
                    </div>
                    {/* Logo overlap */}
                    <div className="absolute -bottom-4 left-3 w-10 h-10 rounded-xl overflow-hidden border-2 border-surface-elevated shadow-lg bg-surface-elevated">
                        {store.logo_url ? (
                            <img src={getImageUrl(store.logo_url) || undefined} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-white uppercase"
                                style={{ backgroundColor: storeColor }}>
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
                {/* Content */}
                <div className="pt-6 pb-3 px-3">
                    <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 transition-colors line-clamp-1 mb-0.5">
                        {storeName}
                    </h3>
                    <p className="text-[11px] text-ink-tertiary line-clamp-2 leading-relaxed min-h-[2rem] mb-2">
                        {store.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                        <div className="flex items-center gap-1 text-[10px] text-ink-tertiary">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{store.location || 'St. Kitts'}</span>
                        </div>
                        <span className="text-[11px] font-bold text-accent-500 group-hover:translate-x-1 transition-transform">
                            Visit →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StoresPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [activeHub, setActiveHub] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'newest'>('name');
    const [showFilters, setShowFilters] = useState(false);

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
                    branding_color: s.branding_color || '#06b6d4',
                    category: s.category,
                    subtype: s.subtype,
                    slug: s.slug,
                    rating: s.rating,
                    is_featured: s.is_featured,
                    location: s.location || s.address,
                    listing_count: s.listing_count || 0,
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
        if (debouncedSearch.trim()) {
            const q = debouncedSearch.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }
        if (activeHub !== 'all') {
            stores = stores.filter(s => getHubForStore(s) === activeHub);
        }
        // Sort
        switch (sortBy) {
            case 'rating':
                stores = [...stores].sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                stores = [...stores].sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            case 'name':
            default:
                stores = [...stores].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
        }
        return stores;
    }, [allStores, debouncedSearch, activeHub, sortBy]);

    const hubCounts = useMemo(() => {
        const counts: Record<string, number> = { all: allStores.length };
        for (const hub of HUBS) {
            if (hub.id === 'all') continue;
            counts[hub.id] = allStores.filter(s => getHubForStore(s) === hub.id).length;
        }
        return counts;
    }, [allStores]);

    const isSearching = debouncedSearch.trim().length > 0;
    const featuredStores = allStores.filter(s => s.is_featured);

    return (
        <div className="min-h-screen bg-surface-primary">
            {/* Top Bar */}
            <div className="sticky top-0 z-30 bg-surface-elevated border-b border-border-primary shadow-sm">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-2">
                            <Link href="/" className="p-2 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors" aria-label="Back to Home">
                                <Home size={18} />
                            </Link>
                            <Link href="/stores" className="flex items-center gap-2">
                                <span className="text-lg">🏪</span>
                                <span className="font-bold text-sm text-ink-primary hidden sm:inline">Stores</span>
                            </Link>
                        </div>
                        <form className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                                <input type="text" placeholder="Search stores..."
                                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border-primary rounded-xl text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all" />
                            </div>
                        </form>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setShowFilters(!showFilters)}
                                className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-accent-500/10 text-accent-500' : 'hover:bg-surface-secondary text-ink-secondary'}`}>
                                <SlidersHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hub filter bar */}
                <div className="border-t border-border-primary/50 bg-surface-primary/50">
                    <div className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-thin">
                        {HUBS.map(hub => {
                            const active = activeHub === hub.id;
                            return (
                                <button key={hub.id} onClick={() => setActiveHub(hub.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                                        active
                                            ? 'bg-accent-500 text-white border-accent-500'
                                            : 'bg-surface-elevated text-ink-secondary border-border-primary hover:border-accent-300'
                                    }`}>
                                    <span>{hub.icon}</span>
                                    <span>{hub.label}</span>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-surface-elevated/20' : 'bg-surface-secondary'}`}>
                                        {loading ? '…' : hubCounts[hub.id] || 0}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-surface-elevated border-b border-border-primary px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-ink-tertiary" />
                            <span className="text-xs font-bold text-ink-secondary">Sort by:</span>
                        </div>
                        {([
                            { id: 'name' as const, label: 'Name' },
                            { id: 'rating' as const, label: 'Rating' },
                            { id: 'newest' as const, label: 'Newest' },
                        ]).map(opt => (
                            <button key={opt.id} onClick={() => setSortBy(opt.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    sortBy === opt.id ? 'bg-accent-500 text-white' : 'bg-surface-secondary text-ink-secondary hover:text-ink-primary'
                                }`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="w-full px-4 sm:px-6 lg:px-8 py-6">

                {/* Featured stores */}
                {!isSearching && activeHub === 'all' && featuredStores.length > 0 && (
                    <section className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">⭐</span>
                            <div>
                                <h2 className="text-lg font-black text-ink-primary">Featured Stores</h2>
                                <p className="text-xs text-ink-tertiary">Hand-picked by the IslandHub team</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {featuredStores.map((store, idx) => (
                                <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Section title */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-black text-ink-primary">
                        {isSearching ? `Search results` : activeHub === 'all' ? 'All Stores' : HUBS.find(h => h.id === activeHub)?.label || 'Stores'}
                        <span className="ml-2 text-sm font-bold text-ink-tertiary">({filteredStores.length})</span>
                    </h2>
                </div>

                {/* Store grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="h-64 bg-surface-elevated animate-pulse rounded-2xl border border-border-primary" />
                        ))}
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🏪</span>
                        <h3 className="text-xl font-bold text-ink-primary mb-2">No stores found</h3>
                        <p className="text-ink-tertiary mb-6">Try adjusting your search or browse by category.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveHub('all'); }}
                            className="px-6 py-3 bg-accent-500 text-white font-bold rounded-xl hover:bg-accent-600 transition-colors">
                            Browse All Stores
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredStores.map((store, index) => (
                            <StoreCard key={store.store_id || store.id} store={store} index={index} />
                        ))}
                    </div>
                )}

                {/* Hub sections (when viewing all) */}
                {!isSearching && activeHub === 'all' && !loading && HUBS.filter(h => h.id !== 'all').map(hub => {
                    const hubStores = allStores.filter(s => getHubForStore(s) === hub.id);
                    if (hubStores.length === 0) return null;
                    return (
                        <section key={hub.id} className="mt-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{hub.icon}</span>
                                    <div>
                                        <h2 className="text-lg font-black text-ink-primary">{hub.label}</h2>
                                        <p className="text-xs text-ink-tertiary">{hub.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setActiveHub(hub.id)}
                                    className="text-xs font-bold text-accent-500 hover:underline flex items-center gap-1">
                                    View all {hubStores.length} <ChevronRight size={12} />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {hubStores.slice(0, 4).map((store, idx) => (
                                    <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
