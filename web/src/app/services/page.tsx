'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface ServiceStore {
    id: number;
    store_id?: number;
    name: string;
    description?: string;
    logo_url?: string;
    banner_url?: string;
    branding_color?: string;
    category: string;
    subtype?: string;
    slug: string;
    rating?: number;
    price?: number;
    starting_price?: number;
}

interface ServiceCategory {
    id: string;
    title: string;
    icon: string;
    description: string;
    gradient: string;
    subtypes: string[];
}

const SERVICE_CATEGORIES: ServiceCategory[] = [
    {
        id: 'professional',
        title: 'Professional Services',
        icon: '💼',
        description: 'Legal, accounting, consulting, and business experts.',
        gradient: 'from-emerald-500 to-teal-600',
        subtypes: ['legal', 'accounting', 'consulting', 'business', 'professional', 'it', 'tech', 'marketing', 'design', 'freelance'],
    },
    {
        id: 'automotive',
        title: 'Automotive',
        icon: '🚗',
        description: 'Mechanics, detailing, and vehicle services.',
        gradient: 'from-slate-600 to-slate-800',
        subtypes: ['auto', 'car', 'mechanic', 'detailing', 'automotive', 'repair', 'tire', 'wash'],
    },
    {
        id: 'health-beauty',
        title: 'Health & Beauty',
        icon: '💆',
        description: 'Spas, salons, wellness, and personal care.',
        gradient: 'from-pink-500 to-rose-600',
        subtypes: ['spa', 'salon', 'beauty', 'health', 'wellness', 'massage', 'hair', 'nails', 'fitness', 'yoga'],
    },
    {
        id: 'marine',
        title: 'Marine Services',
        icon: '⚓',
        description: 'Boat repair, charters, and marine maintenance.',
        gradient: 'from-cyan-500 to-blue-600',
        subtypes: ['marine', 'boat', 'yacht', 'fishing', 'dive', 'scuba', 'sailing', 'dock'],
    },
    {
        id: 'tours',
        title: 'Tours & Experiences',
        icon: '🗺️',
        description: 'Guided tours, excursions, and local adventures.',
        gradient: 'from-amber-500 to-orange-600',
        subtypes: ['tour', 'guide', 'excursion', 'adventure', 'hiking', 'cultural', 'heritage'],
    },
    {
        id: 'events',
        title: 'Events & Entertainment',
        icon: '🎉',
        description: 'Event planning, DJs, photography, and catering.',
        gradient: 'from-violet-500 to-purple-600',
        subtypes: ['event', 'planner', 'dj', 'photo', 'catering', 'entertainment', 'wedding', 'music', 'band'],
    },
];

function categorizeStore(store: ServiceStore): string {
    const text = `${store.subtype || ''} ${store.description || ''} ${store.name}`.toLowerCase();
    for (const cat of SERVICE_CATEGORIES) {
        if (cat.subtypes.some(s => text.includes(s))) {
            return cat.id;
        }
    }
    return 'professional';
}

function StoreCard({ store, index }: { store: ServiceStore; index: number }) {
    const storeId = store.store_id || store.id;
    const displayName = store.name || 'Unnamed Service';
    const displayDesc = store.description || 'Professional service provider ready to assist you.';
    const displayRating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const price = store.starting_price || store.price;
    const brandColor = store.branding_color || '#14b8a6';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="block bg-white rounded-2xl border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden h-full"
            >
                {/* Banner / Top Gradient */}
                <div className="h-28 w-full relative overflow-hidden">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt=""
                            className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div
                            className="w-full h-full"
                            style={{
                                background: `linear-gradient(135deg, ${brandColor}33 0%, ${brandColor}11 100%)`,
                            }}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent" />
                </div>

                {/* Content */}
                <div className="px-5 pb-5 -mt-10 relative z-10">
                    {/* Logo / Avatar */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border-4 border-white shadow-lg mb-3 group-hover:scale-105 transition-transform duration-300">
                        {store.logo_url ? (
                            <img
                                src={getImageUrl(store.logo_url)}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-2xl font-black text-white uppercase"
                                style={{ backgroundColor: brandColor }}
                            >
                                {displayName.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Name */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors truncate">
                        {displayName}
                    </h3>

                    {/* Subtype / Category */}
                    {store.subtype && (
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
                            {store.subtype.replace(/_/g, ' ')}
                        </p>
                    )}

                    {/* Description - 3 lines max */}
                    <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-3">
                        {displayDesc}
                    </p>

                    {/* Price & Rating Row */}
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            {price ? (
                                <span className="text-sm font-bold text-slate-900">
                                    From <span className="text-emerald-600">${Number(price).toFixed(0)}</span>
                                </span>
                            ) : (
                                <span className="text-sm font-bold text-slate-400">Contact for pricing</span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-sm font-bold text-slate-700">{displayRating}</span>
                        </div>
                    </div>

                    {/* Book Now Button */}
                    <button
                        className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl transition-colors duration-200 cursor-pointer"
                        onClick={(e) => e.preventDefault()}
                    >
                        Book Now
                    </button>
                </div>
            </Link>
        </motion.div>
    );
}

function CategorySection({ category, stores }: { category: ServiceCategory; stores: ServiceStore[] }) {
    if (stores.length === 0) return null;

    return (
        <section className="mb-16">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                    {category.icon}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{category.title}</h2>
                    <p className="text-sm text-slate-500">{category.description}</p>
                </div>
                <div className="ml-auto">
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
                        {stores.length} {stores.length === 1 ? 'provider' : 'providers'}
                    </span>
                </div>
            </div>

            {/* Store Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store, idx) => (
                    <StoreCard key={store.store_id || store.id} store={store} index={idx} />
                ))}
            </div>
        </section>
    );
}

export default function ServicesPage() {
    const [allStores, setAllStores] = useState<ServiceStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores?category=service');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const stores: ServiceStore[] = rawData.map((s: any) => ({
                    id: s.store_id || s.id,
                    store_id: s.store_id,
                    name: s.name,
                    description: s.description,
                    logo_url: s.logo_url,
                    banner_url: s.banner_url,
                    branding_color: s.branding_color || '#14b8a6',
                    category: s.category,
                    subtype: s.subtype,
                    slug: s.slug,
                    rating: s.rating,
                    price: s.price,
                    starting_price: s.starting_price,
                }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch service stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    // Filter stores by search term
    const filteredStores = useMemo(() => {
        if (!searchTerm.trim()) return allStores;
        const term = searchTerm.toLowerCase();
        return allStores.filter(
            (s) =>
                s.name?.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term) ||
                s.subtype?.toLowerCase().includes(term) ||
                s.category?.toLowerCase().includes(term)
        );
    }, [allStores, searchTerm]);

    // Group stores by category
    const storesByCategory = useMemo(() => {
        const grouped: Record<string, ServiceStore[]> = {};
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (!grouped[catId]) grouped[catId] = [];
            grouped[catId].push(store);
        }
        return grouped;
    }, [filteredStores]);

    // Filter categories to show
    const visibleCategories = useMemo(() => {
        let cats = SERVICE_CATEGORIES;
        if (activeCategory) {
            cats = cats.filter((c) => c.id === activeCategory);
        }
        return cats.filter((c) => (storesByCategory[c.id]?.length || 0) > 0);
    }, [storesByCategory, activeCategory]);

    const totalProviders = filteredStores.length;

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative">
                <HeroBackground
                    pageKey="services-hub"
                    fallbackTitle="Services Hub"
                    className="!min-h-[320px] md:!min-h-[380px]"
                >
                    <div className="text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="inline-block px-4 py-1.5 bg-emerald-500/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300 mb-4">
                                IslandHub Marketplace
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                                Services <span className="text-emerald-400">Hub</span>
                            </h1>
                            <p className="text-lg text-white/80 max-w-xl font-medium leading-relaxed mb-6">
                                Verified professionals for every need — from auto repair to wellness, marine services to event planning.
                            </p>
                            {/* Stats */}
                            <div className="flex gap-6 justify-center md:justify-start">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{loading ? '—' : totalProviders}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Providers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white">{SERVICE_CATEGORIES.length}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Categories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-emerald-400">4.9</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/50">Avg Rating</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </HeroBackground>
            </section>

            {/* Search & Filter Bar */}
            <section className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full">
                            <svg
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search services, providers, or categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium placeholder-slate-400 text-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                            <button
                                onClick={() => setActiveCategory(null)}
                                className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                    !activeCategory
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All
                            </button>
                            {SERVICE_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                        activeCategory === cat.id
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.icon} {cat.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    /* Loading Skeleton */
                    <div className="space-y-16">
                        {[1, 2, 3].map((section) => (
                            <div key={section}>
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-slate-200 animate-pulse" />
                                    <div>
                                        <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse mb-2" />
                                        <div className="h-4 w-64 bg-slate-100 rounded-lg animate-pulse" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                                        >
                                            <div className="h-28 bg-slate-100 animate-pulse" />
                                            <div className="p-5">
                                                <div className="w-16 h-16 rounded-xl bg-slate-200 animate-pulse -mt-10 mb-3" />
                                                <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
                                                <div className="h-3 w-full bg-slate-100 rounded animate-pulse mb-1" />
                                                <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse mb-4" />
                                                <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : totalProviders === 0 ? (
                    /* Empty State */
                    <div className="text-center py-24">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">No services found</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            {searchTerm
                                ? `No results for "${searchTerm}". Try a different search term or browse all categories.`
                                : 'No service providers are listed yet. Check back soon!'}
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setActiveCategory(null);
                                }}
                                className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors cursor-pointer"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    /* Category Sections */
                    <>
                        {/* Results count */}
                        <div className="mb-8">
                            <p className="text-sm text-slate-500">
                                Showing <span className="font-bold text-slate-900">{totalProviders}</span>{' '}
                                {totalProviders === 1 ? 'service provider' : 'service providers'}
                                {activeCategory && (
                                    <span>
                                        {' '}
                                        in{' '}
                                        <span className="font-bold text-emerald-600">
                                            {SERVICE_CATEGORIES.find((c) => c.id === activeCategory)?.title}
                                        </span>
                                    </span>
                                )}
                            </p>
                        </div>

                        {visibleCategories.map((cat) => (
                            <CategorySection
                                key={cat.id}
                                category={cat}
                                stores={storesByCategory[cat.id] || []}
                            />
                        ))}

                        {/* Uncategorized stores (if any) */}
                        {storesByCategory['professional'] &&
                            !activeCategory &&
                            (() => {
                                const categorizedIds = new Set(
                                    SERVICE_CATEGORIES.filter((c) => c.id !== 'professional').flatMap(
                                        (c) => storesByCategory[c.id]?.map((s) => s.store_id || s.id) || []
                                    )
                                );
                                const uncategorized = storesByCategory['professional'].filter(
                                    (s) => !categorizedIds.has(s.store_id || s.id)
                                );
                                if (uncategorized.length === 0) return null;
                                const otherCat: ServiceCategory = {
                                    id: 'other',
                                    title: 'Other Services',
                                    icon: '🛠️',
                                    description: 'Additional professional services.',
                                    gradient: 'from-slate-500 to-slate-700',
                                    subtypes: [],
                                };
                                return <CategorySection key="other" category={otherCat} stores={uncategorized} />;
                            })()}
                    </>
                )}
            </div>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-10 md:p-16 relative overflow-hidden text-center">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-48 h-48 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                            Are you a Service Provider?
                        </h2>
                        <p className="text-emerald-100 text-lg font-medium mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join IslandHub and connect with thousands of customers looking for your expertise. Grow your business with our professional tools.
                        </p>
                        <Link
                            href="/become-vendor"
                            className="inline-block px-10 py-4 bg-white text-emerald-700 rounded-xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-emerald-50 transition-all shadow-xl cursor-pointer"
                        >
                            Apply to Join →
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
