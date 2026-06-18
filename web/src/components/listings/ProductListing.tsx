'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ListingCard from '@/components/ListingCard';
import ListingFilters from '@/components/ListingFilters';
import { filterConfigs } from '@/lib/filterConfig';

interface ProductListingProps {
    initialListings?: any[];
    category?: string;
    storeId?: number;
}

type SortOption = {
    value: string;
    label: string;
    icon: string;
};

const SORT_OPTIONS: SortOption[] = [
    { value: 'relevance', label: 'Relevance', icon: '✨' },
    { value: 'price_asc', label: 'Price: Low to High', icon: '↑' },
    { value: 'price_desc', label: 'Price: High to Low', icon: '↓' },
    { value: 'newest', label: 'Newest First', icon: '🆕' },
    { value: 'popular', label: 'Most Popular', icon: '🔥' },
    { value: 'rating', label: 'Highest Rated', icon: '⭐' },
];

export default function ProductListing({ initialListings = [], category = 'marketplace', storeId }: ProductListingProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listings, setListings] = useState(initialListings);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    // Get current sort from URL or default
    const currentSort = searchParams.get('sort') || 'relevance';
    const currentFilters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
        if (key !== 'sort' && key !== 'view') {
            currentFilters[key] = value;
        }
    });

    // Get filter config for current category
    const filterConfig = filterConfigs[category] || filterConfigs.marketplace;

    // Sort listings
    const sortedListings = useMemo(() => {
        const sorted = [...listings];
        switch (currentSort) {
            case 'price_asc':
                sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price_desc':
                sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            case 'newest':
                sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                break;
            case 'popular':
                sorted.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'relevance':
            default:
                // Keep original order (relevance)
                break;
        }
        return sorted;
    }, [listings, currentSort]);

    // Handle sort change
    const handleSortChange = (sortValue: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sortValue);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Handle filter change
    const handleFilterChange = (newFilters: Record<string, any>) => {
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== '' && value !== undefined && value !== null) {
                params.set(key, String(value));
            }
        });
        params.set('sort', currentSort);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Handle view mode change
    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', mode);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Count active filters
    const activeFilterCount = Object.values(currentFilters).filter(v => v !== '' && v !== undefined && v !== null).length;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-ink-primary">
                        {filterConfig.title}
                    </h2>
                    <span className="text-sm text-ink-tertiary">
                        {sortedListings.length} {sortedListings.length === 1 ? 'result' : 'results'}
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-accent-500/15 text-accent-500 rounded-full text-xs font-bold">
                            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    
                    <div className="relative">
                        <select
                            value={currentSort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="appearance-none bg-surface-elevated border border-border-primary rounded-xl px-4 py-2 pr-10 text-sm font-bold text-ink-secondary focus:outline-none focus:ring-2 focus:ring-accent-400 cursor-pointer"
                        >
                            {SORT_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.icon} {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-tertiary">
                            ▼
                        </div>
                    </div>

                    
                    <div className="hidden md:flex items-center bg-surface-secondary rounded-xl p-1">
                        <button
                            onClick={() => handleViewModeChange('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-surface-elevated shadow-sm text-ink-primary' : 'text-ink-tertiary'}`}
                            title="Grid view"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                <rect x="0" y="0" width="7" height="7" rx="1" />
                                <rect x="9" y="0" width="7" height="7" rx="1" />
                                <rect x="0" y="9" width="7" height="7" rx="1" />
                                <rect x="9" y="9" width="7" height="7" rx="1" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleViewModeChange('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-surface-elevated shadow-sm text-ink-primary' : 'text-ink-tertiary'}`}
                            title="List view"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                                <rect x="0" y="0" width="16" height="3" rx="1" />
                                <rect x="0" y="5" width="16" height="3" rx="1" />
                                <rect x="0" y="10" width="16" height="3" rx="1" />
                            </svg>
                        </button>
                    </div>

                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-border-primary rounded-xl text-sm font-bold text-ink-secondary"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-accent-500/15 text-accent-500 rounded-full text-xs">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(currentFilters).map(([key, value]) => {
                        if (!value || value === '') return null;
                        const filterLabel = filterConfig.filters.find(f => f.id === key)?.label || key;
                        const optionLabel = filterConfig.filters
                            .find(f => f.id === key)?.options?.find(o => o.value === value)?.label || value;
                        return (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-500/10 text-accent-500 rounded-full text-xs font-bold"
                            >
                                {filterLabel}: {optionLabel}
                                <button
                                    onClick={() => {
                                        const newFilters = { ...currentFilters };
                                        delete newFilters[key];
                                        handleFilterChange(newFilters);
                                    }}
                                    className="ml-1 hover:text-accent-700"
                                >
                                    ×
                                </button>
                            </span>
                        );
                    })}
                    <button
                        onClick={() => handleFilterChange({})}
                        className="px-3 py-1 text-xs font-bold text-ink-tertiary hover:text-ink-secondary"
                    >
                        Clear all
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="sticky top-24">
                        <ListingFilters
                            config={filterConfig}
                            filters={currentFilters}
                            setFilters={handleFilterChange}
                            onClose={() => setShowFilters(false)}
                        />
                    </div>
                </div>

                
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-surface-secondary rounded-2xl h-80 animate-pulse" />
                            ))}
                        </div>
                    ) : sortedListings.length > 0 ? (
                        <div className={viewMode === 'grid'
                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                            : 'space-y-4'
                        }>
                            {sortedListings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} layout={viewMode === 'list' ? 'compact' : 'default'} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-black text-ink-primary mb-2">No results found</h3>
                            <p className="text-ink-tertiary mb-6">Try adjusting your filters or search terms</p>
                            <button
                                onClick={() => handleFilterChange({})}
                                className="px-6 py-3 bg-accent-500 text-white rounded-xl font-bold text-sm hover:bg-accent-600 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
