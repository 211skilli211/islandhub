'use client';

import { MapPin, Search, Layers } from 'lucide-react';

export default function MapPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-ink-primary dark:text-white">Explore Map</h1>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Discover businesses, events, and listings near you</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
                <input 
                    type="text" 
                    placeholder="Search by location or explore nearby..." 
                    className="w-full pl-12 pr-4 py-4 bg-surface-elevated dark:bg-surface-tertiary border border-border-primary dark:border-slate-700 rounded-2xl text-ink-primary dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
            </div>

            {/* Map Filters */}
            <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-accent-500 text-white rounded-xl font-bold text-sm">All</button>
                <button className="px-4 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-accent-500 hover:text-white transition-all">Businesses</button>
                <button className="px-4 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-accent-500 hover:text-white transition-all">Events</button>
                <button className="px-4 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-accent-500 hover:text-white transition-all">Listings</button>
                <button className="px-4 py-2 bg-surface-secondary dark:bg-surface-tertiary text-ink-secondary dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-accent-500 hover:text-white transition-all">Jobs</button>
            </div>

            {/* Map Placeholder */}
            <div className="bg-surface-secondary dark:bg-surface-tertiary rounded-2xl p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto text-slate-300 dark:text-ink-secondary mb-4" />
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Map view coming soon</p>
                    <p className="text-sm text-ink-tertiary dark:text-ink-tertiary mt-2">Using Leaflet with OpenStreetMap</p>
                </div>
            </div>
        </div>
    );
}