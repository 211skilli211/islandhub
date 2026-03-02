'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import CategoryHero from '@/components/CategoryHero';

interface Vendor {
    id: number;
    name: string;
    description: string;
    logo_url?: string;
    category: string;
    subtype: string;
    slug: string;
    rating?: number;
}

export default function RentalProvidersPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const stores = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                // Filter for rental-specific stores OR those that have rental categories
                const rentalVendors = stores.filter((s: any) =>
                    s.category?.toLowerCase().includes('rental') ||
                    s.subtype?.toLowerCase().includes('rental') ||
                    ['housing', 'vehicle', 'transport', 'equipment'].includes(s.category?.toLowerCase())
                );
                setVendors(rentalVendors);
            } catch (error) {
                console.error('Failed to fetch rental vendors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.subtype?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <CategoryHero
                icon="🚙"
                title="Verified Rental Partners"
                description="The most trusted providers of island transport, equipment, and accommodations. All partners are verified for safety and quality."
                category="Rental Directory"
                gradient="from-indigo-600 to-blue-800"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1 w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Find a rental provider..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-4xl text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder-slate-300 shadow-sm"
                        />
                    </div>
                    <Link href="/rentals" className="px-8 py-5 bg-slate-900 text-white rounded-4xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all">
                        ← Back to Rentals Hub
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                        ))}
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">No rental providers found matching your search.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest"
                        >
                            Reset Search
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredVendors.map((vendor, idx) => (
                            <motion.div
                                key={vendor.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={`/store/${vendor.slug}`}
                                    className="block p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-2 transition-all group"
                                >
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                        {vendor.logo_url ? (
                                            <img src={getImageUrl(vendor.logo_url)} alt={vendor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-black text-slate-300 uppercase">
                                                {vendor.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{vendor.name}</h3>
                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">{vendor.subtype || vendor.category}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm font-black text-slate-900">{vendor.rating || '4.9'}</span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
