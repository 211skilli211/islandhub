import React, { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getImageUrl } from '@/lib/api';
import TypeBadge from './TypeBadge';

interface Listing {
    id: string;
    type: 'product' | 'campaign' | 'rental' | 'service';
    category?: string;
    sub_category?: string;
    tour_category?: string;
    title: string;
    description: string;
    price?: number;
    goal_amount?: number;
    current_amount?: number;
    location?: string;
    duration?: string;
    capacity?: number;
    images?: string[];
    image_url?: string;
    photos?: string[];
    metadata?: {
        inventory_count?: number;
        deadline?: string;
        shipping_info?: string;
        unavailable_dates?: string[];
        duration?: string;
        vendor_bio?: string;
        image?: string;
        beneficiary?: string;
    };
    is_promoted?: boolean;
    created_at: string;
    shop_name?: string;
    shop_logo?: string;
    shop_slug?: string;
}

interface ListingCardProps {
    listing: Listing;
    onClick?: () => void;
    layout?: 'default' | 'compact' | 'grid' | 'list';
}

const ListingCardComponent = function ListingCard({ listing, onClick, layout = 'default' }: ListingCardProps) {
    const memoizedListingData = useMemo(() => {
        const { type, title, price, goal_amount, metadata, is_promoted, location, duration, capacity } = listing;

        const isTransport = (listing as any).service_type && ['taxi', 'delivery', 'pickup'].includes((listing as any).service_type);
        const vehicleType = (listing as any).vehicle_category;
        const isFood = (listing as any).category?.toLowerCase() === 'food' || type?.toLowerCase() === 'food';
        const activeType = isFood ? 'food' : type;

        const extractPhotoUrl = (photo: any): string | null => {
            if (!photo) return null;
            if (typeof photo === 'string') return photo;
            if (typeof photo === 'object' && photo.url) return photo.url;
            return null;
        };

        const primaryAsset = (isTransport && vehicleType)
            ? `/assets/vehicles/${vehicleType.toLowerCase()}.png`
            : (listing.photos && listing.photos.length > 0)
                ? extractPhotoUrl(listing.photos[0])
                : (listing.images && listing.images.length > 0)
                    ? extractPhotoUrl(listing.images[0])
                    : (listing.image_url || metadata?.image || null);

        const imageUrl = (typeof primaryAsset === 'string' && primaryAsset.startsWith('/'))
            ? primaryAsset
            : getImageUrl(primaryAsset) || getImageUrl('file-1769965232226-73669333.jpg');

        return { type, title, price, goal_amount, is_promoted, location, duration, capacity, isFood, activeType, imageUrl };
    }, [listing]);

    const { type, title, price, goal_amount, is_promoted, location, duration, capacity, imageUrl } = memoizedListingData;

    const renderPriceOrGoal = useCallback(() => {
        if (type === 'campaign' && goal_amount) {
            return (
                <div className="mt-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-1">Campaign Goal</p>
                    <p className="text-xl font-black text-ink-primary">${goal_amount.toLocaleString()}</p>
                    <div className="w-full bg-surface-tertiary rounded-full h-2 mt-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-accent-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
            );
        }
        if (price) {
            return (
                <div className="mt-2 text-left">
                    <p className="text-2xl font-black text-ink-primary">
                        ${price.toLocaleString()}
                        {type === 'rental' && <span className="text-xs font-bold text-ink-tertiary uppercase tracking-widest ml-1">/ day</span>}
                    </p>
                </div>
            );
        }
        return null;
    }, [type, goal_amount, price]);

    const renderMeta = useCallback(() => {
        if (type === 'product' && listing.metadata?.inventory_count !== undefined) {
            const count = listing.metadata.inventory_count;
            const isLow = count > 0 && count <= 5;
            return (
                <div className="flex items-center gap-2 mt-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${count > 0 ? (isLow ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500') : 'bg-red-500'}`}></div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${count === 0 ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-ink-tertiary'}`}>
                        {count === 0 ? 'Out of stock' : isLow ? `Only ${count} left!` : `${count} in stock`}
                    </span>
                </div>
            )
        }
        if (type === 'campaign' && listing.metadata?.deadline) {
            const daysLeft = Math.ceil((new Date(listing.metadata.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-sand-500 bg-sand-500/10 px-2 py-1 rounded-md">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                    </span>
                </div>
            )
        }
        if ((type === 'service' || type === 'rental') && (duration || listing.metadata?.duration)) {
            return (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-400 bg-accent-500/10 px-2 py-1 rounded-md">
                        ⏱ {duration || listing.metadata?.duration}
                    </span>
                    {capacity && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                            👤 {capacity} Guests
                        </span>
                    )}
                </div>
            )
        }
        return null;
    }, [type, listing.metadata, duration, capacity]);

    const renderAction = useCallback(() => {
        const priceStr = price ? ` • $${price.toFixed(2)}` : '';
        switch (type) {
            case 'product': return `Add to Cart${priceStr}`;
            case 'campaign': return 'Donate Now';
            case 'rental': return 'Review Dates';
            case 'service': return `Book Now${priceStr}`;
            default: return 'Explore';
        }
    }, [type, price]);

    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [showZoom, setShowZoom] = useState(false);

    const getDetailHref = useCallback(() => {
        if (onClick) return '#';
        const id = listing.id || (listing as any).listing_id;
        if (type === 'rental') return `/rentals/${id}`;
        if (type === 'campaign') return `/campaigns/${id}`;
        return `/listings/${id}`;
    }, [onClick, listing.id, (listing as any).listing_id, type]);

    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
        const handleCardClick = (e: React.MouseEvent) => {
            if ((e.target as HTMLElement).closest('a, button')) {
                return;
            }
            if (onClick) {
                e.preventDefault();
                onClick();
            } else {
                router.push(getDetailHref());
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onClick) onClick();
                else router.push(getDetailHref());
            }
        };

        return (
            <div
                onClick={handleCardClick}
                onKeyDown={handleKeyDown}
                role="link"
                tabIndex={0}
                className="group relative bg-surface-elevated rounded-2xl flex flex-col overflow-hidden border border-border-primary hover:shadow-xl hover:shadow-black/20 transition-all duration-500 hover:-translate-y-2 h-full w-full text-left cursor-pointer"
            >
                {children}
            </div>
        );
    };

    // List layout
    if (layout === 'list') {
        return (
            <CardWrapper>
                <div className="flex items-center gap-4 p-3 sm:p-4">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                        <img
                            src={imageUrl || '/assets/placeholder-listing.png'}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt={listing.title}
                        />
                        {listing.is_promoted && (
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-sand-500 text-white rounded text-[7px] font-black uppercase">★</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="text-sm sm:text-base font-black text-ink-primary leading-tight group-hover:text-accent-400 transition-colors truncate">
                                    {title}
                                </h3>
                                <p className="text-[10px] sm:text-xs text-ink-tertiary font-medium line-clamp-1 mt-0.5">
                                    {listing.description}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                {renderPriceOrGoal()}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <TypeBadge type={type} />
                            {listing.shop_name && (
                                <span className="text-[9px] font-bold text-ink-tertiary truncate">by {listing.shop_name}</span>
                            )}
                            {location && (
                                <span className="text-[9px] text-accent-400 font-medium">📍 {location}</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardWrapper>
        );
    }

    // Grid layout (compact grid for catalogue)
    if (layout === 'grid') {
        return (
            <CardWrapper>
                <div className="relative aspect-square overflow-hidden">
                    <img
                        src={imageUrl || '/assets/placeholder-listing.png'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        alt={listing.title}
                    />
                    {listing.is_promoted && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-sand-500 text-white rounded text-[8px] font-black uppercase shadow">★</span>
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                </div>
                <div className="p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-black text-ink-primary leading-tight group-hover:text-accent-400 transition-colors line-clamp-2 mb-1">
                        {title}
                    </h3>
                    <div className="flex items-center justify-between">
                        {renderPriceOrGoal()}
                        <TypeBadge type={type} />
                    </div>
                </div>
            </CardWrapper>
        );
    }

    return (
        <CardWrapper>
            <div className="relative aspect-[16/10] overflow-hidden cursor-zoom-in" onMouseEnter={() => setShowZoom(true)} onMouseLeave={() => setShowZoom(false)}>
                <img
                    src={imageUrl || '/assets/placeholder-listing.png'}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${showZoom ? 'scale-150' : ''}`}
                    alt={listing.title}
                />
                {/* Wishlist Heart */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsWishlisted(!isWishlisted); }}
                    className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors group/heart"
                    aria-label="Add to wishlist"
                >
                    <svg
                        className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'text-red-500 scale-110' : 'text-white group-hover/heart:scale-110'}`}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <TypeBadge type={type} />
                        {listing.is_promoted && (
                            <span className="px-3 py-1 bg-sand-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-sand-500/20">
                                Featured
                            </span>
                        )}
                    </div>
                    {listing.shop_name && (
                        <Link
                            href={`/store/${listing.shop_slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-20 flex items-center gap-1.5 px-2 py-1 bg-surface-elevated/90 backdrop-blur-md rounded-xl border border-white/10 shadow-sm hover:bg-surface-elevated transition-colors group/shop"
                        >
                            <div className="w-5 h-5 rounded-lg bg-surface-secondary overflow-hidden border border-border-primary shrink-0">
                                {listing.shop_logo ? (
                                    <img src={getImageUrl(listing.shop_logo)} alt={listing.shop_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] grayscale group-hover/shop:grayscale-0 transition-all">🏪</div>
                                )}
                            </div>
                            <span className="text-[9px] font-black text-ink-primary uppercase tracking-tight truncate max-w-[80px]">
                                {listing.shop_name}
                            </span>
                        </Link>
                    )}
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />

                {/* Floating Action Hint */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-surface-elevated/90 backdrop-blur-md rounded-full text-[10px] sm:text-sm font-black uppercase tracking-widest text-ink-primary shadow-xl border border-white/10 whitespace-nowrap">
                        {renderAction()} →
                    </span>
                </div>
            </div>

            <div className={`flex-1 flex flex-col text-left ${layout === 'compact' ? 'p-4' : 'p-5 md:p-8'}`}>
                <div className="flex-1">
                    <h3 className={`${layout === 'compact' ? 'text-lg' : 'text-xl md:text-2xl'} font-black text-ink-primary leading-tight group-hover:text-accent-400 transition-colors line-clamp-1 mb-2 md:mb-3`}>
                        {title}
                    </h3>
                    {location && (
                        <p className="text-[10px] font-black text-accent-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                            📍 {location}
                        </p>
                    )}
                    <p className="text-xs sm:text-sm text-ink-tertiary font-medium line-clamp-2 leading-relaxed">
                        {listing.description}
                    </p>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border-primary">
                    {renderPriceOrGoal()}
                    {renderMeta()}
                </div>
            </div>
        </CardWrapper>
    );
};

export default memo(ListingCardComponent);
