'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, AvailabilityBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface CafeStore {
  id: number; name: string; slug: string;
  cafe_type?: string; rating?: number; review_count?: number;
  is_open?: boolean; image_url?: string; description?: string;
  specialties?: string[];
}

function CafeCard({ store }: { store: CafeStore }) {
  const name = store.name || 'Café';
  const img = store.image_url ? getImageUrl(store.image_url) : undefined;
  return (
    <Link href={`/hub/food/cafes/${store.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-square bg-gradient-to-br from-amber-700 to-yellow-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">☕</div>
          )}
          <div className="absolute top-3 left-3">
            <AvailabilityBadge status={store.is_open !== false ? 'open' : 'closed'} />
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {store.rating && <RatingBadge rating={store.rating} size="sm" showCount={false} />}
          </div>
          <p className="text-xs text-ink-tertiary">{store.cafe_type || 'Coffee & Pastries'}</p>
          {store.specialties && store.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {store.specialties.slice(0, 3).map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-ink-tertiary">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CafesHubPage() {
  const [stores, setStores] = useState<CafeStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['cafe', 'coffee', 'bakery', 'pastry'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            cafe_type: ['Coffee Shop', 'Bakery', 'Brunch Spot', 'Juice Bar', 'Tea House', 'Pastry Shop'][i % 6],
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 15 + Math.floor(Math.random() * 150),
            is_open: i % 3 !== 0,
            image_url: s.banner_url,
            description: s.description,
            specialties: [
              ['Espresso', 'Croissants', 'Cold Brew'][i % 3],
              ['Bagels', 'Muffins', 'Smoothies'][i % 3],
              ['Cake', 'Sandwiches', 'Salads'][i % 3],
            ].slice(0, 2),
          }));
        setStores(filtered);
      } catch (error) { console.error('Failed to fetch cafés:', error); }
      finally { setLoading(false); }
    };
    fetchStores();
  }, []);

  const filters = ['All', 'Open Now', 'Coffee', 'Bakery', 'Brunch', 'Juice Bar'];
  const sortOptions = ['Popular', 'Rating', 'Distance'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-amber-800 via-yellow-900 to-orange-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">☕ Cafés & Bakeries</h1>
          <p className="text-amber-200 mb-4">Coffee, pastries, and light bites</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'kitchen', label: 'Kitchens', emoji: '🍳' },
              { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
              { id: 'cafe', label: 'Cafés', emoji: '☕' },
              { id: 'grill', label: 'Grills & Bars', emoji: '🍺' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/food/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'cafe' ? 'bg-white text-amber-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-3"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState emoji="☕" title="No cafés found" message="Check back later for new café listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {stores.map((store) => <CafeCard key={store.id} store={store} />)}
          </div>
        )}
      </div>
    </div>
  );
}
