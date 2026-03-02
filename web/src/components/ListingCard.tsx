import React, { memo, useCallback, useMemo } from 'react';
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
    layout?: 'default' | 'compact';
}

const ListingCardComponent = function ListingCard({ listing, onClick, layout = 'default' }: ListingCardProps) {
    // Memoize expensive computations based on the listing prop
    const memoizedListingData = useMemo(() => {
        const { type, title, price, goal_amount, metadata, is_promoted, location, duration, capacity } = listing;

        const isTransport = (listing as any).service_type && ['taxi', 'delivery', 'pickup'].includes((listing as any).service_type);
        const vehicleType = (listing as any).vehicle_category;
        const isFood = (listing as any).category?.toLowerCase() === 'food' || type?.toLowerCase() === 'food';
        const activeType = isFood ? 'food' : type;

        // Helper to extract URL from photo (handles both string and object formats)
        const extractPhotoUrl = (photo: any): string | null => {
            if (!photo) return null;
            if (typeof photo === 'string') return photo;
            if (typeof photo === 'object' && photo.url) return photo.url;
            return null;
        };

        // Standardized Priority: Transport Image -> Manual Photos -> Group Images -> Main image_url -> Metadata -> No fallback
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
    }, [listing]); // Dependencies for this memo block

    const { type, title, price, goal_amount, is_promoted, location, duration, capacity, imageUrl } = memoizedListingData;

    // Memoize render functions
    const renderPriceOrGoal = useCallback(() => {
        if (type === 'campaign' && goal_amount) {
            return (
                <div className="mt-2 text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Campaign Goal</p>
                    <p className="text-xl font-black text-slate-900">${goal_amount.toLocaleString()}</p>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                        <div className="bg-linear-to-r from-teal-500 to-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>
            );
        }
        if (price) {
            return (
                <div className="mt-2 text-left">
                    <p className="text-2xl font-black text-slate-900">
                        ${price.toLocaleString()}
                        {type === 'rental' && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">/ day</span>}
                    </p>
                </div>
            );
        }
        return null;
    }, [type, goal_amount, price]);

    const renderMeta = useCallback(() => {
        if (type === 'product' && listing.metadata?.inventory_count !== undefined) {
            return (
                <div className="flex items-center gap-2 mt-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${listing.metadata.inventory_count > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {listing.metadata.inventory_count > 0 ? `${listing.metadata.inventory_count} in stock` : 'Out of stock'}
                    </span>
                </div>
            )
        }
        if (type === 'campaign' && listing.metadata?.deadline) {
            const daysLeft = Math.ceil((new Date(listing.metadata.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return (
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                    </span>
                </div>
            )
        }
        if ((type === 'service' || type === 'rental') && (duration || listing.metadata?.duration)) {
            return (
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                        ⏱ {duration || listing.metadata?.duration}
                    </span>
                    {capacity && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                            👤 {capacity} Guests
                        </span>
                    )}
                </div>
            )
        }
        return null;
    }, [type, listing.metadata, duration, capacity]);

    const renderAction = useCallback(() => {
        switch (type) {
            case 'product': return 'Add to Cart';
            case 'campaign': return 'Donate Now';
            case 'rental': return 'Review Dates';
            case 'service': return 'Book Now';
            default: return 'Explore';
        }
    }, [type]);

    const router = useRouter();

    const getDetailHref = useCallback(() => {
        if (onClick) return '#';
        const id = listing.id || (listing as any).listing_id;
        if (type === 'rental') return `/rentals/${id}`;
        if (type === 'campaign') return `/campaigns/${id}`;
        return `/listings/${id}`;
    }, [onClick, listing.id, (listing as any).listing_id, type]);

    const CardWrapper = ({ children }: { children: React.ReactNode }) => {
        const handleCardClick = (e: React.MouseEvent) => {
            // If the user clicked a link or button inside, don't trigger card navigation
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
                className="group relative bg-white rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 hover:-translate-y-2 h-full w-full text-left cursor-pointer"
            >
                {children}
            </div>
        );
    };

    return (
        <CardWrapper>
            <div className="relative aspect-4/3 overflow-hidden">
                <img
                    src={imageUrl || '/assets/placeholder-listing.png'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={listing.title}
                />
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <TypeBadge type={type} />
                        {listing.is_promoted && (
                            <span className="px-3 py-1 bg-amber-400 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-amber-200">
                                Featured
                            </span>
                        )}
                    </div>
                    {listing.shop_name && (
                        <Link
                            href={`/store/${listing.shop_slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="relative z-20 flex items-center gap-1.5 px-2 py-1 bg-white/90 backdrop-blur-md rounded-xl border border-white/50 shadow-sm hover:bg-white transition-colors group/shop"
                        >
                            <div className="w-5 h-5 rounded-lg bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                                {listing.shop_logo ? (
                                    <img src={getImageUrl(listing.shop_logo)} alt={listing.shop_name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] grayscale group-hover/shop:grayscale-0 transition-all">🏪</div>
                                )}
                            </div>
                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-tight truncate max-w-[80px]">
                                {listing.shop_name}
                            </span>
                        </Link>
                    )}
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Floating Action Hint */}
                <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white whitespace-nowrap">
                        {renderAction()} →
                    </span>
                </div>
            </div>

            <div className={`flex-1 flex flex-col text-left ${layout === 'compact' ? 'p-4' : 'p-5 md:p-8'}`}>
                <div className="flex-1">
                    <h3 className={`${layout === 'compact' ? 'text-lg' : 'text-xl md:text-2xl'} font-black text-slate-900 leading-tight group-hover:text-teal-600 transition-colors line-clamp-1 mb-2 md:mb-3`}>
                        {title}
                    </h3>
                    {location && (
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            📍 {location}
                        </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {listing.description}
                    </p>
                </div>

                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50">
                    {renderPriceOrGoal()}
                    {renderMeta()}
                </div>
            </div>
        </CardWrapper>
    );
};

// Memoize the entire component to prevent re-renders if props haven't changed
export default memo(ListingCardComponent);
