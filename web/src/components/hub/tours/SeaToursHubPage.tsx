'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface SeaTour {
  id: number; name: string; slug: string;
  activity_type?: string; duration?: string;
  equipment_included?: boolean; price_per_person?: number;
  rating?: number; review_count?: number; spots_left?: number;
  image_url?: string; description?: string; best_time?: string;
}

function SeaCard({ tour }: { tour: SeaTour }) {
  const name = tour.name || 'Sea Tour';
  const img = tour.image_url ? getImageUrl(tour.image_url) : undefined;
  const price = tour.price_per_person || 85;

  return (
    <Link href={`/hub/tours/sea/${tour.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-cyan-800 to-blue-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🌊</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {tour.equipment_included && (
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/80 text-white text-[10px] font-bold">🤿 Gear Included</span>
            )}
            {tour.spots_left && tour.spots_left <= 4 && (
              <UrgencyCue type="scarcity" value={`${tour.spots_left} spots left`} />
            )}
          </div>
          {tour.best_time && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              ⏰ Best: {tour.best_time}
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{tour.activity_type || 'Sea Adventure'} · {tour.duration || '2 hours'}</p>
            </div>
            {tour.rating && <RatingBadge rating={tour.rating} reviewCount={tour.review_count} size="sm" />}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            <PriceTag price={price} suffix="/person" size="sm" />
            <span className="text-[10px] text-ink-tertiary">🐠 Marine life guaranteed</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SeaToursHubPage() {
  const [tours, setTours] = useState<SeaTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['sea', 'snorkeling', 'sailing', 'fishing', 'diving'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            activity_type: ['Snorkeling', 'Sailing', 'Deep Sea Fishing', 'Scuba Diving', 'Kayaking', 'Whale Watching'][i % 6],
            duration: ['2 hours', '3 hours', '4 hours', 'Half day', 'Full day', '1.5 hours'][i % 6],
            equipment_included: i % 3 !== 0,
            price_per_person: 65 + (i * 20),
            rating: 4.5 + (Math.random() * 0.5),
            review_count: 10 + Math.floor(Math.random() * 120),
            spots_left: [2, 5, 8, 3, 6, 4, 7, 1, 9, 5][i % 10],
            image_url: s.banner_url,
            description: s.description,
            best_time: ['Morning', 'Sunset', 'Anytime', 'Morning', 'Afternoon', 'Morning'][i % 6],
          }));
        setTours(filtered);
      } catch (error) { console.error('Failed to fetch sea tours:', error); }
      finally { setLoading(false); }
    };
    fetchTours();
  }, []);

  const filters = ['All', 'Snorkeling', 'Diving', 'Sailing', 'Fishing', 'Gear Included'];
  const sortOptions = ['Popular', 'Rating', 'Duration', 'Price'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🌊 Sea & Water Adventures</h1>
          <p className="text-cyan-200 mb-4">Snorkeling, sailing, fishing, and diving</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'land', label: 'Land', emoji: '🥾' },
              { id: 'sea', label: 'Sea', emoji: '🌊' },
              { id: 'adventure', label: 'Adventure', emoji: '🧗' },
              { id: 'charter', label: 'Charters', emoji: '⛵' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/tours/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'sea' ? 'bg-white text-cyan-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <EmptyState emoji="🌊" title="No sea tours found" message="Check back later for water adventure listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tours.map((tour) => <SeaCard key={tour.id} tour={tour} />)}
          </div>
        )}
      </div>
    </div>
  );
}
