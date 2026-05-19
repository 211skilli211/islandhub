'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import StoreLayouts from '@/components/marketplace/StoreLayouts';
import { IBTSolutionsLayout } from '@/components/marketplace/IBTSolutionsLayout';

interface StorePageProps {
    params: { slug: string };
}

function getLayoutType(store: any): 'food' | 'service' | 'rental' | 'product' | 'ibt' {
    if (store.slug === 'ibt-solutions' || store.ibt_tier) return 'ibt';

    const templateMap: Record<string, 'food' | 'service' | 'rental' | 'product'> = {
        'food_vendor': 'food',
        'host_rental': 'rental',
        'service_provider': 'service',
        'retail_produce': 'product',
    };
    if (store.template_id && templateMap[store.template_id]) return templateMap[store.template_id];

    const category = (store.category || '').toLowerCase();
    const subtype = (store.subtype || '').toLowerCase();

    if (category === 'food' || category === 'restaurant' || category === 'cafe' ||
        subtype.includes('food') || subtype.includes('restaurant') || subtype.includes('cafe')) return 'food';
    if (category === 'rental' || category === 'rentals' ||
        subtype.includes('rental') || subtype.includes('boat') || subtype.includes('car') || subtype.includes('property')) return 'rental';
    if (category === 'service' || category === 'services' || category === 'professional' || category === 'retail' ||
        subtype.includes('service') || subtype.includes('consultant') || subtype.includes('trades')) return 'service';

    return 'product';
}

export default function StorePage({ params }: StorePageProps) {
    const { slug } = params;
    const [store, setStore] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFoundError, setNotFoundError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storeRes = await api.get(`/stores/slug/${slug}`);
                const storeData = storeRes.data;

                if (!storeData || !storeData.store_id) {
                    setNotFoundError(true);
                    return;
                }

                setStore(storeData);

                try {
                    const listingsRes = await api.get(`/stores/${storeData.store_id}/listings`);
                    const l = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data?.listings || []);
                    setListings(l);
                } catch (e) {
                    // Listings fetch failed, but we can still show the store
                    setListings([]);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setNotFoundError(true);
                } else {
                    setError(err.message || 'Failed to load store');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-teal-600 mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium">Loading store...</p>
                </div>
            </main>
        );
    }

    if (notFoundError) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Store not found</h1>
                    <p className="text-slate-500 mb-6">This store doesn&apos;t exist or has been removed.</p>
                    <a href="/stores" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
                        Browse Stores
                    </a>
                </div>
            </main>
        );
    }

    if (error || !store) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-slate-500 mb-6">We couldn&apos;t load this store. Please try again later.</p>
                    <a href="/stores" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
                        Browse Stores
                    </a>
                </div>
            </main>
        );
    }

    if (store.status !== 'active') {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-black text-slate-900 mb-2">{store.name || 'This Store'}</h1>
                    <p className="text-slate-500 mb-6">
                        {store.status === 'suspended'
                            ? 'This store is currently unavailable.'
                            : 'This store is coming soon. Check back later!'}
                    </p>
                    <a href="/stores" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
                        Browse Other Stores
                    </a>
                </div>
            </main>
        );
    }

    const layoutType = getLayoutType(store);

    if (layoutType === 'ibt') {
        return <IBTSolutionsLayout store={store} listings={listings} />;
    }

    return (
        <StoreLayouts
            store={store}
            listings={listings}
            layoutType={layoutType}
        />
    );
}
