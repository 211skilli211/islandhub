'use client';

import { useState, useEffect, useMemo, type ReactNode } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import BrandMarquee from '@/components/BrandMarquee';

// ─── Types ───────────────────────────────────────────────────
export interface Store {
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
    is_trending?: boolean;
}

export interface HubCategory {
    id: string;
    title: string;
    icon: string;
    desc: string;
    subtypes: string[];
}

export interface HubTheme {
    primary: string;      // e.g. 'orange'
    gradient: string;     // e.g. 'from-orange-500 to-red-500'
    lightBg: string;      // e.g. 'bg-orange-50'
    lightText: string;    // e.g. 'text-orange-600'
    border: string;       // e.g. 'border-orange-100'
    ring: string;         // e.g. 'ring-orange-200'
    accentBg: string;     // e.g. 'bg-orange-500'
}

export interface HubPageConfig {
    type: string;
    slug: string;
    pageKey: string;
    fallbackTitle: string;
    heroSubtitle: string;
    heroEmoji: string;
    heroStats: { label: string; emoji: string };
    categories: HubCategory[];
    theme: HubTheme;
    storeCardVariant: 'food' | 'product' | 'service' | 'tour' | 'transport' | 'rental' | 'campaign' | 'community';
    ctaTitle: string;
    ctaSubtitle: string;
    ctaEmoji: string;
    searchPlaceholder: string;
}

// ─── Star Icon ────────────────────────────────────────────────
export function StarIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    );
}

// ─── Store Card ───────────────────────────────────────────────
export function StoreCard({ store, index, theme, variant, hubType }: {
    store: Store; index: number; theme: HubTheme; variant: string; hubType?: string;
}) {
    const storeName = store.name || store.business_name || 'Unknown Store';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const subtypeLabel = store.subtype
        ? store.subtype.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        : '';

    const bgGradients: Record<string, string> = {
        food: 'from-orange-100 via-amber-50 to-red-50',
        product: 'from-emerald-50 via-teal-50 to-cyan-50',
        service: 'from-blue-50 via-teal-50 to-teal-50',
        tour: 'from-emerald-50 via-green-50 to-teal-50',
        transport: 'from-sky-50 via-blue-50 to-teal-50',
        rental: 'from-amber-50 via-yellow-50 to-orange-50',
        campaign: 'from-rose-50 via-pink-50 to-red-50',
        community: 'from-green-50 via-emerald-50 to-teal-50',
    };

    const emojiMap: Record<string, string> = {
        food: '🍜', product: '🛍️', service: '🛠️', tour: '🗺️',
        transport: '🚕', rental: '🏠', campaign: '❤️', community: '🌴',
    };

    const accentColors: Record<string, string> = {
        food: store.branding_color || '#FF6B35',
        product: store.branding_color || '#10B981',
        service: store.branding_color || '#3B82F6',
        tour: store.branding_color || '#22C55E',
        transport: store.branding_color || '#0EA5E9',
        rental: store.branding_color || '#F59E0B',
        campaign: store.branding_color || '#EF4444',
        community: store.branding_color || '#10B981',
    };

    const btnGradients: Record<string, string> = {
        food: 'from-orange-500 to-red-500',
        product: 'from-emerald-500 to-teal-500',
        service: 'from-blue-500 to-teal-500',
        tour: 'from-emerald-500 to-green-500',
        transport: 'from-sky-500 to-blue-500',
        rental: 'from-amber-500 to-orange-500',
        campaign: 'from-rose-500 to-pink-500',
        community: 'from-green-500 to-emerald-500',
    };

    const labels: Record<string, string> = {
        food: '🛒 Order Now', product: '🛍️ Shop Now', service: '📞 Book Now',
        tour: '🗺️ Explore', transport: '🚕 Book Ride', rental: '🏠 Book Now',
        campaign: '❤️ Support', community: '🌴 Join',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.45 }}
            whileHover={{ y: -6, scale: 1.02 }}
        >
            <Link
                href={`/hub/${hubType || store.category || 'food'}/${store.slug}`}
                className="group block bg-surface-elevated dark:bg-ocean-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 ring-1 ring-ink-200 dark:ring-ocean-700 hover:ring-ink-300 dark:hover:ring-ocean-600"
            >
                <div className="relative h-48 overflow-hidden">
                    {store.banner_url ? (
                        <img
                            src={getImageUrl(store.banner_url)}
                            alt={storeName}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${bgGradients[variant] || bgGradients.product} flex items-center justify-center`}>
                            <span className="text-6xl">{emojiMap[variant] || '🏪'}</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {subtypeLabel && (
                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-elevated/90 dark:bg-ocean-700/90 shadow-lg backdrop-blur-sm ${theme.lightText}`}>
                                {subtypeLabel}
                            </span>
                            {store.is_trending && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/90 text-white shadow-lg backdrop-blur-sm animate-pulse">
                                    🔥 Trending
                                </span>
                            )}
                        </div>
                    )}

                    <div className="absolute bottom-0 left-4 translate-y-1/2 w-14 h-14 rounded-2xl overflow-hidden border-[3px] border-white dark:border-ocean-700 shadow-xl bg-surface-elevated dark:bg-ocean-800 z-10 group-hover:scale-110 transition-transform duration-300">
                        {store.logo_url ? (
                            <img src={getImageUrl(store.logo_url)} alt={storeName} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-black text-white uppercase" style={{ backgroundColor: accentColors[variant] || '#0ea5e9' }}>
                                {storeName.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-10 pb-5 px-4">
                    <div className="flex items-center gap-1.5 mb-2">
                        <StarIcon className="w-4 h-4 text-sand-400" />
                        <span className="text-sm font-bold text-ink-primary dark:text-sand-50">{rating}</span>
                        <span className="text-[11px] text-ink-tertiary ml-1">({Math.floor(Math.random() * 200) + 50} reviews)</span>
                    </div>

                    <h3 className="text-base font-extrabold text-ink-primary dark:text-sand-50 group-hover:text-ocean-600 dark:group-hover:text-ocean-400 transition-colors line-clamp-1 mb-1.5">
                        {storeName}
                    </h3>

                    <p className="text-xs text-ink-tertiary0 dark:text-ink-tertiary line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                        {store.description || `Discover ${storeName} on IslandHub.`}
                    </p>

                    <div className="flex items-center gap-2">
                        <span className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r ${btnGradients[variant] || btnGradients.product} text-white text-xs font-bold rounded-xl shadow-lg transition-all`}>
                            {labels[variant] || 'View'}
                        </span>
                        <span className={`inline-flex items-center justify-center px-3 py-2.5 ${theme.lightBg} ${theme.lightText} text-xs font-bold rounded-xl ring-1 ${theme.ring}`}>
                            View
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

// ─── Hub Hero ─────────────────────────────────────────────────
export function HubHero({ config, totalStores, searchTerm, onSearch, children }: {
    config: HubPageConfig; totalStores: number; searchTerm: string;
    onSearch: (v: string) => void; children?: ReactNode;
}) {
    const t = config.theme;
    return (
        <HeroBackground pageKey={config.pageKey} fallbackTitle={config.fallbackTitle} className="min-h-[55vh]">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.type === 'food' ? 'from-orange-600/70 via-red-500/60 to-amber-600/70' : config.type === 'products' ? 'from-emerald-600/70 via-teal-500/60 to-accent-400/70' : 'from-ocean-600/70 via-brand-500/60 to-brand-600/70'} pointer-events-none`} />
            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="relative z-10 w-full max-w-2xl mx-auto text-center"
            >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-surface-elevated/15 backdrop-blur-md rounded-full text-white/90 text-sm font-semibold mb-5 ring-1 ring-white/20">
                    {config.heroEmoji} {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Hub
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black text-white mb-3 drop-shadow-xl leading-tight">
                    {config.fallbackTitle}
                </h1>
                <p className="text-lg md:text-xl text-white/85 mb-8 font-medium max-w-lg mx-auto">
                    {config.heroSubtitle}
                </p>

                <div className="relative max-w-lg mx-auto">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder={config.searchPlaceholder} value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-surface-elevated dark:bg-ocean-800 rounded-2xl text-ink-primary dark:text-sand-50 font-semibold placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-4 focus:ring-white/30 shadow-2xl shadow-black/20" />
                </div>

                <div className="flex items-center justify-center gap-8 mt-7">
                    <div className="text-center">
                        <div className="text-3xl font-black text-white">{totalStores}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">{config.heroStats.label}</div>
                    </div>
                    <div className="w-px h-10 bg-surface-elevated/20" />
                    <div className="text-center">
                        <div className="text-3xl font-black text-white">{config.categories.length - 1}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Categories</div>
                    </div>
                    <div className="w-px h-10 bg-surface-elevated/20" />
                    <div className="text-center">
                        <div className="text-3xl font-black text-white">{config.heroStats.emoji}</div>
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Island</div>
                    </div>
                </div>
                {children}
            </motion.div>
        </HeroBackground>
    );
}

// ─── Category Filter Bar ──────────────────────────────────────
export function CategoryFilterBar({ categories, activeCategory, onCategoryChange, theme, totalStores, storesByCategory, loading }: {
    categories: HubCategory[]; activeCategory: string; onCategoryChange: (id: string) => void;
    theme: HubTheme; totalStores: number; storesByCategory: Record<string, Store[]>; loading: boolean;
}) {
    return (
        <section className={`bg-surface-elevated dark:bg-ocean-800 border-b ${theme.border} sticky top-18 z-40 shadow-sm`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5 scrollbar-hide">
                    {categories.map(cat => {
                        const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                        const isActive = activeCategory === cat.id;
                        return (
                            <button key={cat.id} onClick={() => onCategoryChange(cat.id)}
                                className={`relative inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                    isActive
                                        ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                                        : `bg-surface-secondary dark:bg-ocean-700 text-ink-secondary dark:text-ink-tertiary hover:${theme.lightBg} ${theme.lightText} ring-1 ring-ink-200 dark:ring-ocean-600`
                                }`}>
                                <span className="text-base">{cat.icon}</span>
                                <span>{cat.title}</span>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${isActive ? 'bg-surface-elevated/25 text-white' : `${theme.lightBg} ${theme.lightText}`}`}>
                                    {loading ? '…' : count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── Hub CTA Section ──────────────────────────────────────────
export function HubCTA({ config }: { config: HubPageConfig }) {
    return (
        <section className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${config.theme.gradient}`} />
            <div className="relative z-10 py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200 }} className="text-6xl mb-6">
                        {config.ctaEmoji}
                    </motion.div>
                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">{config.ctaTitle}</h2>
                    <p className="text-white/85 text-lg md:text-xl mb-10 font-medium max-w-xl mx-auto">{config.ctaSubtitle}</p>
                    <Link href="/become-vendor" className="inline-flex items-center gap-2 px-10 py-4 bg-surface-elevated text-ink-primary font-extrabold rounded-2xl hover:bg-surface-secondary transition-all shadow-2xl shadow-black/20 text-sm uppercase tracking-wider group">
                        <span>🚀</span> Become a Vendor
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
        </section>
    );
}

// ─── Loading Skeleton ─────────────────────────────────────────
export function HubLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-72 bg-gradient-to-br from-ink-100 via-ink-50 to-ink-100 dark:from-ocean-800 dark:via-ocean-700 dark:to-ocean-800 animate-pulse rounded-3xl ring-1 ring-ink-200 dark:ring-ocean-700" />
            ))}
        </div>
    );
}

// ─── Empty State ──────────────────────────────────────────────
export function HubEmptyState({ emoji, title, message, onClear }: {
    emoji: string; title: string; message: string; onClear: () => void;
}) {
    return (
        <div className="text-center py-24">
            <span className="text-7xl mb-5 block">{emoji}</span>
            <h3 className="text-2xl font-extrabold text-ink-primary dark:text-sand-50 mb-2">{title}</h3>
            <p className="text-ink-tertiary0 dark:text-ink-tertiary mb-8 max-w-md mx-auto">{message}</p>
            <button onClick={onClear} className="inline-flex items-center gap-2 px-8 py-3.5 bg-ocean-500 hover:bg-ocean-400 text-white font-bold rounded-2xl transition-all shadow-xl">
                View All
            </button>
        </div>
    );
}
