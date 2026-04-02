'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import CategoryHero from '@/components/CategoryHero';
import ListingCard from '@/components/ListingCard';

const CAT_CONFIG: Record<string, any> = {
    sea: { title: 'Sea & Aquatic', icon: '🚤', desc: 'Catamarans, diving, and fishing expeditions in crystal clear waters.', color: 'cyan' },
    land: { title: 'Land & Culture', icon: '🌿', desc: 'Rainforest hikes, volcano treks, and historic sugarcane tours.', color: 'emerald' },
    rail: { title: 'Rail & Scenic', icon: '🚂', desc: 'The historic St. Kitts Scenic Railway - the Caribbean\'s only rail journey.', color: 'amber' },
    adventure: { title: 'Extreme & Adventure', icon: '🏎️', desc: 'ATV trails, buggy rides, and high-speed island expeditions.', color: 'rose' },
    charter: { title: 'Private Charters', icon: '🛥️', desc: 'Luxury yacht charters and private island hopping adventures.', color: 'slate' },
    culture: { title: 'History & Heritage', icon: '🏛️', desc: 'Explore historic sites, Brimstone Hill, and colonial milestones.', color: 'indigo' },
    default: { title: 'Signature Tours', icon: '✨', desc: 'Explore the best St. Kitts & Nevis has to offer.', color: 'orange' }
};

export default function TourCategoryPage() {
    const params = useParams();
    const category = params.category as string;
    const config = CAT_CONFIG[category] || CAT_CONFIG.default;

    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState(1000);
    const [activeDuration, setActiveDuration] = useState('All');

    useEffect(() => {
        const fetchTours = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/listings?category=tour&sub_category=${category}`);
                setTours(Array.isArray(res.data) ? res.data : res.data.listings || []);
            } catch (error) {
                console.error('Failed to fetch tours', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, [category]);

    const filteredTours = tours.filter(t =>
        t.price <= priceRange &&
        (activeDuration === 'All' || t.duration?.toLowerCase().includes(activeDuration.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-white">
            <CategoryHero
                icon={config.icon}
                title={config.title}
                description={config.desc}
                category="Experiences"
                pageKey={`tour-${category}`}
                gradient={`from-${config.color}-500 to-${config.color}-700`}
            />

            <div className="max-w-7xl mx-auto px-6 py-16">
                {/* Filter Bar */}
                <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 md:p-12 mb-16 flex flex-col lg:flex-row gap-12 items-center">
                    <div className="flex-1 w-full">
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Price Range: Up to ${priceRange}</label>
                        <input
                            type="range"
                            min="50"
                            max="1000"
                            step="50"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center">
                        {['All', 'hour', 'day'].map(d => (
                            <button
                                key={d}
                                onClick={() => setActiveDuration(d)}
                                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeDuration === d ? 'bg-orange-600 text-white shadow-xl shadow-orange-200' : 'bg-white text-slate-400 hover:text-slate-900 border border-slate-100'}`}
                            >
                                {d === 'All' ? 'All Durations' : (d === 'hour' ? 'Short Excursions' : 'Full Day Tours')}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 text-center">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[3rem]" />
                        ))}
                    </div>
                ) : filteredTours.length === 0 ? (
                    <div className="text-center py-32 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
                        <div className="text-6xl mb-6 opacity-30">🏜️</div>
                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter italic">No Experiences matched your filters</h3>
                        <button
                            onClick={() => { setPriceRange(1000); setActiveDuration('All'); }}
                            className="mt-6 text-orange-600 font-bold hover:underline uppercase tracking-widest text-[10px]"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredTours.map((tour, idx) => (
                            <motion.div
                                key={tour.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <ListingCard listing={tour} layout="default" />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
