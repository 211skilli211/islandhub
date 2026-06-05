'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import HeroBackground from '@/components/HeroBackground';

export default function RentalHubPage() {
    const silos = [
        {
            id: 'stays',
            title: 'Stays & Homes',
            icon: '🏠',
            description: 'Luxury villas, apartments, studios & Airbnb',
            link: '/rental-hub/stays',
            gradient: 'from-ocean-500 to-brand-700',
        },
        {
            id: 'vehicles',
            title: 'Vehicles',
            icon: '🚗',
            description: 'Cars, jeeps, ATVs & island bikes',
            link: '/rental-hub/vehicles',
            gradient: 'from-sunset-500 to-sunset-700',
        },
        {
            id: 'sea',
            title: 'Sea & Aquatic',
            icon: '⛵',
            description: 'Boats, jet skis, yachts & marine gear',
            link: '/rental-hub/sea-rentals',
            gradient: 'from-turquoise-400 to-ocean-600',
        },
        {
            id: 'equipment',
            title: 'Equipment & Tools',
            icon: '🛠️',
            description: 'Event gear, power tools & marine equipment',
            link: '/rental-hub/equipment-tools',
            gradient: 'from-ink-500 to-surface-tertiary',
        },
        {
            id: 'property',
            title: 'Land & Property',
            icon: '🏘️',
            description: 'Land plots, commercial real estate & warehouses',
            link: '/rental-hub/property',
            gradient: 'from-brand-600 to-brand-800',
        },
    ];

    return (
        <div className="min-h-screen bg-surface-primary">
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-surface-tertiary">
                <HeroBackground pageKey="rental-hub">
                    <div className="mt-8 pointer-events-auto">
                        <Link
                            href="#explore"
                            className="inline-block px-8 py-4 md:px-10 md:py-5 bg-accent-400 text-brand-950 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Explore All Silos
                        </Link>
                    </div>
                </HeroBackground>
            </section>

            {/* Silo Navigation Bar — visible on scroll */}
            <div className="sticky top-0 z-40 bg-surface-elevated/95 backdrop-blur-xl border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3">
                        <Link href="/" className="text-ink-primary font-black text-sm tracking-tight">
                            🏝 IslandHub Rentals
                        </Link>
                        <div className="flex items-center gap-1 md:gap-2">
                            {silos.map((s) => (
                                <Link
                                    key={s.id}
                                    href={s.link}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest text-ink-secondary hover:text-ink-primary hover:bg-surface-tertiary transition-all"
                                >
                                    <span className="hidden md:inline">{s.icon} </span>
                                    {s.title.split(' ')[0]}
                                </Link>
                            ))}
                        </div>
                        <Link
                            href="/listings?category=rental"
                            className="px-4 py-1.5 bg-accent-400/10 text-accent-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-400/20 transition-all"
                        >
                            All Rentals
                        </Link>
                    </div>
                </div>
            </div>

            {/* Category Grid */}
            <section id="explore" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-400/10 rounded-full text-accent-400 text-[10px] font-black uppercase tracking-widest mb-4">
                        📍 Select Your Sector
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-ink-primary mb-4 tracking-tighter italic">
                        The Silo Experience
                    </h2>
                    <p className="text-lg text-ink-tertiary font-medium italic max-w-2xl mx-auto">
                        Each silo is a tailored experience — stays, rides, sea adventures, and equipment all have their own dedicated journey
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
                    {silos.map((cat, idx) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Link href={cat.link} className="group block h-full">
                                <div className={`relative p-8 rounded-[2.5rem] bg-gradient-to-br ${cat.gradient} text-white overflow-hidden shadow-xl hover:shadow-2xl transition-all h-full flex flex-col hover:-translate-y-2`}>
                                    <div className="absolute top-0 right-0 text-9xl opacity-10 -mr-8 -mt-8 select-none">
                                        {cat.icon}
                                    </div>
                                    <div className="relative z-10 flex flex-col h-full">
                                        <span className="text-4xl mb-4 block group-hover:scale-110 transition-transform">{cat.icon}</span>
                                        <h3 className="text-xl font-black mb-2 tracking-tight uppercase italic">
                                            {cat.title}
                                        </h3>
                                        <p className="text-white/80 font-medium mb-6 text-sm leading-relaxed">
                                            {cat.description}
                                        </p>
                                        <div className="mt-auto inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 w-fit px-4 py-2 rounded-full border border-white/20 group-hover:bg-white/20 transition-all">
                                            Enter Silo <span className="text-lg">→</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Comparison */}
                <div className="bg-surface-elevated rounded-[2.5rem] p-8 md:p-12 border border-border-primary">
                    <h3 className="text-2xl font-black text-ink-primary mb-8 text-center tracking-tight">Which Silo Is Right For You?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { icon: '🏠', title: 'Stays', when: 'Need a place to sleep', examples: 'Villas • Apartments • Studios • Airbnb' },
                            { icon: '🚗', title: 'Vehicles', when: 'Getting around the island', examples: 'Cars • Jeeps • ATVs • Bikes' },
                            { icon: '⛵', title: 'Sea', when: 'Water adventures & fishing', examples: 'Boats • Jet Skis • Yachts • Diving' },
                            { icon: '🛠️', title: 'Equipment', when: 'Tools for projects & events', examples: 'Power Tools • Generators • Tents • Gear' },
                            { icon: '🏘️', title: 'Real Estate', when: 'Buy, lease or rent property', examples: 'Land • Commercial • Warehouses • Offices' },
                        ].map((item) => (
                            <div key={item.title} className="bg-surface-primary rounded-2xl p-6 border border-border-primary">
                                <span className="text-3xl mb-3 block">{item.icon}</span>
                                <h4 className="text-lg font-black text-ink-primary mb-1">{item.title}</h4>
                                <p className="text-accent-400 text-xs font-bold uppercase tracking-widest mb-3">{item.when}</p>
                                <p className="text-ink-tertiary text-sm">{item.examples}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="relative bg-surface-tertiary py-20 md:py-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-ink-primary mb-6 tracking-tighter italic">
                        Can&apos;t Find What You Need?
                    </h2>
                    <p className="text-lg text-ink-tertiary font-medium mb-10 italic max-w-xl mx-auto">
                        Browse the full rental marketplace or list your own property, vehicle, or equipment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/listings?category=rental"
                            className="inline-block px-10 py-4 bg-accent-400 text-brand-950 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl"
                        >
                            Browse All Rentals
                        </Link>
                        <Link
                            href="/become-vendor"
                            className="inline-block px-10 py-4 bg-surface-elevated text-ink-primary rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all border border-border-primary"
                        >
                            List Your Rental
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
