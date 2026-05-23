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

const PRODUCT_CATEGORIES = [
    { id: 'all', title: 'All Products', icon: '🛍️', subtypes: [] },
    { id: 'shop', title: 'Shops', icon: '🏪', desc: 'Local shops & boutiques', subtypes: ['shop', 'boutique', 'retail', 'store'] },
    { id: 'specialty_food', title: 'Specialty Foods', icon: '🍯', desc: 'Local food products', subtypes: ['specialty_food', 'gourmet', 'organic', 'local_food'] },
    { id: 'crafts', title: 'Crafts & Art', icon: '🎨', desc: 'Handmade Caribbean crafts', subtypes: ['crafts', 'art', 'handmade', 'artisan'] },
    { id: 'fashion', title: 'Fashion', icon: '👕', desc: 'Clothing & accessories', subtypes: ['fashion', 'clothing', 'accessories', 'jewelry'] },
    { id: 'electronics', title: 'Electronics', icon: '📱', desc: 'Tech & gadgets', subtypes: ['electronics', 'tech', 'gadgets'] },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of PRODUCT_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'shop';
}

function getCategoryLabel(store: Store): string {
    const catId = categorizeStore(store);
    const cat = PRODUCT_CATEGORIES.find(c => c.id === catId);
    return cat ? cat.title : 'Shop';
}

function StoreCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown Store';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const categoryLabel = getCategoryLabel(store);
    const initials = storeName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-teal-500/5 hover:border-teal-200 transition-all duration-300 h-full"
            >
                {/* Square image area */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <span className="text-6xl font-black text-teal-200/60 select-none">{initials}</span>
                        </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-teal-700 rounded-md shadow-sm border border-white/50">
                            {categoryLabel}
                        </span>
                    </div>
                    {/* Teal overlay on hover */}
                    <div className="absolute inset-0 bg-teal-600/0 group-hover:bg-teal-600/5 transition-colors duration-300" />
                </div>

                {/* Card body — compact, minimal */}
                <div className="flex flex-col flex-1 p-4">
                    {/* Brand / subtitle */}
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600 mb-1">
                        {store.subtype || 'Local Store'}
                    </p>

                    {/* Product name */}
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug mb-2 line-clamp-2 min-h-[2.5rem]">
                        {storeName}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-auto">
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map(star => (
                                <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(parseFloat(rating)) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <span className="text-xs font-semibold text-gray-500 ml-1">{rating}</span>
                    </div>

                    {/* Shop Now CTA */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-teal-500 text-white text-xs font-bold tracking-wide rounded-md hover:bg-teal-600 group-hover:bg-teal-600 transition-colors uppercase">
                            Shop Now
                            <svg className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ProductsHubPage() {
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
                        return cat === 'retail' || cat === 'product';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#0d9488',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch product stores:', error);
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
        for (const cat of PRODUCT_CATEGORIES) { map[cat.id] = []; }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-gray-50">

            {/* ── Hero: Clean, light, e-commerce search style ── */}
            <section className="relative bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
                            Island <span className="text-teal-500">Marketplace</span>
                        </h1>
                        <p className="text-base text-gray-500 font-medium max-w-xl mx-auto">
                            Discover local brands, handmade crafts, specialty foods and more — all in one place.
                        </p>
                    </motion.div>

                    {/* E-commerce search bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto relative"
                    >
                        <div className="relative flex items-center">
                            <svg className="absolute left-4 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search products, brands, crafts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-32 py-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 shadow-sm transition-all"
                            />
                            <button className="absolute right-2 px-5 py-2.5 bg-teal-500 text-white text-sm font-bold rounded-md hover:bg-teal-600 transition-colors uppercase tracking-wide">
                                Search
                            </button>
                        </div>
                    </motion.div>

                    {/* Stats row */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center gap-8 mt-8"
                    >
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{loading ? '—' : totalStores}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Stores</div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-gray-900">{PRODUCT_CATEGORIES.length - 1}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Categories</div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="text-center">
                            <div className="text-2xl font-black text-teal-500">4.9</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">Avg Rating</div>
                        </div>
                    </motion.div>
                </div>

                {/* Subtle teal accent line at bottom */}
                <div className="h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500" />
            </section>

            {/* ── Category filter: Horizontal pills with counts (Shopify style) ── */}
            <section className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-3 scrollbar-hide">
                        {PRODUCT_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all whitespace-nowrap border ${
                                        isActive
                                            ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50'
                                    }`}
                                >
                                    <span className="text-base leading-none">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {loading ? '…' : count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Brand marquee ── */}
            {!loading && totalStores > 0 && <BrandMarquee type="brand" />}

            {/* ── Product Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Empty state */}
                {!loading && totalStores === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No stores found</h3>
                        <p className="text-gray-500 mb-6 text-sm">Try adjusting your search or browse all categories.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                            className="px-6 py-3 bg-teal-500 text-white text-sm font-bold rounded-md hover:bg-teal-600 transition-colors uppercase tracking-wide"
                        >
                            View All Stores
                        </button>
                    </div>
                )}

                {/* Filtered / searched results */}
                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <p className="text-sm text-gray-500 font-medium">
                                    Showing <span className="font-bold text-gray-900">{totalStores}</span> {totalStores === 1 ? 'store' : 'stores'}
                                    {searchTerm && <span> for "<span className="font-bold text-teal-600">{searchTerm}</span>"</span>}
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {filteredStores.map((store, idx) => (
                                    <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    /* Category-sections view */
                    PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-12">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{cat.title}</h2>
                                        <p className="text-xs text-gray-400 font-medium mt-0.5">{cat.desc}</p>
                                    </div>
                                    <Link
                                        href={`/products?category=${cat.id}`}
                                        className="text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-wide flex items-center gap-1 transition-colors"
                                    >
                                        View All
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="bg-white border border-gray-100 rounded-lg overflow-hidden">
                                                <div className="aspect-square bg-gray-100 animate-pulse" />
                                                <div className="p-4 space-y-3">
                                                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                                                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                                                    <div className="h-8 bg-gray-100 rounded animate-pulse w-full" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

            {/* ── CTA: Teal gradient, e-commerce copy ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2MmgxMnptLTgtOGgydjEyaC0yVjIyem00IDBoMnYxMmgtMlYyMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                <div className="relative max-w-3xl mx-auto text-center py-16 px-6">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                        Ready to Start Selling?
                    </h2>
                    <p className="text-white/80 text-lg mb-8 font-medium max-w-xl mx-auto">
                        Open your free store on IslandHub and reach thousands of customers across the Caribbean.
                    </p>
                    <Link
                        href="/become-vendor"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 font-bold rounded-md hover:bg-gray-50 transition-colors shadow-lg text-sm uppercase tracking-wider"
                    >
                        Open Your Store
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </section>
        </main>
    );
}
