'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroBackground from '@/components/HeroBackground';

export default function RentalHubPage() {
    const [activeTab, setActiveTab] = useState<'stays' | 'rides' | 'sea'>('stays');

    const categories = [
        {
            id: 'sea',
            title: 'Sea & Aquatic',
            icon: '⛵',
            description: 'Boats, jet skis, yachts, and marine adventures',
            link: '/rental-hub/sea-rentals',
            gradient: 'from-cyan-500 to-blue-600'
        },
        {
            id: 'stays',
            title: 'Stays & Homes',
            icon: '🏠',
            description: 'Luxury villas, apartments, and studio rentals',
            link: '/rental-hub/stays',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            id: 'land',
            title: 'Land Rentals',
            icon: '🚗',
            description: 'Jeeps, cars, ATVs, and island bikes',
            link: '/rental-hub/land-rentals',
            gradient: 'from-blue-500 to-indigo-600'
        },
        {
            id: 'tools',
            title: 'Equipment & Tools',
            icon: '🛠️',
            description: 'Marine gear, event equipment, and power tools',
            link: '/rental-hub/equipment-tools',
            gradient: 'from-slate-600 to-slate-800'
        }
    ];

    // Featured listings will be fetched from API

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50">
            {/* Hero Section */}
            <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-slate-900">
                <HeroBackground
                    pageKey="rental-hub"
                >
                    <div className="mt-8 pointer-events-auto">
                        <Link
                            href="/rentals"
                            className="inline-block px-8 py-4 md:px-10 md:py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Explore Full Directory
                        </Link>
                    </div>
                </HeroBackground>
            </section>

            {/* Category Grid */}
            <section id="explore" className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        📍 Select Your Sector
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tighter italic">
                        The Silo Experience
                    </h2>
                    <p className="text-lg text-slate-500 font-medium italic">
                        Specialized hubs for every island need
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={cat.link}
                            className="group"
                        >
                            <motion.div
                                whileHover={{ scale: 1.02, y: -5 }}
                                className={`relative p-8 rounded-[2.5rem] bg-linear-to-br ${cat.gradient} text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full flex flex-col`}
                            >
                                <div className="absolute top-0 right-0 text-9xl opacity-20 -mr-8 -mt-8 grayscale group-hover:opacity-30 transition-opacity">
                                    {cat.icon}
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <h3 className="text-2xl font-black mb-2 tracking-tight uppercase italic mt-2">
                                        {cat.title}
                                    </h3>
                                    <p className="text-white/80 font-medium mb-8 text-sm italic">
                                        {cat.description}
                                    </p>
                                    <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20">
                                        Explore Silo <span className="text-lg">→</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Featured Area removed - will be populated with real API data */}
            </section>

            {/* Final CTA */}
            <section className="relative bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15)_0%,transparent_60%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter italic uppercase">
                        Ready to Explore?
                    </h2>
                    <p className="text-xl text-slate-300 font-medium mb-12 italic">
                        Access the full Caribbean marketplace through our unified directory
                    </p>
                    <Link
                        href="/rentals"
                        className="inline-block px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
                    >
                        Enter Global Hub
                    </Link>
                </div>
            </section>
        </div>
    );
}
