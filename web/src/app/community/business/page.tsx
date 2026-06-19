'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, Star, MapPin, Mail } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Business {
    id: number;
    name: string;
    description: string;
    logo_url?: string;
    category: string;
    rating?: number;
    review_count?: number;
    location?: string;
    phone?: string;
    email?: string;
    verified?: boolean;
    created_at?: string;
}

const CATEGORIES = ['all', 'food', 'technology', 'retail', 'services', 'health', 'tourism', 'transportation', 'professional'];

function StarRating({ rating, count }: { rating?: number; count?: number }) {
    if (!rating) return null;
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={12}
                    className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-surface-secondary'}
                />
            ))}
            <span className="text-xs text-ink-tertiary ml-1">
                {rating.toFixed(1)}{count ? ` (${count})` : ''}
            </span>
        </div>
    );
}

export default function BusinessCommunityPage() {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const fetchBusinesses = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                if (category !== 'all') params.append('category', category);

                const response = await api.get(`/community/businesses?${params.toString()}`);
                setBusinesses(response.data || response || []);
            } catch {
                try {
                    const fallback = await api.get(`/businesses?limit=30`);
                    setBusinesses(fallback.data || fallback || []);
                } catch {
                    setBusinesses(getSampleBusinesses());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusinesses();
    }, [category]);

    const getSampleBusinesses = (): Business[] => [
        { id: 1, name: 'Island Food Co.', description: 'Fresh local cuisine with Caribbean flair. Dine-in, takeout, and catering available.', category: 'food', rating: 4.7, review_count: 128, location: 'Downtown', verified: true },
        { id: 2, name: 'Caribbean Tech Solutions', description: 'Full-service IT support, web development, and cloud solutions for local businesses.', category: 'technology', rating: 4.9, review_count: 64, location: 'Business District', verified: true },
        { id: 3, name: 'Sunshine Rentals', description: 'Vacation homes, car rentals, and equipment rental for tourists and locals.', category: 'tourism', rating: 4.3, review_count: 51, location: 'North Shore', verified: false },
        { id: 4, name: 'Tropical Logistics', description: 'Island-wide shipping, freight, and delivery services. Reliable and fast.', category: 'transportation', rating: 4.5, review_count: 89, location: 'Harbor Area', verified: true },
        { id: 5, name: 'Island Adventures', description: 'Snorkeling tours, hiking excursions, and boat charters for all skill levels.', category: 'tourism', rating: 4.8, review_count: 203, location: 'South Bay', verified: true },
        { id: 6, name: 'Coastal Services', description: 'Accounting, legal, and business consulting for small to medium enterprises.', category: 'professional', rating: 4.6, review_count: 37, location: 'Business District', verified: false },
        { id: 7, name: 'Harbor Health Clinic', description: 'Family medicine, urgent care, and wellness programs. Walk-ins welcome.', category: 'health', rating: 4.4, review_count: 112, location: 'Harbor Area', verified: true },
        { id: 8, name: 'Beachside Boutique', description: 'Local fashion, accessories, and souvenirs. Hand-picked from island designers.', category: 'retail', rating: 4.2, review_count: 45, location: 'South Beach', verified: false },
    ];

    const filteredBusinesses = businesses.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Business Directory</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Discover and connect with local businesses</p>
                    </div>
                    <Link
                        href="/community/business/create"
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        <Building2 size={16} className="inline mr-2" />
                        List Business
                    </Link>
                </div>

                <div className="relative flex-1 max-w-lg mb-8">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                    <input
                        type="text"
                        placeholder="Search businesses, categories..."
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
                                        <div className="h-4 bg-surface-secondary rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="mt-4 h-4 bg-surface-secondary rounded w-full"></div>
                                <div className="mt-2 h-4 bg-surface-secondary rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredBusinesses.length === 0 ? (
                    <div className="text-center py-20">
                        <EmojiIcon emoji="🏢" size={48} className="text-6xl mb-4" />
                        <h3 className="text-xl font-black text-ink-primary mb-2">No businesses found</h3>
                        <p className="text-ink-tertiary mb-6">
                            {searchQuery ? 'No businesses match your search.' : 'Be the first to list your business!'}
                        </p>
                        <Link
                            href="/community/business/create"
                            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            List a Business
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBusinesses.map(business => (
                            <div key={business.id} className="bg-surface-elevated rounded-2xl p-6 border border-border-primary hover:shadow-xl hover:shadow-teal-500/10 transition-all group">
                                <div className="flex items-start justify-between">
                                    <div className="w-14 h-14 bg-accent-500/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-accent-500/25 transition-colors">
                                        <Building2 size={24} className="text-accent-400" />
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-3 py-1 bg-surface-secondary text-ink-secondary text-[10px] font-bold rounded-full uppercase tracking-widest">
                                            {business.category}
                                        </span>
                                        {business.verified && (
                                            <span className="px-2 py-0.5 bg-accent-500/10 text-accent-500 text-[10px] font-black rounded-full uppercase tracking-widest">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <h3 className="font-bold text-ink-primary text-lg mt-4 group-hover:text-accent-400 transition-colors">{business.name}</h3>
                                <p className="text-sm text-ink-tertiary mt-2 line-clamp-2">{business.description}</p>
                                {business.rating && (
                                    <div className="mt-3">
                                        <StarRating rating={business.rating} count={business.review_count} />
                                    </div>
                                )}
                                {business.location && (
                                    <p className="text-xs text-ink-tertiary mt-2 flex items-center gap-1">
                                        <MapPin size={12} />
                                        {business.location}
                                    </p>
                                )}
                                <div className="mt-4 pt-4 border-t border-border-primary">
                                    <button className="w-full px-4 py-3 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors flex items-center justify-center gap-2">
                                        <Mail size={14} />
                                        Get Quote
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
