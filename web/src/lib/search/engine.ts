import Fuse from 'fuse.js';
import api from '@/lib/api';

interface SearchResult {
    id: string;
    type: 'product' | 'category' | 'vendor' | 'service';
    title: string;
    subtitle?: string;
    image?: string;
    url: string;
}

export async function searchWithFuzzy(query: string, options: { limit: number, types: string[] }) {
    try {
        // In a real production app, this should be handled by a dedicated search service (Algolia, Elasticsearch)
        // or a specialized database query.
        // For this implementation, we'll fetch recent/popular items and perform fuzzy search.

        // We try to fetch listings and vendors. 
        // Note: Adjust endpoints according to actual backend API capabilities.
        const [listingsRes, vendorsRes] = await Promise.all([
            api.get('/listings?limit=100').catch(() => ({ data: [] })),
            api.get('/vendors?limit=20').catch(() => ({ data: [] }))
        ]);

        const listings = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data?.data || []);
        const vendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data?.data || []);

        const items: SearchResult[] = [
            ...listings.map((l: any) => ({
                id: l.id?.toString() || l._id,
                title: l.title,
                subtitle: l.description ? l.description.substring(0, 60) + '...' : `$${l.price}`,
                type: (l.category === 'service' || l.type === 'service') ? 'service' : 'product',
                image: l.imageUrl || l.images?.[0]?.url || '/placeholder.png',
                url: `/listings/${l.id || l._id}`,
            })),
            ...vendors.map((v: any) => ({
                id: v.id?.toString() || v._id,
                title: v.store_name || v.business_name || v.name,
                subtitle: 'Official Store',
                type: 'vendor',
                image: v.logo_url || v.avatar || '/placeholder-vendor.png',
                url: `/store/${v.id || v._id}`,
            }))
        ];

        if (!items.length) return [];

        const fuse = new Fuse(items, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'subtitle', weight: 0.3 },
                { name: 'type', weight: 0.1 }
            ],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 2
        });

        const results = fuse.search(query);

        return results
            .slice(0, options.limit)
            .map(r => r.item);

    } catch (error) {
        console.error('Fuzzy search failed:', error);
        return [];
    }
}
