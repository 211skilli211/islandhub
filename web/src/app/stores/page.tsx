'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import CategoryHero from '@/components/CategoryHero';

interface Vendor {
    id: number;
    name: string;
    description: string;
    logo_url?: string;
    banner_url?: string;
    branding_color?: string;
    category: string;
    subtype: string;
    slug: string;
    rating?: number;
}

const CATEGORY_CONFIG: Record<string, any> = {
    food: { title: 'Island Kitchens', desc: 'Authentic local flavors, restaurants, and homemade treats.', icon: '🍴', gradient: 'from-orange-500 to-red-600' },
    product: { title: 'Local Brands', desc: 'Handcrafted goods, fashion, and unique island products.', icon: '📦', gradient: 'from-blue-500 to-indigo-600' },
    service: { title: 'Pro Services', desc: 'Verified experts for all your needs.', icon: '🛠', gradient: 'from-emerald-500 to-teal-600' },
    rental: { title: 'Stays & Rides', desc: 'Villas, Apartments, Cars, and ATVs for your island journey.', icon: '🏠', gradient: 'from-purple-500 to-indigo-600' },
    default: { title: 'Marketplace Directory', desc: 'Discover all our trusted partners.', icon: '🏪', gradient: 'from-slate-700 to-slate-900' }
};

export default function StoresPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-slate-100 border-t-indigo-600 rounded-full"></div>
            </div>
        }>
            <StoresContent />
        </Suspense>
    );
}

function StoresContent() {
    const searchParams = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const groupParam = searchParams.get('group');
    const config = CATEGORY_CONFIG[categoryParam || 'default'] || CATEGORY_CONFIG.default;

    const AQUATIC_SUBTYPES = ['boat', 'yacht', 'catamaran', 'jet_ski', 'kayak', 'paddleboard', 'surfboard', 'fishing_boat', 'snorkel_gear', 'scuba'];

    useEffect(() => {
        const fetchVendors = async () => {
            setLoading(true);
            try {
                // Determine API endpoint query
                let endpoint = '/api/stores';
                const params = new URLSearchParams();
                if (categoryParam) params.append('category', categoryParam);

                const res = await api.get(`${endpoint}?${params.toString()}`);
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                let stores = rawData.map((s: any) => ({
                    id: s.store_id || s.id,
                    name: s.name,
                    description: s.description,
                    logo_url: s.logo_url,
                    banner_url: s.banner_url,
                    branding_color: s.branding_color || '#14b8a6',
                    category: s.category,
                    subtype: s.subtype,
                    slug: s.slug,
                    rating: s.rating
                }));

                // Filter by group logic
                if (groupParam === 'aquatic') {
                    stores = stores.filter((v: Vendor) =>
                        AQUATIC_SUBTYPES.some(t => v.subtype?.toLowerCase().includes(t) || v.description?.toLowerCase().includes(t))
                    );
                } else if (categoryParam === 'rental' && !groupParam) {
                    // Default Stays & Rides: Filter OUT aquatic
                    stores = stores.filter((v: Vendor) =>
                        !AQUATIC_SUBTYPES.some(t => v.subtype?.toLowerCase().includes(t) || v.description?.toLowerCase().includes(t))
                    );
                }

                setVendors(stores);
            } catch (error) {
                console.error('Failed to fetch vendors', error);
            } finally {
                setLoading(false);
            }
        };
        fetchVendors();
    }, [categoryParam, groupParam]);

    const filteredVendors = vendors.filter(v =>
        v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.subtype?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <CategoryHero
                icon={config.icon}
                title={config.title}
                description={config.desc}
                category="Marketplace"
                gradient={config.gradient}
                pageKey={categoryParam ? `${categoryParam}-stores` : (groupParam === 'aquatic' ? 'sea-rentals' : 'default-stores')}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="mb-12 max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder={`Search ${config.title.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-4xl text-slate-900 focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder-slate-300 shadow-sm"
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
                        <p className="text-slate-400 font-bold italic">No stores found.</p>
                        <button
                            onClick={() => window.location.href = '/stores'}
                            className="mt-4 text-indigo-600 font-bold text-sm hover:underline"
                        >
                            View All Stores
                        </button>
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
                                    className="block relative bg-white rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all group overflow-hidden"
                                >
                                    {/* Store Banner Background */}
                                    <div className="h-24 w-full relative overflow-hidden">
                                        {vendor.banner_url ? (
                                            <img
                                                src={getImageUrl(vendor.banner_url)}
                                                className="w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-700"
                                                alt="Banner"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-linear-to-r from-slate-100 to-slate-50" />
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-white via-white/40 to-transparent" />
                                    </div>

                                    <div className="px-5 sm:px-8 pb-8 -mt-8 relative z-10">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-white border-4 border-white mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                            {vendor.logo_url ? (
                                                <img src={getImageUrl(vendor.logo_url)} alt={vendor.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center text-3xl font-black text-white uppercase"
                                                    style={{ backgroundColor: vendor.branding_color }}
                                                >
                                                    {vendor.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight truncate">{vendor.name}</h3>
                                        <p className="text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3 sm:mb-4">{vendor.subtype || vendor.category}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-yellow-400">★</span>
                                            <span className="text-sm font-black text-slate-900">{vendor.rating ? Number(vendor.rating).toFixed(1) : '4.9'}</span>
                                        </div>
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
