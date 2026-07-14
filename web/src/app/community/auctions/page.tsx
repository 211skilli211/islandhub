'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Gavel, Clock, DollarSign, TrendingUp, Search, Hammer, Zap, Flame, Eye, Heart, Share2, ChevronDown, ChevronUp, Filter } from 'lucide-react';
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
    seller_avatar?: string;
    seller_rating?: number;
    status?: 'live' | 'ending_soon' | 'ended';
    watcher_count: number;
    is_watching: boolean;
    bid_increment?: number;
    buy_now_price?: number;
}

type SortType = 'ending_soon' | 'newest' | 'most_bids' | 'price_low' | 'price_high';

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '🔥' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'collectibles', label: 'Collectibles', icon: '🏆' },
    { id: 'electronics', label: 'Electronics', icon: '📱' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'jewelry', label: 'Jewelry', icon: '💎' },
    { id: 'island_specials', label: 'Island Specials', icon: '🌴' },
    { id: 'other', label: 'Other', icon: '📦' },
];

function getTimeLeft(endTime: string): string {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
}

function getAuctionStatus(endTime: string): 'live' | 'ending_soon' | 'ended' {
    const diff = new Date(endTime).getTime() - Date.now();
    if (diff <= 0) return 'ended';
    if (diff < 3600000) return 'ending_soon'; // < 1 hour
    return 'live';
}

function formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Sample Data ──────────────────────────────────────

const SAMPLE_AUCTIONS: Auction[] = [
    {
        id: 1, title: 'Handmade Gold Coral Necklace', description: 'Exquisite 18k gold necklace with natural coral from Caribbean waters. Handcrafted by local artisans.',
        current_bid: 245.00, starting_bid: 100, bid_count: 12, end_time: new Date(Date.now() + 1800000).toISOString(),
        category: 'jewelry', seller_name: 'Maria Santos', seller_rating: 4.9, status: 'live', watcher_count: 34, is_watching: false,
        bid_increment: 10, buy_now_price: 500,
    },
    {
        id: 2, title: 'Vintage Island Map Collection', description: 'Set of 5 antique maps of the Caribbean islands from the 1800s. Museum-quality frames included.',
        current_bid: 380.00, starting_bid: 200, bid_count: 8, end_time: new Date(Date.now() + 3600000).toISOString(),
        category: 'collectibles', seller_name: 'James Wilson', seller_rating: 4.7, status: 'live', watcher_count: 22, is_watching: false,
        bid_increment: 20,
    },
    {
        id: 3, title: 'Limited Edition Island Art Print', description: 'Signed limited edition print (1/50) by renowned Caribbean artist. Certificate of authenticity included.',
        current_bid: 175.00, starting_bid: 75, bid_count: 15, end_time: new Date(Date.now() + 900000).toISOString(),
        category: 'art', seller_name: 'Sarah Chen', seller_rating: 4.8, status: 'live', watcher_count: 56, is_watching: false,
        bid_increment: 10, buy_now_price: 350,
    },
    {
        id: 4, title: 'Vintage Coconut Wood Sculpture', description: 'Intricately carved coconut wood sculpture depicting island life. 24" tall, one-of-a-kind piece.',
        current_bid: 520.00, starting_bid: 300, bid_count: 6, end_time: new Date(Date.now() + 7200000).toISOString(),
        category: 'island_specials', seller_name: 'Local Artisans Co-op', seller_rating: 4.9, status: 'live', watcher_count: 18, is_watching: false,
        bid_increment: 25, buy_now_price: 800,
    },
    {
        id: 5, title: 'Professional DJ Equipment Bundle', description: 'Complete DJ setup: Pioneer DDJ-1000, speakers, mixer, and lighting. Barely used, excellent condition.',
        current_bid: 1200.00, starting_bid: 800, bid_count: 3, end_time: new Date(Date.now() + 3600000).toISOString(),
        category: 'electronics', seller_name: 'Mike Rivera', seller_rating: 4.6, status: 'live', watcher_count: 12, is_watching: false,
        bid_increment: 50, buy_now_price: 2000,
    },
    {
        id: 6, title: 'Handwoven Caribbean Hammock', description: 'Premium handwoven cotton hammock made in the traditional style. Supports up to 350 lbs. comes with hanging kit.',
        current_bid: 89.00, starting_bid: 40, bid_count: 9, end_time: new Date(Date.now() + 5400000).toISOString(),
        category: 'island_specials', seller_name: 'Ana Paul', seller_rating: 4.5, status: 'live', watcher_count: 28, is_watching: false,
        bid_increment: 5, buy_now_price: 150,
    },
    {
        id: 7, title: 'Signed Cricket Bat - West Indies Team', description: 'Autographed bat by the West Indies cricket team. Includes display case and COA.',
        current_bid: 450.00, starting_bid: 250, bid_count: 7, end_time: new Date(Date.now() + 600000).toISOString(),
        category: 'collectibles', seller_name: 'Sports Memorabilia', seller_rating: 4.8, status: 'live', watcher_count: 45, is_watching: false,
        bid_increment: 25, buy_now_price: 750,
    },
    {
        id: 8, title: 'Caribbean Rum Tasting Set', description: 'Premium collection of 6 aged Caribbean rums from 6 different islands. Includes tasting notes and glassware.',
        current_bid: 135.00, starting_bid: 60, bid_count: 11, end_time: new Date(Date.now() + 2700000).toISOString(),
        category: 'island_specials', seller_name: 'Spirits of the Caribbean', seller_rating: 4.7, status: 'live', watcher_count: 38, is_watching: false,
        bid_increment: 10, buy_now_price: 250,
    },
];

// ─── Components ───────────────────────────────────────

function BidButton({ amount, onClick, disabled }: { amount: number; onClick: () => void; disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex-1 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:from-accent-600 hover:to-accent-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg shadow-accent-500/20"
        >
            <span className="flex items-center justify-center gap-1.5">
                <Hammer size={14} />
                Bid ${amount.toFixed(2)}
            </span>
        </button>
    );
}

function AuctionCard({ auction, onBid, onWatch }: {
    auction: Auction; onBid: (id: number) => void; onWatch: (id: number) => void;
}) {
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(auction.end_time));
    const [bidAmount, setBidAmount] = useState(auction.current_bid + (auction.bid_increment || 10));
    const [watching, setWatching] = useState(auction.is_watching);
    const [watcherCount, setWatcherCount] = useState(auction.watcher_count);
    const status = getAuctionStatus(auction.end_time);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(getTimeLeft(auction.end_time));
        }, 1000);
        return () => clearInterval(interval);
    }, [auction.end_time]);

    const handleBid = () => {
        onBid(auction.id);
        // Optimistic update
        setBidAmount(bidAmount + (auction.bid_increment || 10));
    };

    const handleWatch = () => {
        setWatching(!watching);
        setWatcherCount(c => watching ? c - 1 : c + 1);
        onWatch(auction.id);
    };

    const statusColor = status === 'live' ? 'bg-emerald-500' : status === 'ending_soon' ? 'bg-rose-500' : 'bg-ink-tertiary';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:shadow-xl hover:border-accent-500/20 transition-all group"
        >
            {/* Image area */}
            <div className="relative h-48 bg-gradient-to-br from-surface-secondary to-surface-tertiary overflow-hidden">
                {/* Status badge */}
                <div className="absolute top-3 left-3 z-10 flex gap-2">
                    <span className={`flex items-center gap-1 px-2.5 py-1 ${statusColor} text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg`}>
                        {status === 'live' && <Zap size={12} />}
                        {status === 'ending_soon' && <Flame size={12} />}
                        {status === 'ended' && 'Ended'}
                        {status !== 'ended' && (status === 'live' ? 'Live' : 'Ending Soon')}
                    </span>
                    {auction.buy_now_price && (
                        <span className="px-2.5 py-1 bg-amber-500/90 text-white rounded-lg text-[9px] font-black uppercase tracking-wider shadow-lg">
                            Buy Now
                        </span>
                    )}
                </div>

                {/* Category icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-15">
                        {CATEGORIES.find(c => c.id === auction.category)?.icon || '📦'}
                    </span>
                </div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Watch button */}
                <button onClick={handleWatch} className="absolute top-3 right-3 z-10 p-2 bg-black/30 backdrop-blur-sm rounded-xl hover:bg-black/50 transition-colors">
                    <Heart size={16} className={watching ? 'text-rose-400 fill-rose-400' : 'text-white'} />
                </button>

                {/* Bid count */}
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-3">
                    <span className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold">
                        <Eye size={12} /> {watcherCount}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-black/30 backdrop-blur-sm text-white rounded-lg text-[9px] font-bold">
                        <Hammer size={12} /> {auction.bid_count} bids
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Seller info */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-[8px] font-bold">
                        {auction.seller_name?.charAt(0) || '?'}
                    </div>
                    <span className="text-[11px] font-semibold text-tertiary">{auction.seller_name}</span>
                    {auction.seller_rating && (
                        <span className="text-[10px] text-amber-500 font-bold">★ {auction.seller_rating}</span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-primary leading-snug line-clamp-2 group-hover:text-accent-400 transition-colors">
                    {auction.title}
                </h3>

                {/* Price & Timer */}
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-[10px] text-tertiary font-semibold uppercase tracking-wider">Current Bid</p>
                        <p className="text-xl font-black text-accent-400">{formatCurrency(auction.current_bid)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-tertiary font-semibold uppercase tracking-wider">
                            {status === 'ended' ? 'Ended' : 'Time Left'}
                        </p>
                        <p className={`text-sm font-black font-mono ${status === 'ending_soon' ? 'text-rose-400' : 'text-primary'}`}>
                            {timeLeft}
                        </p>
                    </div>
                </div>

                {/* Quick bid buttons */}
                {status !== 'ended' && (
                    <div className="flex gap-2 pt-1">
                        <BidButton amount={bidAmount} onClick={handleBid} />
                        {auction.buy_now_price && (
                            <button className="px-4 py-2.5 bg-amber-500/10 text-amber-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-500/20 active:scale-95 transition-all whitespace-nowrap">
                                Buy ${auction.buy_now_price?.toFixed(0)}
                            </button>
                        )}
                        <button className="p-2.5 bg-surface-secondary rounded-xl text-tertiary hover:bg-surface-tertiary transition-colors">
                            <Share2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ─── Main Page ────────────────────────────────────────

export default function AuctionsPage() {
    const [auctions, setAuctions] = useState<Auction[]>(SAMPLE_AUCTIONS);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [sort, setSort] = useState<SortType>('ending_soon');
    const [showFilters, setShowFilters] = useState(false);
    const [bidHistory, setBidHistory] = useState<{ auctionId: number; amount: number; time: string }[]>([]);

    useEffect(() => {
        const fetchAuctions = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', '30');
                if (category !== 'all') params.append('category', category);
                params.append('sort', sort === 'ending_soon' ? 'ending_soon' : sort === 'newest' ? 'newest' : sort === 'most_bids' ? 'bid_count' : sort === 'price_low' ? 'price_asc' : 'price_desc');
                const response = await api.get(`/community/auctions?${params.toString()}`);
                const data = response.data || response;
                if (Array.isArray(data) && data.length > 0) setAuctions(data);
            } catch { /* use sample data */ }
            setIsLoading(false);
        };
        fetchAuctions();
    }, [category, sort]);

    const handleBid = (auctionId: number) => {
        const auction = auctions.find(a => a.id === auctionId);
        if (!auction) return;
        const newBid = auction.current_bid + (auction.bid_increment || 10);
        setAuctions(auctions.map(a =>
            a.id === auctionId ? { ...a, current_bid: newBid, bid_count: a.bid_count + 1 } : a
        ));
        setBidHistory([{ auctionId, amount: newBid, time: new Date().toISOString() }, ...bidHistory.slice(0, 19)]);
        api.post(`/community/auctions/${auctionId}/bid`, { amount: newBid }).catch(() => {});
    };

    const handleWatch = (auctionId: number) => {
        api.post(`/community/auctions/${auctionId}/watch`).catch(() => {});
    };

    const filteredAuctions = auctions.filter(a =>
        (category === 'all' || a.category === category) &&
        (a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
         a.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         a.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const liveCount = auctions.filter(a => getAuctionStatus(a.end_time) === 'live' || getAuctionStatus(a.end_time) === 'ending_soon').length;

    return (
        <main className="min-h-screen bg-surface-primary">
            {/* Hero */}
            <div className="bg-gradient-to-br from-surface-elevated to-surface-secondary border-b border-border-primary">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-widest">Live Now</span>
                                <span className="text-xs text-tertiary font-semibold">{liveCount} active auctions</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
                                Island Auctions <span className="text-accent-400">Marketplace</span>
                            </h1>
                            <p className="text-sm text-tertiary mt-1 max-w-xl">
                                Bid on unique island treasures. Live auctions ending daily.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search auctions..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-56 pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-sm text-primary placeholder:text-tertiary/60 focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="p-2.5 bg-surface-elevated border border-border-primary rounded-xl text-secondary hover:bg-surface-secondary transition-colors"
                            >
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1 mt-6 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    category === cat.id
                                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/15'
                                        : 'bg-surface-elevated text-tertiary border border-border-primary hover:bg-surface-secondary'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Sort dropdown */}
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="mt-3 flex gap-2 overflow-x-auto"
                        >
                            {(['ending_soon', 'newest', 'most_bids', 'price_low', 'price_high'] as SortType[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSort(s)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                        sort === s
                                            ? 'bg-accent-500/10 text-accent-500'
                                            : 'text-tertiary hover:text-primary'
                                    }`}
                                >
                                    {s === 'ending_soon' ? '⏰ Ending Soon' : s === 'newest' ? '🆕 Newest' : s === 'most_bids' ? '🔥 Most Bids' : s === 'price_low' ? '💰 Price: Low' : '💰 Price: High'}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Auction grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="bg-surface-elevated rounded-2xl h-80 animate-pulse border border-border-primary">
                                <div className="h-48 bg-surface-tertiary rounded-t-2xl" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3 bg-surface-tertiary rounded w-1/3" />
                                    <div className="h-4 bg-surface-tertiary rounded w-3/4" />
                                    <div className="h-5 bg-surface-tertiary rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredAuctions.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredAuctions.map((auction, idx) => (
                                <AuctionCard key={auction.id} auction={auction} onBid={handleBid} onWatch={handleWatch} />
                            ))}
                        </div>

                        {/* Live bid activity feed */}
                        {bidHistory.length > 0 && (
                            <div className="mt-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap size={16} className="text-accent-400" />
                                    <h3 className="text-sm font-black text-primary uppercase tracking-wider">Live Bids</h3>
                                </div>
                                <div className="bg-surface-elevated rounded-2xl border border-border-primary p-3 max-h-32 overflow-y-auto">
                                    {bidHistory.slice(0, 10).map((bid, i) => {
                                        const auction = auctions.find(a => a.id === bid.auctionId);
                                        return (
                                            <div key={i} className="flex items-center gap-2 py-1.5 text-xs border-b border-border-primary/50 last:border-0">
                                                <span className="text-accent-400 font-black">⚡</span>
                                                <span className="font-bold text-primary">New bid</span>
                                                <span className="text-accent-400 font-black">{formatCurrency(bid.amount)}</span>
                                                <span className="text-tertiary">on</span>
                                                <span className="text-primary font-semibold truncate">{auction?.title || 'Unknown'}</span>
                                                <span className="text-tertiary ml-auto text-[10px]">{new Date(bid.time).toLocaleTimeString()}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-16 text-center">
                        <span className="text-5xl block mb-4">🔨</span>
                        <h3 className="text-xl font-black text-primary mb-2">No auctions found</h3>
                        <p className="text-sm text-tertiary mb-6">Try a different category or check back later for new listings.</p>
                        <button onClick={() => { setCategory('all'); setSearchQuery(''); }} className="px-6 py-3 bg-accent-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent-600 transition-colors">
                            View All Auctions
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}