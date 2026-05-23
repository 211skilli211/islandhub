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
    hero_title?: string;
    hero_subtitle?: string;
}

const FOOD_CATEGORIES = [
    {
        id: 'all',
        title: 'All',
        icon: '🍽️',
        subtypes: [],
    },
    {
        id: 'kitchen',
        title: 'Food Kitchens',
        icon: '🍳',
        desc: 'Home-cooked meals & local flavors',
        subtypes: ['kitchen', 'home_cook', 'catering', 'meal_prep'],
    },
    {
        id: 'restaurant',
        title: 'Restaurants',
        icon: '🍽️',
        desc: 'Full-service dining experiences',
        subtypes: ['restaurant', 'dine_in', 'fine_dining', 'casual_dining'],
    },
    {
        id: 'cafe',
        title: 'Cafés',
        icon: '☕',
        desc: 'Coffee, pastries & light bites',
        subtypes: ['cafe', 'bakery', 'coffee_shop', 'pastry', 'juice_bar'],
    },
    {
        id: 'bar',
        title: 'Bars & Grills',
        icon: '🍺',
        desc: 'Drinks, grills & nightlife',
        subtypes: ['bar', 'grill', 'pub', 'lounge', 'nightlife'],
    },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of FOOD_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'kitchen';
}

function StarIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
}

function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown Store';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const subtypeLabel = store.subtype
        ? store.subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Food Vendor';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            whileHover={{ y: -6, scale: 1.02 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-orange-200/50 transition-all duration-300 ring-1 ring-orange-100 hover:ring-orange-300"
            >
                {/* Large Image Area */}
                <div className="relative h-48 overflow-hidden">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-50 to-red-50 flex items-center justify-center">
                            <span className="text-6xl">🍜</span>
                        </div>
                    )}
                    {/* Warm gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Food category tag */}
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/90 text-white shadow-lg backdrop-blur-sm">
                            {subtypeLabel}
                        </span>
                    </div>

                    {/* Open badge */}
                    <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Open
                        </span>
                    </div>

                    {/* Logo floating at bottom-left of image */}
                    <div className="absolute bottom-0 left-4 translate-y-1/2 w-14 h-14 rounded-2xl overflow-hidden border-[3px] border-white shadow-xl bg-white ring-2 ring-orange-200 group-hover:ring-orange-400 transition-all duration-300 group-hover:scale-110 z-10">
                        {store.logo_url ? (
                            <img src={getImageUrl(store.logo_url)} alt={storeName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-white uppercase" style={{ backgroundColor: store.branding_color || '#FF6B35' }}>
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="pt-10 pb-5 px-4">
                    {/* Rating row */}
                    <div className="flex items-center gap-1.5 mb-2">
                        <StarIcon className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold text-slate-800">{rating}</span>
                        <span className="text-[11px] text-slate-400 ml-1">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                    </div>

                    {/* Store name */}
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1.5">
                        {storeName}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                        {store.description || 'Delicious island cuisine made with love and fresh ingredients.'}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center gap-2">
                        <span className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-xl group-hover:from-orange-600 group-hover:to-red-600 transition-all shadow-lg shadow-orange-300/30 group-hover:shadow-orange-400/40">
                            🛒 Order Now
                        </span>
                        <span className="inline-flex items-center justify-center px-3 py-2.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl ring-1 ring-amber-200">
                            View
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function FoodHubPage() {
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
                        const cat = (s.category || '').toLowerCase();
                        return cat === 'food';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#FF6B35',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                        hero_title: s.hero_title,
                        hero_subtitle: s.hero_subtitle,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch food stores:', error);
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
                (s.description || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }

        return stores;
    }, [allStores, activeCategory, searchTerm]);

    const storesByCategory = useMemo(() => {
        const map: Record<string, Store[]> = {};
        for (const cat of FOOD_CATEGORIES) {
            map[cat.id] = [];
        }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) {
                map[catId].push(store);
            }
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-white">
            {/* 🍔 Hero Section — warm, vibrant, food delivery app style */}
            <HeroBackground
                pageKey="food-stores"
                fallbackTitle="Island Food Hub"
                className="min-h-[55vh]"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/70 via-red-500/60 to-amber-600/70 pointer-events-none" />
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                    className="relative z-10 w-full max-w-2xl mx-auto text-center"
                >
                    {/* Emoji badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-5 ring-1 ring-white/20"
                    >
                        🍽️🍜☕🍺 Food Court
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-xl leading-tight">
                        Island <span className="text-amber-300">Flavors</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/85 mb-8 font-medium max-w-lg mx-auto">
                        🍳 Fresh kitchens • 🍽️ Top restaurants • ☕ Cozy cafés • 🍺 Chill grills
                    </p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="🍽️ Search kitchens, restaurants, cafés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-amber-300/50 shadow-2xl shadow-black/20"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-8 mt-7">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{loading ? '—' : totalStores}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Places</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{FOOD_CATEGORIES.length - 1}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Categories</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">🌴</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Island</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* 🍴 Category Filter Bar — horizontal scrollable food-app tabs */}
            <section className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-sm shadow-orange-100/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide">
                        {FOOD_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                        isActive
                                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-300/40'
                                            : 'bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 ring-1 ring-slate-200 hover:ring-orange-200'
                                    }`}
                                >
                                    <span className="text-base">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                        isActive
                                            ? 'bg-white/25 text-white'
                                            : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {loading ? '…' : count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Brand Marquee — admin controlled featured food vendors */}
            {!loading && totalStores > 0 && (
                <BrandMarquee type="brand" />
            )}

            {/* 🍕 Store Listings */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence>
                    {searchTerm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 flex items-center justify-between bg-orange-50 px-5 py-3 rounded-2xl ring-1 ring-orange-100"
                        >
                            <p className="text-sm text-slate-600">
                                Showing <span className="font-extrabold text-slate-800">{totalStores}</span> results for &quot;<span className="font-extrabold text-orange-600">{searchTerm}</span>&quot;
                            </p>
                            <button onClick={() => setSearchTerm('')} className="text-xs font-bold text-orange-500 hover:text-orange-700 underline underline-offset-2">
                                Clear search
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!loading && totalStores === 0 && (
                    <div className="text-center py-24">
                        <span className="text-7xl mb-5 block">🍽️</span>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No places found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">Try adjusting your search or browse all categories to discover delicious island eats.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-600 transition-all shadow-xl shadow-orange-300/30">
                            🍴 View All Places
                        </button>
                    </div>
                )}

                {/* Show filtered grid when searching or filtering by category */}
                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredStores.map((store, idx) => (
                                <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                            ))}
                        </div>
                    )
                ) : (
                    /* Show category sections when no filter active */
                    FOOD_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-12">
                                {/* Section header with warm background */}
                                <div className="flex items-center justify-between mb-5 bg-gradient-to-r from-orange-50 via-amber-50 to-red-50 px-5 py-3 rounded-2xl ring-1 ring-orange-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{cat.icon}</span>
                                        <div>
                                            <h2 className="text-xl font-extrabold text-slate-900">{cat.title}</h2>
                                            <p className="text-xs text-slate-500 font-medium">{cat.desc}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200/40">
                                        {loading ? '…' : stores.length} {stores.length === 1 ? 'place' : 'places'}
                                    </span>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-72 bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50 animate-pulse rounded-3xl ring-1 ring-orange-100/50" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {stores.map((store, idx) => (
                                            <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            {/* 🍩 CTA Section — warm gradient, food-themed */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-amber-500" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
                <div className="relative z-10 py-20 px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                            className="text-6xl mb-6"
                        >
                            🍳
                        </motion.div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
                            Own a Kitchen or Restaurant?
                        </h2>
                        <p className="text-white/85 text-lg md:text-xl mb-10 font-medium max-w-xl mx-auto">
                            Join IslandHub&apos;s food court 🍴 and serve thousands of hungry customers across the Caribbean!
                        </p>
                        <Link href="/become-vendor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-600 font-extrabold rounded-2xl hover:bg-orange-50 transition-all shadow-2xl shadow-black/20 text-sm uppercase tracking-wider group">
                            <span>🚀</span>
                            Become a Vendor
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
