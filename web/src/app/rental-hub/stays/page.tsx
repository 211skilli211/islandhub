'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';

export default function StaysHubPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [listingsRes, vendorsRes] = await Promise.all([
                    api.get('/listings?category=rental&sub_category=stays'),
                    api.get('/stores?category=rental')
                ]);

                setListings(Array.isArray(listingsRes.data) ? listingsRes.data : listingsRes.data.listings || []);

                const allVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.stores || [];
                const stayVendors = allVendors.filter((v: any) =>
                    v.subtype?.toLowerCase().includes('stay') ||
                    v.subtype?.toLowerCase().includes('accommodation') ||
                    v.subtype?.toLowerCase().includes('villa') ||
                    v.subtype?.toLowerCase().includes('apartment')
                );
                setVendors(stayVendors);
            } catch (error) {
                console.error('Failed to fetch stays data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredListings = activeFilter === 'All'
        ? listings
        : listings.filter(l =>
            l.title.toLowerCase().includes(activeFilter.toLowerCase()) ||
            l.subtype?.toLowerCase().includes(activeFilter.toLowerCase())
        );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50/20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-elevated">
            {/* Hero Section */}
            <HeroBackground
                pageKey="stays"
                fallbackTitle="Stays & Homes"
                className="min-h-[60vh]"
            />

            {/* Vendors Row */}
            <section className="bg-surface-primary py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-ink-primary tracking-tight italic uppercase">Top Property Managers</h2>
                            <p className="text-ink-tertiary font-medium">Trusted hosts and premium property vendors</p>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                        {vendors.length > 0 ? vendors.map(v => (
                            <Link key={v.id} href={`/store/${v.slug}`} className="shrink-0 w-64 p-8 bg-surface-elevated rounded-[2.5rem] border border-border-primary hover:shadow-2xl transition-all group">
                                <div className="w-16 h-16 bg-surface-primary rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {v.logo_url ? <img src={v.logo_url} className="w-full h-full object-cover rounded-xl" /> : '🏠'}
                                </div>
                                <h3 className="text-lg font-black text-ink-primary mb-1">{v.business_name || v.name}</h3>
                                <p className="text-purple-600 text-[10px] font-black uppercase tracking-widest">{v.subtype || 'Property Host'}</p>
                            </Link>
                        )) : (
                            <div className="text-ink-tertiary font-bold italic py-4">Showcasing top hosts soon...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Filter & Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-ink-primary tracking-tight italic uppercase">Available Inventory</h2>
                        <p className="text-ink-tertiary font-medium">Filter by accommodation type</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-surface-primary rounded-2xl border border-border-primary">
                        {['All', 'Villa', 'Apartment', 'Studio', 'Condo'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-surface-elevated text-purple-600 shadow-sm' : 'text-ink-tertiary hover:text-purple-600'}`}
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
                    <div className="text-center py-32 bg-purple-50/20 rounded-[4rem] border-2 border-dashed border-purple-100">
                        <span className="text-5xl mb-6 block">🏘️</span>
                        <h3 className="text-2xl font-black text-ink-primary mb-2">No Match Found</h3>
                        <p className="text-ink-tertiary font-bold italic">Adjust your filters to see more island homes.</p>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
                <Link href="/rentals" className="inline-flex items-center gap-2 text-ink-tertiary font-bold hover:text-purple-600 transition-colors">
                    Looking for Sea or Land Rentals? Visit the Global Directory →
                </Link>
            </div>
        </div>
    );
}
