'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import api, { getImageUrl } from '@/lib/api';

interface Advertisement {
    ad_id: number;
    title: string;
    description: string;
    media_type: 'image' | 'video' | 'carousel';
    media_url: string;
    media_urls?: string[];
    thumbnail_url?: string;
    click_action: 'url' | 'store' | 'listing' | 'none';
    target_url?: string;
    target_store_id?: number;
    target_listing_id?: number;
    space_name: string;
    style_config?: any;
    layout_template?: string;
}

interface AdSpaceProps {
    spaceName: string;
    className?: string;
    fallback?: React.ReactNode;
    autoRotate?: boolean;
    rotationInterval?: number; // in seconds
}

export default function AdSpace({
    spaceName,
    className = '',
    fallback = null,
    autoRotate = true,
    rotationInterval = 10
}: AdSpaceProps) {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [spaceConfig, setSpaceConfig] = useState<any>(null);
    const [currentAdIndex, setCurrentAdIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);
    const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

    // Fetch ads for this space
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const response = await api.get(`/advertisements/active?space_name=${spaceName}`);
                setAds(response.data.ads || []);
                setSpaceConfig(response.data.space_config);
            } catch (error) {
                console.error('Failed to fetch ads:', error);
                setAds([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAds();
    }, [spaceName]);

    // Track impression when ad is visible
    useEffect(() => {
        if (ads.length > 0 && !hasTrackedImpression) {
            const currentAd = ads[currentAdIndex];
            trackEvent(currentAd.ad_id, 'impression');
            setHasTrackedImpression(true);
        }
    }, [ads, currentAdIndex, hasTrackedImpression]);

    // Auto-rotate ads
    useEffect(() => {
        if (!autoRotate || ads.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentAdIndex((prev) => (prev + 1) % ads.length);
            setHasTrackedImpression(false); // Track impression for next ad
        }, rotationInterval * 1000);

        return () => clearInterval(interval);
    }, [ads.length, autoRotate, rotationInterval]);

    // Track ad events
    const trackEvent = async (adId: number, eventType: 'impression' | 'click') => {
        try {
            await api.post(`/advertisements/${adId}/track`, {
                event_type: eventType,
                page_url: window.location.href,
                page_type: window.location.pathname.split('/')[1] || 'home',
                device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
                session_id: sessionStorage.getItem('session_id') || Math.random().toString(36)
            });
        } catch (error) {
            console.error('Failed to track ad event:', error);
        }
    };

    // Handle ad click
    const handleAdClick = (ad: Advertisement) => {
        trackEvent(ad.ad_id, 'click');

        if (ad.click_action === 'url' && ad.target_url) {
            window.open(ad.target_url, '_blank');
        } else if (ad.click_action === 'store' && ad.target_store_id) {
            window.location.href = `/stores/${ad.target_store_id}`;
        } else if (ad.click_action === 'listing' && ad.target_listing_id) {
            window.location.href = `/listings/${ad.target_listing_id}`;
        }
    };

    // Patterns for richer aesthetics
    const BackgroundPatterns = ({ type, color = 'white' }: { type?: string, color?: string }) => {
        if (!type) return null;
        const opacity = 0.05;
        switch (type) {
            case 'dots':
                return (
                    <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                );
            case 'grid':
                return (
                    <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                );
            case 'mesh':
                return (
                    <div className="absolute inset-0 z-0 opacity-30" style={{
                        background: `radial-gradient(at 0% 0%, ${color}22 0, transparent 50%), 
                                    radial-gradient(at 100% 0%, ${color}22 0, transparent 50%),
                                    radial-gradient(at 100% 100%, ${color}22 0, transparent 50%),
                                    radial-gradient(at 0% 100%, ${color}22 0, transparent 50%)`
                    }} />
                );
            default:
                return null;
        }
    };

    // Sub-components for Layout Templates
    const TrellisLayout = ({ urls }: { urls: string[] }) => (
        <div className="grid grid-cols-2 md:grid-cols-4 h-full w-full gap-1 p-1">
            {urls.slice(0, 4).map((url, i) => (
                <div key={i} className="relative h-full w-full overflow-hidden first:rounded-l-xl last:rounded-r-xl md:first:rounded-l-3xl md:last:rounded-r-3xl">
                    <img src={getImageUrl(url)} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" alt="" />
                </div>
            ))}
        </div>
    );

    const VideoWindow = ({ url, thumbnail }: { url: string, thumbnail?: string }) => (
        <div className="relative h-full w-full flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            <div className="relative z-10 h-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    poster={thumbnail}
                />
            </div>
        </div>
    );

    const TEXTURE_STYLES: Record<string, string> = {
        none: 'none',
        halftone: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
        stripes: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
        grid: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        dots: 'radial-gradient(rgba(255,255,255,0.2) 2px, transparent 2px)',
        waves: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.03) 20px, rgba(255,255,255,0.03) 40px)',
        noise: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
        shimmer: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%)',
        confetti: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 60% 20%, rgba(255,255,255,0.1) 2px, transparent 2px)',
        zigzag: 'linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%), linear-gradient(315deg, rgba(255,255,255,0.05) 25%, transparent 25%)',
    };

    function hexToRgb(hex: string): { r: number; g: number; b: number } {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            return {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            };
        }
        return { r: 255, g: 255, b: 255 };
    }

    function getTextureStyle(texture: string, opacity: number = 0.3, scale: number = 1, color: string = '#ffffff'): any {
        if (texture === 'none' || !texture) return { display: 'none' };
        const baseStyle = TEXTURE_STYLES[texture];
        if (!baseStyle) return { display: 'none' };

        const { r, g, b } = hexToRgb(color);
        const colorizedStyle = baseStyle.replace(/rgba\(255,255,255,/g, `rgba(${r},${g},${b},`);

        return {
            backgroundImage: colorizedStyle,
            backgroundSize: texture === 'noise' ? 'auto' : `${20 * scale}px ${20 * scale}px`,
            opacity,
            position: 'absolute' as const,
            inset: 0,
            pointerEvents: 'none' as const,
            mixBlendMode: 'overlay' as const,
            zIndex: 10
        };
    }

    // Loading state
    if (isLoading) {
        return (
            <div className={`animate-pulse bg-slate-200 rounded-2xl ${className}`}>
                <div className="h-full w-full" />
            </div>
        );
    }

    // If dismissed, show nothing
    if (isDismissed) return null;

    // Determine what to display: current ad or default space config
    const currentAd = ads.length > 0 ? ads[currentAdIndex] : null;

    // Use space config as the fallback if no ads
    const displayConfig = currentAd ? currentAd.style_config : (spaceConfig?.style_config || {});
    const title = currentAd ? currentAd.title : (displayConfig.defaultTitle || spaceConfig?.display_name);
    const body = currentAd ? currentAd.description : displayConfig.defaultBody;
    const mediaUrl = currentAd ? currentAd.media_url : displayConfig.bgAssetUrl;
    const mediaType = currentAd ? currentAd.media_type : displayConfig.bgAssetType;

    const isMobileFooter = spaceName === 'mobile_footer_ad';
    const template = currentAd?.layout_template || displayConfig?.template || 'standard';

    // Dynamic styles based on config
    // Dynamic styles based on config
    const bgLayerStyle = {
        background: displayConfig.bgMode === 'asset' && displayConfig.bgAssetUrl
            ? `url(${getImageUrl(displayConfig.bgAssetUrl)}) ${displayConfig.bgAssetPosition || 'center'}/${displayConfig.bgAssetFit || 'cover'} no-repeat`
            : `linear-gradient(135deg, ${displayConfig.from || '#14b8a6'}, ${displayConfig.to || '#0d9488'})`,
        opacity: displayConfig.bgOpacity ?? 1,
        position: 'absolute' as const,
        inset: 0,
        zIndex: 0
    };

    const textureStyle = getTextureStyle(
        displayConfig.texture || 'none',
        displayConfig.textureOpacity || 0.3,
        displayConfig.textureScale || 1,
        displayConfig.textureColor || '#ffffff'
    );

    // Helper for texture string (ported from manager if needed, or assume global)
    // Actually, AdSpace needs its own implementation of getTextureStyle or shared utils
    // Let's implement a simplified inline version for now or look if it's already there.

    const renderAdContent = () => {
        switch (template) {
            case 'sleek':
                if (!currentAd) return null;
                return (
                    <div className="relative h-full w-full flex items-center p-8 md:p-12 text-white overflow-hidden">
                        <BackgroundPatterns type={displayConfig.pattern} color={displayConfig.patternColor} />
                        <div className="max-w-xl z-10 relative">
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest mb-4 border border-white/10"
                            >
                                Premium Offer
                            </motion.span>
                            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 leading-none uppercase drop-shadow-2xl">{currentAd.title}</h3>
                            <p className="text-white/70 text-sm font-medium italic mb-6 line-clamp-2">{currentAd.description}</p>
                            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-110 transition-transform shadow-xl shadow-white/10">Explore Now</button>
                        </div>
                        {currentAd.media_url && (
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 h-full opacity-40">
                                <img src={getImageUrl(currentAd.media_url)} className="w-full h-full object-cover grayscale mix-blend-overlay" alt="" />
                                <div className="absolute inset-0 bg-linear-to-r from-slate-900 via-transparent to-transparent" />
                            </div>
                        )}
                    </div>
                );
            case 'glass':
                if (!currentAd) return null;
                return (
                    <div className="relative h-full w-full flex items-center justify-center p-6 overflow-hidden">
                        <BackgroundPatterns type={displayConfig.pattern} color={displayConfig.patternColor} />
                        <div className="absolute inset-0">
                            <img src={getImageUrl(currentAd.media_url)} className="w-full h-full object-cover blur-md opacity-40" alt="" />
                        </div>
                        <div className="relative z-10 w-full max-w-lg p-10 bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 text-center text-white shadow-2xl">
                            <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter mb-2 leading-tight uppercase drop-shadow-xl">{currentAd.title}</h3>
                            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-70 italic">{currentAd.description}</p>
                            <div className="w-16 h-1 bg-white/20 mx-auto rounded-full mb-8" />
                            <button className="px-8 py-3 border border-white/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all">Discover</button>
                        </div>
                    </div>
                );
            case 'trellis':
                if (!currentAd) return null;
                return currentAd.media_urls ? <TrellisLayout urls={currentAd.media_urls} /> : null;
            case 'minimal':
                if (!currentAd) return null;
                return (
                    <div className="relative h-full w-full flex items-center gap-6 p-6 px-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                            <img src={getImageUrl(currentAd.thumbnail_url || currentAd.media_url)} className="w-10 h-10 object-contain rounded-lg" alt="" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg md:text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{currentAd.title}</h3>
                            <p className="text-white/60 text-[10px] uppercase font-black tracking-widest mt-1">{currentAd.description}</p>
                        </div>
                        <div className="px-4 py-2 border border-white/20 rounded-full text-white text-[9px] font-black uppercase tracking-widest">View</div>
                    </div>
                );
            case 'portrait':
                if (!currentAd) return null;
                return (
                    <div className="relative h-full w-full flex flex-col p-8 text-white overflow-hidden group">
                        <BackgroundPatterns type={displayConfig.pattern} color={displayConfig.patternColor} />
                        <div className="absolute inset-0 z-0 scale-110 group-hover:scale-100 transition-transform duration-[2s]">
                            <img src={getImageUrl(currentAd.media_url)} className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000" alt="" />
                            <div className="absolute inset-0 bg-linear-to-b from-black/10 via-black/40 to-black/90" />
                        </div>
                        <div className="relative z-10 mt-auto flex flex-col gap-3">
                            <span className="inline-block w-fit px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[7px] font-black uppercase tracking-[0.2em] mb-1 border border-white/10">Limited Spot</span>
                            <h3 className="text-2xl font-black italic tracking-tighter leading-none uppercase drop-shadow-lg">{currentAd.title}</h3>
                            <p className="text-white/50 text-[10px] font-medium leading-tight mb-4 line-clamp-3 opacity-80">{currentAd.description}</p>
                            <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-teal-50 hover:scale-105 transition-all shadow-xl shadow-black/20">View Details</button>
                        </div>
                    </div>
                );
            case 'video_window':
                if (!currentAd) return null;
                return <VideoWindow url={currentAd.media_url} thumbnail={currentAd.thumbnail_url} />;
            case 'standard':
            default:
                return (
                    <>
                        {/* Default/Background Content if no template match or standard */}
                        {mediaType === 'video' ? (
                            <video
                                src={mediaUrl}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className={`w-full h-full object-${displayConfig.bgAssetFit || 'cover'}`}
                                poster={currentAd?.thumbnail_url}
                            />
                        ) : mediaType === 'carousel' && currentAd?.media_urls ? (
                            <div className="relative h-full w-full">
                                <img
                                    src={getImageUrl(currentAd.media_urls[0])}
                                    alt={title}
                                    className={`w-full h-full object-${displayConfig.bgAssetFit || 'cover'}`}
                                />
                            </div>
                        ) : mediaUrl ? (
                            <img
                                src={getImageUrl(mediaUrl)}
                                alt={title}
                                className={`w-full h-full object-${displayConfig.bgAssetFit || 'cover'}`}
                            />
                        ) : null}

                        {/* Overlay with title/description */}
                        {title && (
                            <div className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 md:p-6 ${displayConfig?.textAlign === 'center' ? 'text-center' : ''}`}>
                                <h3 className="text-white font-black text-lg md:text-xl italic tracking-tighter uppercase" style={{ fontSize: displayConfig.titleSize ? `${displayConfig.titleSize}px` : undefined }}>{title}</h3>
                                {body && (
                                    <p className="text-white/80 text-[10px] md:text-xs font-medium mt-1 line-clamp-1 uppercase tracking-widest italic opacity-60">
                                        {body}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Optional CTA Link overlay if it's a default banner with a link */}
                        {!currentAd && displayConfig?.targetLink && (
                            <a href={displayConfig.targetLink} className="absolute inset-0 z-20" />
                        )}
                    </>
                );
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={currentAd ? currentAd.ad_id : 'default'}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`relative group overflow-hidden ${displayConfig.radius || 'rounded-2xl'} ${className}`}
            >
                {/* Background Layer */}
                <div style={bgLayerStyle} />

                {/* Texture Overlay */}
                <div style={textureStyle} />

                {/* Ad Content */}
                <div
                    onClick={() => currentAd && handleAdClick(currentAd)}
                    className={`relative h-full w-full ${currentAd ? 'cursor-pointer' : ''}`}
                >
                    {renderAdContent()}

                    {/* Sponsored/Default label */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-md z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">
                            {currentAd ? 'Partner Spotlight' : 'Island Hub'}
                        </span>
                    </div>

                    {/* Dismiss button for mobile footer */}
                    {isMobileFooter && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDismissed(true);
                            }}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors z-40 shadow-xl"
                        >
                            <X size={16} className="text-slate-700" />
                        </button>
                    )}
                </div>

                {/* Rotation indicators */}
                {ads.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                        {ads.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentAdIndex(index);
                                    setHasTrackedImpression(false);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentAdIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

