export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect, Suspense } from 'react';
import api, { getImageUrl } from '@/lib/api';
import CategoryHero from '@/components/CategoryHero';
import ListingCard from '@/components/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

const RENTAL_CATEGORIES = {
    stays: {
        label: 'Stays & Homes',
        icon: '🏠',
        subtypes: ['villa', 'apartment', 'studio', 'condo']
    },
    rides: {
        label: 'Cars & Bikes',
        icon: '🚗',
        subtypes: ['car', 'jeep', 'suv', 'atv', 'scooter', 'bike']
    },
    sea: {
        label: 'Sea & Aquatic',
        icon: '⛵',
        subtypes: ['boat', 'yacht', 'jet_ski', 'tour']
    }
};

const SUBTYPE_LABELS: Record<string, string> = {
    villa: 'Villa', apartment: 'Apartment', studio: 'Studio', condo: 'Condo',
    car: 'Compact Car', jeep: 'Jeep Wrangler', suv: 'SUV', atv: 'Sport ATV',
    scooter: 'Urban Scooter', bike: 'Mountain Bike',
    boat: 'Boat', yacht: 'Yacht', jet_ski: 'Jet Ski', tour: 'Sea Tour'
};

function RentalsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [listings, setListings] = useState<any[]>([]);
    const [spotlightVendors, setSpotlightVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize from URL
    const [activeCategory, setActiveCategory] = useState<'stays' | 'rides' | 'sea' | 'all'>(
        (searchParams.get('category') as any) || 'all'
    );
    const [activeSubtype, setActiveSubtype] = useState(searchParams.get('subtype') || '');
    const [location, setLocation] = useState(searchParams.get('location') || '');
    const [priceRange, setPriceRange] = useState(Number(searchParams.get('maxPrice')) || 1500);

    useEffect(() => {
        const fetchRentals = async () => {
            setLoading(true);
            try {
                const queryParams = new URLSearchParams();
                queryParams.append('type', 'rental');

                if (activeCategory !== 'all') {
                    queryParams.append('category_group', activeCategory);
                }

                if (activeSubtype) queryParams.append('subtype', activeSubtype);
                if (location) queryParams.append('location', location);
                if (priceRange < 1500) queryParams.append('max_price', priceRange.toString());

                // Update URL (silent)
                const url = new URL(window.location.href);
                if (activeCategory !== 'all') url.searchParams.set('category', activeCategory); else url.searchParams.delete('category');
                if (activeSubtype) url.searchParams.set('subtype', activeSubtype); else url.searchParams.delete('subtype');
                if (location) url.searchParams.set('location', location); else url.searchParams.delete('location');
                if (priceRange < 1500) url.searchParams.set('maxPrice', priceRange.toString()); else url.searchParams.delete('maxPrice');
                window.history.replaceState({}, '', url.toString());

                const res = await api.get(`/listings?${queryParams.toString()}`);
                setListings(Array.isArray(res.data) ? res.data : res.data.listings || []);

                // Fetch aquatic vendors for spotlight
                const vendorRes = await api.get('/stores?category=rental');
                const allRentals = Array.isArray(vendorRes.data) ? vendorRes.data : vendorRes.data.stores || [];
                setSpotlightVendors(allRentals.slice(0, 4));

            } catch (error) {
                console.error('Failed to fetch rental listings', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchRentals, 500);
        return () => clearTimeout(debounce);
    }, [activeCategory, activeSubtype, location, priceRange]);

    return (
        <div className="min-h-screen bg-white">
            <CategoryHero
                icon="🗺️"
                title="Island Rentals Hub"
                description="Everything you need for your island adventure. Book stays, vehicles, and aquatic experiences."
                category="Island Marketplace"
                gradient="from-indigo-600 via-blue-600 to-cyan-500"
                location="rentals_hero"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

                <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 mb-16 grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Location</label>
                        <input
                            type="text"
                            placeholder="Frigate Bay, Basseterre..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-6 py-4 bg-white border-transparent rounded-2xl text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-bold"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-2">Price Limit / Day</label>
                        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl">
                            <input
                                type="range"
                                min="10"
                                max="1500"
                                step="10"
                                value={priceRange}
                                onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                className="w-full accent-indigo-500"
                            />
                            <span className="font-black text-slate-900">${priceRange < 1500 ? priceRange : '1499+'}</span>
                        </div>
                    </div>
                    <div className="flex h-[60px]">
                        <div className="flex-1 bg-white px-6 py-4 rounded-2xl font-bold text-slate-400 flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest">Select Dates</span>
                            <span className="text-lg">📅</span>
                        </div>
                    </div>
                </div>

                {/* Featured Providers Section */}
                <div className="mb-20">
                    <div className="flex justify-between items-end mb-8 px-2">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">Trusted Providers</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Top Rental Stores</h2>
                        </div>
                        <Link href="/stores?category=rental" className="text-sm font-bold text-slate-400 hover:text-indigo-500 transition-colors">View All Stores →</Link>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide px-2">
                        {spotlightVendors.map((v, i) => (
                            <motion.div
                                key={v.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="shrink-0"
                            >
                                <Link href={`/store/${v.slug}`} className="block w-64 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200 transition-all group">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                        {v.logo_url ? <img src={getImageUrl(v.logo_url)} className="w-full h-full object-cover rounded-xl" alt={v.name} /> : '🏝️'}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1">{v.name}</h3>
                                    <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest mb-4 truncate">{v.subtype || 'Island Rentals'}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm font-black text-slate-900">{v.admin_rating || '5.0'}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-16">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap items-center gap-3 mb-8">
                        <button
                            onClick={() => { setActiveCategory('all'); setActiveSubtype(''); }}
                            className={`px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all ${activeCategory === 'all' ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                        >
                            All Rentals
                        </button>
                        {Object.entries(RENTAL_CATEGORIES).map(([key, cat]) => (
                            <button
                                key={key}
                                onClick={() => { setActiveCategory(key as any); setActiveSubtype(''); }}
                                className={`px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeCategory === key ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Subtype Filters */}
                    {activeCategory !== 'all' && (
                        <div className="mb-8 p-6 bg-slate-50 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Drill Down</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setActiveSubtype('')}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${!activeSubtype ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                >
                                    All {RENTAL_CATEGORIES[activeCategory as keyof typeof RENTAL_CATEGORIES].label}
                                </button>
                                {RENTAL_CATEGORIES[activeCategory as keyof typeof RENTAL_CATEGORIES].subtypes.map(subtype => (
                                    <button
                                        key={subtype}
                                        onClick={() => setActiveSubtype(subtype)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeSubtype === subtype ? 'bg-indigo-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        {SUBTYPE_LABELS[subtype]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <main>
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">
                                {loading ? 'Checking Availability...' : `${listings.length} Results Found`}
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[3rem] border border-slate-100" />
                                ))}
                            </div>
                        ) : listings.length === 0 ? (
                            <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                                <span className="text-5xl mb-6 block">🏝️</span>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">No Rentals Found</h3>
                                <p className="text-slate-400 font-bold italic">
                                    Try adjusting your filters or browsing a different category.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                <AnimatePresence mode="popLayout">
                                    {listings.map((listing) => (
                                        <motion.div
                                            key={listing.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ListingCard listing={listing} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function RentalsPageWrapper() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
        }>
            <RentalsPage />
        </Suspense>
    );
}
