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

const TRANSPORT_TYPES = [
    { id: 'ride', label: 'Ride Hailing', icon: '🚕', desc: 'Quick rides across the island' },
    { id: 'delivery', label: 'Delivery', icon: '📦', desc: 'Send packages and goods' },
    { id: 'boat', label: 'Boat Charters', icon: '🚤', desc: 'Private boat and ferry services' },
    { id: 'moving', label: 'Moving', icon: '🚚', desc: 'Relocation and heavy lifting' },
];

export default function TransportPage() {
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
                console.error('Error fetching transport stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const transportStores = useMemo(() => {
        return stores.filter(s => {
            const cat = (s.category || '').toLowerCase();
            const sub = (s.subtype || '').toLowerCase();
            return cat === 'transport' || cat === 'ride' || cat === 'delivery' || sub.includes('ride') || sub.includes('transport') || sub.includes('delivery') || sub.includes('boat');
        });
    }, [stores]);

    const otherStores = useMemo(() => {
        return stores.filter(s => {
            const cat = (s.category || '').toLowerCase();
            const sub = (s.subtype || '').toLowerCase();
            return cat !== 'transport' && cat !== 'ride' && cat !== 'delivery' && !sub.includes('ride') && !sub.includes('transport') && !sub.includes('delivery') && !sub.includes('boat');
        });
    }, [stores]);

    const filteredTransport = useMemo(() => {
        let filtered = transportStores;
        if (selectedType !== 'all') {
            filtered = filtered.filter(s => (s.subtype || '').toLowerCase().includes(selectedType) || (s.category || '').toLowerCase().includes(selectedType));
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(s =>
                s.name?.toLowerCase().includes(term) ||
                s.description?.toLowerCase().includes(term)
            );
        }
        return filtered;
    }, [transportStores, selectedType, searchTerm]);

    const filteredOther = useMemo(() => {
        if (!searchTerm) return otherStores.slice(0, 6);
        const term = searchTerm.toLowerCase();
        return otherStores.filter(s =>
            s.name?.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term)
        ).slice(0, 6);
    }, [otherStores, searchTerm]);

    return (
        <main className="min-h-screen bg-black">
            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-black">
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Yellow glow accents */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[200px] bg-orange-500/8 rounded-full blur-[100px]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        {/* Small badge */}
                        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-8">
                            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                            <span className="text-yellow-400 text-sm font-medium tracking-wide">Island Transport Network</span>
                        </div>

                        {/* Main title */}
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tight leading-none mb-6">
                            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">Get There</span>
                        </h1>

                        <p className="text-ink-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                            Rides, deliveries, boat charters & moving — all in one place.
                            <br className="hidden sm:block" />
                            <span className="text-ink-500">Tap a ride. Get moving.</span>
                        </p>

                        {/* CTA row */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/request-ride" className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 text-lg">
                                🚕 Ride Now
                            </Link>
                            <Link href="/become-vendor" className="inline-flex items-center justify-center gap-2 bg-surface-elevated/5 hover:bg-surface-elevated/10 text-white font-bold px-8 py-4 rounded-2xl transition-all border border-white/10 hover:border-yellow-400/30 text-lg">
                                Become a Driver
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent" />
            </section>

            {/* ── SEARCH & FILTER BAR ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
                <div className="bg-ink-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-2xl">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <input type="text" placeholder="Where to?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-black/60 border border-white/10 text-white placeholder-ink-500 focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-all outline-none" />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500">🔍</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={() => setSelectedType('all')} className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${selectedType === 'all' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-surface-elevated/5 text-ink-400 hover:bg-surface-elevated/10 hover:text-white border border-white/5'}`}>All</button>
                            {TRANSPORT_TYPES.map(type => (
                                <button key={type.id} onClick={() => setSelectedType(type.id)} className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${selectedType === type.id ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20' : 'bg-surface-elevated/5 text-ink-400 hover:bg-surface-elevated/10 hover:text-white border border-white/5'}`}>{type.icon} {type.label}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TRANSPORT TYPE CARDS ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TRANSPORT_TYPES.map(type => (
                        <button key={type.id} onClick={() => setSelectedType(type.id)} className={`group relative p-6 rounded-2xl text-center transition-all duration-300 overflow-hidden ${selectedType === type.id ? 'bg-yellow-400 text-black shadow-xl shadow-yellow-400/20 scale-[1.02]' : 'bg-ink-900/60 text-white border border-white/5 hover:border-yellow-400/30 hover:bg-ink-900/80'}`}>
                            {/* Hover glow */}
                            {selectedType !== type.id && (
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-orange-500/0 group-hover:from-yellow-400/5 group-hover:to-orange-500/5 transition-all duration-300" />
                            )}
                            <div className="relative">
                                <div className="text-4xl mb-3">{type.icon}</div>
                                <h3 className="font-bold text-base">{type.label}</h3>
                                <p className={`text-xs mt-1.5 ${selectedType === type.id ? 'text-black/60' : 'text-ink-500'}`}>{type.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* ── TRANSPORT PROVIDERS ── */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-white">Transport Providers</h2>
                    {!loading && filteredTransport.length > 0 && (
                        <span className="text-sm text-ink-500">{filteredTransport.length} available</span>
                    )}
                </div>
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3].map(i => (<div key={i} className="bg-ink-900 rounded-2xl h-72 animate-pulse border border-white/5" />))}
                    </div>
                ) : filteredTransport.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredTransport.map((store, index) => (
                                <motion.div key={store.id || store.store_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                    <Link href={`/store/${store.slug}`}>
                                        <div className="bg-ink-900/60 border border-white/5 rounded-2xl overflow-hidden group cursor-pointer h-full hover:border-yellow-400/20 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-400/5">
                                            <div className="h-40 overflow-hidden relative">
                                                {store.banner_url ? (<img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-orange-500/20" />)}
                                                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
                                                <div className="absolute top-3 left-3"><span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">Transport</span></div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex items-center gap-3 mb-3">
                                                    {store.logo_url && (<img src={getImageUrl(store.logo_url)} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400/30" />)}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-white truncate">{store.name}</h3>
                                                        {store.rating && (<div className="flex items-center gap-1"><span className="text-yellow-400 text-sm">★</span><span className="text-sm text-ink-400">{store.rating}</span></div>)}
                                                    </div>
                                                </div>
                                                <p className="text-ink-500 text-sm line-clamp-2 mb-4">{store.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-ink-600 uppercase tracking-wider">{store.subtype || store.category}</span>
                                                    <span className="inline-flex items-center gap-1 bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-4 py-2 rounded-xl transition-all shadow-md shadow-yellow-400/10 group-hover:shadow-yellow-400/30">
                                                        Ride Now →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-xl font-bold text-white mb-2">No transport services found</h3>
                        <p className="text-ink-500">Try adjusting your search or filters</p>
                    </div>
                )}
            </section>

            {/* ── OTHER FEATURED STORES ── */}
            {filteredOther.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <h2 className="text-2xl font-bold text-white mb-8">Other Featured Stores</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOther.map((store, index) => (
                            <motion.div key={store.id || store.store_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                                <Link href={`/store/${store.slug}`}>
                                    <div className="bg-ink-900/40 border border-white/5 rounded-2xl overflow-hidden group cursor-pointer h-full hover:border-white/10 transition-all duration-300">
                                        <div className="h-32 overflow-hidden relative">
                                            {store.banner_url ? (<img src={getImageUrl(store.banner_url)} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />) : (<div className="w-full h-full bg-gradient-to-br from-ink-800 to-ink-900" />)}
                                            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 to-transparent" />
                                            <div className="absolute top-3 left-3"><span className="bg-surface-elevated/10 text-ink-300 text-xs font-bold px-3 py-1 rounded-full border border-white/10">{store.category}</span></div>
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-white truncate">{store.name}</h3>
                                            <p className="text-ink-500 text-sm line-clamp-2 mt-1">{store.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </section>
            )}

            {/* ── DRIVER CTA ── */}
            <section className="relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500" />
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0,0,0,.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(0,0,0,.2) 0%, transparent 50%)' }} />

                <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 py-20">
                    <h2 className="text-4xl sm:text-5xl font-black text-black mb-4">Start Driving.<br />Start Earning.</h2>
                    <p className="text-black/60 text-lg mb-10 max-w-xl mx-auto">Join the island&apos;s fastest-growing transport network. Set your own hours, keep more of what you earn.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/request-ride" className="inline-flex items-center justify-center gap-2 bg-black text-yellow-400 font-bold px-8 py-4 rounded-2xl hover:bg-ink-900 transition-all shadow-xl text-lg">
                            🚕 Book a Ride →
                        </Link>
                        <Link href="/become-vendor" className="inline-flex items-center justify-center gap-2 bg-surface-elevated/20 backdrop-blur text-black font-bold px-8 py-4 rounded-2xl hover:bg-surface-elevated/30 transition-all border border-black/10 text-lg">
                            Become a Driver →
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER SPACING ── */}
            <div className="h-8 bg-black" />
        </main>
    );
}
