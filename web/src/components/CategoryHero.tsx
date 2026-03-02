'use client';

import { useState, useEffect } from 'react';
import Breadcrumbs from './Breadcrumbs';
import api, { getImageUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryHeroProps {
    icon: string;
    title: string;
    description: string;
    category: string;
    gradient?: string;
    location?: string; // Existing prop for dynamic banner
    pageKey?: string;  // New prop for unified hero assets
}

export default function CategoryHero({
    icon,
    title,
    description,
    category,
    gradient = "from-teal-500 to-teal-700",
    location,
    pageKey
}: CategoryHeroProps) {

    const [banner, setBanner] = useState<any>(null);
    const [heroAsset, setHeroAsset] = useState<any>(null);

    // Fetch hero asset from hero-assets API when pageKey is provided
    useEffect(() => {
        if (pageKey) {
            const fetchHeroAsset = async () => {
                try {
                    const res = await api.get(`/admin/hero-assets/${pageKey}`);
                    if (res.data) {
                        setHeroAsset(res.data);
                    }
                } catch (e) {
                    console.log(`No hero asset found for ${pageKey}`);
                }
            };
            fetchHeroAsset();
        }
    }, [pageKey]);

    // Fallback to promotions API if location is provided (legacy support)
    useEffect(() => {
        if (location && !pageKey) {
            const fetchBanner = async () => {
                try {
                    const res = await api.get(`/promotions/active?location=${location}`);
                    if (res.data && res.data.length > 0) {
                        setBanner(res.data[0]);
                    }
                } catch (e) {
                    console.error('Failed to fetch category banner');
                }
            };
            fetchBanner();
        }
    }, [location, pageKey]);

    // Determine which data source to use
    const assetUrl = heroAsset?.asset_url || null;
    const isVideo = heroAsset?.asset_type === 'video';
    const overlayColor = heroAsset?.overlay_color || '#000000';
    const overlayOpacity = heroAsset?.overlay_opacity !== undefined ? parseFloat(heroAsset.overlay_opacity) : 0.5;

    // Content priority: heroAsset > banner > props
    const displayTitle = heroAsset?.title || banner?.title || title;
    const displaySubtitle = heroAsset?.subtitle || banner?.subtitle || category;
    const displayDescription = heroAsset?.description || banner?.description || description;

    return (
        <div className={`bg-gradient-to-br ${gradient} text-white py-12 md:py-20 px-4 relative overflow-hidden group`}>
            {/* Dynamic Background Asset Layer */}
            {assetUrl && (
                <div className="absolute inset-0 z-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={assetUrl}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0"
                        >
                            {isVideo ? (
                                <video autoPlay loop muted playsInline className="w-full h-full object-cover" src={getImageUrl(assetUrl)} />
                            ) : (
                                <img src={getImageUrl(assetUrl)} alt={displayTitle} className="w-full h-full object-cover" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
                </div>
            )}

            {/* Legacy Banner Image */}
            {!assetUrl && banner?.image_url && (
                <div className="absolute inset-0 opacity-20 z-0">
                    <img src={getImageUrl(banner.image_url)} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[2s]" alt="" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} mix-blend-multiply opacity-80`}></div>
                </div>
            )}

            {/* Abstract Decorative Elements */}
            {!assetUrl && !banner && (
                <>
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
                </>
            )}

            <div className="max-w-7xl mx-auto relative z-10">
                <Breadcrumbs />

                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12 mt-4">
                    <div className="text-7xl md:text-9xl transform hover:scale-110 transition-transform duration-500 cursor-default select-none filter drop-shadow-lg">
                        {heroAsset?.icon_url ? (
                            <img src={getImageUrl(heroAsset.icon_url)} alt="icon" className="w-24 h-24 md:w-32 md:h-32 object-contain" />
                        ) : icon}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            {displaySubtitle}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight drop-shadow-md">
                            {typeof displayTitle === 'string' && displayTitle.includes('*') ? (
                                <span dangerouslySetInnerHTML={{ __html: displayTitle.replace(/\*(.*?)\*/g, '<span class="text-yellow-300 italic">$1</span>') }} />
                            ) : displayTitle}
                        </h1>
                        <p className="text-lg md:text-xl text-white/90 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                            {displayDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
