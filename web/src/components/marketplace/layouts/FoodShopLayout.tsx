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

interface StoreProps {
    store: any;
    listings: any[];
    menuData?: any;
    layoutType?: 'food' | 'service' | 'rental' | 'product';
}

const PLACEHOLDER_LOGO = '/placeholders/logo-placeholder.png';
const PLACEHOLDER_HERO = '/placeholders/food-hero.jpg';

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
