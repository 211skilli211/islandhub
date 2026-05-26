'use client';

import { ShoppingBag, Search, Filter } from 'lucide-react';

export default function MarketplacePage() {
    const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Services', 'Vehicles', 'Jobs'];
    const listings = [
        { title: 'iPhone 14 Pro - Like New', price: 750, category: 'Electronics', location: 'South Side' },
        { title: 'Mountain Bike - Excellent Condition', price: 350, category: 'Sports', location: 'West End' },
        { title: 'Vintage Wooden Furniture Set', price: 500, category: 'Home', location: 'Downtown' },
        { title: 'Professional Photography Services', price: 'From $100', category: 'Services', location: 'Island-wide' },
        { title: 'Toyota Camry 2020', price: 18000, category: 'Vehicles', location: 'North Shore' },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-primary dark:text-white">Marketplace</h1>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Buy and sell locally</p>
                </div>
                <button className="px-6 py-3 bg-accent-500 text-white rounded-xl font-bold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Sell Item
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
                    <input 
                        type="text" 
                        placeholder="Search listings..." 
                        className="w-full pl-12 pr-4 py-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-slate-700 rounded-2xl text-ink-primary dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                    />
                </div>
                <button className="px-4 py-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-slate-700 rounded-2xl text-ink-secondary dark:text-slate-300 hover:border-teal-500">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <button key={cat} className="px-4 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-accent-500 hover:text-white transition-all">
                        {cat}
                    </button>
                ))}
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item, idx) => (
                    <div key={idx} className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl overflow-hidden border border-border-primary dark:border-slate-700 hover:border-teal-500 transition-all cursor-pointer">
                        <div className="aspect-square bg-surface-secondary dark:bg-slate-700"></div>
                        <div className="p-4">
                            <h3 className="font-bold text-ink-primary dark:text-white">{item.title}</h3>
                            <p className="text-accent-400 dark:text-teal-400 font-black text-xl mt-1">
                                {typeof item.price === 'number' ? `$${item.price}` : item.price}
                            </p>
                            <div className="flex items-center justify-between mt-3 text-sm text-ink-tertiary dark:text-ink-tertiary">
                                <span>{item.category}</span>
                                <span>{item.location}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}