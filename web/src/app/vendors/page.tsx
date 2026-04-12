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

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const stores = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                setVendors(stores);
            } catch (error) {
                console.error('Failed to fetch vendors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <CategoryHero
                icon="🏪"
                title="Our Island Partners"
                description="Connect directly with the local businesses that make our economy thrive. From artisans to aggregators, discover the best of the islands."
                category="Business Directory"
                gradient="from-slate-700 to-slate-900"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search for a business or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-4xl text-slate-900 focus:outline-none focus:border-teal-500 transition-all font-bold placeholder-slate-300 shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                        ))}
                    </div>
                ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold italic">No businesses found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredVendors.map((vendor, idx) => (
                            <motion.div
                                key={vendor.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Link
                                    href={`/store/${vendor.slug}`}
                                    className="block p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 transition-all group"
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
                                    <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-teal-600 transition-colors uppercase tracking-tight">{vendor.name}</h3>
                                    <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-4">{vendor.category} • {vendor.subtype}</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-yellow-400">★</span>
                                        <span className="text-sm font-black text-slate-900">{vendor.rating || '4.8'}</span>
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
