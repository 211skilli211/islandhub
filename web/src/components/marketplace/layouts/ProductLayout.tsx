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
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface StoreProps {
    store: any;
    listings: any[];
    menuData?: any;
    layoutType?: 'food' | 'service' | 'rental' | 'product';
}

const PLACEHOLDER_LOGO = '/placeholders/logo-placeholder.png';
const PLACEHOLDER_HERO = '/placeholders/food-hero.jpg';

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
        <div className="bg-surface-elevated dark:bg-ink-primary dark:bg-surface-tertiary min-h-screen font-sans">
            
            <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-ink-950">
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
                                className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-surface-elevated p-1 object-contain shadow-md"
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
                                    <span className="bg-emerald-500/10 dark:bg-emerald-900/200 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Eco-Package</span>
                                    <span className="bg-blue-50 dark:bg-blue-900/200 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight">Farm Direct</span>
                                </div>
                            )}
                        </div>
                    </div>
                </HeroBackground>
            </section>

            
            <div id="catalogue" className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
                <PromotionBanner storeId={store.store_id || store.id} />
                <AdSpace spaceName="marketplace_banner" className="h-20 md:h-28 my-6 rounded-xl overflow-hidden shadow-sm" />
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                <div className="lg:col-span-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                        <div>
                            <span className="text-xs font-medium uppercase tracking-wide mb-2 block" style={{ color: brandingColor }}>{store.hero_subtitle?.includes('collection') ? 'Collection' : 'Shop'}</span>
                            <h2 className="text-3xl md:text-4xl font-semibold text-ink-primary dark:text-white">{store.business_name ? `${store.business_name}'s Collection` : 'Our Collection'}</h2>
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
                            <div className="w-10 h-10 border-4 border-border-primary dark:border-border-primary border-t-slate-900 rounded-full animate-spin mx-auto mb-3" />
                            <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Loading Boutique...</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {menu.filter(s => activeTab === 'All' || s.name === activeTab).map((section) => (
                                <div key={section.id}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-px" style={{ backgroundColor: brandingColor }} />
                                        <h4 className="text-sm font-semibold text-ink-primary dark:text-white">{section.name}</h4>
                                        <div className="flex-1 h-px bg-surface-secondary" />
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
                                        <Link href={section.cta_link || '#'} className="block w-full py-3 bg-surface-elevated text-center rounded-lg font-medium text-sm transition-colors hover:bg-surface-secondary dark:bg-surface-tertiary" style={{ color: brandingColor }}>
                                            {section.cta_text}
                                        </Link>
                                    )}
                                </motion.div>
                            );
                        })()}

                        
                        {siteSections.find(s => s.name === 'connect_with_us') && (() => {
                            const section = siteSections.find(s => s.name === 'connect_with_us');
                            return (
                                <div className="bg-ink-primary dark:bg-surface-tertiary p-6 rounded-xl text-white shadow-sm">
                                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full" style={{ backgroundColor: brandingColor }} />
                                        {section.title}
                                    </h3>
                                    <div className="space-y-4">
                                        {section.list_items?.map((item: any, i: number) => (
                                            <div key={i} className="flex gap-3 items-start group">
                                                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                                <div>
                                                    <p className="text-ink-tertiary dark:text-ink-tertiary text-xs mb-0.5">{item.title}</p>
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

            
            <section className="bg-surface-secondary dark:bg-surface-tertiary py-16 md:py-20 border-t border-border-primary dark:border-border-primary">
                <div className="max-w-2xl mx-auto px-4 md:px-6 text-center">
                    <EmojiIcon emoji="📩" size={28} className="text-3xl mb-4 block" />
                    <h2 className="text-2xl md:text-3xl font-semibold text-ink-primary dark:text-white mb-3">Join The Pulse Club</h2>
                    <p className="text-ink-tertiary dark:text-ink-tertiary dark:text-ink-tertiary mb-8">Get early access to drops, smart tech updates, and exclusive island styling tips.</p>
                    <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 px-4 py-3 rounded-lg border border-border-primary dark:border-border-primary focus:ring-2 focus:ring-offset-1 outline-none transition-all text-sm"
                            style={{ '--tw-ring-color': brandingColor } as React.CSSProperties}
                        />
                        <button
                            className="px-6 py-3 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
                            style={{ backgroundColor: brandingColor }}
                        >
                            Start
                        </button>
                    </div>
                </div>
            </section>

            
            <footer className="py-12 md:py-16 border-t border-border-primary dark:border-border-primary">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h4 className="text-xl font-semibold mb-4" style={{ color: brandingColor }}><EmojiIcon emoji="🏝️" size={20} /> {store.business_name}</h4>
                            <p className="text-ink-tertiary dark:text-ink-tertiary dark:text-ink-tertiary text-sm max-w-sm mb-6 leading-relaxed">
                                {store.bio || "Hand-picked local products that embody the spirit of paradise. Quality, sustainable, and authentic."}
                            </p>
                            <div className="flex gap-3">
                                {['fb', 'ig', 'tw', 'wa'].map(sm => (
                                    <div key={sm} className="w-9 h-9 rounded-lg bg-surface-secondary dark:bg-surface-tertiary border border-border-primary dark:border-border-primary flex items-center justify-center text-ink-tertiary dark:text-ink-tertiary hover:text-ink-secondary dark:text-ink-tertiary hover:bg-surface-secondary transition-all cursor-pointer text-xs font-medium uppercase">
                                        {sm}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-ink-primary dark:text-white mb-4">Boutique Services</h5>
                            <ul className="space-y-2 text-sm text-ink-tertiary dark:text-ink-tertiary dark:text-ink-tertiary">
                                <li className="hover:text-ink-secondary cursor-pointer transition-colors">Size Guides</li>
                                <li className="hover:text-ink-secondary cursor-pointer transition-colors">Smart Tech Setup</li>
                                <li className="hover:text-ink-secondary cursor-pointer transition-colors">Eco-Returns</li>
                                <li className="hover:text-ink-secondary cursor-pointer transition-colors">Island Shipping</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-xs font-semibold uppercase tracking-wide text-ink-primary dark:text-white mb-4">Pulse Payments</h5>
                            <div className="grid grid-cols-2 gap-2 opacity-40 grayscale">
                                <div className="h-6 bg-surface-secondary rounded" />
                                <div className="h-6 bg-surface-secondary rounded" />
                                <div className="h-6 bg-surface-secondary rounded" />
                                <div className="h-6 bg-surface-secondary rounded" />
                            </div>
                            <p className="text-xs text-ink-tertiary mt-4">Encrypted & Secure</p>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-border-primary dark:border-border-primary flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">
                            © 2024 {store.business_name}. Verified Hub Merchant.
                        </p>
                        <div className="flex gap-6 text-xs text-ink-tertiary dark:text-ink-tertiary">
                            <a href="#" className="hover:text-ink-secondary transition-colors">Terms</a>
                            <a href="#" className="hover:text-ink-secondary transition-colors">Privacy</a>
            <a href="#" className="hover:text-ink-secondary transition-colors">License</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

