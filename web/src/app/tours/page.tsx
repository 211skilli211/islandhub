'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
import ListingCard from '@/components/ListingCard';

const TOUR_CATEGORIES = [
    { id: 'sea', title: 'Sea & Aquatic', icon: '🚤', desc: 'Catamarans, diving, and fishing expeditions.', gradient: 'from-cyan-500 to-blue-600' },
    { id: 'land', title: 'Land & Culture', icon: '🌿', desc: 'Rainforest hikes, volcano treks, and historic tours.', gradient: 'from-emerald-500 to-teal-600' },
    { id: 'rail', title: 'Rail & Scenic', icon: '🚂', desc: 'The historic St. Kitts Scenic Railway experiences.', gradient: 'from-amber-500 to-orange-600' },
    { id: 'adventure', title: 'Extreme & Adventure', icon: '🏎️', desc: 'ATV trails, buggy rides, and ziplining.', gradient: 'from-rose-500 to-red-600' },
    { id: 'charter', title: 'Private Charters', icon: '🛥️', desc: 'Luxury yachts and private island expeditions.', gradient: 'from-slate-700 to-slate-900' },
    { id: 'culture', title: 'History & Heritage', icon: '🏛️', desc: 'Colonial landmarks and local storytelling.', gradient: 'from-indigo-500 to-purple-600' }
];

export default function TourHubPage() {
    const [featuredTours, setFeaturedTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const res = await api.get('/listings?category=tour&featured=true');
                setFeaturedTours(Array.isArray(res.data) ? res.data : res.data.listings || []);
            } catch (error) {
                console.error('Failed to fetch tours', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 340; // Card width + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (scrollContainerRef.current) {
                const { current } = scrollContainerRef;
                if (current.scrollLeft + current.clientWidth >= current.scrollWidth - 10) {
                    current.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    current.scrollBy({ left: 340, behavior: 'smooth' });
                }
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-slate-900">
                <HeroBackground
                    pageKey="tour-hub"
                >
                    {/* Stats Grid as children */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 pointer-events-auto hidden lg:grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl mx-auto lg:mx-0"
                    >
                        {[
                            { label: 'Experiences', val: '50+' },
                            { label: 'Categories', val: '6' },
                            { label: 'Rating', val: '4.9/5' },
                            { label: 'Verified', val: '100%' }
                        ].map((stat, i) => (
                            <div key={i} className="p-4 md:p-6 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl md:rounded-4xl text-center">
                                <div className="text-xl md:text-2xl font-black text-orange-400 mb-1">{stat.val}</div>
                                <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/50">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </HeroBackground>
            </section>

            {/* Signature Experiences Carousel */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex justify-between items-end mb-16">
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight italic uppercase leading-none mb-4">
                                Signature <span className="text-orange-600">Experiences</span>
                            </h2>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Hand-picked premium excursions for our elite travelers</p>
                        </div>
                        <div className="hidden sm:flex gap-4">
                            <button onClick={() => scroll('left')} className="text-slate-300 font-bold hover:text-orange-600 cursor-pointer transition-colors">← Prev</button>
                            <button onClick={() => scroll('right')} className="text-slate-900 font-bold hover:text-orange-600 cursor-pointer transition-colors">Next →</button>
                        </div>
                    </div>

                    <div ref={scrollContainerRef} className="flex gap-8 overflow-x-auto pb-12 scrollbar-hide snap-x select-none">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="shrink-0 w-80 h-[450px] bg-slate-200 animate-pulse rounded-[3rem]" />
                            ))
                        ) : featuredTours.map((tour, idx) => (
                            <div key={tour.id} className="shrink-0 w-80 snap-center">
                                <ListingCard listing={tour} layout="compact" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Silo Categories Grid */}
            <section className="py-32 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter italic uppercase mb-6">Choose Your <span className="text-orange-600">Adventure</span></h2>
                        <p className="text-slate-400 font-medium text-xl max-w-2xl mx-auto italic">Explore our specialized hubs organized by category for a professional, focused journey.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {TOUR_CATEGORIES.map((cat, i) => (
                            <motion.div
                                key={cat.id}
                                whileHover={{ y: -15, scale: 1.02 }}
                                className="group relative"
                            >
                                <Link href={`/tours/${cat.id}`} className="block relative h-96 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200">
                                    <div className={`absolute inset-0 bg-linear-to-br ${cat.gradient} opacity-90 group-hover:opacity-100 transition-all duration-500`} />

                                    {/* Abstract Decoration */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

                                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                        <div className="text-6xl mb-6 transform group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-500">{cat.icon}</div>
                                        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">{cat.title}</h3>
                                        <p className="text-white/70 font-medium mb-8 leading-relaxed italic">{cat.desc}</p>
                                        <div className="w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center font-black group-hover:w-full group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                            {cat.id === 'rail' ? '🚂' : '➔'}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-slate-900 rounded-[4rem] p-12 md:p-24 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px] -translate-y-1/2" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-8 italic uppercase tracking-tighter">Are you a Tour Operator?</h2>
                        <p className="text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto italic">Join the most premium experience marketplace in the Caribbean. Empower your brand with professional tools.</p>
                        <Link href="/become-vendor" className="inline-block px-12 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/50">
                            Apply to Host ➔
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
