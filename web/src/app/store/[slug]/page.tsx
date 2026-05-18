'use client';

import { notFound } from 'next/navigation';
import api from '@/lib/api';
import StoreLayouts from '@/components/marketplace/StoreLayouts';
import { IBTSolutionsLayout } from '@/components/marketplace/IBTSolutionsLayout';

interface StorePageProps {
    params: { slug: string };
}

// Layout selection based on template_id (priority) or category (fallback)
function getLayoutType(store: any): 'food' | 'service' | 'rental' | 'product' | 'ibt' {
    // Priority 1: IBT Solutions custom store
    if (store.slug === 'ibt-solutions' || store.ibt_tier) {
        return 'ibt';
    }

    // Priority 2: Explicit template_id
    const templateMap: Record<string, 'food' | 'service' | 'rental' | 'product'> = {
        'food_vendor': 'food',
        'host_rental': 'rental',
        'service_provider': 'service',
        'retail_produce': 'product',
    };
    if (store.template_id && templateMap[store.template_id]) {
        return templateMap[store.template_id];
    }

    // Priority 3: Category-based fallback
    const category = (store.category || '').toLowerCase();
    const subtype = (store.subtype || '').toLowerCase();

    if (category === 'food' || category === 'restaurant' || category === 'cafe' ||
        subtype.includes('food') || subtype.includes('restaurant') || subtype.includes('cafe')) {
        return 'food';
    }
    if (category === 'rental' || category === 'rentals' ||
        subtype.includes('rental') || subtype.includes('boat') || subtype.includes('car') || subtype.includes('property')) {
        return 'rental';
    }
    if (category === 'service' || category === 'services' || category === 'professional' ||
        subtype.includes('service') || subtype.includes('consultant') || subtype.includes('trades')) {
        return 'service';
    }

    // Default: product layout
    return 'product';
}

export default async function StorePage({ params }: StorePageProps) {
    const { slug } = params;

    try {
        // Fetch store data
        const storeRes = await api.get(`/stores/slug/${slug}`);
        const store = storeRes.data;

        // Check if store exists
        if (!store || !store.store_id) {
            notFound();
        }

        // Check if store is active
        if (store.status !== 'active') {
            return (
                <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto px-6">
                        <div className="text-6xl mb-6">🏪</div>
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

        // Fetch store listings
        const listingsRes = await api.get(`/stores/${store.store_id}/listings`);
        const listings = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data.listings || []);

        // Determine layout type
        const layoutType = getLayoutType(store);

        // Render appropriate layout
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
    } catch (error: any) {
        if (error.response?.status === 404) {
            notFound();
        }

        console.error('Store page error:', error);
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-6">
                    <div className="text-6xl mb-6">😕</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Something went wrong</h1>
                    <p className="text-slate-500 mb-6">We couldn&apos;t load this store. Please try again later.</p>
                    <a href="/stores" className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors">
                        Browse Stores
                    </a>
                </div>
            </main>
        );
    }
}
