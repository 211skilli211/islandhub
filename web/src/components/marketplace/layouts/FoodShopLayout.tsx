'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewSection from '@/components/ReviewSection';
import api, { getImageUrl } from '@/lib/api';
import { BadgeList } from '../BadgeSelector';
import React, { useState, useEffect, useRef } from 'react';
import KitchenSidebar from '../KitchenSidebar';
import FoodSelectionModal from '../FoodSelectionModal';
import ServiceBookingModal from '../ServiceBookingModal';
import { useStoreSections } from '../hooks/useStoreSections';
import HeroBackground from '@/components/HeroBackground';
import PromotionBanner from '@/components/advertising/PromotionBanner';
import AdSpace from '@/components/advertising/AdSpace';

interface StoreProps {
    store: any;
    listings: any[];
    menuData?: any;
    layoutType?: 'food' | 'service' | 'rental' | 'product';
}

const PLACEHOLDER_LOGO = '/placeholders/logo-placeholder.png';
const PLACEHOLDER_HERO = '/placeholders/food-hero.jpg';

// Dietary badge config for menu items
const DIETARY_BADGES: Record<string, { label: string; emoji: string; color: string; darkColor: string }> = {
    vegan: { label: 'Vegan', emoji: '🌱', color: 'bg-green-100 text-green-700 border-green-200', darkColor: 'dark:bg-green-900/40 dark:text-green-300 dark:border-green-700' },
    vegetarian: { label: 'Vegetarian', emoji: '🥬', color: 'bg-lime-100 text-lime-700 border-lime-200', darkColor: 'dark:bg-lime-900/40 dark:text-lime-300 dark:border-lime-700' },
    gf: { label: 'Gluten-Free', emoji: '🌾', color: 'bg-amber-100 text-amber-700 border-amber-200', darkColor: 'dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
    gluten_free: { label: 'Gluten-Free', emoji: '🌾', color: 'bg-amber-100 text-amber-700 border-amber-200', darkColor: 'dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700' },
    halal: { label: 'Halal', emoji: '☪️', color: 'bg-teal-100 text-teal-700 border-teal-200', darkColor: 'dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700' },
    spicy: { label: 'Spicy', emoji: '🌶️', color: 'bg-red-100 text-red-700 border-red-200', darkColor: 'dark:bg-red-900/40 dark:text-red-300 dark:border-red-700' },
    df: { label: 'Dairy-Free', emoji: '🥛', color: 'bg-blue-100 text-blue-700 border-blue-200', darkColor: 'dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
    dairy_free: { label: 'Dairy-Free', emoji: '🥛', color: 'bg-blue-100 text-blue-700 border-blue-200', darkColor: 'dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700' },
};

export const FoodShopLayout = ({ store, listings }: StoreProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);

    const isSoupKitchen = store.slug === 'soup-kitchen' || store.subtype?.includes('community') || store.business_name.toLowerCase().includes('soup');
    const brandingColor = store.branding_color || '#14b8a6';
    const secondaryColor = store.secondary_color || '#0f172a';

    const { sections: siteSections } = useStoreSections(store.store_id || store.id);

    // Refs for scroll fade detection
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);

    const handleScrollFade = () => {
        const el = scrollContainerRef.current;
        if (!el) return;
        setShowLeftFade(el.scrollLeft > 8);
        setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', handleScrollFade, { passive: true });
            // Initial check
            handleScrollFade();
            return () => el.removeEventListener('scroll', handleScrollFade);
        }
    }, [menu]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const targetStoreId = store.store_id || store.id;
                const res = await api.get(`/menu?storeId=${targetStoreId}`);
                if (res.data?.sections) {
                    setMenu(res.data.sections);
                }
            } catch (e) {
                console.error('Failed to fetch menu:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [store.store_id, store.id]);

    // Categorize listings for tabs
    const categories = ['All', ...menu.map(s => s.name)];

    const filteredSections = activeTab === 'All'
        ? menu
        : menu.filter(section => section.name === activeTab);

    const hasMenuItems = menu.length > 0;

    // FAB action handlers
    const handleCall = () => {
        if (store.phone || store.contact_phone) {
            window.location.href = `tel:${store.phone || store.contact_phone}`;
        } else {
            window.location.href = `tel:${store.user_phone || ''}`;
        }
    };

    const handleDirections = () => {
        const addr = store.business_address || store.location || store.name;
        const encoded = encodeURIComponent(addr || '');
        window.open(`https://www.google.com/maps/search/?api=1&query=${encoded}`, '_blank');
    };

    const handleShare = async () => {
        const shareData = {
            title: store.business_name || store.name,
            text: store.description || store.bio || `Check out ${store.business_name} on IslandHub`,
            url: window.location.href,
        };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // User cancelled
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch {
                // clipboard failed
            }
        }
    };

    const handleCart = () => {
        setSidebarOpen(true);
    };

    return (
        <div className="bg-white dark:bg-[var(--surface-primary)] min-h-screen font-sans transition-colors duration-300">

            {/* ═══ Floating Action Bar (replaces Kitchen Hub button) ═══ */}
            <div className="fixed right-4 bottom-24 z-50 flex flex-col items-end gap-3">
                {/* Secondary FAB actions */}
                <AnimatePresence>
                    {fabOpen && (
                        <>
                            {/* Cart */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: 0.0 }}
                                onClick={handleCart}
                                className="flex items-center gap-2 pl-4 pr-5 py-3 bg-white dark:bg-[var(--surface-elevated)] text-slate-700 dark:text-[var(--ink-primary)] shadow-lg hover:shadow-xl rounded-full border border-slate-200 dark:border-[var(--border-secondary)] transition-all hover:scale-105 active:scale-95 group"
                                title="Cart"
                            >
                                <span className="text-lg">🛒</span>
                                <span className="text-xs font-semibold hidden group-hover:inline">Cart</span>
                            </motion.button>

                            {/* Share */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: 0.05 }}
                                onClick={handleShare}
                                className="flex items-center gap-2 pl-4 pr-5 py-3 bg-white dark:bg-[var(--surface-elevated)] text-slate-700 dark:text-[var(--ink-primary)] shadow-lg hover:shadow-xl rounded-full border border-slate-200 dark:border-[var(--border-secondary)] transition-all hover:scale-105 active:scale-95 group"
                                title="Share"
                            >
                                <span className="text-lg">📤</span>
                                <span className="text-xs font-semibold hidden group-hover:inline">Share</span>
                            </motion.button>

                            {/* Directions */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: 0.1 }}
                                onClick={handleDirections}
                                className="flex items-center gap-2 pl-4 pr-5 py-3 bg-white dark:bg-[var(--surface-elevated)] text-slate-700 dark:text-[var(--ink-primary)] shadow-lg hover:shadow-xl rounded-full border border-slate-200 dark:border-[var(--border-secondary)] transition-all hover:scale-105 active:scale-95 group"
                                title="Directions"
                            >
                                <span className="text-lg">📍</span>
                                <span className="text-xs font-semibold hidden group-hover:inline">Directions</span>
                            </motion.button>

                            {/* Call */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                transition={{ delay: 0.15 }}
                                onClick={handleCall}
                                className="flex items-center gap-2 pl-4 pr-5 py-3 bg-white dark:bg-[var(--surface-elevated)] text-slate-700 dark:text-[var(--ink-primary)] shadow-lg hover:shadow-xl rounded-full border border-slate-200 dark:border-[var(--border-secondary)] transition-all hover:scale-105 active:scale-95 group"
                                title="Call"
                            >
                                <span className="text-lg">📞</span>
                                <span className="text-xs font-semibold hidden group-hover:inline">Call</span>
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>

                {/* Main FAB toggle */}
                <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center text-white text-xl border-2 border-white dark:border-[var(--surface-primary)]"
                    style={{ backgroundColor: brandingColor }}
                    title={fabOpen ? 'Close actions' : 'Quick actions'}
                >
                    <motion.span
                        animate={{ rotate: fabOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="block"
                    >
                        ⚡
                    </motion.span>
                </button>
            </div>

            <KitchenSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                listingTitle={store.business_name}
                storeId={store.store_id || store.id}
            />

            {/* Elegant Restaurant Hero — UNCHANGED */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <HeroBackground
                    overrideData={{
                        asset_url: store.banner_url || undefined,
                        title: store.hero_title || store.business_name || "Island Hub Kitchen",
                        subtitle: store.hero_subtitle || store.bio || "Experience authentic local flavors, crafted with passion and tradition.",
                        cta_text: store.hero_cta_text || "View Menu",
                        cta_link: store.hero_cta_link || "#menu",
                        typography: store.typography,
                        icon_url: store.hero_icon_url || store.branding_icon_url,
                        overlay_opacity: 0.5,
                        branding_color: brandingColor
                    }}
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 bg-black/30 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-white/10 mt-6 md:mt-8 w-full md:w-fit pointer-events-auto">
                        {/* Logo and BadgeList */}
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl border-2 border-white/20 shadow-lg bg-white p-1 overflow-hidden shrink-0">
                            <img
                                src={store.logo_url ? getImageUrl(store.logo_url) : getImageUrl(PLACEHOLDER_LOGO)}
                                className="w-full h-full object-cover rounded-lg"
                                alt="Logo"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 text-white/90 text-sm">
                                <span>📍 {store.location || 'St. Kitts'}</span>
                                <span className="hidden md:inline text-white/50">•</span>
                                <span className="text-amber-400">Authentic Food Hub</span>
                            </div>
                            <div className="mt-2 flex justify-center md:justify-start">
                                <BadgeList badges={store.badges || ['Vegan Friendly', 'Local Source', 'Fresh']} />
                            </div>
                        </div>
                    </div>
                </HeroBackground>
            </div>

            {/* ═══ Collapsible About Section ═══ */}
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                <button
                    onClick={() => setAboutOpen(!aboutOpen)}
                    className="w-full flex items-center justify-between py-4 mt-2 group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-lg">ℹ️</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-[var(--ink-secondary)] group-hover:text-slate-900 dark:group-hover:text-[var(--ink-primary)] transition-colors">
                            About {store.business_name}
                        </span>
                    </div>
                    <motion.span
                        animate={{ rotate: aboutOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400 dark:text-[var(--ink-tertiary)]"
                    >
                        ▼
                    </motion.span>
                </button>

                <AnimatePresence>
                    {aboutOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Description */}
                                {(store.description || store.bio) && (
                                    <div className="p-4 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)]">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)] mb-2">About Us</h4>
                                        <p className="text-sm text-slate-700 dark:text-[var(--ink-secondary)] leading-relaxed">
                                            {store.description || store.bio}
                                        </p>
                                    </div>
                                )}

                                {/* Location & Hours */}
                                <div className="p-4 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)] space-y-3">
                                    <div className="flex items-start gap-2">
                                        <span className="text-base">📍</span>
                                        <div>
                                            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)]">Location</h4>
                                            <p className="text-sm text-slate-700 dark:text-[var(--ink-secondary)]">
                                                {store.business_address || store.location || 'St. Kitts & Nevis'}
                                            </p>
                                        </div>
                                    </div>
                                    {store.opening_hours && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-base">🕒</span>
                                            <div>
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)]">Hours</h4>
                                                <p className="text-sm text-slate-700 dark:text-[var(--ink-secondary)] whitespace-pre-line">
                                                    {store.opening_hours}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {store.phone && (
                                        <div className="flex items-start gap-2">
                                            <span className="text-base">📞</span>
                                            <div>
                                                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)]">Phone</h4>
                                                <p className="text-sm text-slate-700 dark:text-[var(--ink-secondary)]">{store.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dietary Options */}
                                {store.dietary_options && store.dietary_options.length > 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)] md:col-span-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)] mb-2">Dietary Options</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {store.dietary_options.map((opt: string) => {
                                                const badge = DIETARY_BADGES[opt];
                                                if (!badge) return (
                                                    <span key={opt} className="px-2.5 py-1 bg-slate-100 dark:bg-[var(--surface-tertiary)] rounded-lg text-xs font-medium text-slate-600 dark:text-[var(--ink-secondary)] border border-slate-200 dark:border-[var(--border-secondary)]">
                                                        {opt}
                                                    </span>
                                                );
                                                return (
                                                    <span key={opt} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${badge.color} ${badge.darkColor}`}>
                                                        <span>{badge.emoji}</span>
                                                        {badge.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Store Badges */}
                                {store.badges && store.badges.length > 0 && (
                                    <div className="p-4 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)] md:col-span-2">
                                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-[var(--ink-tertiary)] mb-2">Highlights</h4>
                                        <BadgeList badges={store.badges} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="border-b border-slate-100 dark:border-[var(--border-primary)]" />
            </div>

            {/* ═══ Menu Filters — Enhanced Mobile UX ═══ */}
            <div id="menu" className="sticky top-0 bg-white/90 dark:bg-[var(--surface-primary)]/90 backdrop-blur-md z-40 border-b border-slate-100 dark:border-[var(--border-primary)]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
                    {/* Left fade edge */}
                    <AnimatePresence>
                        {showLeftFade && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-[var(--surface-primary)] to-transparent z-10 pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

                    {/* Right fade edge */}
                    <AnimatePresence>
                        {showRightFade && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-[var(--surface-primary)] to-transparent z-10 pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

                    <div
                        ref={scrollContainerRef}
                        className="overflow-x-auto scrollbar-hide py-3 md:py-4"
                    >
                        <div className="flex gap-2 md:gap-3 min-w-max px-1">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className="px-5 py-3 md:py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap min-h-[44px] md:min-h-0"
                                    style={{
                                        backgroundColor: activeTab === cat ? brandingColor : '#f8fafc',
                                        color: activeTab === cat ? 'white' : '#64748b'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <PromotionBanner storeId={store.store_id || store.id} />
                <AdSpace spaceName="food_hub_banner" className="h-20 md:h-28 my-6 rounded-xl overflow-hidden shadow-sm" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                {/* Menu Section */}
                <div className="lg:col-span-8 space-y-10 md:space-y-16">
                    {filteredSections.length > 0 ? filteredSections.map((section: any) => (
                        <section key={section.id} id={`section-${section.id}`}>
                            <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                                <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-[var(--ink-primary)]">
                                    {section.name}
                                </h2>
                                <div className="flex-1 h-px bg-slate-100 dark:bg-[var(--border-primary)]" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {section.items?.map((item: any, idx: number) => {
                                    // Get dietary badges for this item
                                    const itemDietary = (item.dietary_tags || item.dietary || []).filter((tag: string) => DIETARY_BADGES[tag]);

                                    return (
                                        <div
                                            key={item.id}
                                            className="relative block group cursor-pointer"
                                            onMouseEnter={() => setHoveredItem(item)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                            onClick={() => {
                                                if (item.listing_id || item.id) {
                                                    window.location.href = `/listings/${item.listing_id || item.id}`;
                                                } else {
                                                    setSelectedItem(item);
                                                    setIsModalOpen(true);
                                                }
                                            }}
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.05 }}
                                                whileHover={{ scale: 1.02 }}
                                                className={`relative bg-white dark:bg-[var(--surface-elevated)] p-4 rounded-xl border ${isSoupKitchen ? 'border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-700' : 'border-slate-100 dark:border-[var(--border-primary)] hover:border-slate-200 dark:hover:border-[var(--border-secondary)]'} group-hover:shadow-md dark:group-hover:shadow-lg transition-all flex gap-4`}
                                            >
                                                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-slate-50 dark:bg-[var(--surface-tertiary)] rounded-lg overflow-hidden">
                                                    {item.image_url ? (
                                                        <img
                                                            src={getImageUrl(item.image_url)}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            alt={item.name}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl">{isSoupKitchen ? '🍲' : '🥘'}</div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                                    <div className="flex justify-between items-start mb-1 gap-2">
                                                        <h3 className="font-semibold text-slate-900 dark:text-[var(--ink-primary)] text-sm md:text-base group-hover:text-slate-700 dark:group-hover:text-[var(--ink-secondary)] transition-colors truncate">{item.name}</h3>
                                                        <div className="text-right shrink-0">
                                                            <span
                                                                className="font-medium text-white px-2 py-0.5 rounded text-xs"
                                                                style={{ backgroundColor: brandingColor }}
                                                            >
                                                                ${item.price}
                                                            </span>
                                                            {item.donation_suggested && (
                                                                <p className="text-xs text-slate-500 dark:text-[var(--ink-tertiary)] mt-0.5">Suggested</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-[var(--ink-tertiary)] text-xs leading-relaxed mb-2 line-clamp-2">{item.description}</p>

                                                    {/* Dietary badges */}
                                                    {itemDietary.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {itemDietary.map((tag: string) => {
                                                                const badge = DIETARY_BADGES[tag];
                                                                return (
                                                                    <span key={tag} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.color} ${badge.darkColor}`}>
                                                                        <span>{badge.emoji}</span>
                                                                        {badge.label}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs font-medium" style={{ color: brandingColor }}>
                                                            {item.donation_suggested ? 'Donate & Order →' : '+ Add to Selection'}
                                                        </div>

                                                        {/* Quick add button — visible on hover */}
                                                        <motion.button
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-md"
                                                            style={{ backgroundColor: brandingColor }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedItem(item);
                                                                setIsModalOpen(true);
                                                            }}
                                                            title="Quick add"
                                                        >
                                                            +
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Hover Preview Card */}
                                            <AnimatePresence>
                                                {hoveredItem?.id === item.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: -10 }}
                                                        className="absolute left-full ml-4 top-0 z-50 hidden lg:block w-72"
                                                    >
                                                        <div className="bg-white dark:bg-[var(--surface-elevated)] rounded-xl shadow-lg border border-slate-100 dark:border-[var(--border-primary)] overflow-hidden">
                                                            <div className="h-32 relative bg-slate-100 dark:bg-[var(--surface-tertiary)]">
                                                                {item.image_url ? (
                                                                    <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt="" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-3xl">{isSoupKitchen ? '🍲' : '🥘'}</div>
                                                                )}
                                                                <div className="absolute top-3 right-3 bg-white/95 dark:bg-[var(--surface-elevated)]/95 backdrop-blur px-2 py-1 rounded-lg font-semibold text-sm text-slate-900 dark:text-[var(--ink-primary)] shadow-sm">
                                                                    ${item.price}
                                                                </div>
                                                            </div>
                                                            <div className="p-5">
                                                                <h4 className="text-base font-semibold text-slate-900 dark:text-[var(--ink-primary)] mb-2">{item.name}</h4>
                                                                <p className="text-slate-500 dark:text-[var(--ink-tertiary)] text-xs leading-relaxed mb-4">
                                                                    {item.description || "The finest island ingredients prepared with tradition and care."}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                                    {(item.dietary_tags || item.dietary || ['Organic', 'Local', 'Artisan']).map((tag: string) => {
                                                                        const badge = DIETARY_BADGES[tag];
                                                                        if (badge) {
                                                                            return (
                                                                                <span key={tag} className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium border ${badge.color} ${badge.darkColor}`}>
                                                                                    <span>{badge.emoji}</span>
                                                                                    {badge.label}
                                                                                </span>
                                                                            );
                                                                        }
                                                                        return (
                                                                            <span key={tag} className="px-2 py-0.5 bg-slate-50 dark:bg-[var(--surface-tertiary)] rounded text-xs font-medium text-slate-500 dark:text-[var(--ink-tertiary)] border border-slate-100 dark:border-[var(--border-secondary)]">
                                                                                {tag}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                                <div className="flex items-center gap-2 py-3 border-t border-slate-50 dark:border-[var(--border-primary)]">
                                                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${brandingColor}15` }}>👨‍🍳</div>
                                                                    <p className="text-xs font-medium text-slate-400 dark:text-[var(--ink-tertiary)]">Chef&apos;s Special</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )) : !loading ? (
                        /* ═══ Empty State ═══ */
                        <div className="py-16 md:py-24 text-center">
                            <div
                                className="w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: `${brandingColor}15` }}
                            >
                                <span className="text-5xl">{isSoupKitchen ? '🍲' : '🍽️'}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-[var(--ink-primary)] mb-2">
                                Menu Coming Soon
                            </h3>
                            <p className="text-slate-500 dark:text-[var(--ink-tertiary)] text-sm max-w-md mx-auto mb-6">
                                {store.business_name} is preparing something special. Check back soon for our delicious offerings!
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm"
                                    style={{ backgroundColor: brandingColor }}
                                >
                                    🔔
                                </div>
                                <span className="text-sm text-slate-600 dark:text-[var(--ink-secondary)]">
                                    We&apos;ll notify you when the menu is live
                                </span>
                            </div>
                            {store.badges && store.badges.length > 0 && (
                                <div className="mt-8 flex justify-center">
                                    <BadgeList badges={store.badges} />
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Dynamic Kitchen Story Section */}
                    {siteSections.find(s => s.name === 'kitchen_story') ? (() => {
                        const section = siteSections.find(s => s.name === 'kitchen_story');
                        return (
                            <section className="pt-12 border-t border-slate-100 dark:border-[var(--border-primary)]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                    >
                                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-[var(--ink-primary)] mb-4">
                                            {section.title}
                                        </h2>
                                        <p className="text-slate-600 dark:text-[var(--ink-secondary)] leading-relaxed mb-6">
                                            &ldquo;{section.body}&rdquo;
                                        </p>

                                        {section.list_items && section.list_items.length > 0 && (
                                            <div className="space-y-4">
                                                {section.list_items.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 group">
                                                        <div className="w-10 h-10 bg-slate-50 dark:bg-[var(--surface-tertiary)] rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-[var(--ink-primary)] text-sm">{item.title}</p>
                                                            <p className="text-xs text-slate-400 dark:text-[var(--ink-tertiary)]">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.cta_text && (
                                            <Link href={section.cta_link || '#'} className="inline-block mt-6 px-6 py-3 bg-slate-900 dark:bg-[var(--ink-primary)] text-white dark:text-[var(--surface-primary)] rounded-lg font-medium text-sm hover:bg-slate-800 dark:hover:bg-[var(--ink-secondary)] transition-colors">
                                                {section.cta_text}
                                            </Link>
                                        )}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="relative"
                                    >
                                        <div className="aspect-square bg-slate-100 dark:bg-[var(--surface-tertiary)] rounded-2xl overflow-hidden shadow-md group relative">
                                            <img
                                                src={getImageUrl(section.image_url)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt="Kitchen Story"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-6 left-6 text-white">
                                                <p className="text-xs font-medium mb-1 opacity-70">Authentic Heritage</p>
                                                <p className="font-semibold text-lg">Verified Island Hub Kitchen</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </section>
                        );
                    })() : null}

                    {/* Professional Business Profile: Aims & Objectives */}
                    {(store.aims || store.objectives) && (
                        <section className="pt-12 border-t border-slate-100 dark:border-[var(--border-primary)]">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                {store.aims && (
                                    <div className="flex-1 p-6 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center text-lg">🎯</span>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-[var(--ink-primary)]">Strategic Aims</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-[var(--ink-secondary)] leading-relaxed">&ldquo;{store.aims}&rdquo;</p>
                                    </div>
                                )}
                                {store.objectives && (
                                    <div className="flex-1 p-6 bg-slate-50 dark:bg-[var(--surface-secondary)] rounded-xl border border-slate-100 dark:border-[var(--border-primary)]">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center justify-center text-lg">🚀</span>
                                            <h3 className="text-base font-semibold text-slate-900 dark:text-[var(--ink-primary)]">Key Objectives</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-[var(--ink-secondary)] leading-relaxed">&ldquo;{store.objectives}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Integrated Reviews */}
                    <section className="pt-12 border-t border-slate-100 dark:border-[var(--border-primary)]">
                        <ReviewSection vendorId={String(store.id || store.user_id)} />
                    </section>
                </div>

                {/* Info Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Dynamic Exclusive Promotion Card */}
                        {siteSections.find(s => s.name === 'exclusive_promotion') ? (() => {
                            const section = siteSections.find(s => s.name === 'exclusive_promotion');
                            return (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-6 rounded-xl text-white shadow-sm relative overflow-hidden"
                                    style={{
                                        background: `linear-gradient(135deg, ${section.style_config?.from || brandingColor}, ${section.style_config?.to || secondaryColor})`
                                    }}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">Exclusive Promotion</p>
                                    <h3 className="text-xl font-semibold mb-3">
                                        {section.title}
                                    </h3>
                                    <p className="text-sm mb-5 opacity-90 leading-relaxed">
                                        {section.body}
                                    </p>
                                    {section.cta_text && (
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-white text-center rounded-lg font-medium text-sm transition-colors hover:bg-slate-50" style={{ color: brandingColor }}>
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })() : (
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="p-6 rounded-xl text-white shadow-sm relative overflow-hidden"
                                style={{ background: `linear-gradient(135deg, ${brandingColor}, ${secondaryColor})` }}
                            >
                                <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">Current Promotion</p>
                                <h3 className="text-xl font-semibold mb-3">
                                    {store.promo_title || `${store.business_name} Exclusive`}
                                </h3>
                                <p className="text-sm mb-5 opacity-90 leading-relaxed">
                                    {store.promo_text || "Visit us to discover our latest island-inspired specialties and seasonal treats."}
                                </p>
                                <button className="w-full py-3 bg-white rounded-lg font-medium text-sm transition-colors hover:bg-slate-50 active:scale-95" style={{ color: brandingColor }}>
                                    {store.promo_cta_text || 'Learn More'}
                                </button>
                            </motion.div>
                        )}

                        {/* Dynamic Connect Card */}
                        {siteSections.find(s => s.name === 'connect_with_us') ? (() => {
                            const section = siteSections.find(s => s.name === 'connect_with_us');
                            return (
                                <div className="bg-slate-900 dark:bg-[var(--surface-secondary)] p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>

                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-slate-400 dark:text-[var(--ink-tertiary)] text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-slate-200 dark:text-[var(--ink-secondary)]">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {section.cta_text && (
                                        <Link href={section.cta_link || '#'} className="block w-full mt-5 py-3 bg-white text-center rounded-lg font-medium text-sm text-slate-900 hover:bg-slate-100 transition-colors">
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </div>
                            );
                        })() : (
                            <div className="bg-slate-900 dark:bg-[var(--surface-secondary)] p-6 rounded-xl text-white shadow-sm">
                                <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                    Connect With Us
                                </h3>
                                <div className="space-y-4 text-sm">
                                    {store.website_url && (
                                        <a href={store.website_url.startsWith('http') ? store.website_url : `https://${store.website_url}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 items-center group">
                                            <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                                            <div>
                                                <p className="text-slate-400 dark:text-[var(--ink-tertiary)] text-xs mb-0.5">Official Website</p>
                                                <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">Visit Official Site →</p>
                                            </div>
                                        </a>
                                    )}
                                    <div className="flex gap-3 items-start">
                                        <span className="text-xl">📍</span>
                                        <div>
                                            <p className="text-slate-400 dark:text-[var(--ink-tertiary)] text-xs mb-0.5">Location</p>
                                            <p className="font-medium text-slate-200 dark:text-[var(--ink-secondary)]">{store.business_address || store.location || 'Verified Island Merchant'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="text-xl">🕒</span>
                                        <div>
                                            <p className="text-slate-400 dark:text-[var(--ink-tertiary)] text-xs mb-0.5">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <p className="font-medium text-slate-200 dark:text-[var(--ink-secondary)]">Accepting Orders</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="w-full mt-5 py-3 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors active:scale-95">
                                    Get Directions
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <FoodSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                item={selectedItem}
                storeId={store.store_id || store.id}
            />

            {/* Clean Footer */}
            <footer className="bg-slate-50 dark:bg-[var(--surface-secondary)] py-12 border-t border-slate-100 dark:border-[var(--border-primary)]">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-serif mb-3 block text-slate-900 dark:text-[var(--ink-primary)]">IslandHub</Link>
                        <p className="text-slate-500 dark:text-[var(--ink-tertiary)] text-sm max-w-sm">
                            Empowering local island businesses through verified commerce and authentic community hubs.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-[var(--ink-primary)] mb-4">Explore</h4>
                        <nav className="flex flex-col gap-2 text-sm text-slate-500 dark:text-[var(--ink-tertiary)]">
                            <Link href="/food" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Food Hub</Link>
                            <Link href="/listings" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Marketplace</Link>
                            <Link href="/about" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Our Charter</Link>
                        </nav>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 dark:text-[var(--ink-primary)] mb-4">Support</h4>
                        <nav className="flex flex-col gap-2 text-sm text-slate-500 dark:text-[var(--ink-tertiary)]">
                            <a href="#" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Contact Vendor</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Report Issue</a>
                            <a href="#" className="hover:text-slate-900 dark:hover:text-[var(--ink-primary)] transition-colors">Help Center</a>
                        </nav>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 mt-8 border-t border-slate-200 dark:border-[var(--border-secondary)] text-center">
                    <p className="text-xs text-slate-400 dark:text-[var(--ink-tertiary)]">
                        © 2026 {store.business_name} • Secure Island Commerce Protocol
                    </p>
                </div>
            </footer>
        </div>
    );
};


// ----------------------------------------------------------------------
// 🛠️ Service Layout (Consultants, Trades, Wellness)
// Focus: Expertise, trust badges, categorized catalog
// ----------------------------------------------------------------------
