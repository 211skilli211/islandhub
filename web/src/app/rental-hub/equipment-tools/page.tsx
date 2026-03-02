'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';

export default function EquipmentHubPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Fetch equipment-related listings and vendors
                const [listingsRes, vendorsRes] = await Promise.all([
                    api.get('/listings?category=rental&sub_category=equipment,gear,tools'),
                    api.get('/stores?category=rental')
                ]);

                setListings(Array.isArray(listingsRes.data) ? listingsRes.data : listingsRes.data.listings || []);

                const allVendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : vendorsRes.data.stores || [];
                const equipVendors = allVendors.filter((v: any) =>
                    v.subtype?.toLowerCase().includes('gear') ||
                    v.subtype?.toLowerCase().includes('tool') ||
                    v.subtype?.toLowerCase().includes('equipment') ||
                    v.business_name?.toLowerCase().includes('rental')
                );
                setVendors(equipVendors);
            } catch (error) {
                console.error('Failed to fetch equipment data:', error);
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
            <div className="min-h-screen flex items-center justify-center bg-slate-100/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <HeroBackground
                pageKey="equipment-tools"
                fallbackTitle="Equipment & Tools"
                className="min-h-[60vh]"
            />

            {/* Vendors Row */}
            <section className="bg-slate-50 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Trusted Equipment Vendors</h2>
                            <p className="text-slate-500 font-medium">Reliable partners for tools and utility rentals</p>
                        </div>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                        {vendors.length > 0 ? vendors.map(v => (
                            <Link key={v.id} href={`/store/${v.slug}`} className="shrink-0 w-64 p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl transition-all group">
                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {v.logo_url ? <img src={v.logo_url} className="w-full h-full object-cover rounded-xl" /> : '🛠️'}
                                </div>
                                <h3 className="text-lg font-black text-slate-900 mb-1">{v.business_name || v.name}</h3>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{v.subtype || 'Utility Expert'}</p>
                            </Link>
                        )) : (
                            <div className="text-slate-400 font-bold italic py-4">Showcasing top utility stores soon...</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Filter & Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Tool Catalogue</h2>
                        <p className="text-slate-500 font-medium">Filter by utility category</p>
                    </div>
                    <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                        {['All', 'Tools', 'Event', 'Marine', 'Power'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}
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
                    <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                        <span className="text-5xl mb-6 block">🛠️</span>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Catalogue Empty</h3>
                        <p className="text-slate-400 font-bold italic">Adjust your filters to see more utility options.</p>
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-24 text-center">
                <Link href="/rentals" className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors">
                    Looking for Stays or Vehicle Rentals? Visit the Global Directory →
                </Link>
            </div>
        </div>
    );
}
