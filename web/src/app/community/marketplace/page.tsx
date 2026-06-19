'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, MessageSquare, Tag, DollarSign } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Listing {
    id: number;
    title: string;
    price: number;
    price_text?: string;
    image_url?: string;
    seller_name: string;
    seller_id?: number;
    condition?: string;
    category: string;
    location?: string;
    description?: string;
    created_at: string;
    status?: string;
}

type SortType = 'newest' | 'price_low' | 'price_high';

const CATEGORIES = ['all', 'electronics', 'fashion', 'home', 'sports', 'services', 'vehicles', 'other'];

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MarketplacePage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState<SortType>('newest');

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                if (category !== 'all') params.append('category', category);
                if (sort === 'newest') params.append('sort', 'newest');
                else if (sort === 'price_low') params.append('sort', 'price_asc');
                else if (sort === 'price_high') params.append('sort', 'price_desc');

                const response = await api.get(`/community/listings?${params.toString()}`);
                setListings(response.data || response || []);
            } catch {
                try {
                    const fallback = await api.get(`/marketplace/listings?limit=30`);
                    setListings(fallback.data || fallback || []);
                } catch {
                    setListings(getSampleListings());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchListings();
    }, [category, sort]);

    const getSampleListings = (): Listing[] => [
        { id: 1, title: 'iPhone 14 Pro — Like New', price: 750, condition: 'Like New', category: 'electronics', location: 'South Side', seller_name: 'Alex M.', description: '256GB, unlocked, minor screen protector marks. Includes charger and box.', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        { id: 2, title: 'Mountain Bike — Excellent', price: 350, condition: 'Excellent', category: 'sports', location: 'West End', seller_name: 'Tara K.', description: 'Trek Marlin 7, size medium. Perfect for island trails. Recently serviced.', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
        { id: 3, title: 'Vintage Wooden Furniture Set', price: 500, condition: 'Good', category: 'home', location: 'Downtown', seller_name: 'Island Decor', description: 'Dining table with 4 chairs. Solid mahogany, some wear but structurally sound.', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 4, title: 'Professional Photography', price: 100, price_text: 'From $100', condition: undefined, category: 'services', location: 'Island-wide', seller_name: 'Photo Studio', description: 'Portrait, event, and real estate photography. 5+ years experience. Editing included.', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 5, title: 'Toyota Camry 2020', price: 18000, condition: 'Good', category: 'vehicles', location: 'North Shore', seller_name: 'Sunny Autos', description: '45,000 miles, single owner, full service history. Silver exterior, black interior.', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 6, title: 'Garden Tool Set', price: 45, condition: 'Good', category: 'home', location: 'East Side', seller_name: 'Green Thumb', description: 'Shovel, rake, pruners, gloves, and watering can. Barely used, moving sale.', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: 7, title: 'Kids Bicycle — Age 6-9', price: 65, condition: 'Good', category: 'sports', location: 'West End', seller_name: 'Sarah P.', description: 'Pink bike with training wheels (removable). Some cosmetic wear but rides great.', created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
    ];

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.seller_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleMessage = async (sellerId: number, listingId: number) => {
        try {
            await api.post(`/community/listings/${listingId}/message`);
        } catch {
            await api.post(`/marketplace/listings/${listingId}/message`);
        }
    };

    const formatPrice = (listing: Listing): string => {
        if (listing.price_text) return listing.price_text;
        return `$${listing.price.toLocaleString()}`;
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Marketplace</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Buy and sell locally within the community</p>
                    </div>
                    <Link
                        href="/marketplace/sell"
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        <ShoppingBag size={16} className="inline mr-2" />
                        Sell Item
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                        <input
                            type="text"
                            placeholder="Search listings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated rounded-2xl border border-border-primary font-medium outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {([
                            { id: 'newest' as SortType, label: 'Newest' },
                            { id: 'price_low' as SortType, label: 'Price ↑' },
                            { id: 'price_high' as SortType, label: 'Price ↓' },
                        ]).map(s => (
                            <button
                                key={s.id}
                                onClick={() => setSort(s.id)}
                                className={`px-5 py-3 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${sort === s.id
                                    ? 'bg-surface-primary border-2 border-accent-500 text-accent-500'
                                    : 'bg-surface-elevated text-ink-tertiary hover:bg-surface-secondary'
                                    }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
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
                            <div key={i} className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary">
                                <div className="aspect-square bg-surface-secondary animate-pulse"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-5 bg-surface-secondary rounded-lg w-3/4 animate-pulse"></div>
                                    <div className="h-6 bg-surface-secondary rounded w-1/3 animate-pulse"></div>
                                    <div className="flex justify-between pt-2 border-t border-border-primary">
                                        <div className="h-4 bg-surface-secondary rounded w-1/3 animate-pulse"></div>
                                        <div className="h-4 bg-surface-secondary rounded w-1/4 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredListings.length === 0 ? (
                    <div className="text-center py-20">
                        <EmojiIcon emoji="🛍️" size=48 className="text-6xl mb-4" />
                        <h3 className="text-xl font-black text-ink-primary mb-2">No listings found</h3>
                        <p className="text-ink-tertiary mb-6">
                            {searchQuery || category !== 'all' ? 'No listings match your filters.' : 'Be the first to list something for sale!'}
                        </p>
                        <Link
                            href="/marketplace/sell"
                            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            List an Item
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredListings.map(listing => (
                            <div key={listing.id} className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary hover:shadow-xl hover:shadow-teal-500/10 transition-all group cursor-pointer">
                                <div className="aspect-square bg-surface-secondary relative flex items-center justify-center">
                                    <ShoppingBag size={48} className="text-ink-tertiary/20" />
                                    <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg capitalize">
                                        {listing.category}
                                    </div>
                                    {listing.condition && (
                                        <div className="absolute top-3 right-3 px-2 py-1 bg-white/90 text-ink-primary text-[10px] font-bold rounded-lg">
                                            {listing.condition}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-ink-primary text-lg group-hover:text-accent-400 transition-colors line-clamp-1">{listing.title}</h3>
                                    <p className="font-black text-accent-400 text-2xl mt-1">
                                        {formatPrice(listing)}
                                    </p>
                                    {listing.description && (
                                        <p className="text-sm text-ink-tertiary mt-2 line-clamp-2">{listing.description}</p>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-border-primary flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-ink-tertiary font-bold">{listing.seller_name}</p>
                                            <div className="flex items-center gap-3 mt-1">
                                                {listing.location && (
                                                    <EmojiIcon emoji="📍" size=16 className="text-[10px] text-ink-tertiary" />
                                                )}
                                                <span className="text-[10px] text-ink-tertiary">{timeAgo(listing.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMessage(listing.seller_id || 0, listing.id);
                                            }}
                                            className="w-full px-4 py-3 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <MessageSquare size={14} />
                                            Message Seller
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
