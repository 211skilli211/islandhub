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
        <div className="bg-white dark:bg-slate-900 min-h-screen">
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
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">Professional {section.section_name.toLowerCase()} for your needs</p>
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
                                                        className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md flex flex-col cursor-pointer"
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
                                                                <span className="bg-slate-900 dark:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium">${service.price}</span>
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
