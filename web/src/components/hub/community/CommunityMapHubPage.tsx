'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MapPin, Search, Navigation, Layers, ChevronRight } from 'lucide-react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

const FEATURED_LOCATIONS = [
  { id: 1, name: 'Downtown Market Plaza', type: 'Business', category: 'Shopping', lat: 17.302, lng: -62.717, emoji: '🏪', rating: 4.8 },
  { id: 2, name: 'South Beach', type: 'Event Venue', category: 'Recreation', lat: 17.285, lng: -62.735, emoji: '🏖️', rating: 4.9 },
  { id: 3, name: 'Harbor Square', type: 'Market', category: 'Shopping', lat: 17.295, lng: -62.725, emoji: '⚓', rating: 4.7 },
  { id: 4, name: 'Amphitheater Park', type: 'Event Venue', category: 'Entertainment', lat: 17.310, lng: -62.710, emoji: '🎵', rating: 4.6 },
  { id: 5, name: 'West Beach', type: 'Recreation', category: 'Fitness', lat: 17.280, lng: -62.740, emoji: '🧘', rating: 4.8 },
  { id: 6, name: 'Town Square', type: 'Market', category: 'Food', lat: 17.300, lng: -62.720, emoji: '🍽️', rating: 4.5 },
  { id: 7, name: 'Marina Club', type: 'Business', category: 'Networking', lat: 17.290, lng: -62.730, emoji: '🏢', rating: 4.4 },
  { id: 8, name: 'National Gallery', type: 'Arts', category: 'Culture', lat: 17.305, lng: -62.715, emoji: '🎨', rating: 4.7 },
];

const FILTERS = ['All', 'Businesses', 'Events', 'Markets', 'Recreation', 'Arts'];

export default function CommunityMapHubPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = FEATURED_LOCATIONS.filter(loc => {
    if (activeFilter !== 'All' && loc.type !== activeFilter) return false;
    if (searchQuery && !loc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-blue-900 via-indigo-900 to-violet-900 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-1 leading-tight"><EmojiIcon emoji="🗺️" size={40} /> Explore Map</h1>
          <p className="text-sm text-white/70 max-w-xl mx-auto">Discover businesses, events, and places across St. Kitts & Nevis</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/50 p-8 md:p-16 flex flex-col items-center justify-center min-h-[200px] md:min-h-[300px]">
            <MapPin className="w-12 h-12 text-accent-400 mb-4" />
            <h3 className="text-lg font-bold text-ink-primary mb-2">Interactive Island Map</h3>
            <p className="text-sm text-ink-tertiary mb-4 text-center max-w-md">Explore businesses, events, jobs, and listings on an interactive map with real-time markers</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <EmojiIcon emoji="🏪" size={16} className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-medium rounded-full" />
              <EmojiIcon emoji="📅" size={16} className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs font-medium rounded-full" />
              <EmojiIcon emoji="💼" size={16} className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-medium rounded-full" />
              <EmojiIcon emoji="🛍️" size={16} className="px-2 py-1 bg-violet-500/10 text-violet-500 text-xs font-medium rounded-full" />
            </div>
            <Link href="/community/map" className="mt-4 px-6 py-2.5 bg-accent-500 text-white rounded-xl font-bold text-sm hover:bg-accent-600 transition-colors flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Open Full Map
            </Link>
          </div>
        </div>

        
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
            <input type="text" placeholder="Search locations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-sm text-ink-primary placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-ink-secondary border border-border-primary hover:border-accent-500/30'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(loc => (
            <Link key={loc.id} href="/community/map"
              className="block bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-md transition-all group">
              <div className="aspect-square bg-gradient-to-br from-blue-900/30 to-indigo-900/30 flex items-center justify-center text-3xl leading-none">
                {loc.emoji}
              </div>
              <div className="p-2.5">
                <h3 className="text-xs font-bold text-ink-primary truncate group-hover:text-accent-500 transition-colors">{loc.name}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-ink-tertiary">{loc.type}</span>
                  <EmojiIcon emoji="★" size={16} className="text-[10px] text-amber-500 flex items-center gap-0.5" />
                </div>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-surface-secondary text-ink-tertiary text-[9px] font-medium rounded">{loc.category}</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink-tertiary">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No locations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
