'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface CharterListing {
  id: number; name: string; slug: string;
  boat_type?: string; capacity?: number;
  captain_included?: boolean; duration_options?: string[];
  half_day_price?: number; full_day_price?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
  amenities?: string[];
}

function CharterCard({ charter }: { charter: CharterListing }) {
  const name = charter.name || 'Charter';
  const img = charter.image_url ? getImageUrl(charter.image_url) : undefined;
  const price = charter.half_day_price || charter.full_day_price || 300;

  return (
    <Link href={`/hub/tours/charter/${charter.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-sky-800 to-indigo-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">⛵</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {charter.captain_included && (
              <span className="px-2 py-0.5 rounded-full bg-sky-500/80 text-white text-[10px] font-bold">👨‍✈️ Captain</span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              👥 {charter.capacity || 8} max
            </span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{charter.boat_type || 'Private Charter'}</p>
            </div>
            {charter.rating && <RatingBadge rating={charter.rating} reviewCount={charter.review_count} size="sm" />}
          </div>
          {charter.duration_options && charter.duration_options.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {charter.duration_options.map((d, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-sky-500/10 text-[10px] font-medium text-sky-600">{d}</span>
              ))}
            </div>
          )}
          {charter.amenities && charter.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {charter.amenities.slice(0, 3).map((a, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-ink-tertiary">✓ {a}</span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            <PriceTag price={price} suffix={charter.half_day_price ? '/half day' : '/day'} size="sm" />
            <span className="text-[10px] text-ink-tertiary">Instant Book</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CharterToursHubPage() {
  const [charters, setCharters] = useState<CharterListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchCharters = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['charter', 'yacht', 'private_boat'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            boat_type: ['Yacht', 'Catamaran', 'Speed Boat', 'Sailboat', 'Fishing Boat', 'Luxury Yacht'][i % 6],
            capacity: 4 + (i * 3),
            captain_included: i % 2 === 0,
            duration_options: [
              ['Half Day', 'Full Day'][i % 2],
              ['Sunset Cruise'][i % 2],
              ['Full Day', 'Multi-Day'][i % 2],
            ].slice(0, 1 + (i % 2)),
            half_day_price: 200 + (i * 100),
            full_day_price: 350 + (i * 150),
            rating: 4.6 + (Math.random() * 0.4),
            review_count: 5 + Math.floor(Math.random() * 60),
            image_url: s.banner_url,
            description: s.description,
            amenities: [
              ['Snorkeling Gear', 'Fishing Equipment', 'Cooler'][i % 3],
              ['Bluetooth Sound', 'Swim Platform', 'Restroom'][i % 3],
              ['Lunch', 'Drinks'][i % 2],
            ].slice(0, 2),
          }));
        setCharters(filtered);
      } catch (error) { console.error('Failed to fetch charters:', error); }
      finally { setLoading(false); }
    };
    fetchCharters();
  }, []);

  const filters = ['All', 'Yacht', 'Catamaran', 'Speed Boat', 'Captain Included', 'Instant Book'];
  const sortOptions = ['Popular', 'Rating', 'Price', 'Capacity'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-sky-900 via-indigo-900 to-violet-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">⛵ Private Charters</h1>
          <p className="text-sky-200 mb-4">Private boat and yacht charters</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'land', label: 'Land', emoji: '🥾' },
              { id: 'sea', label: 'Sea', emoji: '🌊' },
              { id: 'adventure', label: 'Adventure', emoji: '🧗' },
              { id: 'charter', label: 'Charters', emoji: '⛵' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/tours/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'charter' ? 'bg-white text-sky-900' : 'bg-white/10 text-white hover:bg-white/20'
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
        ) : charters.length === 0 ? (
          <EmptyState emoji="⛵" title="No charters available" message="Check back later for private boat charters." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {charters.map((charter) => <CharterCard key={charter.id} charter={charter} />)}
          </div>
        )}
      </div>
    </div>
  );
}
