'use client';

import { Gavel, Clock, DollarSign, Video, Search } from 'lucide-react';

export default function AuctionsPage() {
    const liveAuctions = [
        { id: 1, title: 'Vintage Island Surfboard', currentBid: 250, timeLeft: '2h 15m', image: '/auction-1.jpg', bids: 12 },
        { id: 2, title: 'Handmade Crafts Collection', currentBid: 85, timeLeft: '5h 30m', image: '/auction-2.jpg', bids: 8 },
        { id: 3, title: 'Local Art Piece', currentBid: 420, timeLeft: '1h 45m', image: '/auction-3.jpg', bids: 15 },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-primary dark:text-white">Live Auctions</h1>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Bid on unique island items in real-time</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
                <input 
                    type="text" 
                    placeholder="Search auctions..." 
                    className="w-full pl-12 pr-4 py-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-border-primary rounded-2xl text-ink-primary dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
            </div>

            {/* Live Badge */}
            <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#e11d48]/10 dark:bg-rose-900 text-[#be123c] dark:text-rose-300 text-xs font-bold rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-[#e11d48]/50 rounded-full animate-pulse"></span>
                    LIVE NOW
                </span>
                <span className="text-sm text-ink-tertiary dark:text-ink-tertiary">3 active auctions</span>
            </div>

            {/* Auctions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveAuctions.map((auction) => (
                    <div key={auction.id} className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl overflow-hidden border border-border-primary dark:border-border-primary">
                        <div className="aspect-square bg-surface-secondary dark:bg-surface-tertiary relative">
                            <div className="absolute top-3 right-3 px-2 py-1 bg-[#e11d48] text-white text-xs font-bold rounded flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                LIVE
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-ink-primary dark:text-white">{auction.title}</h3>
                            <div className="flex items-center justify-between mt-3">
                                <div>
                                    <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Current Bid</p>
                                    <p className="font-black text-accent-400 dark:text-accent-400">${auction.currentBid}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-ink-tertiary dark:text-ink-tertiary">Time Left</p>
                                    <p className="font-bold text-ink-secondary dark:text-ink-tertiary flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {auction.timeLeft}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-primary dark:border-border-primary">
                                <span className="text-xs text-ink-tertiary dark:text-ink-tertiary">{auction.bids} bids</span>
                                <button className="px-4 py-2 bg-accent-500 text-white rounded-xl font-bold text-sm">Place Bid</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-teal-100 dark:border-border-primary">
                <h3 className="font-bold text-ink-primary dark:text-white mb-2">Start Selling at Auction</h3>
                <p className="text-sm text-ink-secondary dark:text-ink-tertiary mb-4">List your items and reach thousands of buyers with real-time bidding</p>
                <button className="px-6 py-3 bg-accent-500 text-white rounded-xl font-bold">Create Auction</button>
            </div>
        </div>
    );
}