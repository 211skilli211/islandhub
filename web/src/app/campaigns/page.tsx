'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import HeroBackground from '@/components/HeroBackground';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCampaigns = async () => {
            setLoading(true);
            try {
                let url = '/listings?type=campaign';
                if (searchTerm) {
                    url = `/listings?type=campaign&search=${encodeURIComponent(searchTerm)}`;
                }
                const response = await api.get(url);
                setCampaigns(response.data);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => {
            fetchCampaigns();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    return (
        <main className="min-h-screen bg-white overflow-hidden">
            {/* Hero Section */}
            <HeroBackground pageKey="campaigns" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto relative z-30 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        ❤️ Community & Fundraising
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                    >
                        Empower the <span className="text-rose-500">Islands</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-teal-50 text-lg max-w-2xl mx-auto mb-12 font-medium opacity-80"
                    >
                        Support community projects, disaster relief, and local startups.
                        Every contribution makes a direct impact on island life.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-xl mx-auto relative group"
                    >
                        <input
                            type="text"
                            placeholder="Find a cause to support..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-8 py-5 bg-white/5 backdrop-blur-2xl border-2 border-white/10 rounded-2xl text-white text-md placeholder-teal-200/40 focus:outline-none focus:border-rose-400/50 transition-all font-medium"
                        />
                    </motion.div>
                </div>
            </HeroBackground>


            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        {loading ? 'Finding Causes...' : `${campaigns.length} Active Campaigns`}
                    </h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-96 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
                        ))}
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 text-lg font-bold italic">No campaigns found. Try a different search!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {campaigns.map((campaign, idx) => (
                            <motion.div
                                key={campaign.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <ListingCard listing={campaign} />
                            </motion.div>
                        ))}
                    </div>
                )}
                {/* Cross-Category Navigation */}
                <section className="bg-slate-50 py-24 mb-12">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Explore More from the Islands</h2>
                        <p className="text-slate-500 font-medium mb-12 max-w-xl mx-auto italic">
                            Support local businesses while you support community causes.
                        </p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Restaurants', href: '/stores?category=food', icon: '🍴', color: 'rose' },
                                { label: 'Services', href: '/stores?category=service', icon: '🛠', color: 'emerald' },
                                { label: 'Rentals', href: '/rentals', icon: '🏠', color: 'blue' },
                                { label: 'Community', href: '/community', icon: '🏝', color: 'teal' }
                            ].map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group flex flex-col items-center gap-4"
                                >
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{link.icon}</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">
                                        {link.label} →
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

