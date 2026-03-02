'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface FloatingBannerProps {
    location: string;
}

export default function FloatingBanner({ location }: FloatingBannerProps) {
    const [banner, setBanner] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const fetchBanner = async () => {
            try {
                // Get current page from pathname
                const currentPath = window.location.pathname;
                const pageKey = currentPath.split('/')[1] || 'home';

                // Check if user has dismissed this banner in this session
                const dismissedKey = `banner_dismissed_${pageKey}`;
                if (sessionStorage.getItem(dismissedKey)) {
                    return;
                }

                // Fetch active banners from backend
                const response = await api.get('/promotions/active', {
                    params: { location: `${pageKey}_floating,global` }
                });

                const data = response.data;

                if (Array.isArray(data) && data.length > 0) {
                    // Filter for floating mode
                    const floatingBanners = data.filter((b: any) => b.mobile_mode === 'floating');

                    // Prioritize match for current page key
                    const bestMatch = floatingBanners.find((b: any) =>
                        b.location === `${pageKey}_floating` ||
                        (b.url_pattern && b.url_pattern.split(',').includes(pageKey))
                    ) || floatingBanners.find((b: any) => b.location === 'global');

                    if (bestMatch) {
                        setBanner(bestMatch);
                        setTimeout(() => setIsVisible(true), 1500);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch floating banner:', error);
            }
        };

        fetchBanner();
    }, [location]);

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        // Remember dismissal for this session
        sessionStorage.setItem(`banner_dismissed_${location}`, 'true');
    };

    if (!banner || isDismissed) return null;

    const getThemeColors = (theme: string, type: string) => {
        const themes: Record<string, { gradient: string; button: string; text: string; iconBg: string }> = {
            teal: { gradient: 'from-teal-500 to-emerald-500', button: 'bg-teal-600 hover:bg-teal-700', text: 'text-teal-100', iconBg: 'bg-teal-400/20' },
            indigo: { gradient: 'from-indigo-600 to-blue-700', button: 'bg-indigo-800 hover:bg-black', text: 'text-indigo-100', iconBg: 'bg-indigo-400/20' },
            rose: { gradient: 'from-rose-600 to-red-700', button: 'bg-rose-800 hover:bg-black', text: 'text-rose-100', iconBg: 'bg-rose-400/20' },
            amber: { gradient: 'from-amber-500 to-orange-600', button: 'bg-amber-700 hover:bg-black', text: 'text-amber-100', iconBg: 'bg-amber-400/20' },
            emerald: { gradient: 'from-emerald-600 to-green-700', button: 'bg-emerald-800 hover:bg-black', text: 'text-emerald-100', iconBg: 'bg-emerald-400/20' },
            blue: { gradient: 'from-blue-600 to-cyan-700', button: 'bg-blue-800 hover:bg-black', text: 'text-blue-100', iconBg: 'bg-blue-400/20' },
            purple: { gradient: 'from-purple-600 to-indigo-700', button: 'bg-purple-800 hover:bg-black', text: 'text-purple-100', iconBg: 'bg-purple-400/20' },
            urgency: { gradient: 'from-red-600 to-orange-700', button: 'bg-white text-red-600 hover:bg-white/90', text: 'text-red-50', iconBg: 'bg-white/20' },
            community: { gradient: 'from-blue-600 to-indigo-700', button: 'bg-white text-blue-600 hover:bg-white/90', text: 'text-blue-50', iconBg: 'bg-white/20' },
            promotion: { gradient: 'from-yellow-400 to-orange-500', button: 'bg-black text-white hover:bg-slate-900', text: 'text-orange-900/70', iconBg: 'bg-black/10' },
            high_impact: { gradient: 'from-fuchsia-600 via-purple-600 to-indigo-600', button: 'bg-white text-fuchsia-600 hover:shadow-fuchsia-500/50 hover:shadow-lg', text: 'text-white/80', iconBg: 'bg-white/30' },
            minimal: { gradient: 'from-slate-50 to-slate-200', button: 'bg-slate-900 text-white', text: 'text-slate-500', iconBg: 'bg-slate-200' },
        };

        if (type === 'urgency') return themes.urgency;
        if (type === 'community') return themes.community;
        if (type === 'promotion') return themes.promotion;
        if (type === 'high_impact') return themes.high_impact;
        if (type === 'minimal') return themes.minimal;

        return themes[theme] || themes.teal;
    };

    const colors = getThemeColors(banner.color_theme || 'teal', banner.template_type);
    const alignment = banner.alignment || 'left';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-4 left-4 right-4 z-50 lg:hidden"
                >
                    <div className={`bg-gradient-to-r ${colors.gradient} rounded-2xl shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden`}>
                        {/* Close Button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors z-10"
                            aria-label="Dismiss banner"
                        >
                            <X size={16} className="text-white" />
                        </button>

                        <div className={`p-5 flex items-center gap-4 ${alignment === 'center' ? 'flex-col text-center' : alignment === 'right' ? 'flex-row-reverse text-right' : ''}`}>
                            {/* Icon or Image */}
                            {banner.image_url ? (
                                <div className={`${alignment === 'center' ? 'w-24 h-24' : 'w-16 h-16'} rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-white/20`}>
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className={`${alignment === 'center' ? 'w-16 h-16 text-4xl' : 'w-12 h-12 text-2xl'} ${colors.iconBg} rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse`}>
                                    {banner.icon || '✨'}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-white font-black uppercase tracking-tight leading-tight mb-1 ${alignment === 'center' ? 'text-xl' : 'text-sm'}`}>
                                    {banner.title}
                                </h4>
                                {banner.subtitle && (
                                    <p className={`${colors.text} text-xs font-bold leading-snug opacity-90`}>
                                        {banner.subtitle}
                                    </p>
                                )}
                            </div>

                            {/* CTA Button */}
                            {banner.target_url && (
                                <Link
                                    href={banner.target_url}
                                    onClick={handleDismiss}
                                    className={`px-6 py-3 ${colors.button} ${alignment === 'center' ? 'w-full' : ''} text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 whitespace-nowrap flex-shrink-0`}
                                >
                                    {banner.template_type === 'urgency' ? 'Act Now →' : 'Explore →'}
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
