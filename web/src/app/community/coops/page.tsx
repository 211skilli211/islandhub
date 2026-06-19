'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Search, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Cooperative {
    id: number;
    name: string;
    description: string;
    member_count: number;
    founding_date?: string;
    category: string;
    is_member?: boolean;
    logo_url?: string;
    savings?: string;
}

const CATEGORIES = ['all', 'retail', 'agriculture', 'transportation', 'technology', 'professional', 'other'];

function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function CoopsPage() {
    const [coops, setCoops] = useState<Cooperative[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const fetchCoops = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                if (category !== 'all') params.append('category', category);

                const response = await api.get(`/community/cooperatives?${params.toString()}`);
                setCoops(response.data || response || []);
            } catch {
                try {
                    const fallback = await api.get(`/cooperatives?limit=30`);
                    setCoops(fallback.data || fallback || []);
                } catch {
                    setCoops(getSampleCoops());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchCoops();
    }, [category]);

    const getSampleCoops = (): Cooperative[] => [
        { id: 1, name: 'Island Grocers Cooperative', description: 'Collective buying power for groceries and household essentials. Save on bulk orders from distributors.', member_count: 45, founding_date: '2023-03-15', category: 'retail', savings: '15%' },
        { id: 2, name: 'Farmers United', description: 'Shared equipment, seeds, and distribution network for local farmers.', member_count: 32, founding_date: '2022-08-01', category: 'agriculture', savings: '20%' },
        { id: 3, name: 'Island Transport Pool', description: 'Shared vehicle fleet and logistics coordination for deliveries across the island.', member_count: 28, founding_date: '2023-01-20', category: 'transportation', savings: '25%' },
        { id: 4, name: 'Tech Share Collective', description: 'Shared coworking space, software licenses, and tech resources for freelancers.', member_count: 18, founding_date: '2024-02-10', category: 'technology', savings: '30%' },
        { id: 5, name: 'Bulk Buyers Club', description: 'Monthly bulk purchase group for everything from electronics to furniture.', member_count: 56, founding_date: '2022-11-05', category: 'retail', savings: '18%' },
        { id: 6, name: 'Shared Workspace Hub', description: 'Professional coworking space with meeting rooms, high-speed internet, and shared admin staff.', member_count: 12, founding_date: '2024-05-01', category: 'professional', savings: '40%' },
    ];

    const filteredCoops = coops.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleJoin = async (coopId: number) => {
        try {
            await api.post(`/community/cooperatives/${coopId}/join`);
            setCoops(prev => prev.map(c => c.id === coopId ? { ...c, is_member: true } : c));
        } catch {
            try {
                await api.post(`/cooperatives/${coopId}/join`);
            } catch (e) {
                console.error('Failed to join cooperative:', e);
            }
        }
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Cooperatives</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Join forces with others for collective buying power</p>
                    </div>
                    <Link
                        href="/community/coops/create"
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        <Building2 size={16} className="inline mr-2" />
                        Start Co-op
                    </Link>
                </div>

                <div className="relative flex-1 max-w-lg mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                        type="text"
                        placeholder="Search cooperatives..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated rounded-2xl border border-border-primary font-medium outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${category === cat
                                ? 'bg-accent-500 text-white shadow-lg shadow-teal-500/25'
                                : 'bg-surface-elevated text-ink-tertiary hover:bg-surface-secondary'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary animate-pulse">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 bg-surface-secondary rounded-xl shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-surface-secondary rounded-lg w-3/4"></div>
                                        <div className="h-3 bg-surface-secondary rounded w-1/3"></div>
                                    </div>
                                </div>
                                <div className="mt-4 h-4 bg-surface-secondary rounded w-full"></div>
                                <div className="mt-2 h-4 bg-surface-secondary rounded w-5/6"></div>
                                <div className="mt-4 pt-4 border-t border-border-primary flex justify-between">
                                    <div className="h-4 bg-surface-secondary rounded w-1/4"></div>
                                    <div className="h-4 bg-surface-secondary rounded w-1/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredCoops.length === 0 ? (
                    <div className="text-center py-20">
                        <EmojiIcon emoji="🤝" size=48 className="text-6xl mb-4" />
                        <h3 className="text-xl font-black text-ink-primary mb-2">No cooperatives found</h3>
                        <p className="text-ink-tertiary mb-6">
                            {searchQuery ? 'No cooperatives match your search.' : 'Start the first cooperative in your community!'}
                        </p>
                        <Link
                            href="/community/coops/create"
                            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            Start a Co-op
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCoops.map(coop => (
                            <div key={coop.id} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary hover:shadow-xl hover:shadow-teal-500/10 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 bg-accent-500/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-500/25 transition-colors">
                                        <Building2 size={24} className="text-accent-400" />
                                    </div>
                                    <span className="px-3 py-1 bg-surface-secondary text-ink-secondary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                        {coop.category}
                                    </span>
                                </div>
                                <h3 className="font-bold text-ink-primary text-lg mt-4 group-hover:text-accent-400 transition-colors">{coop.name}</h3>
                                <p className="text-sm text-ink-tertiary mt-2 line-clamp-2">{coop.description}</p>
                                <div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-ink-tertiary text-sm">
                                            <Users size={14} />
                                            {coop.member_count} members
                                        </span>
                                        {coop.founding_date && (
                                            <span className="flex items-center gap-1 text-ink-tertiary text-xs">
                                                <Calendar size={12} />
                                                {formatDate(coop.founding_date)}
                                            </span>
                                        )}
                                    </div>
                                    {coop.savings && (
                                        <span className="text-accent-400 font-bold text-sm">Save {coop.savings}</span>
                                    )}
                                </div>
                                <div className="mt-4">
                                    <button
                                        onClick={() => handleJoin(coop.id)}
                                        disabled={coop.is_member}
                                        className={`w-full px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-colors ${coop.is_member
                                            ? 'bg-accent-500/10 text-accent-500 cursor-default'
                                            : 'bg-accent-500 text-white hover:bg-accent-600'
                                            }`}
                                    >
                                        {coop.is_member ? '✓ Joined' : 'Join Co-op'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
