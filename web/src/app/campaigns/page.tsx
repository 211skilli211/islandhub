'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface Store {
    id: number;
    store_id?: number;
    name: string;
    business_name?: string;
    description: string;
    logo_url?: string;
    banner_url?: string;
    branding_color?: string;
    category: string;
    subtype: string;
    slug: string;
    rating?: number;
}

export default function CampaignsPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const response = await api.get('/stores');
                const allStores = response.data?.stores || response.data || [];
                setStores(allStores);
            } catch (error) {
                console.error('Error fetching stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        if (!searchTerm) return stores;
        const term = searchTerm.toLowerCase();
        return stores.filter(s =>
            s.name?.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term) ||
            s.category?.toLowerCase().includes(term)
        );
    }, [stores, searchTerm]);

    return (
        <main className="min-h-screen bg-gray-50">
            <HeroBackground
                fallbackTitle="Campaigns"
                defaultImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop"
                overrideData={{
                    title: "Campaigns",
                    subtitle: "Discover promotions, fundraisers and special offers from local businesses",
                    overlay_color: "#7c3aed",
                    overlay_opacity: 0.5,
                    style_config: { bgColor: "#7c3aed" }
                }}
            />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input type="text" placeholder="Search campaigns and stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none" />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        </div>
                    </div>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Campaigns</h2>
                <p className="text-gray-500 mb-8">Stores running promotions and special offers</p>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (<div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />))}
                    </div>
                ) : filteredStores.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredStores.map((store, index) => (
                                <motion.div key={store.id || store.store_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <Link href={`/store/${store.slug}`}>
                                        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer h-full">
                                            <div className="h-40 overflow-hidden relative">
                                                {store.banner_url ? (<img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />) : (<div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500" />)}
                                                <div className="absolute top-3 left-3"><span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">Campaign</span></div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {store.logo_url && (<img src={getImageUrl(store.logo_url)} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />)}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                                                        <span className="text-xs text-purple-600 font-medium">{store.category}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 text-sm line-clamp-2">{store.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">📢</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No campaigns found</h3>
                        <p className="text-gray-500">Try adjusting your search</p>
                    </div>
                )}
            </section>
            <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-white mb-4">Launch your campaign</h2>
                    <p className="text-purple-100 mb-8">Promote your products, events or fundraisers to the IslandHub community.</p>
                    <Link href="/become-vendor" className="inline-block bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl">Get Started →</Link>
                </div>
            </section>
        </main>
    );
}
