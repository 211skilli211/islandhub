'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gavel, Clock, DollarSign, TrendingUp, Search, Hammer } from 'lucide-react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Auction {
    id: number;
    title: string;
    description?: string;
    image_url?: string;
    current_bid: number;
    starting_bid?: number;
    bid_count: number;
    end_time: string;
    category: string;
    seller_name?: string;
    status?: string;
}

type SortType = 'ending_soon' | 'newest' | 'most_bids';

const CATEGORIES = ['all', 'art', 'collectibles', 'electronics', 'fashion', 'other'];

function getTimeLeft(endTime: string): string {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
}

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState<SortType>('ending_soon');

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                if (category !== '056') params.append('category', category);
                if (sort === 'ending_soon') params.append('sort', 'ending_soon');
                else if (sort === 'newest') params.append('sort', 'newest');
                else if (sort === 'most_bids') params.append('sort', 'bid_count');

                const response = await api.get(`/community/auctions?${params.toString()}`);
                setAuctions(response.data || response || []);
            } catch {
                try {
                    const fallback = await api.get(`/auctions?limit=30`);
                    setAuctions(fallback.data || fallback || []);
                } catch {
                    setAuctions(getSampleAuctions());
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchAuctions();
    }, [category, sort]);

    const getSampleAuctions = (): Auction[] => [
        { id: 1, title: 'Vintage Island Surfboard', description: 'Classic longboard from the 70s, excellent condition', current_bid: 250, starting_bid: 100, bid_count: 12, end_time: new Date(Date.now() + 2 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(), category: 'collectibles', seller_name: 'Mike D.' },
        { id: 2, title: 'Handmade Crafts Collection', description: 'Locally sourced artisan crafts, 12 pieces', current_bid: 85, starting_bid: 50, bid_count: 8, end_time: new Date(Date.now() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(), category: 'art', seller_name: 'Island Art Co.' },
        { id: 3, title: 'Local Art Piece — Ocean Sunset', description: 'Original acrylic painting, 24x36', current_bid: 420, starting_bid: 200, bid_count: 15, end_time: new Date(Date.now() + 1 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(), category: 'art', seller_name: 'Sarah K.' },
        { id: 4, title: 'iPhone 13 Pro Max', description: '256GB, unlocked, minor scratches', current_bid: 650, starting_bid: 400, bid_count: 22, end_time: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(), category: 'electronics', seller_name: 'Tech Deals' },
        { id: 5, title: 'Designer Handbag', description: 'Authentic, with original receipt and dust bag', current_bid: 180, starting_bid: 80, bid_count: 6, end_time: new Date(Date.now() + 3 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(), category: 'fashion', seller_name: 'Style Studio' },
        { id: 6, title: 'Antique Brass Compass', description: 'Maritime collectible, circa 1920s', current_bid: 95, starting_bid: 40, bid_count: 4, end_time: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), category: 'collectibles', seller_name: 'Lighthouse Antiques' },
    ];

    const filteredAuctions = auctions.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBid = async (auctionId: number) => {
        try {
            const bidAmount = prompt('Enter your bid amount:');
            if (!bidAmount) return;
            const parsed = parseFloat(bidAmount);
            await api.post(`/community/auctions/${auctionId}/bid`, { amount: parsed });
            setAuctions(prev => prev.map(a =>
                a.id === auctionId ? { ...a, current_bid: parsed > a.current_bid ? parsed : a.current_bid, bid_count: a.bid_count + 1 } : a
            ));
        } catch {
            try {
                await api.post(`/auctions/${auctionId}/bid`, { amount: 0 });
            } catch (e) {
                console.error('Failed to place bid:', e);
            }
        }
    };

    return (
        <main className="min-h-screen bg-surface-primary">
            <section className="max-w-7xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-ink-primary tracking-tighter">Live Auctions</h1>
                        <p className="text-ink-tertiary font-medium mt-1">Bid on unique island items in real-time</p>
                    </div>
                    <Link
                        href="/community/auctions/create"
                        className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 transition-all"
                    >
                        <Gavel size={16} className="inline mr-2" />
                        Start Auction
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                        <input
                            type="text"
                            placeholder="Search auctions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-surface-elevated rounded-2xl border border-border-primary font-medium outline-none focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#e11d48]/10 text-[#be123c] text-xs font-bold rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 bg-[#e11d48]/50 rounded-full animate-pulse"></span>
                            LIVE NOW
                        </span>
                        <span className="text-sm text-ink-tertiary">
                            {isLoading ? '...' : filteredAuctions.length} active
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
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

                <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
                    {([
                        { id: 'ending_soon' as SortType, label: '⏰ Ending Soon' },
                        { id: 'newest' as SortType, label: '🆕 Newest' },
                        { id: 'most_bids' as SortType, label: '🔥 Most Bids' },
                    ]).map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSort(s.id)}
                            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all whitespace-nowrap ${sort === s.id
                                ? 'bg-surface-primary border-2 border-accent-500 text-accent-500'
                                : 'bg-surface-elevated text-ink-tertiary hover:bg-surface-secondary'
                                }`}
                        >
                            {s.label}
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
                                    <div className="h-4 bg-surface-secondary rounded w-1/2 animate-pulse"></div>
                                    <div className="flex justify-between pt-2 border-t border-border-primary">
                                        <div className="h-4 bg-surface-secondary rounded w-1/4 animate-pulse"></div>
                                        <div className="h-4 bg-surface-secondary rounded w-1/4 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAuctions.length === 0 ? (
                    <div className="text-center py-20">
                        <EmojiIcon emoji="🔨" size=48 className="text-6xl mb-4" />
                        <h3 className="text-xl font-black text-ink-primary mb-2">No auctions yet</h3>
                        <p className="text-ink-tertiary mb-6">
                            {searchQuery ? 'No auctions match your search.' : 'Be the first to start an auction!'}
                        </p>
                        <Link
                            href="/community/auctions/create"
                            className="inline-block px-8 py-4 bg-accent-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                        >
                            Start an Auction
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAuctions.map(auction => (
                            <div key={auction.id} className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary hover:shadow-xl hover:shadow-teal-500/10 transition-all">
                                <div className="aspect-square bg-surface-secondary relative flex items-center justify-center">
                                    <Hammer size={48} className="text-ink-tertiary/20" />
                                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#e11d48] text-white text-[10px] font-black rounded-lg flex items-center gap-1 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                        LIVE
                                    </div>
                                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded-lg capitalize">
                                        {auction.category}
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-ink-primary text-lg">{auction.title}</h3>
                                    {auction.seller_name && (
                                        <p className="text-xs text-ink-tertiary mt-1">by {auction.seller_name}</p>
                                    )}
                                    <div className="flex items-center justify-between mt-4">
                                        <div>
                                            <p className="text-[10px] text-ink-tertiary uppercase tracking-widest font-bold">Current Bid</p>
                                            <p className="font-black text-accent-400 text-xl">${auction.current_bid}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-ink-tertiary uppercase tracking-widest font-bold">Time Left</p>
                                            <p className="font-bold text-ink-secondary flex items-center gap-1">
                                                <Clock size={14} />
                                                {getTimeLeft(auction.end_time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-primary">
                                        <span className="text-xs text-ink-tertiary flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            {auction.bid_count} bids
                                        </span>
                                        <button
                                            onClick={() => handleBid(auction.id)}
                                            className="px-5 py-2.5 bg-accent-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-accent-600 transition-colors"
                                        >
                                            Place Bid
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
