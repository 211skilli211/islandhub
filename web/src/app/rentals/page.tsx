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

const RENTAL_CATEGORIES = [
    { id: 'all', title: 'All Rentals', icon: '🏝️', subtypes: [] },
    { id: 'stays', title: 'Stays & Homes', icon: '🏠', desc: 'Villas, apartments & vacation homes', subtypes: ['stays', 'apartment', 'villa', 'condo', 'studio', 'home', 'house'] },
    { id: 'vehicles', title: 'Vehicles', icon: '🚗', desc: 'Cars, SUVs, scooters & bikes', subtypes: ['car', 'vehicle', 'suv', 'scooter', 'bike', 'motorcycle', 'jeep'] },
    { id: 'water', title: 'Water Sports', icon: '⛵', desc: 'Boats, jet skis & sea tours', subtypes: ['boat', 'yacht', 'jet_ski', 'sea', 'water', 'marine', 'charter'] },
    { id: 'equipment', title: 'Equipment', icon: '🔧', desc: 'Tools, gear & machinery', subtypes: ['equipment', 'tools', 'gear', 'machinery'] },
    { id: 'land', title: 'Land & Property', icon: '🌴', desc: 'Land rentals & outdoor spaces', subtypes: ['land', 'property', 'outdoor'] },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of RENTAL_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'stays';
}

function StarRating({ rating }: { rating: string }) {
    const num = parseFloat(rating);
    const fullStars = Math.floor(num);
    const hasHalf = num - fullStars >= 0.3;
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < fullStars ? 'text-sunset-400' : (i === fullStars && hasHalf ? 'text-sunset-400' : 'text-border-tertiary')}`}
                    fill={i < fullStars ? 'currentColor' : (i === fullStars && hasHalf ? 'url(#half-star)' : 'none')}
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                >
                    <defs>
                        <linearGradient id="half-star">
                            <stop offset="50%" stopColor="currentColor" />
                            <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                    </defs>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            ))}
            <span className="ml-1 text-xs font-semibold text-ink-secondary">{rating}</span>
        </div>
    );
}

function RentalCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : null;
    const category = categorizeStore(store);
    const catInfo = RENTAL_CATEGORIES.find(c => c.id === category);

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            whileHover={{ y: -6 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-surface-elevated rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-border-primary"
            >
                {/* Large Image */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-surface-secondary to-surface-tertiary flex items-center justify-center">
                            <span className="text-6xl opacity-60">{catInfo?.icon || '🏠'}</span>
                        </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                    {/* Wishlist heart */}
                    <button
                        className="absolute top-3 right-3 w-8 h-8 bg-surface-elevated/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-surface-elevated transition-colors shadow-sm"
                        onClick={(e) => e.preventDefault()}
                    >
                        <svg className="w-4 h-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </button>

                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-surface-elevated/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-bold text-ink-secondary flex items-center gap-1 shadow-sm">
                        <span>{catInfo?.icon || '🏠'}</span>
                        <span>{catInfo?.title || 'Rental'}</span>
                    </div>

                    {/* Price overlay at bottom of image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <div className="bg-surface-elevated/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
                            <span className="text-lg font-black text-ink-primary">Contact for pricing</span>
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="px-1 pt-3 pb-1">
                    {/* Location + Name */}
                    <div className="flex items-start gap-1.5 mb-1">
                        <svg className="w-3.5 h-3.5 text-accent-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        <h3 className="text-[15px] font-bold text-ink-primary group-hover:text-accent-400 transition-colors line-clamp-1 leading-tight">{storeName}</h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-ink-tertiary line-clamp-1 mb-2 pl-5">
                        {store.description || catInfo?.desc || 'Quality rentals for your island experience.'}
                    </p>

                    {/* Rating + Book Now */}
                    <div className="flex items-center justify-between pl-5">
                        {rating ? <StarRating rating={rating} /> : <span className="text-xs text-ink-tertiary">New listing</span>}
                        <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-accent-400 text-brand-950 text-[11px] font-bold rounded-full group-hover:bg-accent-300 transition-all shadow-sm group-hover:shadow-md">
                            View Details
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function CategoryCard({ cat, count, loading }: { cat: typeof RENTAL_CATEGORIES[number]; count: number; loading: boolean }) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-500 to-brand-700 p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <span className="text-4xl mb-3 block">{cat.icon}</span>
            <h3 className="text-lg font-bold mb-1">{cat.title}</h3>
            <p className="text-sm text-white/70 mb-3">{cat.desc}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{loading ? '…' : count} listings</span>
                <span className="text-xs font-bold group-hover:translate-x-1 transition-transform">Explore →</span>
            </div>
        </div>
    );
}

export default function RentalsHubPage() {
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
                        return cat === 'rental' || cat === 'rent';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#0891b2',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                // Silently handle - show empty state
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
        for (const cat of RENTAL_CATEGORIES) { map[cat.id] = []; }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* Hero */}
            <HeroBackground pageKey="rental-hub" fallbackTitle="Island Rentals" className="min-h-[60vh]">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="w-full max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-surface-elevated/15 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                        <span className="text-sm">🏝️</span>
                        <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Island Rentals</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-5 drop-shadow-lg leading-tight">
                        Find Your Perfect<br />
                        <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-sunset-300 bg-clip-text text-transparent">Island Experience</span>
                    </h1>
                    <p className="text-lg text-white/75 mb-10 font-medium max-w-xl mx-auto">Discover homes, vehicles, boats and equipment from local providers across the Caribbean.</p>

                    {/* Search bar */}
                    <div className="bg-surface-elevated rounded-full p-2 shadow-2xl flex items-center gap-2 max-w-2xl mx-auto">
                        <div className="flex-1 flex items-center gap-3 px-5">
                            <svg className="w-5 h-5 text-accent-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search rentals, vehicles, boats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full py-2.5 text-ink-primary font-medium placeholder-ink-tertiary focus:outline-none text-sm bg-transparent"
                            />
                        </div>
                        <button className="bg-accent-400 text-brand-950 px-7 py-3 rounded-full font-bold text-sm hover:bg-accent-300 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{loading ? '—' : totalStores}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Providers</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">{RENTAL_CATEGORIES.length - 1}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Categories</div>
                        </div>
                        <div className="w-px h-10 bg-white/20" />
                        <div className="text-center">
                            <div className="text-3xl font-black text-white">4.9</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Avg Rating</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* Category Cards */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {RENTAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="text-left">
                            <CategoryCard cat={cat} count={storesByCategory[cat.id]?.length || 0} loading={loading} />
                        </button>
                    ))}
                </div>
            </section>

            {/* Horizontal scrollable category filter */}
            <section className="bg-surface-elevated/80 backdrop-blur-md border-b border-border-primary sticky top-0 z-30 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
                        {RENTAL_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap border ${
                                        isActive
                                            ? 'bg-accent-400 text-brand-950 border-accent-400 shadow-lg'
                                            : 'bg-surface-elevated text-ink-secondary border-border-primary hover:border-accent-400 hover:text-accent-500'
                                    }`}
                                >
                                    <span className="text-base">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isActive ? 'bg-brand-950/15 text-brand-950' : 'bg-surface-secondary text-ink-tertiary'
                                    }`}>
                                        {loading ? '…' : count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {!loading && totalStores > 0 && <BrandMarquee type="brand" />}

            {/* Rental Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {!loading && totalStores === 0 && (
                    <div className="text-center py-24">
                        <div className="w-24 h-24 bg-surface-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="text-5xl">🏠</span>
                        </div>
                        <h3 className="text-2xl font-bold text-ink-primary mb-3">No rentals found</h3>
                        <p className="text-ink-tertiary mb-8 max-w-md mx-auto">Try adjusting your search or browse all categories to discover island rentals.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                            className="px-8 py-3.5 bg-accent-400 text-brand-950 font-bold rounded-full hover:bg-accent-300 transition-all shadow-lg hover:shadow-xl text-sm"
                        >
                            View All Rentals
                        </button>
                    </div>
                )}

                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-ink-primary">
                                    {activeCategory !== 'all'
                                        ? `${RENTAL_CATEGORIES.find(c => c.id === activeCategory)?.title || 'Results'}`
                                        : 'Search Results'}
                                </h2>
                                <span className="text-sm text-ink-tertiary font-medium">{totalStores} providers found</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredStores.map((store, idx) => (
                                    <RentalCard key={store.store_id || store.id} store={store} index={idx} />
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    RENTAL_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-14">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-surface-secondary rounded-xl flex items-center justify-center">
                                            <span className="text-xl">{cat.icon}</span>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-ink-primary">{cat.title}</h2>
                                            <p className="text-xs text-ink-tertiary">{cat.desc}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-accent-500 bg-accent-500/10 px-3 py-1.5 rounded-full">
                                        {loading ? '…' : `${stores.length} ${stores.length === 1 ? 'provider' : 'providers'}`}
                                    </span>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="animate-pulse">
                                                <div className="aspect-[4/3] bg-surface-secondary rounded-3xl mb-3" />
                                                <div className="h-4 bg-surface-secondary rounded-full w-3/4 mb-2" />
                                                <div className="h-3 bg-surface-secondary rounded-full w-1/2" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {stores.map((store, idx) => (
                                            <RentalCard key={store.store_id || store.id} store={store} index={idx} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            {/* CTA */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500 via-brand-600 to-brand-800" />
                <div className="relative max-w-4xl mx-auto text-center py-20 px-6">
                    <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
                        <span className="text-sm">✨</span>
                        <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Become a Host</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
                        Have Something<br />to Rent?
                    </h2>
                    <p className="text-white/80 text-lg mb-10 font-medium max-w-xl mx-auto">
                        List your property, vehicle, or equipment and start earning. Join island hosts already sharing with travelers.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/become-vendor"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-brand-700 font-bold rounded-full hover:bg-surface-secondary transition-all shadow-2xl text-sm uppercase tracking-wider hover:scale-105 transform duration-200"
                        >
                            Start Hosting Today
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/how-it-works"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white/15 backdrop-blur-sm text-white font-bold rounded-full hover:bg-white/25 transition-all text-sm border border-white/20"
                        >
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
