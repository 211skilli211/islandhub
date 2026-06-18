import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface SortConfig {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export const usePaginatedFetch = <T>(endpoint: string, key: string, initialFilters: Record<string, any> = {}) => {
    const [items, setItems] = useState<T[]>([]);
    const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
    const [sort, setSort] = useState<SortConfig>({ sortBy: 'created_at', sortOrder: 'desc' });
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Refresh trigger
    const [refreshKey, setRefreshKey] = useState(0);

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [search]);

    const fetchPage = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            params.append('sortBy', sort.sortBy);
            params.append('sortOrder', sort.sortOrder);

            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }

            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.append(key, filters[key]);
                }
            });

            const separator = endpoint.includes('?') ? '&' : '?';
            const res = await api.get(`${endpoint}${separator}${params.toString()}`);

            if (res.data[key]) {
                setItems(res.data[key]);
                setMeta({
                    total: res.data.total,
                    page: res.data.page,
                    limit: res.data.limit || limit,
                    totalPages: res.data.totalPages
                });
            } else if (res.data.items && Array.isArray(res.data.items)) {
                // Support for mixed response { items: [], settings: {} }
                setItems(res.data.items);
                setMeta({
                    total: res.data.items.length,
                    page: 1,
                    limit: res.data.items.length,
                    totalPages: 1
                });
            } else if (Array.isArray(res.data)) {
                // Fallback if something goes wrong or endpoint doesn't support pagination yet
                setItems(res.data);
                setMeta({ total: res.data.length, page: 1, limit: res.data.length, totalPages: 1 });
            }
        } catch (error) {
            console.error(`Failed to fetch ${endpoint}:`, error);
        } finally {
            setLoading(false);
        }
    }, [endpoint, key, filters, sort, debouncedSearch]);

    // Trigger fetch on dependencies change
    useEffect(() => {
        fetchPage(1, 10); // Reset to page 1 on filter/sort/search change
    }, [filters, sort, debouncedSearch, refreshKey]);

    // Handle page change (don't reset to page 1)
    const handlePageChange = (newPage: number) => {
        fetchPage(newPage, meta.limit);
    };

    const refresh = () => setRefreshKey(prev => prev + 1);

    return {
        items,
        meta,
        filters,
        setFilters,
        sort,
        setSort,
        loading,
        selectedRows,
        setSelectedRows,
        handlePageChange,
        refresh,
        search,
        setSearch
    };
};
