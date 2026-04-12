'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroBackgroundProps {
    pageKey?: string;
    defaultImage?: string;
    fallbackTitle?: string;
    className?: string;
    align?: 'left' | 'center' | 'right';
    // Overrides for Store/Vendor pages
    overrideData?: {
        asset_url?: string;
        asset_type?: string;
        overlay_color?: string;
        overlay_opacity?: number;
        title?: string;
        subtitle?: string;
        cta_text?: string;
        cta_link?: string;
        cta2_text?: string;
        cta2_link?: string;
        hero_cta2_text?: string;
        hero_cta2_link?: string;
        icon_url?: string;
        typography?: any;
        layout_template?: string;
        style_config?: any;
        branding_color?: string;
    };
    children?: React.ReactNode;
}

export default function HeroBackground({
    pageKey,
    defaultImage = '',
    fallbackTitle = '',
    className = '',
    align,
    overrideData,
    children
}: HeroBackgroundProps) {
    const [asset, setAsset] = useState<any>(overrideData || null);
    const [loading, setLoading] = useState(!overrideData);

    useEffect(() => {
        if (overrideData) {
            setAsset(overrideData);
            setLoading(false);
            return;
        }

        const fetchAsset = async () => {
            if (!pageKey) {
                setLoading(false);
                return;
            }
            try {
                // Fetch high priority - no artificial delay
                const response = await api.get(`/admin/hero-assets/${pageKey}`);
                if (response.data) {
                    setAsset(response.data);
                }
            } catch (error) {
                console.log(`No custom hero asset found for ${pageKey}, using defaults.`);
            } finally {
                // Ensure loading is set to false immediately after attempt
                setLoading(false);
            }
        };
        fetchAsset();
    }, [pageKey, overrideData]);

    const assetUrl = asset?.asset_url || (loading ? null : defaultImage);
    const isVideo = asset?.asset_type === 'video';
    const overlayColor = asset?.overlay_color || '#000000';
    const overlayOpacity = asset?.overlay_opacity !== undefined && asset.overlay_opacity !== null ? parseFloat(asset.overlay_opacity) : 0.4;

    // Content Fields
    const title = asset?.title || asset?.hero_title || fallbackTitle;
    const subtitle = asset?.subtitle || asset?.hero_subtitle;
    const ctaText = asset?.cta_text || asset?.hero_cta_text;
    const ctaLink = asset?.cta_link || asset?.hero_cta_link;
    const cta2Text = asset?.cta2_text || asset?.hero_cta2_text || overrideData?.cta2_text || overrideData?.hero_cta2_text;
    const cta2Link = asset?.cta2_link || asset?.hero_cta2_link || overrideData?.cta2_link || overrideData?.hero_cta2_link;
    const iconUrl = asset?.icon_url || asset?.hero_icon_url;
    const typography = asset?.typography || {};
    const titleStyle = typography.heading || {};
    const subtitleStyle = typography.subtitle || {};

    // Font Mapping & Dynamic Injection
    const getFontFamily = (model: string, customUrl?: string) => {
        if (customUrl) {
            const fontName = `CustomFont_${customUrl.split('/').pop()?.split('.')[0]}`;
            // Simple injection of @font-face if not already exists
            if (typeof document !== 'undefined' && !document.getElementById(fontName)) {
                const style = document.createElement('style');
                style.id = fontName;
                style.appendChild(document.createTextNode(`
                    @font-face {
                        font-family: '${fontName}';
                        src: url('${getImageUrl(customUrl)}');
                    }
                `));
                document.head.appendChild(style);
            }
            return fontName;
        }
        switch (model) {
            case 'modern': return 'Outfit, sans-serif';
            case 'serif': return 'Playfair Display, serif';
            case 'display': return 'Bebas Neue, sans-serif';
            default: return 'Inter, sans-serif';
        }
    };

    const getEffectClass = (effect: string) => {
        switch (effect) {
            case 'glow': return 'text-shadow-glow';
            case 'outline': return 'text-shadow-outline';
            case 'soft': return 'drop-shadow-lg';
            default: return '';
        }
    };

    const effectiveAlign = align || typography.align || 'left';

    const alignmentClass = effectiveAlign === 'center' ? 'items-center text-center' : effectiveAlign === 'right' ? 'items-end text-right' : 'items-start text-left';

    const layoutTemplate = asset?.layout_template || 'standard';
    const styleConfig = asset?.style_config || {};
    const scale = styleConfig.scale || 100;
    const offsetY = styleConfig.offsetY || 0;
    const offsetX = styleConfig.offsetX || 0; // Horizontal offset for split view
    const bgColor = styleConfig.bgColor || '#000000';
    const showOverlay = styleConfig.showOverlay !== false; // Default to true

    // New dynamic controls
    const splitDivide = styleConfig.splitDivide || 50; // Percentage for split
    const overlayScale = styleConfig.overlayScale || 100; // Percentage for overlay size
    const overlayAlign = styleConfig.overlayAlign || typography.align || 'center';

    const getGradientStyle = (style: any) => {
        if (!style.useGradient || !style.gradientStart || !style.gradientEnd) return {};
        const angle = style.gradientAngle || 135;
        return {
            backgroundImage: `linear-gradient(${angle}deg, ${style.gradientStart}, ${style.gradientEnd})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
        };
    };

    // Patterns for richer aesthetics - reused from AdSpace or moved to utils/theme
    const BackgroundPatterns = ({ type, color = 'white' }: { type?: string, color?: string }) => {
        if (!type) return null;
        switch (type) {
            case 'dots':
                return (
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
                );
            case 'grid':
                return (
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
                );
            case 'mesh':
                return (
                    <div className="absolute inset-0 z-0 opacity-30 pointer-events-none" style={{
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

    return (
        <div className={`relative w-full overflow-hidden ${className}`} style={{ minHeight: '600px', backgroundColor: bgColor }}>
            <style jsx global>{`
                .text-shadow-glow { text-shadow: 0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3); }
                .text-shadow-outline { text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; }
            `}</style>

            {/* Background Layer */}
            <div
                className="absolute inset-0 z-0 transition-all duration-700"
                style={layoutTemplate === 'split' ? {
                    width: `${100 - splitDivide}%`,
                    left: `${splitDivide}%`
                } : { width: '100%', left: 0 }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={assetUrl}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                        style={{
                            transform: `scale(${scale / 100}) translate(${layoutTemplate === 'split' ? offsetX : 0}px, ${offsetY}px)`,
                            transition: 'transform 0.5s ease-out'
                        }}
                    >
                        {isVideo ? (
                            <video autoPlay loop muted playsInline className="w-full h-full object-cover" src={getImageUrl(assetUrl)} />
                        ) : (getImageUrl(assetUrl) || defaultImage) ? (
                            <img src={getImageUrl(assetUrl) || defaultImage} alt={title || 'Hero'} className="w-full h-full object-cover" />
                        ) : null}
                    </motion.div>
                </AnimatePresence>

                {/* Always show overlay effects on the media layer if enabled */}
                {showOverlay && (
                    <>
                        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
                        <BackgroundPatterns type={styleConfig.pattern} color={styleConfig.patternColor} />
                    </>
                )}
            </div>

            {/* Content Layer */}
            {!loading && (title || subtitle || iconUrl || ctaText || children) && (
                <div className={`relative z-10 flex w-full min-h-[600px] md:min-h-[85vh] ${layoutTemplate === 'split' ? 'items-center' : 'items-center justify-center'
                    }`}>
                    <div className={`max-w-7xl mx-auto w-full px-6 sm:px-12 md:px-24 flex ${layoutTemplate === 'split' ? 'ml-0 mr-auto' : 'justify-center w-full'
                        }`}
                        style={layoutTemplate === 'split' ? { width: `${splitDivide}%` } : {}}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`w-full flex flex-col ${layoutTemplate === 'overlay' ? 'bg-black/20 backdrop-blur-xl rounded-[3.5rem] border border-white/10 shadow-2xl' :
                                alignmentClass
                                } ${layoutTemplate === 'split' ? 'text-left items-start' : ''}`}
                            style={layoutTemplate === 'overlay' ? {
                                padding: `${(48 * (overlayScale / 100)).toFixed(0)}px`,
                                maxWidth: `${(800 * (overlayScale / 100)).toFixed(0)}px`,
                                alignItems: overlayAlign === 'center' ? 'center' : overlayAlign === 'right' ? 'flex-end' : 'flex-start',
                                textAlign: overlayAlign as any
                            } : {}}
                        >
                            {/* IF children are provided, we skip the automatic title/subtitle/ctas to avoid duplication */}
                            {!children ? (
                                <>
                                    {/* Icon / Graphic */}
                                    {iconUrl && iconUrl.trim() !== '' && (
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.1 }}
                                            className={`mb-8 md:mb-12 relative flex w-full ${((layoutTemplate === 'overlay' ? overlayAlign : effectiveAlign) === 'center') ? 'justify-center' :
                                                (layoutTemplate === 'overlay' ? overlayAlign : effectiveAlign) === 'right' ? 'justify-end' : 'justify-start'
                                                }`}
                                        >
                                            <div className="w-20 h-20 md:w-40 md:h-40 flex items-center justify-center p-4 md:p-8 bg-white/10 backdrop-blur-2xl rounded-4xl md:rounded-[3.5rem] border border-white/20 shadow-2xl overflow-hidden group hover:scale-110 transition-transform duration-500">
                                                {(iconUrl.startsWith('http') || iconUrl.startsWith('/') || iconUrl.includes('uploads') || iconUrl.includes('.')) ? (
                                                    <img
                                                        src={getImageUrl(iconUrl)}
                                                        className="w-full h-full object-contain drop-shadow-2xl translate-y-1 md:translate-y-2 group-hover:translate-y-0 transition-transform duration-700"
                                                        alt=""
                                                        onError={(e) => { (e.target as any).style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-4xl md:text-8xl drop-shadow-2xl select-none leading-none">{iconUrl}</span>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-3xl opacity-30 animate-pulse pointer-events-none" />
                                        </motion.div>
                                    )}

                                    {/* Title */}
                                    {title && (
                                        <h1
                                            className={`text-3xl md:text-7xl lg:text-8xl font-black leading-[1.1] md:leading-[1.05] mb-6 md:mb-8 drop-shadow-md ${getEffectClass(titleStyle.effect)}`}
                                            style={{
                                                fontFamily: getFontFamily(titleStyle.model || typography.model, titleStyle.custom_font),
                                                color: titleStyle.color || 'white',
                                                fontSize: titleStyle.size ? `${Math.max(32, titleStyle.size)}px` : undefined,
                                                textTransform: titleStyle.model === 'display' ? 'uppercase' : 'none',
                                                letterSpacing: titleStyle.model === 'display' ? '0.05em' : 'normal',
                                                ...getGradientStyle(titleStyle)
                                            }}
                                        >
                                            {title}
                                        </h1>
                                    )}

                                    {/* Subtitle */}
                                    {subtitle && (
                                        <p
                                            className={`text-base md:text-2xl font-medium mb-8 md:mb-12 max-w-2xl drop-shadow-md ${getEffectClass(subtitleStyle.effect)}`}
                                            style={{
                                                fontFamily: getFontFamily(subtitleStyle.model || typography.model, subtitleStyle.custom_font),
                                                color: subtitleStyle.color || 'rgba(255,255,255,0.95)',
                                                fontSize: subtitleStyle.size ? `${Math.max(16, subtitleStyle.size)}px` : undefined,
                                                ...getGradientStyle(subtitleStyle)
                                            }}
                                        >
                                            {subtitle}
                                        </p>
                                    )}

                                    {/* CTAs */}
                                    <div className={`flex flex-wrap gap-4 md:gap-6 mb-12 ${((layoutTemplate === 'overlay' ? overlayAlign : effectiveAlign) === 'center') ? 'justify-center' :
                                        (layoutTemplate === 'overlay' ? overlayAlign : effectiveAlign) === 'right' ? 'justify-end' : 'justify-start'
                                        }`}>
                                        {ctaText && ctaLink && (
                                            <a
                                                href={ctaLink}
                                                className="inline-block px-8 md:px-12 py-4 md:py-5 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-2xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                                                style={{
                                                    backgroundColor: overrideData?.branding_color || '#14b8a6',
                                                    boxShadow: `0 20px 40px -10px ${(overrideData?.branding_color || '#14b8a6')}40`
                                                }}
                                            >
                                                {ctaText}
                                            </a>
                                        )}
                                        {cta2Text && cta2Link && (
                                            <a
                                                href={cta2Link}
                                                className="inline-block px-8 md:px-12 py-4 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-2xl shadow-2xl shadow-black/20 transform hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                                            >
                                                {cta2Text}
                                            </a>
                                        )}
                                    </div>
                                </>
                            ) : children}
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    );
}
