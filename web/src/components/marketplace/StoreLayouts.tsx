'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewSection from '@/components/ReviewSection';
import api, { getImageUrl } from '@/lib/api';
import { BadgeList } from './BadgeSelector';
import React, { useState, useEffect } from 'react';
import KitchenSidebar from './KitchenSidebar';
import FoodSelectionModal from './FoodSelectionModal';
import ServiceBookingModal from './ServiceBookingModal';
import HeroBackground from '@/components/HeroBackground';
import PromotionBanner from '@/components/advertising/PromotionBanner';
import AdSpace from '@/components/advertising/AdSpace';

// Shared interfaces
interface StoreProps {
    store: any;
    listings: any[];
    menuData?: any;
}

const PLACEHOLDER_LOGO = '/placeholders/logo-placeholder.png';
const PLACEHOLDER_HERO = '/placeholders/food-hero.jpg';

// Custom Hook for fetching store-specific sections
const useStoreSections = (storeId: number | string) => {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await api.get(`/homepage?storeId=${storeId}`);
                setSections(res.data || []);
            } catch (e) {
                console.error('Failed to fetch store sections:', e);
            } finally {
                setLoading(false);
            }
        };
        if (storeId) fetchSections();
    }, [storeId]);

    return { sections, loading };
};

// ----------------------------------------------------------------------
// 🍔 Food Shop Layout (Restaurants, Cafes)
// Focus: Menu items, appetizing imagery, warm details
// ----------------------------------------------------------------------
export const FoodShopLayout = ({ store, listings }: StoreProps) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isSoupKitchen = store.slug === 'soup-kitchen' || store.subtype?.includes('community') || store.business_name.toLowerCase().includes('soup');
    const brandingColor = store.branding_color || '#14b8a6';
    const secondaryColor = store.secondary_color || '#0f172a';

    const { sections: siteSections } = useStoreSections(store.store_id || store.id);

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

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Kitchen Hub Toggle */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed right-6 top-28 z-50 p-3 bg-slate-900 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all group flex items-center gap-2 border-2 border-white"
                title="Open Kitchen Hub"
            >
                <span className="text-lg">👨‍🍳</span>
                <span className="text-xs font-medium hidden group-hover:inline pr-1">Kitchen Hub</span>
            </button>

            <KitchenSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                listingTitle={store.business_name}
                storeId={store.store_id || store.id}
            />

            {/* Elegant Restaurant Hero */}
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

            {/* Menu Filters */}
            <div id="menu" className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-slate-100 py-4">
                <div className="max-w-7xl mx-auto px-4 md:px-6 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 min-w-max">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all"
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
                                <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                                    {section.name}
                                </h2>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {section.items?.map((item: any, idx: number) => (
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
                                            className={`relative bg-white p-4 rounded-xl border ${isSoupKitchen ? 'border-amber-100 hover:border-amber-200' : 'border-slate-100 hover:border-slate-200'} group-hover:shadow-sm transition-all flex gap-4`}
                                        >
                                            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0late-50 rounded-lg overflow-hidden">
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
                                                    <h3 className="font-semibold text-slate-900 text-sm md:text-base group-hover:text-slate-700 transition-colors truncate">{item.name}</h3>
                                                    <div className="text-right shrink-0">
                                                        <span
                                                            className="font-medium text-white px-2 py-0.5 rounded text-xs"
                                                            style={{ backgroundColor: brandingColor }}
                                                        >
                                                            ${item.price}
                                                        </span>
                                                        {item.donation_suggested && (
                                                            <p className="text-xs text-slate-500 mt-0.5">Suggested</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-slate-500 text-xs leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                                                <div className="text-xs font-medium" style={{ color: brandingColor }}>
                                                    {item.donation_suggested ? 'Donate & Order →' : '+ Add to Selection'}
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
                                                    <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                                                        <div className="h-32 relative bg-slate-100">
                                                            {item.image_url ? (
                                                                <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-3xl">{isSoupKitchen ? '🍲' : '🥘'}</div>
                                                            )}
                                                            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg font-semibold text-sm text-slate-900 shadow-sm">
                                                                ${item.price}
                                                            </div>
                                                        </div>
                                                        <div className="p-5">
                                                            <h4 className="text-base font-semibold text-slate-900 mb-2">{item.name}</h4>
                                                            <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                                                {item.description || "The finest island ingredients prepared with tradition and care."}
                                                            </p>
                                                            <div className="flex flex-wrap gap-1.5 mb-3">
                                                                {['Organic', 'Local', 'Artisan'].map(tag => (
                                                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 rounded text-xs font-medium text-slate-500 border border-slate-100">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-2 py-3 border-t border-slate-50">
                                                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: `${brandingColor}15` }}>👨‍🍳</div>
                                                                <p className="text-xs font-medium text-slate-400">Chef&apos;s Special</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )) : !loading ? (
                        <div className="py-20 text-center">
                            <span className="text-5xl mb-4 block">🍽️</span>
                            <h3 className="text-lg font-medium text-slate-600">No specialties in this section yet</h3>
                        </div>
                    ) : null}

                    {/* Dynamic Kitchen Story Section */}
                    {siteSections.find(s => s.name === 'kitchen_story') ? (() => {
                        const section = siteSections.find(s => s.name === 'kitchen_story');
                        return (
                            <section className="pt-12 border-t border-slate-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                    >
                                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-4">
                                            {section.title}
                                        </h2>
                                        <p className="text-slate-600 leading-relaxed mb-6">
                                            &ldquo;{section.body}&rdquo;
                                        </p>

                                        {section.list_items && section.list_items.length > 0 && (
                                            <div className="space-y-4">
                                                {section.list_items.map((item: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-4 group">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                                                            <p className="text-xs text-slate-400">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {section.cta_text && (
                                            <Link href={section.cta_link || '#'} className="inline-block mt-6 px-6 py-3 bg-slate-900 text-white rounded-lg font-medium text-sm hover:bg-slate-800 transition-colors">
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
                                        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden shadow-md group relative">
                                            <img
                                                src={getImageUrl(section.image_url)}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt="Kitchen Story"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
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
                        <section className="pt-12 border-t border-slate-100">
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                                {store.aims && (
                                    <div className="flex-1 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center text-lg">🎯</span>
                                            <h3 className="text-base font-semibold text-slate-900">Strategic Aims</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">&ldquo;{store.aims}&rdquo;</p>
                                    </div>
                                )}
                                {store.objectives && (
                                    <div className="flex-1 p-6 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center text-lg">🚀</span>
                                            <h3 className="text-base font-semibold text-slate-900">Key Objectives</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed">&ldquo;{store.objectives}&rdquo;</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Integrated Reviews */}
                    <section className="pt-12 border-t border-slate-100">
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
                                <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>

                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-slate-400 text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-slate-200">{item.desc}</p>
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
                            <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm">
                                <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                                    <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                    Connect With Us
                                </h3>
                                <div className="space-y-4 text-sm">
                                    {store.website_url && (
                                        <a href={store.website_url.startsWith('http') ? store.website_url : `https://${store.website_url}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 items-center group">
                                            <span className="text-xl group-hover:scale-110 transition-transform">🌐</span>
                                            <div>
                                                <p className="text-slate-400 text-xs mb-0.5">Official Website</p>
                                                <p className="font-medium text-white group-hover:text-indigo-400 transition-colors">Visit Official Site →</p>
                                            </div>
                                        </a>
                                    )}
                                    <div className="flex gap-3 items-start">
                                        <span className="text-xl">📍</span>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-0.5">Location</p>
                                            <p className="font-medium text-slate-200">{store.business_address || store.location || 'Verified Island Merchant'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 items-start">
                                        <span className="text-xl">🕒</span>
                                        <div>
                                            <p className="text-slate-400 text-xs mb-0.5">Status</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                <p className="font-medium text-slate-200">Accepting Orders</p>
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
            <footer className="bg-slate-50 py-12 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    <div className="md:col-span-2">
                        <Link href="/" className="text-2xl font-serif mb-3 block">IslandHub</Link>
                        <p className="text-slate-500 text-sm max-w-sm">
                            Empowering local island businesses through verified commerce and authentic community hubs.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Explore</h4>
                        <nav className="flex flex-col gap-2 text-sm text-slate-500">
                            <Link href="/food" className="hover:text-slate-900 transition-colors">Food Hub</Link>
                            <Link href="/listings" className="hover:text-slate-900 transition-colors">Marketplace</Link>
                            <Link href="/about" className="hover:text-slate-900 transition-colors">Our Charter</Link>
                        </nav>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Support</h4>
                        <nav className="flex flex-col gap-2 text-sm text-slate-500">
                            <a href="#" className="hover:text-slate-900 transition-colors">Contact Vendor</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Report Issue</a>
                            <a href="#" className="hover:text-slate-900 transition-colors">Help Center</a>
                        </nav>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 mt-8 border-t border-slate-200 text-center">
                    <p className="text-xs text-slate-400">
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
export const ServiceLayout = ({ store, listings }: StoreProps) => {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const brandingColor = store.branding_color || '#14b8a6';
    const secondaryColor = store.secondary_color || '#312e81';

    const { sections: siteSections } = useStoreSections(store.store_id || store.id);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const targetStoreId = store.store_id || store.id;
                const menuRes = await api.get(`/menu?storeId=${targetStoreId}`);
                if (menuRes.data?.sections && menuRes.data.sections.length > 0) {
                    const normalized = menuRes.data.sections.map((section: any, idx: number) => ({
                        section_id: section.id,
                        section_name: section.name,
                        priority: idx + 1,
                        items: (section.items || []).map((item: any) => ({
                            service_id: item.id,
                            service_name: item.name,
                            description: item.description,
                            price: item.price,
                            image_url: item.image_url,
                            duration: item.duration,
                            badges: item.badges || [],
                            faqs: item.faqs || []
                        }))
                    }));
                    setSections(normalized);
                } else if (listings.length > 0) {
                    setSections([]);
                }
            } catch (e) {
                console.error('Failed to fetch services menu:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [store.store_id, store.id, listings]);

    return (
        <div className="bg-white min-h-screen">
            {/* Service Hero */}
            <div className="relative pt-20 pb-16 overflow-hidden bg-slate-50 min-h-[400px] flex items-center">
                <HeroBackground
                    overrideData={{
                        asset_url: store.banner_url || undefined,
                        title: store.hero_title || store.business_name || "Professional Services",
                        subtitle: store.hero_subtitle || store.bio || "Excellence and expertise delivered to your doorstep.",
                        cta_text: store.hero_cta_text || "Explore Services",
                        cta_link: store.hero_cta_link || "#catalog",
                        typography: store.typography,
                        icon_url: store.hero_icon_url || store.branding_icon_url,
                        overlay_opacity: 0.1,
                        overlay_color: '#ffffff',
                        branding_color: brandingColor
                    }}
                >
                    <div className="mt-8 flex flex-col lg:flex-row items-center gap-8 pointer-events-auto">
                        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-4">
                            <img
                                src={store.logo_url ? getImageUrl(store.logo_url) : getImageUrl(PLACEHOLDER_LOGO)}
                                className="w-20 h-20 rounded-xl bg-white p-1.5 object-contain shadow-md border border-slate-100"
                                alt="Logo"
                            />
                            <div className="text-center lg:text-left">
                                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${brandingColor}15`, color: brandingColor }}>Verified</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${brandingColor}15`, color: brandingColor }}>Professional</span>
                                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-medium">Local Expert</span>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full"
                        >
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">✅</span>
                                <h4 className="text-xl font-semibold text-slate-900">100%</h4>
                                <p className="text-xs text-slate-400">Satisfaction</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">🛡️</span>
                                <h4 className="text-xl font-semibold text-slate-900">Verified</h4>
                                <p className="text-xs text-slate-400">Professional</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">🏆</span>
                                <h4 className="text-xl font-semibold text-slate-900">5+ Yrs</h4>
                                <p className="text-xs text-slate-400">Experience</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                                <span className="text-2xl mb-2">⭐</span>
                                <h4 className="text-xl font-semibold text-slate-900">4.9/5</h4>
                                <p className="text-xs text-slate-400">Avg Rating</p>
                            </div>
                        </motion.div>
                    </div>
                </HeroBackground>
            </div>

            {/* Service Catalogue */}
            <div id="catalog" className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
                <PromotionBanner storeId={store.store_id || store.id} />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {sections.length > 0 ? (
                                sections.map((section: any) => (
                                    <section key={section.section_id}>
                                        <div className="flex items-end justify-between mb-6 border-b border-slate-100 pb-4">
                                            <div>
                                                <h2 className="text-xl font-semibold text-slate-900">{section.section_name}</h2>
                                                <p className="text-slate-500 text-sm">Professional {section.section_name.toLowerCase()} for your needs</p>
                                            </div>
                                            <span className="text-xs text-slate-400">Section {section.priority}</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            {section.items.map((service: any) => (
                                                <div key={service.service_id} className="relative">
                                                    <motion.div
                                                        whileHover={{ y: -3 }}
                                                        onClick={() => {
                                                            if (service.listing_id || service.service_id) {
                                                                window.location.href = `/listings/${service.listing_id || service.service_id}`;
                                                            } else {
                                                                setSelectedService(service);
                                                                setIsBookingModalOpen(true);
                                                            }
                                                        }}
                                                        className="group bg-white rounded-xl border border-slate-100 overflow-hidden transition-all hover:shadow-md flex flex-col cursor-pointer"
                                                    >
                                                        <div className="relative h-40 bg-slate-100">
                                                            {service.image_url ? (
                                                                <img src={getImageUrl(service.image_url)} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" alt={service.service_name} />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-50 font-semibold text-slate-300">
                                                                    {service.service_name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-5 flex-1 flex flex-col">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h3 className="text-base font-semibold text-slate-900">{service.service_name}</h3>
                                                                <span className="bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs font-medium">${service.price}</span>
                                                            </div>
                                                            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">{service.description}</p>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))
                            ) : listings.length > 0 ? (
                                <section>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        {listings.map((item) => (
                                            <ListingCard key={item.id} listing={item} />
                                        ))}
                                    </div>
                                </section>
                            ) : (
                                <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <h3 className="text-lg font-medium text-slate-600">No items found</h3>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Dynamic Exclusive Promotion Card */}
                        {siteSections.find(s => s.name === 'exclusive_promotion') && (() => {
                            const section = siteSections.find(s => s.name === 'exclusive_promotion');
                            return (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-6 rounded-xl text-white shadow-sm relative overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${section.style_config?.from || brandingColor}, ${section.style_config?.to || secondaryColor})` }}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">Exclusive Promotion</p>
                                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                                    <p className="text-sm mb-5 opacity-90 leading-relaxed">{section.body}</p>
                                    {section.cta_text && (
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-white text-center rounded-lg font-medium text-sm transition-colors hover:bg-slate-50" style={{ color: brandingColor }}>
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })()}

                        {/* Dynamic Connect Card */}
                        {siteSections.find(s => s.name === 'connect_with_us') && (() => {
                            const section = siteSections.find(s => s.name === 'connect_with_us');
                            return (
                                <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-slate-400 text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-slate-200">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <ServiceBookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                service={selectedService}
                storeId={store.store_id || store.id}
            />

            <footer className="bg-slate-900 py-12 text-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-semibold mb-1">{store.business_name}</h2>
                        <p className="text-slate-400 text-sm max-w-sm">
                            Committed to delivering professional excellence and building trust through quality service.
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="text-right hidden md:block">
                            <p className="text-xs text-slate-500 mb-0.5">Ready to book?</p>
                            <p className="text-sm font-medium">Secure your session today</p>
                        </div>
                        <button
                            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-6 py-3 bg-white text-slate-900 rounded-lg font-medium text-sm hover:bg-slate-100 active:scale-95 transition-all"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};


// ----------------------------------------------------------------------
// 🚙 Rental Layout (Cars, Stays)
// Focus: Availability, specs, high-res gallery
// ----------------------------------------------------------------------
export const RentalLayout = ({ store, listings }: StoreProps) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [menu, setMenu] = useState<any[]>([]);
    const [hoveredItem, setHoveredItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const brandingColor = store.branding_color || '#14b8a6';
    const secondaryColor = store.secondary_color || '#0f172a';

    const { sections: siteSections } = useStoreSections(store.store_id || store.id);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const targetStoreId = store.store_id || store.id;
                const res = await api.get(`/menu?storeId=${targetStoreId}`);
                if (res.data?.sections) {
                    setMenu(res.data.sections);
                }
            } catch (e) {
                console.error('Failed to fetch rental menu:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, [store.store_id, store.id]);

    const filteredListings = activeFilter === 'All'
        ? listings
        : listings.filter(item =>
            item.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
            item.description.toLowerCase().includes(activeFilter.toLowerCase())
        );

    const allItems = menu.length > 0
        ? menu.flatMap(s => s.items).map(item => ({
            ...item,
            id: item.id || item.item_id,
            title: item.name || item.item_name,
            images: [item.image_url],
            type: 'rental'
        }))
        : filteredListings;

    return (
        <div className="bg-white min-h-screen">
            {/* Fleet Hero - Pro Rental Look */}
            <div className="relative min-h-[60vh] w-full overflow-hidden flex items-center">
                <HeroBackground
                    overrideData={{
                        asset_url: store.banner_url || undefined,
                        title: store.hero_title || store.business_name || "Premium Island Rentals",
                        subtitle: store.hero_subtitle || store.bio || "High-quality gear and vehicles for your next adventure.",
                        cta_text: store.hero_cta_text || "Explore Fleet",
                        cta_link: store.hero_cta_link || "#fleet",
                        typography: store.typography,
                        icon_url: store.hero_icon_url || store.branding_icon_url,
                        overlay_opacity: 0.5,
                        overlay_color: '#0f172a',
                        branding_color: brandingColor
                    }}
                >
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 pointer-events-auto w-full mt-4 md:mt-8">
                        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 bg-black/30 backdrop-blur-md p-4 md:p-5 rounded-xl border border-white/10 w-full md:w-fit text-center md:text-left">
                            <img
                                src={store.logo_url ? getImageUrl(store.logo_url) : getImageUrl(PLACEHOLDER_LOGO)}
                                className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-white p-1 object-contain shadow-md shrink-0"
                                alt="Logo"
                            />
                            <div>
                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                    <span className="font-medium text-xs" style={{ color: brandingColor }}>
                                        {store.subtype || 'Island Rental'}
                                    </span>
                                    <div className="flex justify-center md:justify-start">
                                        <BadgeList badges={store.badges || ['Verified Merchant', 'Quality Fleet', 'Insured']} />
                                    </div>
                                </div>
                                <div className="hidden md:block mt-2 text-white/60 text-xs">
                                    📍 {store.location || 'St. Kitts'} • Registered Rental Operator
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:gap-4 w-full md:w-auto">
                            <div className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl backdrop-blur-md group hover:bg-white/10 transition-colors text-center">
                                <span className="text-xl md:text-3xl mb-1 block">🚙</span>
                                <h4 className="text-white font-semibold text-base md:text-xl">Verified</h4>
                                <p className="text-slate-400 text-xs">Active Fleet</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl backdrop-blur-md group hover:bg-white/10 transition-colors text-center">
                                <span className="text-xl md:text-3xl mb-1 block">🛡️</span>
                                <h4 className="text-white font-semibold text-base md:text-xl">Insured</h4>
                                <p className="text-slate-400 text-xs">Safety First</p>
                            </div>
                        </div>
                    </div>
                </HeroBackground>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <PromotionBanner storeId={store.store_id || store.id} />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-semibold text-slate-900">
                                {store.subtype?.includes('boat') || store.subtype?.includes('sea') ? 'Our Marine Fleet' :
                                    store.subtype?.includes('apartment') || store.subtype?.includes('villa') ? 'Available Stays' :
                                        'Our Current Fleet'}
                            </h2>
                            <p className="text-slate-500 text-sm">Select a category to filter the inventory</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {(store.subtype?.toLowerCase().includes('boat') || store.subtype?.toLowerCase().includes('sea')
                                ? ['All', 'Boat', 'Jet Ski', 'Tour']
                                : store.subtype?.toLowerCase().includes('apartment') || store.subtype?.toLowerCase().includes('villa')
                                    ? ['All', 'Villa', 'Apartment', 'Studio']
                                    : ['All', 'SUV', 'Economy', 'ATV']
                            ).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: f === activeFilter ? brandingColor : '#f8fafc',
                                        color: f === activeFilter ? 'white' : '#64748b'
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {loading && menu.length === 0 ? (
                            <div className="col-span-full py-16 text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto"></div>
                            </div>
                        ) : allItems.map((item, idx) => (
                            <div key={item.id} className="relative">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    onMouseEnter={() => setHoveredItem(item)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className="group bg-white rounded-xl overflow-hidden border border-slate-100 hover:shadow-md transition-all flex flex-col h-full cursor-pointer"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                                        {item.images && item.images.length > 0 ? (
                                            <img
                                                src={getImageUrl(item.images[0])}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                alt={item.title}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-5xl">🏎️</div>
                                        )}
                                        <div
                                            className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-sm space-y-0"
                                            style={{ color: brandingColor }}
                                        >
                                            <p className="text-xs opacity-60">From</p>
                                            <p className="text-lg font-semibold">
                                                ${item.price}
                                                <span className="text-xs text-slate-400 ml-1 font-normal">{item.rental_period ? `/ ${item.rental_period.replace('Per ', '')}` : ''}</span>
                                            </p>
                                        </div>
                                        {item.deposit_amount && (
                                            <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                                                + ${item.deposit_amount} Dep.
                                            </div>
                                        )}
                                        {item.price_per_week && (
                                            <div className="absolute bottom-3 left-3 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                                Weekly: ${item.price_per_week}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandingColor}15`, color: brandingColor }}>Premium Selection</span>
                                        </div>
                                        <h3
                                            className="font-semibold text-lg text-slate-900 mb-2 transition-colors"
                                            style={{ color: hoveredItem?.id === item.id ? brandingColor : undefined }}
                                        >
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{item.description}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{item.metadata?.seats ? '👤' : '📦'}</span>
                                                <span className="text-xs text-slate-500">
                                                    {item.metadata?.seats ? `${item.metadata.seats} Seats` : item.metadata?.capacity ? `${item.metadata.capacity} Capacity` : 'General Use'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{item.metadata?.transmission ? '⚙️' : '🏷️'}</span>
                                                <span className="text-xs text-slate-500">
                                                    {item.metadata?.transmission || item.metadata?.condition || 'Standard'}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/listings/${item.id}`}
                                            className="w-full py-3 text-white font-medium text-sm rounded-lg transition-all text-center"
                                            style={{ backgroundColor: brandingColor }}
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Dynamic Exclusive Promotion Card */}
                        {siteSections.find(s => s.name === 'exclusive_promotion') && (() => {
                            const section = siteSections.find(s => s.name === 'exclusive_promotion');
                            return (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-6 rounded-xl text-white shadow-sm relative overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${section.style_config?.from || brandingColor}, ${section.style_config?.to || secondaryColor})` }}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">Exclusive Promotion</p>
                                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                                    <p className="text-sm mb-5 opacity-90 leading-relaxed">{section.body}</p>
                                    {section.cta_text && (
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-white text-center rounded-lg font-medium text-sm transition-colors hover:bg-slate-50" style={{ color: brandingColor }}>
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })()}

                        {/* Dynamic Connect Card */}
                        {siteSections.find(s => s.name === 'connect_with_us') && (() => {
                            const section = siteSections.find(s => s.name === 'connect_with_us');
                            return (
                                <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-slate-400 text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-slate-200">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};



// ----------------------------------------------------------------------
// 📦 Default / Product Layout (Shops)
// Focus: Grid, filters, cart
// ----------------------------------------------------------------------
export const ProductLayout = ({ store, listings }: StoreProps) => {
    const [menu, setMenu] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');

    const brandingColor = store.branding_color || '#14b8a6';
    const secondaryColor = store.secondary_color || '#0f172a';

    const { sections: siteSections } = useStoreSections(store.store_id || store.id);

    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                const targetStoreId = store.store_id || store.id;
                const res = await api.get(`/menu?storeId=${targetStoreId}`);
                if (res.data?.sections) {
                    setMenu(res.data.sections);
                }
            } catch (e) {
                console.error('Failed to fetch catalogue:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchCatalogue();
    }, [store.store_id, store.id]);

    const categories = ['All', ...menu.map(s => s.name)];

    const sortedListings = [...listings].sort((a, b) => b.id - a.id);

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* Premium Lifestyle Hero */}
            <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-slate-950">
                <HeroBackground
                    overrideData={{
                        asset_url: store.banner_url,
                        title: store.hero_title || store.business_name || "Quality Island Goods",
                        subtitle: store.hero_subtitle || store.bio || "Hand-picked products that embody the spirit of paradise.",
                        cta_text: store.hero_cta_text || "Shop Collection",
                        cta_link: store.hero_cta_link || "#catalogue",
                        cta2_text: store.hero_cta2_text,
                        cta2_link: store.hero_cta2_link,
                        typography: store.typography,
                        icon_url: store.hero_icon_url || store.branding_icon_url,
                        overlay_opacity: 0.5,
                        overlay_color: '#020617',
                        branding_color: brandingColor
                    }}
                >
                    <div className="mt-6 pointer-events-auto flex flex-wrap items-center gap-3">
                        {store.logo_url && (
                            <img
                                src={getImageUrl(store.logo_url)}
                                alt={store.business_name}
                                className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white p-1 object-contain shadow-md"
                            />
                        )}
                        <div className="flex flex-col gap-1.5">
                            <span
                                className="inline-block px-3 py-1 border rounded-lg text-xs font-medium"
                                style={{ backgroundColor: `${brandingColor}15`, borderColor: `${brandingColor}30`, color: brandingColor }}
                            >
                                {store.template_id === 'retail_produce' ? 'Island Fresh' : 'Verified Merchant'}
                            </span>
                            {store.badges && <BadgeList badges={store.badges} />}
                            {store.template_id === 'retail_produce' && (
                                <div className="mt-2 flex gap-2">
                                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Eco-Package</span>
                                    <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Farm Direct</span>
                                </div>
                            )}
                        </div>
                    </div>
                </HeroBackground>
            </section>

            {/* Featured Categories (Catalogue) */}
            <div id="catalogue" className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
                <PromotionBanner storeId={store.store_id || store.id} />
                <AdSpace spaceName="marketplace_banner" className="h-20 md:h-28 my-6 rounded-xl overflow-hidden shadow-sm" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: brandingColor }}>{store.hero_subtitle?.includes('collection') ? 'Collection' : 'Shop'}</span>
                            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">{store.business_name ? `${store.business_name}'s Collection` : 'Our Collection'}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveTab(cat)}
                                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all border"
                                    style={{
                                        backgroundColor: activeTab === cat ? brandingColor : 'transparent',
                                        borderColor: activeTab === cat ? brandingColor : '#e2e8f0',
                                        color: activeTab === cat ? 'white' : '#64748b'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs text-slate-400">Loading Boutique...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {menu.filter(s => activeTab === 'All' || s.name === activeTab).map((section) => (
                                <div key={section.id}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-px" style={{ backgroundColor: brandingColor }} />
                                        <h4 className="text-sm font-semibold text-slate-900">{section.name}</h4>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                        {section.items?.map((item: any, idx: number) => {
                                            const fullListing = listings.find(l => l.id === item.listing_id) || {
                                                id: item.listing_id || item.id,
                                                title: item.item_name,
                                                description: item.description,
                                                price: item.price,
                                                image_url: item.image_url,
                                                category: store.category,
                                                type: 'product'
                                            };
                                            return (
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: idx * 0.05 }}
                                                >
                                                    <ListingCard listing={fullListing} />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {menu.length === 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                    {sortedListings.map((item, idx) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <ListingCard listing={item} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="sticky top-24 space-y-6">
                        {/* Dynamic Exclusive Promotion Card */}
                        {siteSections.find(s => s.name === 'exclusive_promotion') && (() => {
                            const section = siteSections.find(s => s.name === 'exclusive_promotion');
                            return (
                                <motion.div
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="p-6 rounded-xl text-white shadow-sm relative overflow-hidden"
                                    style={{ background: `linear-gradient(135deg, ${section.style_config?.from || brandingColor}, ${section.style_config?.to || secondaryColor})` }}
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide mb-2 opacity-80">Exclusive Promotion</p>
                                    <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                                    <p className="text-sm mb-5 opacity-90 leading-relaxed">{section.body}</p>
                                    {section.cta_text && (
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-white text-center rounded-lg font-medium text-sm transition-colors hover:bg-slate-50" style={{ color: brandingColor }}>
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })()}

                        {/* Dynamic Connect Card */}
                        {siteSections.find(s => s.name === 'connect_with_us') && (() => {
                            const section = siteSections.find(s => s.name === 'connect_with_us');
                            return (
                                <div className="bg-slate-900 p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-slate-400 text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-slate-200">{item.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Newsletter & Loyalty */}
            <section className="bg-slate-50 py-16 md:py-20 border-t border-slate-100">
                <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
                    <span className="text-3xl mb-4 block">📩</span>
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">Join The Pulse Club</h2>
                    <p className="text-slate-500 mb-8">Get early access to drops, smart tech updates, and exclusive island styling tips.</p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-offset-1 outline-none transition-all text-sm"
                            style={{ '--tw-ring-color': brandingColor } as any}
                        />
                        <button
                            className="px-6 py-3 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
                            style={{ backgroundColor: brandingColor }}
                        >
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            {/* Clean Footer */}
            <footer className="py-12 md:py-16 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-xl font-semibold mb-4" style={{ color: brandingColor }}>🏝️ {store.business_name}</h4>
                            <p className="text-slate-500 text-sm max-w-sm mb-6 leading-relaxed">
                                {store.bio || "Hand-picked local products that embody the spirit of paradise. Quality, sustainable, and authentic."}
                            </p>
                            <div className="flex gap-3">
                                {['fb', 'ig', 'tw', 'wa'].map(sm => (
                                    <div key={sm} className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer text-xs font-medium uppercase">
                                        {sm}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Boutique Services</h5>
                            <ul className="space-y-2 text-sm text-slate-500">
                                <li className="hover:text-slate-700 cursor-pointer transition-colors">Size Guides</li>
                                <li className="hover:text-slate-700 cursor-pointer transition-colors">Smart Tech Setup</li>
                                <li className="hover:text-slate-700 cursor-pointer transition-colors">Eco-Returns</li>
                                <li className="hover:text-slate-700 cursor-pointer transition-colors">Island Shipping</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-slate-900 mb-4">Pulse Payments</h5>
                            <div className="grid grid-cols-2 gap-2 opacity-40 grayscale">
                                <div className="h-6 bg-slate-100 rounded" />
                                <div className="h-6 bg-slate-100 rounded" />
                                <div className="h-6 bg-slate-100 rounded" />
                                <div className="h-6 bg-slate-100 rounded" />
                            </div>
                            <p className="text-xs text-slate-300 mt-4">Encrypted & Secure</p>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-slate-400">
                            © 2024 {store.business_name}. Verified Hub Merchant.
                        </p>
                        <div className="flex gap-6 text-xs text-slate-400">
                            <a href="#" className="hover:text-slate-700 transition-colors">Terms</a>
                            <a href="#" className="hover:text-slate-700 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-slate-700 transition-colors">License</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
