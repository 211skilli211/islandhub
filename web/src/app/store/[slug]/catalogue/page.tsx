'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import { Search, SlidersHorizontal, Grid3X3, List, ShoppingBag, X, ChevronDown } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import AdSpace from '@/components/advertising/AdSpace';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'name';

function StoreCatalogueContent() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug || '';

    const [store, setStore] = useState<any>(null);
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Catalogue state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

    useEffect(() => {
        if (!slug) return;
        fetchData();
    }, [slug]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const storeRes = await api.get(`/stores/slug/${slug}`);
            const storeData = storeRes.data;
            if (!storeData?.store_id) { setNotFound(true); return; }
            setStore(storeData);

            try {
                const listingsRes = await api.get(`/stores/${storeData.store_id}/listings`);
                const l = Array.isArray(listingsRes.data) ? listingsRes.data : (listingsRes.data?.listings || []);
                setListings(l);
            } catch { setListings([]); }
        } catch (err: any) {
            if (err.response?.status === 404) setNotFound(true);
            else setError(err.message || 'Failed to load store');
        } finally { setLoading(false); }
    };

    // Extract unique categories from listings
    const categories = useMemo(() => {
        const cats = new Set<string>();
        listings.forEach(l => { if (l.category) cats.add(l.category); });
        return ['All', ...Array.from(cats).sort()];
    }, [listings]);

    // Filter and sort listings
    const filteredListings = useMemo(() => {
        let result = [...listings];

        // Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(l =>
                (l.title || '').toLowerCase().includes(q) ||
                (l.description || '').toLowerCase().includes(q) ||
                (l.category || '').toLowerCase().includes(q)
            );
        }

        // Category
        if (selectedCategory !== 'All') {
            result = result.filter(l => l.category === selectedCategory);
        }

        // Price range
        result = result.filter(l => {
            const price = parseFloat(l.price) || 0;
            return price >= priceRange[0] && price <= priceRange[1];
        });

        // Sort
        switch (sortBy) {
            case 'price_asc': result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)); break;
            case 'price_desc': result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)); break;
            case 'name': result.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
            case 'popular': result.sort((a, b) => (b.views || 0) - (a.views || 0)); break;
            case 'newest': default: result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break;
        }

        return result;
    }, [listings, searchQuery, selectedCategory, sortBy, priceRange]);

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-teal-600" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-ink-primary mb-2">Store not found</h1>
                    <a href="/stores" className="text-accent-400 font-medium">Browse Stores</a>
                </div>
            </div>
        );
    }

    if (error || !store) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-black text-ink-primary mb-2">Something went wrong</h1>
                    <a href="/stores" className="text-accent-400 font-medium">Browse Stores</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary">
            {/* Store Header Bar */}
            <div className="bg-surface-elevated border-b border-border-primary sticky top-[var(--navbar-height,72px)] z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${store.name || 'store'}...`}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border-primary bg-surface-primary text-sm font-medium text-ink-primary focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all placeholder:text-ink-tertiary"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary">
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                                    showFilters ? 'bg-accent-500 text-white border-teal-600' : 'bg-surface-elevated text-ink-secondary border-border-primary hover:border-border-primary'
                                }`}
                            >
                                <SlidersHorizontal size={14} />
                                Filters
                            </button>

                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border-primary bg-surface-elevated text-xs font-bold uppercase tracking-widest text-ink-secondary cursor-pointer focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low → High</option>
                                    <option value="price_desc">Price: High → Low</option>
                                    <option value="popular">Most Popular</option>
                                    <option value="name">Name A-Z</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none" />
                            </div>

                            <div className="flex border border-border-primary rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-ink-tertiary hover:text-ink-secondary'}`}
                                >
                                    <Grid3X3 size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 ${viewMode === 'list' ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-ink-tertiary hover:text-ink-secondary'}`}
                                >
                                    <List size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 pb-2 border-t border-border-primary mt-4">
                                    <div className="flex flex-wrap gap-4">
                                        {/* Categories */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2 block">Category</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {categories.map(cat => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => setSelectedCategory(cat)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                                            selectedCategory === cat
                                                                ? 'bg-accent-500 text-white'
                                                                : 'bg-surface-secondary text-ink-tertiary hover:bg-surface-tertiary'
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Range */}
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary mb-2 block">
                                                Price Range: ${priceRange[0]} - ${priceRange[1] === 10000 ? 'Any' : `$${priceRange[1]}`}
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="5000"
                                                    step="50"
                                                    value={priceRange[1]}
                                                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                                                    className="w-32 accent-teal-600"
                                                />
                                                <button
                                                    onClick={() => setPriceRange([0, 10000])}
                                                    className="text-[10px] font-bold text-accent-400 uppercase tracking-widest hover:underline"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Category Pills (horizontal scroll) */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    selectedCategory === cat
                                        ? 'bg-surface-tertiary text-white'
                                        : 'bg-surface-secondary text-ink-tertiary hover:bg-surface-tertiary'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <span className="px-3 py-1.5 text-[10px] text-ink-tertiary font-medium shrink-0">
                            {filteredListings.length} item{filteredListings.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            </div>

            {/* Ad Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <AdSpace spaceName="vendor_store_banner" className="h-16 md:h-24 rounded-xl overflow-hidden shadow-sm" />
            </div>

            {/* Catalogue Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
                {filteredListings.length > 0 ? (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6'
                        : 'space-y-3'
                    }>
                        {filteredListings.map((listing, idx) => (
                            <motion.div
                                key={listing.id || listing.listing_id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <ListingCard listing={listing} layout={viewMode} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-12 text-center">
                        <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-ink-primary mb-2">No items found</h3>
                        <p className="text-sm text-ink-tertiary mb-4">
                            {searchQuery
                                ? `No results for "${searchQuery}". Try a different search term.`
                                : 'No items match your current filters.'}
                        </p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setPriceRange([0, 10000]); }}
                            className="px-4 py-2 bg-accent-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Store Info Footer */}
                {filteredListings.length > 0 && (
                    <div className="mt-12 text-center">
                        <p className="text-xs text-ink-tertiary">
                            Showing {filteredListings.length} of {listings.length} items from {store.name}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function StoreCataloguePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-teal-600" />
            </div>
        }>
            <StoreCatalogueContent />
        </Suspense>
    );
}
