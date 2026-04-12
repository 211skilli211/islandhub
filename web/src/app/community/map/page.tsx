'use client';

import { MapPin, Search, Layers } from 'lucide-react';

export default function MapPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Explore Map</h1>
                    <p className="text-slate-500 dark:text-slate-400">Discover businesses, events, and listings near you</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by location or explore nearby..." 
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
            </div>

            {/* Map Filters */}
            <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm">All</button>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all">Businesses</button>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all">Events</button>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all">Listings</button>
                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-teal-600 hover:text-white transition-all">Jobs</button>
            </div>

            {/* Map Placeholder */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Map view coming soon</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Using Leaflet with OpenStreetMap</p>
                </div>
            </div>
        </div>
    );
}