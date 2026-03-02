import { cache } from 'react';
import api from '@/lib/api';

// Cache expensive API operations per-request
// This is useful when moving to React Server Components to deduplicate requests

export const getCachedListings = cache(async (params?: any) => {
    try {
        const res = await api.get('/listings', { params });
        return res.data;
    } catch (error) {
        console.error('Failed to fetch listings', error);
        return [];
    }
});

export const getCachedCampaign = cache(async (id: string) => {
    try {
        const res = await api.get(`/campaigns/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch campaign ${id}`, error);
        return null;
    }
});

export const getCachedVendor = cache(async (id: string) => {
    try {
        const res = await api.get(`/vendors/${id}`);
        return res.data;
    } catch (error) {
        console.error(`Failed to fetch vendor ${id}`, error);
        return null;
    }
});
