'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, AvailabilityBadge, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface BarStore {
  id: number; name: string; slug: string;
  vibe?: string; rating?: number; review_count?: number;
  is_open?: boolean; image_url?: string; description?: string;
  happy_hour?: string; has_live_music?: boolean; has_outdoor_seating?: boolean;
  is_trending?: boolean;
}

function BarCard({ store }: { store: BarStore }) {
  const name = store.name || 'Bar & Grill';
  const img = store.image_url ? getImageUrl(store.image_url) : undefined;
  const isOpen = store.is_open !== false;

  return (
    <Link href={`/hub/food/grills/${store.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-rose-900 to-purple-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍺</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {store.is_trending && <UrgencyCue type="trending" value="Hot Spot" />}
            {store.has_live_music && <span className="px-2 py-0.5 rounded-full bg-purple-500/80 text-white text-[10px] font-bold">🎵 Live</span>}
          </div>
          <div className="absolute bottom-3 left-3">
            <AvailabilityBadge status={isOpen ? 'open' : 'closed'} />
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{store.vibe || 'BBQ & Grill'}</p>
            </div>
            {store.rating && <RatingBadge rating={store.rating} size="sm" showCount={false} />}
          </div>
          <div className="flex flex-wrap gap-1">
            {store.happy_hour && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-semibold text-amber-500">🍻 {store.happy_hour}</span>}
            {store.has_outdoor_seating && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-semibold text-emerald-500">🌿 Outdoor</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function GrillsHubPage() {
  const [stores, setStores] = useState<BarStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['grill', 'bar', 'bbq', 'nightlife', 'pub'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            vibe: ['BBQ Joint', 'Sports Bar', 'Craft Beer', 'Rooftop Bar', 'Beach Bar', 'Pub'][i % 6],
            rating: 4.2 + (Math.random() * 0.8),
            review_count: 15 + Math.floor(Math.random() * 180),
            is_open: i % 4 !== 0,
            image_url: s.banner_url,
            description: s.description,
            happy_hour: i % 2 === 0 ? `4-7pm` : undefined,
            has_live_music: i % 3 === 0,
            has_outdoor_seating: i % 2 === 0,
            is_trending: i < 2,
          }));
        setStores(filtered);
      } catch (error) { console.error('Failed to fetch grills:', error); }
      finally { setLoading(false); }
    };
    fetchStores();
  }, []);

  const filters = ['All', 'Open Now', 'BBQ', 'Live Music', 'Outdoor', 'Happy Hour'];
  const sortOptions = ['Popular', 'Rating', 'Distance'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-rose-900 via-purple-900 to-indigo-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🍺 Grills, Bars & Nightlife</h1>
          <p className="text-rose-200 mb-4">BBQ, grills, and island nightlife</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'kitchen', label: 'Kitchens', emoji: '🍳' },
              { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
              { id: 'cafe', label: 'Cafés', emoji: '☕' },
              { id: 'grill', label: 'Grills & Bars', emoji: '🍺' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/food/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'grill' ? 'bg-white text-rose-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                <span>{cat.emoji}</span> {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter}
          sortOptions={sortOptions} activeSort={activeSort} onSortChange={setActiveSort} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState emoji="🍺" title="No grills or bars found" message="Check back later for new listings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stores.map((store) => <BarCard key={store.id} store={store} />)}
          </div>
        )}
      </div>
    </div>
  );
}
