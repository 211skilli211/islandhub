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

const FOOD_CATEGORIES = [
    {
        id: 'kitchen',
        title: 'Food Kitchens',
        icon: '🍳',
        desc: 'Home-cooked meals and local island flavors',
        gradient: 'from-orange-500 to-red-500',
        subtypes: ['kitchen', 'home_cook', 'catering', 'meal_prep'],
    },
    {
        id: 'restaurant',
        title: 'Restaurants',
        icon: '🍽️',
        desc: 'Full-service dining experiences',
        gradient: 'from-amber-500 to-orange-600',
        subtypes: ['restaurant', 'dine_in', 'fine_dining', 'casual_dining'],
    },
    {
        id: 'cafe',
        title: 'Cafés & Bakeries',
        icon: '☕',
        desc: 'Coffee, pastries, and light bites',
        gradient: 'from-yellow-500 to-amber-600',
        subtypes: ['cafe', 'bakery', 'coffee_shop', 'pastry', 'juice_bar'],
    },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of FOOD_CATEGORIES) {
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'kitchen';
}

function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown Store';
    const storeId = store.store_id || store.id;
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const subtypeLabel = store.subtype
        ? store.subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Food Vendor';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:border-orange-200 transition-all duration-300"
            >
                {/* Banner / Logo Header */}
                <div className="relative h-32 overflow-hidden">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Logo */}
                    <div className="absolute -bottom-6 left-5 w-14 h-14 rounded-xl overflow-hidden border-3 border-white shadow-lg bg-white group-hover:scale-110 transition-transform duration-300">
                        {store.logo_url ? (
                            <img
                                src={getImageUrl(store.logo_url)}
                                alt={storeName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-xl font-black text-white uppercase"
                                style={{ backgroundColor: store.branding_color || '#FF6B35' }}
                            >
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Card Body */}
                <div className="pt-9 pb-5 px-5">
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-600 uppercase tracking-wider">
                            {subtypeLabel}
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-sm font-bold text-slate-700">{rating}</span>
                        </div>
                    </div>

                    {/* Name */}
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                        {storeName}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                        {store.description || 'Delicious island cuisine made with love.'}
                    </p>

                    {/* Order Now Button */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Open Now</span>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl group-hover:bg-orange-600 transition-colors shadow-sm">
                            Order Now
                            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function CategorySection({
    category,
    stores,
    loading,
}: {
    category: typeof FOOD_CATEGORIES[number];
    stores: Store[];
    loading: boolean;
}) {
    if (loading) {
        return (
            <section className="py-6">
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                        <p className="text-sm text-slate-500">{category.desc}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </section>
        );
    }

    if (stores.length === 0) return null;

    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                        <p className="text-sm text-slate-500">{category.desc}</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                    {stores.length} {stores.length === 1 ? 'place' : 'places'}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stores.map((store, idx) => (
                    <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                ))}
            </div>
        </section>
    );
}

export default function FoodHubPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores?category=food');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const stores: Store[] = rawData.map((s: any) => ({
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
        if (!searchTerm.trim()) return allStores;
        const q = searchTerm.toLowerCase();
        return allStores.filter(s =>
            (s.name || s.business_name || '').toLowerCase().includes(q) ||
            (s.description || '').toLowerCase().includes(q) ||
            (s.subtype || '').toLowerCase().includes(q) ||
            (s.category || '').toLowerCase().includes(q)
        );
    }, [allStores, searchTerm]);

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
            {/* Hero Section */}
            <HeroBackground
                pageKey="food-hub"
                fallbackTitle="Island Food Hub"
                className="min-h-[50vh]"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-2xl mx-auto text-center"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
                        Island <span className="text-orange-400">Flavors</span>
                    </h1>
                    <p className="text-lg text-white/80 mb-8 font-medium">
                        Discover authentic Caribbean cuisine from local kitchens, restaurants, and cafés.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-lg mx-auto">
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search kitchens, restaurants, cafés..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-xl border border-white/20"
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

                    {/* Quick Stats */}
                    <div className="flex items-center justify-center gap-6 mt-8">
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">{loading ? '—' : totalStores}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Places</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-white">3</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Categories</div>
                        </div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-orange-400">4.9</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Avg Rating</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Category Quick Links */}
            <section className="bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {FOOD_CATEGORIES.map(cat => {
                            const count = storesByCategory[cat.id]?.length || 0;
                            return (
                                <a
                                    key={cat.id}
                                    href={`#${cat.id}`}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-full border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group shadow-sm"
                                >
                                    <span className="text-lg">{cat.icon}</span>
                                    <span className="text-sm font-semibold text-slate-700 group-hover:text-orange-600 transition-colors">
                                        {cat.title}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                                        {loading ? '…' : count}
                                    </span>
                                </a>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Store Category Sections */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search Results Info */}
                <AnimatePresence>
                    {searchTerm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 flex items-center justify-between"
                        >
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-bold text-slate-700">{totalStores}</span> results for &ldquo;<span className="font-bold text-orange-600">{searchTerm}</span>&rdquo;
                            </p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                            >
                                Clear search
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* No Results */}
                {!loading && totalStores === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🍽️</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No places found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or browse all categories.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                        >
                            View All Places
                        </button>
                    </div>
                )}

                {/* Category Sections */}
                {FOOD_CATEGORIES.map(cat => (
                    <div key={cat.id} id={cat.id} className="scroll-mt-20">
                        <CategorySection
                            category={cat}
                            stores={storesByCategory[cat.id] || []}
                            loading={loading}
                        />
                    </div>
                ))}
            </div>

            {/* Bottom CTA */}
            <section className="py-16 px-6 bg-gradient-to-br from-orange-500 to-red-600">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                        Own a Kitchen or Restaurant?
                    </h2>
                    <p className="text-white/80 text-lg mb-8 font-medium">
                        Join IslandHub and reach thousands of food lovers across the Caribbean.
                    </p>
                    <Link
                        href="/become-vendor"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:bg-orange-50 transition-colors shadow-xl text-sm uppercase tracking-wider"
                    >
                        Become a Vendor
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </main>
    );
}
