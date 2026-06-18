'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';
interface CoopSector {
    sector_id: number;
    sector_key: string;
    display_name: string;
    description: string;
    icon: string;
    color: string;
}

interface Coop {
    coop_id: number;
    name: string;
    slug: string;
    description: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    location: string;
    island: string;
    is_verified: boolean;
    is_featured: boolean;
    sector_key: string;
    sector_name: string;
    sector_icon: string;
    sector_color: string;
    member_count?: number;
}

const ISLAND_FILTERS = [
    { key: 'all', label: 'All Islands' },
    { key: 'st_kitts', label: 'St. Kitts' },
    { key: 'nevis', label: 'Nevis' },
];

export default function CoopsPage() {
    const [sectors, setSectors] = useState<CoopSector[]>([]);
    const [coops, setCoops] = useState<Coop[]>([]);
    const [selectedSector, setSelectedSector] = useState<string>('all');
    const [selectedIsland, setSelectedIsland] = useState<string>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sectorsRes, coopsRes] = await Promise.all([
                    api.get('/ibt/coops/sectors'),
                    api.get('/ibt/coops'),
                ]);
                setSectors(sectorsRes.data || []);
                setCoops(coopsRes.data || []);
            } catch (error) {
                console.error('Error fetching coops data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredCoops = coops.filter((coop) => {
        if (selectedSector !== 'all' && coop.sector_key !== selectedSector) return false;
        if (selectedIsland !== 'all' && coop.island !== selectedIsland) return false;
        return true;
    });

    const groupedCoops = sectors.map((sector) => ({
        ...sector,
        coops: filteredCoops.filter((c) => c.sector_key === sector.sector_key),
    })).filter((g) => g.coops.length > 0);

    if (loading) {
        return (
            <main className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-ink-tertiary font-medium">Loading co-ops...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-surface-primary">
            
            <HeroBackground pageKey="ibt-coops">
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="inline-block px-4 py-1 bg-accent-500/20 text-accent-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                            IBT Co-operative Federation
                        </span>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-6 italic uppercase tracking-tighter">
                            Caribbean <span className="text-accent-400">Co-ops</span>
                        </h1>
                        <p className="text-xl text-white/60 max-w-2xl mx-auto">
                            Democratically-governed cooperatives uniting tradespeople, farmers, creatives, and logistics providers across the islands.
                        </p>
                    </motion.div>
                </div>
            </HeroBackground>

            
            <section className="sticky top-0 z-20 bg-surface-elevated border-b border-border-primary shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">Sector:</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setSelectedSector('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        selectedSector === 'all'
                                            ? 'bg-surface-tertiary text-white'
                                            : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                                    }`}
                                >
                                    All
                                </button>
                                {sectors.map((s) => (
                                    <button
                                        key={s.sector_key}
                                        onClick={() => setSelectedSector(s.sector_key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            selectedSector === s.sector_key
                                                ? 'bg-surface-tertiary text-white'
                                                : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                                        }`}
                                    >
                                        {s.icon} {s.display_name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">Island:</span>
                            <div className="flex gap-1">
                                {ISLAND_FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setSelectedIsland(f.key)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                            selectedIsland === f.key
                                                ? 'bg-accent-500 text-white'
                                                : 'bg-surface-secondary text-ink-secondary hover:bg-surface-tertiary'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        
                        <div className="ml-auto text-xs font-bold text-ink-tertiary">
                            {filteredCoops.length} co-op{filteredCoops.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="max-w-7xl mx-auto px-6 py-12">
                {groupedCoops.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-black text-ink-primary mb-2">No co-ops found</h3>
                        <p className="text-ink-tertiary">Try adjusting your filters.</p>
                    </div>
                ) : (
                    groupedCoops.map((group, gi) => (
                        <div key={group.sector_key} className="mb-16">
                            <div className="flex items-center gap-3 mb-8">
                                <span className="text-3xl">{group.icon}</span>
                                <div>
                                    <h2 className="text-2xl font-black text-ink-primary italic uppercase">{group.display_name}</h2>
                                    <p className="text-ink-tertiary text-sm">{group.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {group.coops.map((coop, ci) => (
                                    <motion.div
                                        key={coop.coop_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: ci * 0.05 }}
                                    >
                                        <Link href={`/store/ibt-solutions/coops/${coop.slug}`}>
                                            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 hover:shadow-xl hover:-translate-y-1 transition-all h-full group">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-black text-ink-primary group-hover:text-accent-400 transition-colors">
                                                            {coop.name}
                                                        </h3>
                                                        <p className="text-xs text-ink-tertiary font-medium">
                                                            📍 {coop.location}, {coop.island === 'st_kitts' ? 'St. Kitts' : 'Nevis'}
                                                        </p>
                                                    </div>
                                                    {coop.is_verified && (
                                                        <span className="text-accent-500 text-sm" title="Verified">✓</span>
                                                    )}
                                                </div>
                                                <p className="text-ink-tertiary text-sm leading-relaxed mb-4 line-clamp-2">
                                                    {coop.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {coop.contact_phone && (
                                                            <span className="text-xs bg-surface-secondary text-ink-secondary px-2 py-1 rounded-lg font-medium">
                                                                📞 {coop.contact_phone}
                                                            </span>
                                                        )}
                                                        {coop.member_count !== undefined && (
                                                            <span className="text-xs bg-accent-500/10 text-accent-500 px-2 py-1 rounded-lg font-medium">
                                                                👥 {coop.member_count} members
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-accent-400 text-xs font-bold group-hover:translate-x-1 transition-transform">
                                                        View →
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            
            <section className="bg-surface-tertiary py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4 italic uppercase">
                        Start Your Own <span className="text-accent-400">Co-op</span>
                    </h2>
                    <p className="text-ink-tertiary mb-8">
                        Have a group of Caribbean professionals ready to collaborate? Apply to join the IBT Co-operative Federation.
                    </p>
                    <Link
                        href="/store/ibt-solutions/coops/apply"
                        className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-bold uppercase text-sm tracking-wider hover:bg-accent-500/100 transition-all"
                    >
                        Apply to Join
                    </Link>
                </div>
            </section>
        </main>
    );
}
