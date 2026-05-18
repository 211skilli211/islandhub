'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface CoopDetail {
    coop_id: number;
    name: string;
    slug: string;
    description: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    location: string;
    island: string;
    logo_url: string;
    banner_url: string;
    website_url: string;
    is_verified: boolean;
    sector_key: string;
    sector_name: string;
    sector_icon: string;
    member_count: number;
    services: Array<{
        service_id: number;
        service_name: string;
        description: string;
        price_range: string;
    }>;
}

export default function CoopDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [coop, setCoop] = useState<CoopDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchCoop = async () => {
            try {
                const res = await api.get(`/ibt/coops/${slug}`);
                setCoop(res.data);
            } catch (err) {
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchCoop();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </main>
        );
    }

    if (error || !coop) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Co-op not found</h1>
                    <Link href="/store/ibt-solutions/coops" className="text-teal-600 font-bold hover:underline">
                        ← Back to Co-ops
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Hero */}
            <section className="bg-slate-900 py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/store/ibt-solutions/coops" className="inline-flex items-center gap-2 text-teal-400 text-sm font-bold mb-6 hover:gap-3 transition-all">
                        ← Back to Co-ops
                    </Link>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">{coop.sector_icon}</span>
                            <span className="px-3 py-1 bg-teal-600/20 text-teal-400 rounded-full text-xs font-bold uppercase tracking-widest">
                                {coop.sector_name}
                            </span>
                            {coop.is_verified && (
                                <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-bold">
                                    ✓ Verified
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 italic uppercase tracking-tighter">
                            {coop.name}
                        </h1>
                        <p className="text-white/60 text-lg max-w-2xl">{coop.description}</p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Services */}
                        {coop.services && coop.services.length > 0 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                <h2 className="text-xl font-black text-slate-900 mb-4 italic uppercase">Services</h2>
                                <div className="space-y-3">
                                    {coop.services.map((service) => (
                                        <div key={service.service_id} className="bg-white rounded-xl border border-slate-100 p-5">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-bold text-slate-900">{service.service_name}</h3>
                                                    {service.description && (
                                                        <p className="text-slate-500 text-sm mt-1">{service.description}</p>
                                                    )}
                                                </div>
                                                {service.price_range && (
                                                    <span className="text-teal-600 font-bold text-sm whitespace-nowrap ml-4">
                                                        {service.price_range}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl border border-slate-100 p-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Contact</h3>
                            <div className="space-y-3">
                                {coop.contact_name && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">👤</span>
                                        <span className="text-sm text-slate-700">{coop.contact_name}</span>
                                    </div>
                                )}
                                {coop.contact_email && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">✉️</span>
                                        <a href={`mailto:${coop.contact_email}`} className="text-sm text-teal-600 hover:underline">
                                            {coop.contact_email}
                                        </a>
                                    </div>
                                )}
                                {coop.contact_phone && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">📞</span>
                                        <a href={`tel:${coop.contact_phone}`} className="text-sm text-teal-600 hover:underline">
                                            {coop.contact_phone}
                                        </a>
                                    </div>
                                )}
                                {coop.location && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">📍</span>
                                        <span className="text-sm text-slate-700">
                                            {coop.location}, {coop.island === 'st_kitts' ? 'St. Kitts' : 'Nevis'}
                                        </span>
                                    </div>
                                )}
                                {coop.website_url && (
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-400">🌐</span>
                                        <a href={coop.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                                            Website
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Stats */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="bg-teal-50 rounded-2xl border border-teal-100 p-6">
                            <div className="text-center">
                                <div className="text-3xl font-black text-teal-600">{coop.member_count}</div>
                                <div className="text-xs font-bold text-teal-600/60 uppercase tracking-wider">Members</div>
                            </div>
                        </motion.div>

                        {/* Join CTA */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                            <a
                                href={`mailto:${coop.contact_email || 'info@ibt-solutions.com'}?subject=Inquiry: Join ${coop.name}`}
                                className="block w-full text-center px-6 py-4 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors"
                            >
                                Contact to Join
                            </a>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}
