'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import BrandMarquee from '@/components/BrandMarquee';

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

const SERVICE_CATEGORIES = [
    { id: 'all', title: 'All Services', icon: '🛠️', subtypes: [] },
    { id: 'professional', title: 'Professional', icon: '💼', desc: 'Legal, consulting & business', subtypes: ['professional_services', 'legal', 'consulting', 'accounting'] },
    { id: 'automotive', title: 'Automotive', icon: '🚗', desc: 'Repair, detailing & maintenance', subtypes: ['automotive', 'car_repair', 'detailing'] },
    { id: 'health', title: 'Health & Beauty', icon: '💆', desc: 'Spa, wellness & personal care', subtypes: ['health_beauty', 'spa', 'wellness', 'salon'] },
    { id: 'marine', title: 'Marine', icon: '⚓', desc: 'Boat services & water activities', subtypes: ['marine', 'boat_service', 'diving'] },
    { id: 'events', title: 'Events', icon: '🎉', desc: 'Planning, catering & entertainment', subtypes: ['event_services', 'catering', 'entertainment', 'planning'] },
    { id: 'digital', title: 'Digital & Tech', icon: '💻', desc: 'Web, app & digital services', subtypes: ['digital', 'web', 'app', 'tech', 'it'] },
];

function categorizeStore(store: Store): string {
    const subtype = (store.subtype || '').toLowerCase();
    const name = (store.name || store.business_name || '').toLowerCase();
    const desc = (store.description || '').toLowerCase();
    const combined = `${subtype} ${name} ${desc}`;

    for (const cat of SERVICE_CATEGORIES) {
        if (cat.id === 'all') continue;
        for (const s of cat.subtypes) {
            if (combined.includes(s)) return cat.id;
        }
    }
    return 'professional';
}

function ServiceCard({ store, index }: { store: Store; index: number }) {
    const storeName = store.name || store.business_name || 'Unknown';
    const rating = store.rating ? Number(store.rating).toFixed(1) : '4.9';
    const subtypeLabel = store.subtype
        ? store.subtype.replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())
        : 'Service';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            whileHover={{ y: -4 }}
        >
            <Link
                href={`/store/${store.slug}`}
                className="group block bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg hover:border-violet-200 transition-all duration-300"
            >
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            {store.logo_url ? (
                                <img src={getImageUrl(store.logo_url)} alt={storeName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xl font-black text-white uppercase" style={{ backgroundColor: store.branding_color || '#7c3aed' }}>
                                    {storeName.charAt(0)}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">{storeName}</h3>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{subtypeLabel}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <span className="text-yellow-400 text-xs">★</span>
                            <span className="text-xs font-bold text-slate-700">{rating}</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-4 min-h-[2rem]">
                        {store.description || 'Professional services for your needs.'}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Available</span>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-violet-500 text-white text-[11px] font-bold rounded-lg group-hover:bg-violet-600 transition-colors">
                            Book Now →
                        </span>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

export default function ServicesHubPage() {
    const [allStores, setAllStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        const fetchStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/stores');
                const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
                const stores: Store[] = rawData
                    .filter((s: any) => {
                        const cat = (s.category || '').toLowerCase();
                        return cat === 'services' || cat === 'professional';
                    })
                    .map((s: any) => ({
                        id: s.store_id || s.id,
                        store_id: s.store_id,
                        name: s.name || s.business_name,
                        business_name: s.business_name,
                        description: s.description,
                        logo_url: s.logo_url,
                        banner_url: s.banner_url,
                        branding_color: s.branding_color || '#7c3aed',
                        category: s.category,
                        subtype: s.subtype,
                        slug: s.slug,
                        rating: s.rating,
                    }));
                setAllStores(stores);
            } catch (error) {
                console.error('Failed to fetch service stores:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStores();
    }, []);

    const filteredStores = useMemo(() => {
        let stores = allStores;
        if (activeCategory !== 'all') {
            stores = stores.filter(s => categorizeStore(s) === activeCategory);
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            stores = stores.filter(s =>
                (s.name || s.business_name || '').toLowerCase().includes(q) ||
                (s.description || '').toLowerCase().includes(q) ||
                (s.subtype || '').toLowerCase().includes(q)
            );
        }
        return stores;
    }, [allStores, activeCategory, searchTerm]);

    const storesByCategory = useMemo(() => {
        const map: Record<string, Store[]> = {};
        for (const cat of SERVICE_CATEGORIES) { map[cat.id] = []; }
        for (const store of filteredStores) {
            const catId = categorizeStore(store);
            if (map[catId]) map[catId].push(store);
        }
        return map;
    }, [filteredStores]);

    const totalStores = filteredStores.length;

    return (
        <main className="min-h-screen bg-white">
            <HeroBackground pageKey="service-stores" fallbackTitle="Island Services" className="min-h-[50vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-full max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">Island <span className="text-violet-400">Services</span></h1>
                    <p className="text-lg text-white/80 mb-8 font-medium">Find trusted professionals for every need — from legal to digital.</p>
                    <div className="relative max-w-lg mx-auto">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text" placeholder="Search services, professionals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 shadow-xl border border-white/20" />
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="text-center"><div className="text-2xl font-black text-white">{loading ? '—' : totalStores}</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Providers</div></div>
                        <div className="w-px h-8 bg-white/20" />
                        <div className="text-center"><div className="text-2xl font-black text-white">{SERVICE_CATEGORIES.length - 1}</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/60">Categories</div></div>
                    </div>
                </motion.div>
            </HeroBackground>

            <section className="bg-slate-50 border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {SERVICE_CATEGORIES.map(cat => {
                            const count = cat.id === 'all' ? totalStores : (storesByCategory[cat.id]?.length || 0);
                            return (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${activeCategory === cat.id ? 'bg-violet-500 text-white shadow-lg' : 'bg-white text-slate-700 border border-slate-200 hover:border-violet-300 hover:bg-violet-50'}`}>
                                    <span>{cat.icon}</span><span>{cat.title}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeCategory === cat.id ? 'bg-white/20' : 'bg-slate-100'}`}>{loading ? '…' : count}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            {!loading && totalStores > 0 && <BrandMarquee type="brand" />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!loading && totalStores === 0 && (
                    <div className="text-center py-20">
                        <span className="text-6xl mb-4 block">🛠️</span>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No services found</h3>
                        <p className="text-slate-500 mb-6">Try adjusting your search or browse all categories.</p>
                        <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="px-6 py-3 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600 transition-colors">View All Services</button>
                    </div>
                )}

                {(searchTerm || activeCategory !== 'all') ? (
                    !loading && totalStores > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStores.map((store, idx) => (<ServiceCard key={store.store_id || store.id} store={store} index={idx} />))}
                        </div>
                    )
                ) : (
                    SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const stores = storesByCategory[cat.id] || [];
                        if (!loading && stores.length === 0) return null;
                        return (
                            <section key={cat.id} className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{cat.icon}</span>
                                        <div><h2 className="text-xl font-bold text-slate-900">{cat.title}</h2><p className="text-xs text-slate-500">{cat.desc}</p></div>
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">{loading ? '…' : stores.length}</span>
                                </div>
                                {loading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => (<div key={i} className="h-40 bg-slate-100 animate-pulse rounded-xl" />))}</div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{stores.map((store, idx) => (<ServiceCard key={store.store_id || store.id} store={store} index={idx} />))}</div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>

            <section className="py-16 px-6 bg-gradient-to-br from-violet-600 to-purple-700">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Offer a Service?</h2>
                    <p className="text-white/80 text-lg mb-8 font-medium">Join IslandHub and connect with customers looking for your expertise.</p>
                    <Link href="/become-vendor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold rounded-2xl hover:bg-violet-50 transition-colors shadow-xl text-sm uppercase tracking-wider">List Your Service →</Link>
                </div>
            </section>
        </main>
    );
}
