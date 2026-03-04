"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { useCart } from '@/contexts/CartContext';
import api, { getImageUrl } from '@/lib/api';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ReviewSection from '@/components/ReviewSection';
import AvailabilityCalendar from '@/components/AvailabilityCalendar';
import KitchenSidebar from '@/components/marketplace/KitchenSidebar';

export interface Listing {
    id: number;
    title: string;
    description: string;
    goal_amount?: number;
    current_amount?: number;
    type: string;
    category: string;
    image_url?: string;
    images?: string[];
    photos?: { id: string; url: string; is_primary: boolean; order_index: number }[];
    price: number | string;
    store_id?: number | string;
    currency?: string;
    creator_id: number;
    owner_name?: string;
    vendor_name?: string;
    vendor_id?: number;
    vendor_bio?: string;
    slug?: string;
    metadata?: {
        sub_type?: string;
        inventory_count?: number;
        deadline?: string;
        shipping_info?: string;
        unavailable_dates?: string[];
        location_notes?: string;
        variants?: any;
        addons?: any[];
        menu_sections?: any[];
        gallery?: string[];
        specialties?: any[];
        [key: string]: any;
        duration?: string;
        vendor_bio?: string;
        make?: string;
        model?: string;
        year?: number;
        insurance_included?: boolean;
        transmission?: string;
        property_type?: string;
        rooms?: number;
        beds?: number;
        guests?: number;
        amenities?: string[];
        inclusions?: string[];
        exclusions?: string[];
        site_ids?: string;
        client_rating?: number;
        experience_years?: string;
        pickup_schedules?: { location: string; time: string }[];
        appointment_config?: {
            days: string[];
            start: string;
            end: string;
        };
        catalogue_sections?: any[];
    };
    created_at: string;
}

const CATEGORY_THEMES: Record<string, { color: string; label: string; icon: string }> = {
    food: { color: 'rose', label: 'Local Food', icon: '🍴' },
    product: { color: 'amber', label: 'Local Products', icon: '📦' },
    service: { color: 'emerald', label: 'Service', icon: '🛠' },
    campaign: { color: 'indigo', label: 'Campaign', icon: '❤️' },
    rental: { color: 'blue', label: 'Rentals & Stays', icon: '🏠' }
};

const DEFAULT_SLOTS = ['09:00 AM', '10:30 AM', '12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM'];

export default function ListingClient({ listing }: { listing: Listing }) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [isKitchenSidebarOpen, setIsKitchenSidebarOpen] = useState(false);
    const [selectedItemForAddons, setSelectedItemForAddons] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    useEffect(() => {
        if (!listing.id) return;
        api.post(`/listings/${listing.id}/view`).catch(err => console.error("View track err:", err));
    }, [listing.id]);

    const theme = CATEGORY_THEMES[listing.type === 'product' && listing.category?.toLowerCase() === 'food' ? 'food' : listing.type] || CATEGORY_THEMES.product;
    const accentColor = (listing as any).branding_color || '#14b8a6';

    const displayImages = React.useMemo(() => {
        // Debug: Log the actual structure
        console.log('Listing image data:', {
            photos: listing.photos,
            images: listing.images,
            image_url: listing.image_url,
            metadata_image: (listing.metadata as any)?.image
        });

        // Helper to extract URL from various formats
        const extractUrl = (item: any): string | null => {
            if (!item) return null;
            if (typeof item === 'string') return item;
            if (item.url) return item.url;
            if (item.image_url) return item.image_url;
            if (item.path) return item.path;
            return null;
        };

        // Try photos first (new structure)
        if (listing.photos && listing.photos.length > 0) {
            const photoUrls = [...listing.photos]
                .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                .map(extractUrl)
                .filter(Boolean) as string[];

            if (photoUrls.length > 0) {
                console.log('Using photos:', photoUrls);
                return photoUrls;
            }
        }

        // Try images array (legacy structure)
        if (listing.images && listing.images.length > 0) {
            const imageUrls = listing.images
                .map(extractUrl)
                .filter(Boolean) as string[];

            if (imageUrls.length > 0) {
                console.log('Using images:', imageUrls);
                return imageUrls;
            }
        }

        // Fallback to single image
        if (listing.image_url) {
            console.log('Using image_url:', listing.image_url);
            return [listing.image_url];
        }

        // Last resort: metadata image
        const metadataImage = (listing.metadata as any)?.image;
        if (metadataImage) {
            console.log('Using metadata image:', metadataImage);
            return [metadataImage];
        }

        console.log('No images found');
        return [];
    }, [listing]);

    const calculateTotal = () => {
        const base = parseFloat(String(listing.price || 0));
        const addonsTotal = selectedAddons.reduce((acc, a) => acc + (parseFloat(a.price) || 0), 0);
        return (base + addonsTotal) * quantity;
    };

    const handleAction = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/listings/${listing.id}`);
            return;
        }

        if (listing.type === 'campaign') {
            router.push(`/checkout?campaignId=${listing.id}`);
            return;
        }

        if (listing.type === 'service') {
            if (!selectedDate || !selectedSlot) {
                setIsBookingModalOpen(true);
                return;
            }
        }

        setIsAdding(true);
        try {
            const payload: any = {
                quantity,
                selectedVariant: selectedVariants,
                selectedAddons: selectedAddons
            };

            if (listing.type === 'service') {
                payload.appointmentSlot = `${selectedDate} ${selectedSlot}`;
            }

            await addToCart(listing.id, payload);
            toast.success(listing.type === 'service' ? 'Appointment requested!' : 'Added to cart');
        } catch (error) {
            console.error('Failed to add to cart:', error);
            toast.error('Failed to update cart');
        } finally {
            setIsAdding(false);
        }
    };

    const isKitchen = listing.category?.toLowerCase() === 'food' || listing.title.toLowerCase().includes('ital');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => {
                                    if (window.history.length > 1) {
                                        router.back();
                                    } else {
                                        router.push('/listings');
                                    }
                                }}
                                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back
                            </button>
                            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
                                <Link href="/" className="hover:text-slate-600 transition-colors">Home</Link>
                                <span>/</span>
                                <Link href={`/${listing.type === 'product' && listing.category?.toLowerCase() === 'food' ? 'food' : listing.type + 's'}`} className="hover:text-slate-600 transition-colors">
                                    {theme.label}
                                </Link>
                                <span>/</span>
                                <span className="text-slate-900 truncate max-w-[200px]">{listing.title}</span>
                            </div>
                        </div>
                        {isKitchen && (
                            <button
                                onClick={() => setIsKitchenSidebarOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                <span>👨‍🍳</span>
                                Kitchen Hub
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <KitchenSidebar
                isOpen={isKitchenSidebarOpen}
                onClose={() => setIsKitchenSidebarOpen(false)}
                listingTitle={listing.title}
                storeId={listing.store_id || listing.vendor_id || listing.creator_id}
            />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Image Gallery */}
                        <div className="relative aspect-4/3 bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={activeImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    src={displayImages.length > 0 && displayImages[activeImage]
                                        ? getImageUrl(displayImages[activeImage])
                                        : (getImageUrl(listing.image_url) || '/assets/placeholder-listing.png')}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Image failed to load:', displayImages[activeImage]);
                                        e.currentTarget.src = '/assets/placeholder-listing.png';
                                    }}
                                />
                            </AnimatePresence>

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                                <span
                                    className="px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-sm"
                                    style={{ backgroundColor: accentColor }}
                                >
                                    {theme.label}
                                </span>
                            </div>

                            {/* Image Counter */}
                            {displayImages.length > 1 && (
                                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                                    {activeImage + 1} / {displayImages.length}
                                </div>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {displayImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-slate-900 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900 mb-4">Description</h2>
                            <p className="text-slate-600 leading-relaxed">
                                {listing.description}
                            </p>
                        </div>

                        {/* Inclusions / Exclusions */}
                        {((listing.metadata as any)?.inclusions?.length > 0 || (listing.metadata as any)?.exclusions?.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {(listing.metadata as any).inclusions?.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            What's Included
                                        </h3>
                                        <ul className="space-y-2">
                                            {(listing.metadata as any).inclusions.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <span className="text-emerald-500 mt-0.5">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {(listing.metadata as any).exclusions?.length > 0 && (
                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                            What's Not Included
                                        </h3>
                                        <ul className="space-y-2">
                                            {(listing.metadata as any).exclusions.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                                                    <span className="text-rose-400 mt-0.5">•</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Restaurant Menu */}
                        {(listing.metadata as any)?.menu_sections && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Restaurant Menu</h2>
                                <div className="space-y-8">
                                    {(listing.metadata as any).menu_sections?.map((section: any, sIdx: number) => (
                                        <div key={sIdx}>
                                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                                                {section.section_name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {section.items?.map((item: any, iIdx: number) => (
                                                    <div
                                                        key={iIdx}
                                                        onClick={() => setSelectedItemForAddons(item)}
                                                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer flex gap-4"
                                                    >
                                                        {item.image_url && (
                                                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                                                                <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.item_name || item.name} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <h4 className="font-medium text-slate-900">{item.item_name || item.name}</h4>
                                                                <span className="font-semibold text-rose-600">${item.price}</span>
                                                            </div>
                                                            <p className="text-slate-500 text-sm">{item.description}</p>
                                                            {item.addons && JSON.parse(typeof item.addons === 'string' ? item.addons : JSON.stringify(item.addons)).length > 0 && (
                                                                <span className="mt-2 text-xs font-medium text-emerald-600">+ Addons Available</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Boutique Catalogue */}
                        {(listing.metadata as any)?.catalogue_sections && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Boutique Catalogue</h2>
                                <div className="space-y-8">
                                    {(listing.metadata as any).catalogue_sections?.map((section: any, sIdx: number) => (
                                        <div key={sIdx}>
                                            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-4">
                                                {section.section_name}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {section.items?.map((item: any, iIdx: number) => (
                                                    <div key={iIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-4">
                                                        {item.image_url && (
                                                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                                                                <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.name} />
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div>
                                                                    <h4 className="font-medium text-slate-900">{item.name}</h4>
                                                                    {item.colors && <p className="text-xs text-slate-400">{item.colors}</p>}
                                                                </div>
                                                                <span className="font-semibold text-slate-900">${item.price}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {Array.isArray(item.sizes) ? item.sizes.map((s: string) => (
                                                                    <span key={s} className="px-2 py-0.5 bg-white rounded text-xs text-slate-500 border border-slate-200">{s}</span>
                                                                )) : item.sizes && <span className="px-2 py-0.5 bg-white rounded text-xs text-slate-500 border border-slate-200">{item.sizes}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rental/Service CTA */}
                        {(listing.type === 'rental' || listing.type === 'service') && (
                            <div className="bg-slate-900 rounded-2xl p-8 text-white">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-semibold mb-2">
                                            {listing.type === 'rental' ? 'Direct Booking' : 'Book Island Expertise'}
                                        </h3>
                                        <p className="text-slate-400 text-sm">
                                            {listing.type === 'rental' ? 'Live pricing and instant confirmation' : 'Quality service from verified local experts'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => listing.type === 'service' && setIsBookingModalOpen(true)}
                                        className="px-8 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                                    >
                                        {listing.type === 'rental' ? 'View Schedule' : 'Select Date & Time'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Specifications */}
                        {listing.metadata && Object.keys(listing.metadata).length > 2 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h2 className="text-lg font-semibold text-slate-900 mb-6">Specifications</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(listing.metadata).map(([key, value]) => {
                                        if (['sub_type', 'vendor_bio', 'unavailable_dates', 'menu_sections', 'catalogue_sections', 'specialties', 'variants', 'addons', 'appointment_config', 'pickup_schedules', 'inclusions', 'exclusions', 'gallery'].includes(key)) return null;
                                        if (value === undefined || value === null || value === '') return null;

                                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

                                        return (
                                            <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
                                                <span className="block mt-1 font-medium text-slate-900">
                                                    {Array.isArray(value) ? (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {value.map((v, i) => {
                                                                const displayValue = typeof v === 'object' && v !== null ? (v.label || v.name || JSON.stringify(v)) : String(v);
                                                                return (
                                                                    <span key={v?.id || v?.name || i} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600 border border-slate-200">
                                                                        {displayValue}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : typeof value === 'boolean' ? (
                                                        value ? 'Yes' : 'No'
                                                    ) : typeof value === 'object' && value !== null ? (
                                                        (value as any).label || (value as any).name || JSON.stringify(value)
                                                    ) : value.toString()}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Vendor Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl overflow-hidden">
                                        {(listing as any).vendor_logo ? (
                                            <img src={getImageUrl((listing as any).vendor_logo)} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <span>{theme.icon}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Verified Island Partner</span>
                                    <h3 className="text-xl font-semibold text-slate-900 mt-1">
                                        {(listing as any).store_name || (listing as any).vendor_name || listing.owner_name || 'Island Partner'}
                                    </h3>
                                    {(listing as any).vendor_bio && (
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{(listing as any).vendor_bio}</p>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <Link href={(listing as any).store_slug ? `/store/${(listing as any).store_slug}` : `/vendors/${listing.creator_id}`}>
                                        <button className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                            View Store
                                        </button>
                                    </Link>
                                    <Link href={`/dashboard/messages?userId=${listing.creator_id}&userName=${listing.owner_name}`}>
                                        <button className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors">
                                            Message
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        {listing.vendor_id && (
                            <div className="pt-8">
                                <ReviewSection vendorId={String(listing.vendor_id)} listingId={String(listing.id)} />
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0 lg:sticky lg:top-24 lg:self-start">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                            <div className="p-6 border-b border-slate-100">
                                <h1 className="text-2xl font-semibold text-slate-900 leading-tight mb-4">
                                    {listing.title}
                                </h1>

                                {/* Price Section */}
                                {listing.type === 'campaign' ? (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Current Funding</span>
                                                <span className="block text-4xl font-bold text-slate-900">${(listing.current_amount || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Goal</span>
                                                <span className="block text-lg font-medium text-slate-500">${(listing.goal_amount || 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(100, (Number(listing.current_amount || 0) / Number(listing.goal_amount || 1)) * 100)}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: accentColor }}
                                            />
                                        </div>
                                        <p className="text-xs font-medium text-slate-400 text-center">Verified Hub Campaign</p>
                                    </div>
                                ) : (
                                    <div>
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Price</span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold text-slate-900">${(listing.price || 0).toLocaleString()}</span>
                                            {listing.type === 'rental' && <span className="text-sm text-slate-400">/ day</span>}
                                            {listing.type === 'service' && <span className="text-xs text-slate-400">starting price</span>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Variants Selection */}
                                {listing.metadata?.variants && typeof listing.metadata.variants === 'object' && !Array.isArray(listing.metadata.variants) && (
                                    <div className="space-y-4">
                                        {Object.entries(listing.metadata.variants).map(([groupName, options], idx) => (
                                            <div key={idx}>
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">{groupName}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(options as string[]).map((v: string) => {
                                                        const isSelected = selectedVariants[groupName] === v;
                                                        return (
                                                            <button
                                                                key={v}
                                                                onClick={() => setSelectedVariants(prev => ({ ...prev, [groupName]: v }))}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected
                                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                {v}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Legacy Variants */}
                                {listing.metadata?.variants && Array.isArray(listing.metadata.variants) && (
                                    <div className="space-y-4">
                                        {listing.metadata.variants.map((variant: any, idx: number) => (
                                            <div key={idx}>
                                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">{variant.name}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {((typeof variant.values === 'string' ? variant.values : '')).split(',').map((val: string) => {
                                                        const v = val.trim();
                                                        if (!v) return null;
                                                        const isSelected = selectedVariants[variant.name] === v;
                                                        return (
                                                            <button
                                                                key={v}
                                                                onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.name]: v }))}
                                                                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isSelected
                                                                        ? 'border-slate-900 bg-slate-900 text-white'
                                                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                                    }`}
                                                            >
                                                                {v}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Addons Selection */}
                                {listing.metadata?.addons && Array.isArray(listing.metadata.addons) && listing.metadata.addons.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Enhance your order</p>
                                        <div className="space-y-2">
                                            {listing.metadata.addons.map((addon, idx) => {
                                                const isSelected = selectedAddons.find((a: any) => a.name === addon.name);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setSelectedAddons(prev => prev.filter((a: any) => a.name !== addon.name));
                                                            } else {
                                                                setSelectedAddons(prev => [...prev, { name: addon.name, price: addon.price }]);
                                                            }
                                                        }}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border ${isSelected
                                                                ? 'bg-slate-900 border-slate-900 text-white'
                                                                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-slate-900 border-white' : 'border-slate-300'}`}>
                                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                            <span className="text-sm font-medium">{addon.name}</span>
                                                        </div>
                                                        <span className={`text-sm font-medium ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>+${addon.price}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Service Schedule */}
                                {listing.metadata?.appointment_config && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Typical Schedule</p>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                const isAvailable = listing.metadata?.appointment_config?.days?.includes(day);
                                                return (
                                                    <span key={day} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${isAvailable ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                                        {day.charAt(0)}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between text-sm font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                                            <span>{listing.metadata?.appointment_config?.start || '9:00'}</span>
                                            <span className="text-slate-400">to</span>
                                            <span>{listing.metadata?.appointment_config?.end || '17:00'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Pickup Schedules */}
                                {listing.metadata?.pickup_schedules && Array.isArray(listing.metadata.pickup_schedules) && listing.metadata.pickup_schedules.length > 0 && (
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Pickup Schedule</p>
                                        <div className="space-y-2">
                                            {listing.metadata.pickup_schedules.map((sched: any, sIdx: number) => (
                                                <div key={sIdx} className="flex justify-between items-center text-sm bg-white p-2 rounded-lg border border-slate-200">
                                                    <span className="text-slate-700">{sched.location}</span>
                                                    <span className="text-emerald-600 font-medium">{sched.time}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rental Inclusions */}
                                {listing.metadata?.inclusions && (
                                    <div>
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Included</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(listing.metadata.inclusions as string[]).map((inc: string) => (
                                                <span key={inc} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                                                    {inc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Trust Badges */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 mb-1">Experience</p>
                                        <p className="text-sm font-semibold text-slate-900">{(listing.metadata as any)?.experience_years || '10y+'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                        <p className="text-xs text-slate-400 mb-1">Rating</p>
                                        <div className="flex items-center justify-center gap-1">
                                            <span className="text-sm font-semibold text-slate-900">{(listing.metadata as any)?.client_rating || '4.9'}</span>
                                            <span className="text-amber-500 text-sm">★</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                {listing.type !== 'service' && listing.type !== 'campaign' && (
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <span className="text-sm font-medium text-slate-600">Quantity</span>
                                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 hover:bg-slate-50 transition-colors">−</button>
                                            <span className="w-8 text-center font-medium text-slate-900">{quantity}</span>
                                            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-slate-600 hover:bg-slate-50 transition-colors">+</button>
                                        </div>
                                    </div>
                                )}

                                {/* Service Date Picker */}
                                {listing.type === 'service' && (
                                    <button
                                        onClick={() => setIsBookingModalOpen(true)}
                                        className={`w-full p-4 rounded-xl border transition-all text-left ${selectedDate && selectedSlot ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        {selectedDate && selectedSlot ? (
                                            <div>
                                                <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">Selected</span>
                                                <p className="text-sm font-semibold text-slate-900 mt-1">
                                                    {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} @ {selectedSlot}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm">📅</div>
                                                <div>
                                                    <span className="text-sm font-medium text-slate-900">Select Date & Time</span>
                                                    <p className="text-xs text-slate-400">Check availability</p>
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                )}

                                {/* Total & CTA */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-slate-600">Total</span>
                                        <span className="text-2xl font-bold text-slate-900">${calculateTotal().toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleAction}
                                        disabled={isAdding || (listing.type === 'product' && listing.metadata?.variants && Object.keys(selectedVariants).length < (Array.isArray(listing.metadata.variants) ? listing.metadata.variants.length : Object.keys(listing.metadata.variants).length)) || (listing.type === 'service' && (!selectedDate || !selectedSlot))}
                                        className="w-full py-3.5 rounded-xl font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: isAdding ? '#94a3b8' : accentColor }}
                                    >
                                        {isAdding ? 'Adding...' : listing.type === 'campaign' ? 'Contribute Now' : listing.type === 'service' ? 'Request Appointment' : 'Add to Cart'}
                                    </button>
                                    <p className="text-center mt-3 text-xs text-slate-400">
                                        Secure transactions by IslandHub
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Service Specialties */}
                        {listing.type === 'service' && listing.metadata?.specialties && (
                            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Our Specialties</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Array.isArray(listing.metadata.specialties) && listing.metadata.specialties.map((spec: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-indigo-50 rounded-xl">
                                            <p className="font-medium text-indigo-900 text-sm">{spec.name || spec}</p>
                                            {spec.description && <p className="text-xs text-indigo-600/70 mt-1">{spec.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Left Panel */}
                            <div className="md:w-2/5 bg-slate-900 p-6 text-white">
                                <button
                                    onClick={() => setIsBookingModalOpen(false)}
                                    className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="mt-12">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Book Your Session</p>
                                    <h3 className="text-xl font-semibold mb-4">{listing.title}</h3>
                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400">Duration:</span>
                                            <span className="font-medium">{(listing.metadata as any)?.duration || '60 min'}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400">Starting from:</span>
                                            <span className="font-semibold text-lg">${listing.price}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-slate-900 mb-4">1. Select Date</h4>
                                    <AvailabilityCalendar
                                        listingId={listing.id}
                                        onDateSelect={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                                        selectedDate={selectedDate ? new Date(selectedDate) : undefined}
                                    />
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-slate-900 mb-4">2. Select Time</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DEFAULT_SLOTS.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${selectedSlot === slot
                                                        ? 'bg-slate-900 border-slate-900 text-white'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (selectedDate && selectedSlot) {
                                            setIsBookingModalOpen(false);
                                            handleAction();
                                        }
                                    }}
                                    disabled={!selectedDate || !selectedSlot}
                                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm & Request
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Item Addons Modal */}
            <AnimatePresence>
                {selectedItemForAddons && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItemForAddons(null)}
                            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-xl"
                        >
                            <div className="relative aspect-video">
                                <img src={getImageUrl(selectedItemForAddons.image_url || listing.image_url)} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => setSelectedItemForAddons(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold text-slate-900">{selectedItemForAddons.item_name || selectedItemForAddons.name}</h3>
                                    <span className="text-lg font-semibold text-rose-600">${selectedItemForAddons.price}</span>
                                </div>
                                <p className="text-sm text-slate-500 mb-6">{selectedItemForAddons.description}</p>

                                {selectedItemForAddons.addons && (
                                    <div className="space-y-3 mb-6">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Available Addons</p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {JSON.parse(typeof selectedItemForAddons.addons === 'string' ? selectedItemForAddons.addons : JSON.stringify(selectedItemForAddons.addons)).map((addon: any, idx: number) => {
                                                const isSelected = selectedAddons.some((a: any) => a.name === addon.name);
                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => isSelected ? setSelectedAddons(prev => prev.filter((a: any) => a.name !== addon.name)) : setSelectedAddons(prev => [...prev, { name: addon.name, price: addon.price }])}
                                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isSelected
                                                                ? 'border-rose-500 bg-rose-50'
                                                                : 'border-slate-200 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-rose-500 border-rose-500' : 'border-slate-300'}`}>
                                                                {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                            <span className={`text-sm font-medium ${isSelected ? 'text-rose-700' : 'text-slate-700'}`}>{addon.name}</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-500">+${addon.price}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={async () => {
                                        const addons = selectedAddons.map((addonName: any) => {
                                            const foundAddon = JSON.parse(typeof selectedItemForAddons.addons === 'string' ? selectedItemForAddons.addons : JSON.stringify(selectedItemForAddons.addons)).find((a: any) => a.name === (addonName.name || addonName));
                                            return foundAddon ? { name: foundAddon.name, price: foundAddon.price } : { name: addonName.name || addonName, price: 0 };
                                        });
                                        await addToCart(listing.id, {
                                            itemId: selectedItemForAddons.id,
                                            quantity: 1,
                                            selectedVariant: {},
                                            selectedAddons: addons
                                        });
                                        toast.success(`${selectedItemForAddons.item_name || selectedItemForAddons.name} added to cart!`);
                                        setSelectedItemForAddons(null);
                                    }}
                                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
                                >
                                    Add to Order
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
