'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useAnimationFrame } from 'framer-motion';
import { useStores, useRecommendations } from '@/lib/hooks/use-swr';
import { getImageUrl } from '@/lib/api';

interface BrandMarqueeProps {
    type: 'brand' | 'product';
    items?: BrandMarqueeItem[];
    className?: string;
    autoPlay?: boolean;
    speed?: number;
    textColor?: string;
    emoji?: string;
}

export interface BrandMarqueeItem {
    id: number | string;
    name: string;
    logo_url?: string;
    image_url?: string;
    slug?: string;
    category?: string;
    price?: string | number;
}

const DOUBLED_COUNT = 3;

export default function BrandMarquee({
    type = 'brand',
    items,
    className = '',
    autoPlay = true,
    speed = 1.2, // Slightly slower for better readability
    textColor,
    emoji
}: BrandMarqueeProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isPaused, setIsPaused] = useState(false);
    const positionRef = useRef(0);

    // Dynamic data fetching
    const { data: storesData, isLoading: storesLoading } = useStores(type === 'brand' ? { is_featured: true } : undefined);
    const { recommendations: trendingProducts, isLoading: productsLoading } = useRecommendations(type === 'product' ? 'trending' : undefined, 12);

    const [displayItems, setDisplayItems] = useState<BrandMarqueeItem[]>(items || []);

    useEffect(() => {
        if (items) {
            setDisplayItems(items);
        } else if (type === 'brand') {
            const stores = Array.isArray(storesData) ? storesData : (storesData as any)?.stores || [];
            setDisplayItems(stores);
        } else {
            const products = Array.isArray(trendingProducts) ? trendingProducts : (trendingProducts as any)?.recommendations || [];
            setDisplayItems(products);
        }
        // Reset position on data change to prevent glitches
        positionRef.current = 0;
    }, [items, storesData, trendingProducts, type]);

    const isLoading = storesLoading || productsLoading;

    // Triple for seamless loop
    const doubledItems = displayItems.length > 0 ? [...displayItems, ...displayItems, ...displayItems] : [];

    // Use framer-motion's useAnimationFrame for optimized performance
    useAnimationFrame((time, delta) => {
        if (!autoPlay || isPaused || !scrollRef.current || displayItems.length === 0) return;

        const containerWidth = scrollRef.current.scrollWidth / 3;

        // Use delta-based movement for consistent speed across different refresh rates
        const frameAdjustedSpeed = speed * (delta / 16.6);
        positionRef.current -= frameAdjustedSpeed;

        // Reset for seamless loop
        if (Math.abs(positionRef.current) >= containerWidth) {
            positionRef.current += containerWidth;
        }

        scrollRef.current.style.transform = `translateX(${positionRef.current}px)`;
    });

    if (displayItems.length === 0 && !isLoading) return null;

    const BrandCard = ({ item }: { item: BrandMarqueeItem }) => (
        <Link
            href={item.slug ? `/store/${item.slug}` : `/store/${item.id}`}
            className="shrink-0 w-44 md:w-56 bg-white dark:bg-slate-800 rounded-[2rem] p-5 md:p-8 border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer shadow-sm flex flex-col items-center text-center overflow-hidden"
        >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-slate-50 dark:bg-slate-700/50 mb-6 overflow-hidden flex items-center justify-center border border-slate-50 dark:border-slate-600 shadow-inner shrink-0">
                {item.logo_url ? (
                    <img
                        src={getImageUrl(item.logo_url) || getImageUrl('file-1769965232226-73669333.jpg')}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">
                        {item.category?.toLowerCase().includes('food') ? '🍴' :
                            item.category?.toLowerCase().includes('fashion') ? '👕' :
                                item.category?.toLowerCase().includes('jewel') ? '💎' : '🏝️'}
                    </span>
                )}
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-base md:text-lg truncate w-full px-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors uppercase tracking-tighter mb-2">
                {item.name}
            </h4>
            <div className="flex items-center justify-center gap-2 w-full px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest truncate">
                    {item.category || 'Island Partner'}
                </p>
            </div>
        </Link>
    );

    const ProductCard = ({ item, index }: { item: BrandMarqueeItem; index: number }) => (
        <Link
            href={item.slug ? `/listings/${item.slug}` : `/listings/${item.id}`}
            className="shrink-0 w-40 md:w-48 bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group cursor-pointer shadow-sm"
        >
            <div className="aspect-square bg-slate-50 dark:bg-slate-700/50 relative overflow-hidden">
                {item.image_url || item.logo_url ? (
                    <img
                        src={getImageUrl(item.image_url || item.logo_url) || getImageUrl('file-1769965232226-73669333.jpg')}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl opacity-50">
                        {['🛍️', '🍯', '☕', '🌶️', '🧴', '👕', '👜', '🎁'][index % 8]}
                    </div>
                )}
                {item.category && (
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-slate-900 dark:text-white text-[8px] font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-xl border border-white/20 shadow-sm">
                        {item.category}
                    </div>
                )}
            </div>
            <div className="p-5 md:p-6">
                <h4 className="font-black text-slate-900 dark:text-white text-xs md:text-sm truncate mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{item.name}</h4>
                <div className="flex items-center justify-between mt-4">
                    <span className="text-teal-600 dark:text-teal-400 font-black text-base md:text-xl italic">
                        {typeof item.price === 'string' ? item.price : `$${item.price || '0.00'}`}
                    </span>
                    <div className="w-9 h-9 rounded-2xl bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-all text-teal-600 shadow-sm">
                        <span className="text-lg font-black">+</span>
                    </div>
                </div>
            </div>
        </Link>
    );

    return (
        <section
            className={`relative py-12 md:py-24 overflow-hidden theme-transition ${className} ${isLoading ? 'animate-pulse' : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Ambient Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-64 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[2rem] bg-teal-500/10 flex items-center justify-center text-4xl shadow-inner border border-teal-500/20">
                            {emoji || (type === 'brand' ? '🏙️' : '✨')}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">Verified Hub</span>
                            </div>
                            <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3 italic uppercase">
                                {type === 'brand' ? 'Premier Brands & Hosts' : 'Island Trending Now'}
                            </h3>
                            <p className="text-sm md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-lg leading-tight italic">
                                {type === 'brand'
                                    ? 'Showcasing high-caliber local entrepreneurs and unique island stays.'
                                    : 'The most coveted local treasures loved by the community.'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={type === 'brand' ? '/stores' : '/listings'}
                        className="group flex items-center gap-4 px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-teal-500 hover:bg-teal-500 hover:text-white transition-all duration-500 self-start md:self-auto shadow-xl shadow-slate-200/50"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.2em]">
                            Explore All {type === 'brand' ? 'Stores' : 'Products'}
                        </span>
                        <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Marquee Container */}
            <div
                className="relative z-10 overflow-hidden select-none"
                style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}
            >
                {isLoading ? (
                    <div className="flex gap-8 px-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="shrink-0 w-44 h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 md:gap-10 px-6 will-change-transform py-6"
                    >
                        {doubledItems.map((item, index) => (
                            <div key={`${item.id}-${index}`}>
                                {type === 'brand'
                                    ? <BrandCard item={item} />
                                    : <ProductCard item={item} index={index} />
                                }
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

