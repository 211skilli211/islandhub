'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import MarketplaceHero from '@/components/marketplace/MarketplaceHero';
import CategorySection from '@/components/marketplace/CategorySection';
import SponsorSection from '@/components/marketplace/SponsorSection';
import ListingCard from '@/components/ListingCard';
import ListingFilters from '@/components/ListingFilters';
import GuestWelcomeModal from '@/components/marketplace/GuestWelcomeModal';
import FloatingBanner from '@/components/FloatingBanner';
import BrandMarquee from '@/components/BrandMarquee';
import { filterConfigs } from '@/lib/filterConfig';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketplaceDiscoveryPage() {
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        min_price: '',
        max_price: ''
    });

    const getActiveConfig = () => {
        if (filters.type === 'food') return filterConfigs.food;
        if (filters.type === 'product' || (filters.category && ['Souvenirs', 'Clothing', 'Art', 'Agro'].some(c => filters.category?.includes(c)))) return filterConfigs.shop;
        if (filters.type === 'rental' || (filters.category && ['Apartment', 'Car', 'Boat', 'Jet Ski', 'Equipment'].some(c => filters.category?.includes(c)))) return filterConfigs.rent;
        if (filters.type === 'service' || (filters.category && ['Professional', 'Tour'].some(c => filters.category?.includes(c)))) return filterConfigs.book;
        return filterConfigs.marketplace;
    };

    const config = getActiveConfig();
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchListings = async () => {
            setLoading(true);
            try {
                // Read filters from URL on initial load
                const params = new URLSearchParams(window.location.search);
                const urlFilters = {
                    type: params.get('type') || '',
                    category: params.get('category') || '',
                    min_price: params.get('min_price') || '',
                    max_price: params.get('max_price') || ''
                };
                const urlSearch = params.get('search') || '';

                // Update state with URL params
                setFilters(urlFilters);
                setSearchQuery(urlSearch);

                // Build search params for API
                const searchParams = new URLSearchParams();
                if (urlFilters.type) searchParams.append('type', urlFilters.type);
                if (urlFilters.category) searchParams.append('category', urlFilters.category);
                if (urlFilters.min_price) searchParams.append('min_price', urlFilters.min_price);
                if (urlFilters.max_price) searchParams.append('max_price', urlFilters.max_price);
                if (urlSearch) searchParams.append('search', urlSearch);

                const res = await api.get(`/listings?${searchParams.toString()}`);
                setListings(res.data);
            } catch (error) {
                console.error("Failed to fetch listings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []); // Only run on mount

    // Separate effect for when filters/search change after initial load
    useEffect(() => {
        // Skip if this is the initial render (filters are still empty)
        if (!filters.type && !filters.category && !filters.min_price && !filters.max_price && !searchQuery) {
            return;
        }

        const fetchListings = async () => {
            setLoading(true);
            try {
                const searchParams = new URLSearchParams();
                if (filters.type) searchParams.append('type', filters.type);
                if (filters.category) searchParams.append('category', filters.category);
                if (filters.min_price) searchParams.append('min_price', filters.min_price);
                if (filters.max_price) searchParams.append('max_price', filters.max_price);
                if (searchQuery) searchParams.append('search', searchQuery);

                const res = await api.get(`/listings?${searchParams.toString()}`);
                setListings(res.data);
            } catch (error) {
                console.error("Failed to fetch listings", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [filters, searchQuery]);

    const isDiscoveryMode = !filters.type && !filters.category && !filters.min_price && !filters.max_price && !searchQuery;

    // Memoize filtered results to avoid recomputation
    const promotedListings = useMemo(() => listings.filter(l => l.is_promoted), [listings]);
    const foodListings = useMemo(() => listings.filter(l => l.category?.toLowerCase() === 'food' || l.type?.toLowerCase() === 'food'), [listings]);
    const productListings = useMemo(() => listings.filter(l => (l.type?.toLowerCase() === 'product' || l.category?.toLowerCase() === 'retail') && l.category?.toLowerCase() !== 'food'), [listings]);
    const serviceListings = useMemo(() => listings.filter(l => l.type?.toLowerCase() === 'service' || l.category?.toLowerCase() === 'service'), [listings]);

    return (
        <div className="min-h-screen bg-white">
            <GuestWelcomeModal />

            <MarketplaceHero onSearch={setSearchQuery} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AnimatePresence mode="wait">
                    {isDiscoveryMode ? (
                        <motion.div
                            key="discovery"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <FloatingBanner location="marketplace" />

                            <BrandMarquee type="product" />

                            <SponsorSection />

                            <CategorySection
                                id="food"
                                title="Island Kitchens"
                                icon="🍴"
                                listings={foodListings}
                                loading={loading}
                                viewAllHref="/stores?category=food"
                            />

                            {/* Sponsored Strip */}
                            <section className="bg-linear-to-rrom-teal-600/5 to-emerald-600/5 rounded-[3rem] p-12 border border-teal-100 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight italic mb-2">Merchant Spotlight</h3>
                                        <p className="text-slate-500 font-medium max-w-md italic">Discover high-quality local businesses and exclusive deals from our verified island partners.</p>
                                    </div>
                                    <div className="flex gap-4 scrollbar-hide overflow-x-auto pb-4 w-full md:w-auto">
                                        {promotedListings.slice(0, 2).map(promo => (
                                            <div key={promo.id} className="min-w-[280px] bg-white p-4 rounded-3xl shadow-xl shadow-teal-900/5 border border-white flex gap-4">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                                                    <img src={promo.images?.[0] || 'https://via.placeholder.com/80'} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <h4 className="font-black text-slate-900 leading-tight mb-1 truncate max-w-[150px]">{promo.title}</h4>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">{promo.type}</p>
                                                    <Link href={`/listings/${promo.id}`} className="text-[10px] font-black uppercase text-slate-400 hover:text-teal-600 transition-colors">View Offer →</Link>
                                                </div>
                                            </div>
                                        ))}
                                        {promotedListings.length === 0 && (
                                            <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50">
                                                <span className="text-3xl">🌟</span>
                                                <div>
                                                    <p className="font-black text-slate-800 text-sm">Your business here?</p>
                                                    <Link href="/become-vendor" className="text-[10px] font-black uppercase text-teal-600">Upgrade to Pro →</Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <CategorySection
                                id="product"
                                title="Local Products"
                                icon="📦"
                                listings={productListings}
                                loading={loading}
                                viewAllHref="/shop"
                            />

                            <CategorySection
                                id="service"
                                title="Local Services"
                                icon="🛠"
                                listings={serviceListings}
                                loading={loading}
                                viewAllHref="/book"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex flex-col lg:flex-row gap-8"
                        >
                            <aside className="w-full lg:w-64 shrink-0">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sticky top-24">
                                    <ListingFilters
                                        config={config}
                                        filters={filters}
                                        setFilters={setFilters}
                                    />
                                    <button
                                        onClick={() => {
                                            setFilters({ type: '', category: '', min_price: '', max_price: '' });
                                            setSearchQuery('');
                                        }}
                                        className="w-full mt-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                                    >
                                        ← Back to Discovery
                                    </button>
                                </div>
                            </aside>

                            <main className="flex-1">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {searchQuery ? `Search results for "${searchQuery}"` : 'All Listings'}
                                        <span className="ml-3 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                            ({listings.length})
                                        </span>
                                    </h2>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-3xl border border-slate-100" />
                                        ))}
                                    </div>
                                ) : listings.length === 0 ? (
                                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-400 mb-2 italic">Nothing found matching your criteria...</h3>
                                        <p className="text-slate-400 text-sm font-medium">Try adjusting your search or filters.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 content-visibility-auto contain-intrinsic-size-auto">
                                        {listings.map((listing, index) => (
                                            <motion.div
                                                key={listing.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <ListingCard listing={listing} />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </main>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <section className="bg-slate-900 py-24 px-8 text-center text-white rounded-[4rem] mx-4 mb-20 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Expand Your Reach</h2>
                    <p className="text-slate-400 text-xl font-medium mb-10 max-w-2xl mx-auto">
                        Join our vibrant community of island entrepreneurs. Register as a vendor today!
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/become-vendor"
                            className="px-12 py-5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-900/40 transition-all"
                        >
                            Start Selling Today <span>→</span>
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="/contact"
                            className="px-12 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-2xl font-black text-lg transition-all"
                        >
                            Contact Support
                        </motion.a>
                    </div>
                </div>
            </section>
        </div>
    );
}
