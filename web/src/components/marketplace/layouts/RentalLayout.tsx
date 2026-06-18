'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ListingCard from '@/components/ListingCard';
import ReviewSection from '@/components/ReviewSection';
import api, { getImageUrl } from '@/lib/api';
import { BadgeList } from '../BadgeSelector';
import React, { useState, useEffect } from 'react';
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
        <div className="bg-surface-elevated min-h-screen">
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
                                className="w-14 h-14 md:w-20 md:h-20 rounded-xl bg-surface-elevated p-1 object-contain shadow-md shrink-0"
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
                            <div className="bg-surface-elevated/5 border border-white/10 p-3 md:p-5 rounded-xl backdrop-blur-md group hover:bg-surface-elevated/10 transition-colors text-center">
                                <span className="text-xl md:text-3xl mb-1 block">🚙</span>
                                <h4 className="text-white font-semibold text-base md:text-xl">Verified</h4>
                                <p className="text-ink-tertiary text-xs">Active Fleet</p>
                            </div>
                            <div className="bg-surface-elevated/5 border border-white/10 p-3 md:p-5 rounded-xl backdrop-blur-md group hover:bg-surface-elevated/10 transition-colors text-center">
                                <span className="text-xl md:text-3xl mb-1 block">🛡️</span>
                                <h4 className="text-white font-semibold text-base md:text-xl">Insured</h4>
                                <p className="text-ink-tertiary text-xs">Safety First</p>
                            </div>
                        </div>
                    </div>
                </HeroBackground>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <PromotionBanner storeId={store.store_id || store.id} />
                <AdSpace spaceName="vendor_store_banner" className="h-20 md:h-28 my-6 rounded-xl overflow-hidden shadow-sm" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                        <div>
                            <h2 className="text-xl md:text-2xl font-semibold text-ink-primary">
                                {store.subtype?.includes('boat') || store.subtype?.includes('sea') ? 'Our Marine Fleet' :
                                    store.subtype?.includes('apartment') || store.subtype?.includes('villa') ? 'Available Stays' :
                                        'Our Current Fleet'}
                            </h2>
                            <p className="text-ink-tertiary text-sm">Select a category to filter the inventory</p>
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
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-border-primary mx-auto"></div>
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
                                    className="group bg-surface-elevated rounded-xl overflow-hidden border border-border-primary hover:shadow-md transition-all flex flex-col h-full cursor-pointer"
                                >
                                    <div className="relative aspect-16/10 overflow-hidden bg-surface-secondary">
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
                                            className="absolute top-3 left-3 bg-surface-elevated/95 backdrop-blur px-3 py-2 rounded-lg shadow-sm space-y-0"
                                            style={{ color: brandingColor }}
                                        >
                                            <p className="text-xs opacity-60">From</p>
                                            <p className="text-lg font-semibold">
                                                ${item.price}
                                                <span className="text-xs text-ink-tertiary ml-1 font-normal">{item.rental_period ? `/ ${item.rental_period.replace('Per ', '')}` : ''}</span>
                                            </p>
                                        </div>
                                        {item.deposit_amount && (
                                            <div className="absolute top-3 right-3 bg-ink-primary/90 backdrop-blur text-white px-2.5 py-1 rounded-lg text-xs font-medium">
                                                + ${item.deposit_amount} Dep.
                                            </div>
                                        )}
                                        {item.price_per_week && (
                                            <div className="absolute bottom-3 left-3 bg-emerald-500/100 text-white px-2.5 py-1 rounded-full text-xs font-medium">
                                                Weekly: ${item.price_per_week}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: `${brandingColor}15`, color: brandingColor }}>Premium Selection</span>
                                        </div>
                                        <h3
                                            className="font-semibold text-lg text-ink-primary mb-2 transition-colors"
                                            style={{ color: hoveredItem?.id === item.id ? brandingColor : undefined }}
                                        >
                                            {item.title}
                                        </h3>
                                        <p className="text-ink-tertiary text-sm leading-relaxed mb-4 flex-1 line-clamp-2">{item.description}</p>

                                        <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-border-primary">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{item.metadata?.seats ? '👤' : '📦'}</span>
                                                <span className="text-xs text-ink-tertiary">
                                                    {item.metadata?.seats ? `${item.metadata.seats} Seats` : item.metadata?.capacity ? `${item.metadata.capacity} Capacity` : 'General Use'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">{item.metadata?.transmission ? '⚙️' : '🏷️'}</span>
                                                <span className="text-xs text-ink-tertiary">
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
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-surface-elevated text-center rounded-lg font-medium text-sm transition-colors hover:bg-surface-secondary" style={{ color: brandingColor }}>
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
                                <div className="bg-ink-primary p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-ink-tertiary text-xs mb-0.5">{item.title}</p>
                                                    <p className="font-medium text-sm text-ink-tertiary">{item.desc}</p>
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
