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
    const containerStyle = {
        background: displayConfig.bgMode === 'asset'
            ? '#000'
            : (displayConfig.from && displayConfig.to
                ? `linear-gradient(135deg, ${displayConfig.from}, ${displayConfig.to})`
                : displayConfig.from || 'transparent'),
    };

    const renderAdContent = () => {
        switch (template) {
            case 'sleek':
                return (
                    <div className="relative h-full w-full flex items-center p-8 md:p-12 text-white bg-slate-900/40 backdrop-blur-sm">
                        <div className="max-w-xl z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-[8px] font-black uppercase tracking-widest mb-4 border border-white/10">Premium Offer</span>
                            <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4 leading-none uppercase">{currentAd.title}</h3>
                            <p className="text-white/70 text-sm font-medium italic mb-6 line-clamp-2">{currentAd.description}</p>
                            <button className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px]">Explore Now</button>
                        </div>
                        {currentAd.media_url && (
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 h-full opacity-40">
                                <img src={getImageUrl(currentAd.media_url)} className="w-full h-full object-cover grayscale" alt="" />
                            </div>
                        )}
                    </div>
                );
            case 'glass':
                return (
                    <div className="relative h-full w-full flex items-center justify-center p-6">
                        <div className="absolute inset-0">
                            <img src={getImageUrl(currentAd.media_url)} className="w-full h-full object-cover blur-sm opacity-50" alt="" />
                        </div>
                        <div className="relative z-10 w-full max-w-lg p-8 bg-white/10 backdrop-blur-xl rounded-4xl border border-white/20 text-center text-white shadow-2xl">
                            <h3 className="text-2xl md:text-4xl font-black italic tracking-tighter mb-2 leading-tight">{currentAd.title}</h3>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-70">{currentAd.description}</p>
                            <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
                        </div>
                    </div>
                );
            case 'trellis':
                return currentAd.media_urls ? <TrellisLayout urls={currentAd.media_urls} /> : null;
            case 'minimal':
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
            case 'video_window':
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
                                className="w-full h-full object-cover"
                                poster={currentAd?.thumbnail_url}
                            />
                        ) : mediaType === 'carousel' && currentAd?.media_urls ? (
                            <div className="relative h-full w-full">
                                <img
                                    src={getImageUrl(currentAd.media_urls[0])}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : mediaUrl ? (
                            <img
                                src={getImageUrl(mediaUrl)}
                                alt={title}
                                className="w-full h-full object-cover"
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
                style={containerStyle}
            >
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

