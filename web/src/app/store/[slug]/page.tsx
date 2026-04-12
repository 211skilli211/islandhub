'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { motion } from 'framer-motion';
import ReviewSection from '@/components/ReviewSection';
import { FoodShopLayout, RentalLayout, ServiceLayout, ProductLayout } from '@/components/marketplace/StoreLayouts';

export default function VendorStorefront() {
    const { slug } = useParams();
    const [vendor, setVendor] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStorefront = async () => {
            try {
                setLoading(true);
                let response;

                try {
                    // Try fetching from stores table first (new system)
                    response = await api.get(`/stores/slug/${slug}`);
                } catch (e: any) {
                    if (e.response?.status === 404) {
                        // Fallback to vendors table (legacy system)
                        response = await api.get(`/vendors/slug/${slug}`);
                    } else {
                        throw e;
                    }
                }

                if (response?.data) {
                    const storeData = response.data;
                    setVendor(storeData);

                    // The canonical ID for fetching listings/menu is store_id (for new stores) or id (for legacy vendors)
                    const canonicalStoreId = storeData.store_id || storeData.id;

                    try {
                        // Consistently fetch listings for the store
                        const listingsRes = await api.get(`/stores/${canonicalStoreId}/listings`);
                        setListings(listingsRes.data.listings || listingsRes.data || []);
                        setListings(listingsRes.data.listings || []);
                    } catch (listingError) {
                        console.error('Failed to fetch store listings:', listingError);
                        setListings([]);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch storefront', error);
                setVendor(null);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchStorefront();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!vendor) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-black text-slate-900 mb-4">Vendor Not Found</h1>
                <p className="text-slate-500 mb-8">The storefront you're looking for doesn't exist.</p>
                <a href="/" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold transition-all">Back Home</a>
            </div>
        </div>
    );

    const themeColor = vendor.theme_color || 'teal-600';

    // Determine layout based on template_id or category
    const renderLayout = () => {
        const templateId = vendor.template_id;
        const cat = (vendor.category || '').toLowerCase();

        // Priority 1: template_id
        if (templateId === 'food_vendor') return <FoodShopLayout store={vendor} listings={listings} />;
        if (templateId === 'host_rental') return <RentalLayout store={vendor} listings={listings} />;
        if (templateId === 'service_provider') return <ServiceLayout store={vendor} listings={listings} />;
        if (templateId === 'retail_produce') return <ProductLayout store={vendor} listings={listings} />;

        // Priority 2: Category keywords (Fallback)
        if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe')) {
            return <FoodShopLayout store={vendor} listings={listings} />;
        }
        if (cat.includes('rental') || cat.includes('transport') || cat.includes('accommodation') || cat.includes('host')) {
            return <RentalLayout store={vendor} listings={listings} />;
        }
        if (cat.includes('service') || cat.includes('consultant')) {
            return <ServiceLayout store={vendor} listings={listings} />;
        }
        return <ProductLayout store={vendor} listings={listings} />;
    };

    return (
        <main className="min-h-screen bg-white">
            {renderLayout()}
        </main>
    );
}
