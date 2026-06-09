'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface AdventureTour {
  id: number; name: string; slug: string;
  activity_type?: string; thrill_level?: number; duration?: string;
  age_requirement?: string; price_per_person?: number;
  rating?: number; review_count?: number; spots_left?: number;
  image_url?: string; description?: string;
}

function AdventureCard({ tour }: { tour: AdventureTour }) {
  const name = tour.name || 'Adventure';
  const img = tour.image_url ? getImageUrl(tour.image_url) : undefined;
  const price = tour.price_per_person || 95;
  const thrill = tour.thrill_level || 3;

  return (
    <Link href={`/hub/tours/adventure/${tour.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-red-900 to-orange-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🧗</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-red-500/80 text-white text-[10px] font-bold">
              {'⚡'.repeat(Math.min(thrill, 5))} {thrill <= 2 ? 'Mild' : thrill <= 3 ? 'Medium' : thrill <= 4 ? 'High' : 'Extreme'}
            </span>
            {tour.spots_left && tour.spots_left <= 3 && (
              <UrgencyCue type="scarcity" value={`${tour.spots_left} left!`} />
            )}
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{tour.activity_type || 'Adventure'} · {tour.duration || '2 hours'}</p>
            </div>
            {tour.rating && <RatingBadge rating={tour.rating} reviewCount={tour.review_count} size="sm" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {tour.age_requirement && <span>🔞 {tour.age_requirement}+</span>}
            <span>· 🏆 {thrill <= 2 ? 'Family Friendly' : thrill <= 3 ? 'Adventurous' : 'Thrill Seeker'}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            <PriceTag price={price} suffix="/person" size="sm" />
            <span className="text-[10px] text-ink-tertiary font-medium">Safety gear included</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AdventureToursHubPage() {
  const [tours, setTours] = useState<AdventureTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['adventure', 'zipline', 'atv', 'extreme'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            activity_type: ['Zip Line', 'ATV Tour', 'Rock Climbing', 'Bungee Jump', 'Paragliding', 'Mountain Biking'][i % 6],
            thrill_level: 2 + (i % 4),
            duration: ['1 hour', '2 hours', '3 hours', 'Half day', '4 hours', '1.5 hours'][i % 6],
            age_requirement: [8, 12, 16, 18, 10, 14][i % 6].toString(),
            price_per_person: 75 + (i * 25),
            rating: 4.4 + (Math.random() * 0.6),
            review_count: 8 + Math.floor(Math.random() * 80),
            spots_left: [2, 4, 6, 1, 3, 5, 2, 4][i % 8],
            image_url: s.banner_url,
            description: s.description,
          }));
        setTours(filtered);
      } catch (error) { console.error('Failed to fetch adventure tours:', error); }
      finally { setLoading(false); }
    };
    fetchTours();
  }, []);

  const filters = ['All', 'Mild', 'Medium', 'High', 'Extreme', 'Family Friendly', '18+'];
  const sortOptions = ['Popular', 'Rating', 'Thrill Level', 'Price'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-red-900 via-orange-900 to-amber-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🧗 Adventure & Extreme</h1>
          <p className="text-red-200 mb-4">Zip-lining, ATV, and extreme experiences</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'land', label: 'Land', emoji: '🥾' },
              { id: 'sea', label: 'Sea', emoji: '🌊' },
              { id: 'adventure', label: 'Adventure', emoji: '🧗' },
              { id: 'charter', label: 'Charters', emoji: '⛵' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/tours/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'adventure' ? 'bg-white text-red-900' : 'bg-white/10 text-white hover:bg-white/20'
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
        ) : tours.length === 0 ? (
          <EmptyState emoji="🧗" title="No adventure tours found" message="Check back later for extreme experience listings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tours.map((tour) => <AdventureCard key={tour.id} tour={tour} />)}
          </div>
        )}
      </div>
    </div>
  );
}
