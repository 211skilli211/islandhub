'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export const useStoreSections = (storeId: number | string) => {
    const [sections, setSections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const res = await api.get(`/homepage?storeId=${storeId}`);
                setSections(res.data || []);
            } catch (e) {
                console.error('Failed to fetch store sections:', e);
            } finally {
                setLoading(false);
            }
        };
        if (storeId) {
            fetchSections();
        }
    }, [storeId]);

    return { sections, loading };
};
