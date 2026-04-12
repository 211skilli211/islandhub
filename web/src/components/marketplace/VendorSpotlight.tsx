'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

interface Vendor {
    id: number;
    business_name: string;
    sub_type: string;
    rating?: number;
    is_featured?: boolean;
    slug: string;
    logo_url?: string;
    banner_url?: string;
    branding_color?: string;
}

export default function VendorSpotlight() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedVendors = async () => {
            try {
                // Fetch featured stores specifically
                const res = await api.get('/stores', { params: { is_featured: true } });
                const stores = Array.isArray(res.data) ? res.data : (res.data.stores || []);

                const mapped = stores.map((s: any) => ({
                    id: s.store_id || s.id,
                    business_name: s.name,
                    sub_type: s.subtype || s.category,
                    slug: s.slug,
                    logo_url: s.logo_url,
                    banner_url: s.banner_url,
                    branding_color: s.branding_color || '#14b8a6',
                    rating: parseFloat(s.rating || s.admin_rating) || 5.0
                }));

                setVendors(mapped.slice(0, 3));
            } catch (error) {
                console.error('Failed to fetch featured stores', error);
                // Fallback to all stores if no featured ones
                try {
                    const res = await api.get('/stores');
                    const stores = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                    const mapped = stores.slice(0, 3).map((s: any) => ({
                        id: s.store_id || s.id,
                        business_name: s.name,
                        sub_type: s.subtype || s.category,
                        slug: s.slug,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        rating: parseFloat(s.rating) || 5.0
                    }));
                    setVendors(mapped);
                } catch (e) { }
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedVendors();
    }, []);

    if (loading) return (
        <div className="py-24 max-w-7xl mx-auto px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-slate-800 animate-pulse rounded-[2.5rem]" />
                ))}
            </div>
        </div>
    );

    if (vendors.length === 0) return null;

    return (
        <section className="py-12 md:py-24 bg-slate-900 rounded-4xl md:rounded-3xl my-10 md:my-20 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]" />

            <div className="max-w-7xl mx-auto px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Meet Featured Storefronts/Hosts</h2>
                    <p className="text-slate-400 font-medium max-w-xl mx-auto">
                        High-performing local entrepreneurs providing exceptional island experiences and quality goods.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {vendors.map((vendor, index) => (
                        <motion.div
                            key={vendor.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                href={`/stores/${vendor.slug || vendor.id}`}
                                className="block h-full group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
                            >
                                {/* Professional Banner Background */}
                                <div className="h-24 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                                    {vendor.banner_url ? (
                                        <img
                                            src={getImageUrl(vendor.banner_url)}
                                            alt="Banner"
                                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-r from-teal-500/10 to-blue-500/10" />
                                    )}
                                    <div className="absolute inset-0 bg-linear-to-t from-white dark:from-slate-800 via-transparent to-transparent" />
                                </div>

                                <div className="px-8 pb-10 relative z-10 -mt-8">
                                    {/* Professional Logo in Tile */}
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl mb-6 group-hover:scale-105 transition-transform bg-white">
                                        {vendor.logo_url ? (
                                            <img src={getImageUrl(vendor.logo_url)} className="w-full h-full object-cover" alt={vendor.business_name} />
                                        ) : (
                                            <div
                                                className="w-full h-full flex items-center justify-center text-2xl font-black text-white"
                                                style={{ backgroundColor: vendor.branding_color || '#14b8a6' }}
                                            >
                                                {vendor.business_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors uppercase tracking-tight">{vendor.business_name}</h3>
                                    <p className="text-teal-600 dark:text-teal-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">{vendor.sub_type || 'Verified Vendor'}</p>

                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i}>{i < Math.floor(vendor.rating || 5) ? '★' : '☆'}</span>
                                            ))}
                                        </div>
                                        <span className="text-slate-900 dark:text-white font-black text-sm">{vendor.rating?.toFixed(1) || '5.0'}</span>
                                        <span className="text-slate-500 dark:text-slate-400 text-[9px] font-bold uppercase tracking-widest ml-2">Rating</span>
                                    </div>

                                    <div className="inline-flex items-center gap-3 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                        Enter Storefront <span className="group-hover:translate-x-2 transition-transform">→</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
