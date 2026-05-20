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

const RENTAL_TYPES = [
    { id: 'vehicles', label: 'Vehicles', icon: '🚗', desc: 'Cars, SUVs, scooters and more' },
    { id: 'equipment', label: 'Equipment', icon: '🔧', desc: 'Tools, gear and machinery' },
    { id: 'property', label: 'Property', icon: '🏠', desc: 'Villas, apartments and land' },
    { id: 'water', label: 'Water Sports', icon: '⛵', desc: 'Boats, jet skis and tours' },
];

export default function RentalsPage() {
    const [stores, setStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const response = await api.get('/stores');
                const allStores = response.data?.stores || response.data || [];
                setStores(allStores);
            } catch (error) {
                console.error('Error fetching rental stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const rentalStores = useMemo(() => {
        return stores.filter(s => {
            const cat = (s.category || '').toLowerCase();
            return cat === 'rental' || cat === 'rent';
        });
    }, [stores]);

    const otherStores = useMemo(() => {
        return stores.filter(s => {
            const cat = (s.category || '').toLowerCase();
            return cat !== 'rental' && cat !== 'rent';
        });
    }, [stores]);

    const filteredRentals = useMemo(() => {
        let filtered = rentalStores;
        if (selectedType !== 'all') {
            filtered = filtered.filter(s => (s.subtype || '').toLowerCase().includes(selectedType));
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term)
            );
        }
        return filtered;
    }, [rentalStores, selectedType, searchTerm]);

    const filteredOther = useMemo(() => {
        if (!searchTerm) return otherStores.slice(0, 6);
        const term = searchTerm.toLowerCase();
        return otherStores.filter(s =>
            s.name?.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term)
        ).slice(0, 6);
    }, [otherStores, searchTerm]);

    return (
        <main className="min-h-screen bg-gray-50">
            <HeroBackground
                fallbackTitle="Rentals"
                defaultImage="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1920&h=1080&fit=crop"
                overrideData={{
                    title: "Rentals",
                    subtitle: "Vehicles, equipment, property and water sports",
                    overlay_color: "#0891b2",
                    overlay_opacity: 0.5,
                    style_config: { bgColor: "#0891b2" }
                }}
            />
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input type="text" placeholder="Search rentals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 transition-all outline-none" />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setSelectedType('all')} className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedType === 'all' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
                            {RENTAL_TYPES.map(type => (
                                <button key={type.id} onClick={() => setSelectedType(type.id)} className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedType === type.id ? 'bg-cyan-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{type.icon} {type.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {RENTAL_TYPES.map(type => (
                        <button key={type.id} onClick={() => setSelectedType(type.id)} className={`p-6 rounded-2xl text-center transition-all hover:scale-105 ${selectedType === type.id ? 'bg-cyan-600 text-white shadow-xl' : 'bg-white text-gray-700 shadow-md hover:shadow-lg'}`}>
                            <div className="text-4xl mb-3">{type.icon}</div>
                            <h3 className="font-bold text-lg">{type.label}</h3>
                            <p className={`text-sm mt-1 ${selectedType === type.id ? 'text-cyan-100' : 'text-gray-500'}`}>{type.desc}</p>
                        </button>
                    ))}
                </div>
            </section>
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Rental Providers</h2>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (<div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />))}
                    </div>
                ) : filteredRentals.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredRentals.map((store, index) => (
                                <motion.div key={store.id || store.store_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <Link href={`/store/${store.slug}`}>
                                        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer h-full">
                                            <div className="h-40 overflow-hidden relative">
                                                {store.banner_url ? (<img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />) : (<div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500" />)}
                                                <div className="absolute top-3 left-3"><span className="bg-cyan-600 text-white text-xs font-bold px-3 py-1 rounded-full">Rental</span></div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {store.logo_url && (<img src={getImageUrl(store.logo_url)} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />)}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                                                        {store.rating && (<div className="flex items-center gap-1"><span className="text-yellow-500 text-sm">★</span><span className="text-sm text-gray-600">{store.rating}</span></div>)}
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
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No rentals found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </section>
            {filteredOther.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Featured Stores</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOther.map((store, index) => (
                            <motion.div key={store.id || store.store_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                <Link href={`/store/${store.slug}`}>
                                    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group cursor-pointer h-full">
                                        <div className="h-32 overflow-hidden relative">
                                            {store.banner_url ? (<img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />) : (<div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />)}
                                            <div className="absolute top-3 left-3"><span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full">{store.category}</span></div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate">{store.name}</h3>
                                            <p className="text-gray-500 text-sm line-clamp-2 mt-1">{store.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}
            <section className="bg-gradient-to-r from-cyan-600 to-blue-700 py-16">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl font-bold text-white mb-4">Have something to rent?</h2>
                    <p className="text-cyan-100 mb-8">List your vehicles, equipment or property and start earning today.</p>
                    <Link href="/become-vendor" className="inline-block bg-white text-cyan-700 font-bold px-8 py-4 rounded-xl hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl">Become a Rental Provider →</Link>
                </div>
            </section>
        </main>
    );
}
