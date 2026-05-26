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

const SERVICE_CATEGORIES = [
    { id: 'all', title: 'All Services', icon: '🛠️', subtypes: [] },
    { id: 'professional', title: 'Professional', icon: '💼', desc: 'Legal, consulting & business', subtypes: ['professional_services', 'legal', 'consulting', 'accounting'] },
    { id: 'automotive', title: 'Automotive', icon: '🚗', desc: 'Repair, detailing & maintenance', subtypes: ['automotive', 'car_repair', 'detailing'] },
    { id: 'health', title: 'Health & Beauty', icon: '💆', desc: 'Spa, wellness & personal care', subtypes: ['health_beauty', 'spa', 'wellness', 'salon'] },
    { id: 'marine', title: 'Marine', icon: '⚓', desc: 'Boat services & water activities', subtypes: ['marine', 'boat_service', 'diving'] },
    { id: 'events', title: 'Events', icon: '🎉', desc: 'Planning, catering & entertainment', subtypes: ['event_services', 'catering', 'entertainment', 'planning'] },
    { id: 'digital', title: 'Digital & Tech', icon: '💻', desc: 'Web, app & digital services', subtypes: ['digital', 'web', 'app', 'tech', 'it'] },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    professional: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    automotive: { bg: 'bg-surface-secondary', text: 'text-ink-secondary', border: 'border-border-primary' },
    health: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
    marine: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    events: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    digital: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
};

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of SERVICE_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'professional';
}

function StarRating({ rating }: { rating: string }) {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalf = numRating - fullStars >= 0.5;

    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${i < fullStars ? 'text-amber-400' : (i === fullStars && hasHalf) ? 'text-amber-400' : 'text-slate-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function ServiceCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const subtypeLabel = store.subtype
        ? store.subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : 'Service';
    const catId = categorizeStore(store);
    const catColors = CATEGORY_COLORS[catId] || CATEGORY_COLORS.professional;
    const catConf = SERVICE_CATEGORIES.find(c => c.id === catId);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -3 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:shadow-xl hover:shadow-blue-500/8 hover:border-blue-300 transition-all duration-300"
            >
                {/* Top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-slate-600" />

                <div className="p-5">
                    {/* Header: logo + name + rating */}
                    <div className="flex items-start gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border-primary bg-surface-primary shrink-0 shadow-sm">
                            {store.logo_url ? (
                                <img src={getImageUrl(store.logo_url)} alt={storeName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black text-white uppercase" style={{ backgroundColor: store.branding_color || '#3b82f6' }}>
                                    {storeName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-ink-primary group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight mb-1">
                                {storeName}
                            </h3>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${catColors.bg} ${catColors.text} ${catColors.border} border`}>
                                    {catConf?.icon} {subtypeLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <StarRating rating={rating} />
                                <span className="text-xs font-bold text-ink-secondary">{rating}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-ink-tertiary line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                        {store.description || 'Professional services for your needs.'}
                    </p>

                    {/* Trust signals */}
                    <div className="flex items-center gap-3 mb-4 text-[10px] text-ink-tertiary font-medium">
                        <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                        </span>
                        <span className="w-px h-3 bg-surface-tertiary" />
                        <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            Quick Response
                        </span>
                        <span className="w-px h-3 bg-surface-tertiary" />
                        <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            Island Local
                        </span>
                    </div>

                    {/* CTA footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Available
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl group-hover:bg-blue-700 transition-colors shadow-sm group-hover:shadow-md group-hover:shadow-blue-500/20">
                            Book Consultation
                            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ServicesHubPage() {
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
                        return cat === 'services' || cat === 'professional';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#3b82f6',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch service stores:', error);
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
        for (const cat of SERVICE_CATEGORIES) { map[cat.id] = []; }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* ═══════════════════════════════════════════════════════════════
                HERO — Professional blue gradient, trustworthy feel
            ═══════════════════════════════════════════════════════════════ */}
            <HeroBackground pageKey="service-stores" fallbackTitle="Island Services" className="min-h-[52vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-3xl mx-auto text-center">
                    {/* Trust badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-elevated/15 backdrop-blur-sm rounded-full border border-white/20 mb-6"
                    >
                        <svg className="w-4 h-4 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs font-semibold text-white/90 tracking-wide">Verified & Trusted Professionals</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 drop-shadow-lg tracking-tight">
                        Find the Right <span className="bg-gradient-to-r from-blue-300 to-blue-200 bg-clip-text text-transparent">Professional</span>
                    </h1>
                    <p className="text-base md:text-lg text-white/75 mb-8 font-medium max-w-xl mx-auto leading-relaxed">
                        Connect with vetted service providers across the island — from legal experts to marine specialists.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-xl mx-auto">
                        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search by service, skill, or provider..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-5 py-4 bg-surface-elevated rounded-2xl text-ink-primary font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:shadow-lg focus:shadow-blue-500/10 shadow-xl border border-border-primary"
                        />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center justify-center gap-8 mt-8">
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-white">{loading ? '—' : totalStores}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Service Providers</div>
                        </div>
                        <div className="w-px h-8 bg-surface-elevated/15" />
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-white">{SERVICE_CATEGORIES.length - 1}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Categories</div>
                        </div>
                        <div className="w-px h-8 bg-surface-elevated/15" />
                        <div className="text-center">
                            <div className="text-2xl md:text-3xl font-black text-white">4.8</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Avg Rating</div>
                        </div>
                    </div>
                </motion.div>
            </HeroBackground>

            {/* ═══════════════════════════════════════════════════════════════
                CATEGORY FILTER BAR — Sticky, professional pill badges
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-surface-elevated border-b border-border-primary sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                        <div className="flex items-center gap-1.5 mr-4 shrink-0">
                            <svg className="w-4 h-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">Filter:</span>
                        </div>
                        {SERVICE_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
                                        isActive
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                            : 'bg-surface-primary text-ink-secondary border-border-primary hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                                    }`}
                                >
                                    <span className="text-base">{cat.icon}</span>
                                    <span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                                        isActive ? 'bg-surface-elevated/20 text-white' : 'bg-surface-tertiary/80 text-ink-tertiary'
                                    }`}>
                                        {loading ? '…' : count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                BRAND MARQUEE — Overridden to blue/slate theme
            ═══════════════════════════════════════════════════════════════ */}
            {!loading && totalStores > 0 && (
                <div className="bg-surface-elevated border-b border-border-primary">
                    <BrandMarquee type="brand" />
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SERVICE LISTINGS — Grouped by category with headers
            ═══════════════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Empty state */}
                {!loading && totalStores === 0 && (
                    <div className="text-center py-24">
                        <div className="w-20 h-20 mx-auto mb-6 bg-surface-secondary rounded-2xl flex items-center justify-center">
                            <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-ink-primary mb-2">No services found</h3>
                        <p className="text-ink-tertiary mb-6 max-w-md mx-auto">Try adjusting your search or browse all categories to find the right professional.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                        >
                            View All Services
                        </button>
                    </div>
                )}

                {/* Filtered / searched results */}
                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div>
                            {/* Results header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-bold text-ink-primary">
                                        {activeCategory !== 'all'
                                            ? `${SERVICE_CATEGORIES.find(c => c.id === activeCategory)?.title} Services`
                                            : 'Search Results'
                                        }
                                    </h2>
                                    <p className="text-xs text-ink-tertiary mt-0.5">
                                        {totalStores} provider{totalStores !== 1 ? 's' : ''} found
                                        {searchTerm && <span> for &ldquo;{searchTerm}&rdquo;</span>}
                                    </p>
                                </div>
                                <button
                                    onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Clear filters
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredStores.map((store, idx) => (
                                    <ServiceCard key={store.store_id || store.id} store={store} index={idx} />
                                ))}
                            </div>
                        </div>
                    )
                ) : (
                    /* Grouped by category */
                    SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-12">
                                {/* Category header */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg">
                                            {cat.icon}
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold text-ink-primary">{cat.title}</h2>
                                            <p className="text-xs text-ink-tertiary">{cat.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-ink-tertiary bg-surface-secondary px-3 py-1.5 rounded-lg">
                                            {loading ? '…' : `${stores.length} provider${stores.length !== 1 ? 's' : ''}`}
                                        </span>
                                        <Link
                                            href={`/services?category=${cat.id}`}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            View all →
                                        </Link>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                                                <div className="h-1.5 bg-surface-tertiary animate-pulse" />
                                                <div className="p-5">
                                                    <div className="flex items-start gap-3.5 mb-4">
                                                        <div className="w-14 h-14 bg-surface-secondary rounded-xl animate-pulse shrink-0" />
                                                        <div className="flex-1 space-y-2">
                                                            <div className="h-4 bg-surface-secondary rounded-lg animate-pulse w-3/4" />
                                                            <div className="h-3 bg-surface-secondary rounded-lg animate-pulse w-1/2" />
                                                            <div className="h-3 bg-surface-secondary rounded-lg animate-pulse w-1/3" />
                                                        </div>
                                                    </div>
                                                    <div className="h-3 bg-surface-secondary rounded-lg animate-pulse w-full mb-2" />
                                                    <div className="h-3 bg-surface-secondary rounded-lg animate-pulse w-2/3 mb-4" />
                                                    <div className="flex justify-between pt-4 border-t border-border-primary">
                                                        <div className="h-6 bg-surface-secondary rounded-lg animate-pulse w-20" />
                                                        <div className="h-8 bg-surface-secondary rounded-xl animate-pulse w-32" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {stores.map((store, idx) => (
                                            <ServiceCard key={store.store_id || store.id} store={store} index={idx} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TRUST SECTION — Social proof & trust signals
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-surface-elevated border-t border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-ink-primary mb-1">Verified Professionals</h3>
                            <p className="text-xs text-ink-tertiary leading-relaxed">Every provider is vetted and verified for quality and reliability.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-ink-primary mb-1">Transparent Pricing</h3>
                            <p className="text-xs text-ink-tertiary leading-relaxed">No hidden fees. Get upfront quotes before you book any service.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-bold text-ink-primary mb-1">24/7 Support</h3>
                            <p className="text-xs text-ink-tertiary leading-relaxed">Our team is always available to help you find the right professional.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                CTA — Blue gradient, professional services copy
            ═══════════════════════════════════════════════════════════════ */}
            <section className="relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-800" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-600/20 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-elevated/10 backdrop-blur-sm rounded-full border border-white/15 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold text-white/80">Join 500+ service providers</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            Offer a Service?
                        </h2>
                        <p className="text-white/70 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-medium">
                            Join IslandHub&apos;s professional network and connect with customers actively looking for your expertise.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/become-vendor"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-surface-elevated text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-xl shadow-black/10 text-sm uppercase tracking-wider group"
                            >
                                List Your Service
                                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-surface-elevated/10 backdrop-blur-sm text-white font-bold rounded-2xl hover:bg-surface-elevated/20 transition-all border border-white/20 text-sm uppercase tracking-wider"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </main>
    );
}
