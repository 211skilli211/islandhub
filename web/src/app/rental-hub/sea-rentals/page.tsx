'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';

export default function SeaRentalsPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchSeaData = async () => {
            try {
                setLoading(true);
                // Fetch sea-specific listings and vendors
                const [listingsRes, vendorsRes] = await Promise.all([
                    api.get('/listings?category=rental&sub_category=sea,boat,yacht,jetski,charter,water'),
                    api.get('/stores?category=rental')
                ]);

                setListings(Array.isArray(listingsRes.data) ? listingsRes.data : listingsRes.data.listings || []);

                const allVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.stores || [];
                const seaVendors = allVendors.filter((v: any) =>
                    v.subtype?.toLowerCase().includes('boat') ||
                    v.subtype?.toLowerCase().includes('sea') ||
                    v.subtype?.toLowerCase().includes('water')
                );
                setVendors(seaVendors);
            } catch (error) {
                console.error('Failed to fetch sea rental data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSeaData();
    }, []);

    const filteredListings = activeFilter === 'All'
        ? listings
        : listings.filter(l =>
            l.title?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            l.subtype?.toLowerCase().includes(activeFilter.toLowerCase()) ||
            l.sub_category?.toLowerCase().includes(activeFilter.toLowerCase())
        );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cyan-50/30">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Aquatic Hero Section */}
            <HeroBackground
                pageKey="sea-rentals"
                fallbackTitle="The Sea Hub"
                className="min-h-[60vh]"
            />

            {/* Sea Vendors Row */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Top Marine Vendors</h2>
                            <p className="text-slate-500 font-medium">Expert providers for your sea adventures</p>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                        {vendors.map(v => (
                            <Link key={v.id} href={`/store/${v.slug}`} className="shrink-0 w-64 p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform overflow-hidden">
                                    {v.logo_url ? <img src={getImageUrl(v.logo_url)} className="w-full h-full object-cover" /> : '⛵'}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{v.business_name || v.name}</h3>
                                <p className="text-cyan-600 text-[10px] font-black uppercase tracking-widest">{v.subtype || 'Marine Expert'}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Aquatic Filter & Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Marine Fleet</h2>
                        <p className="text-slate-500 font-medium">Filter by craft type</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                        {['All', 'Boat', 'Yacht', 'Jet Ski', 'Tour'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-cyan-600'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                        {filteredListings.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <ListingCard listing={item} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {filteredListings.length === 0 && (
                    <div className="text-center py-32 bg-cyan-50/20 rounded-[4rem] border-2 border-dashed border-cyan-100">
                        <span className="text-5xl mb-6 block">⛵</span>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Ocean is Quiet...</h3>
                        <p className="text-slate-400 font-bold italic">Adjust your filters to discover more sea adventures.</p>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
                <Link href="/rentals" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-cyan-600 transition-colors">
                    Looking for Land Rentals or Stays? Visit the Global Directory →
                </Link>
            </div>
        </div>
    );
}
