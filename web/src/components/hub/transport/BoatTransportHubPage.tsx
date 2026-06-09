'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState, AvailabilityBadge } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface BoatTransport {
  id: number; name: string; slug: string;
  boat_type?: string; route?: string; capacity?: number;
  next_departure?: string; price?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
}

function BoatCard({ boat }: { boat: BoatTransport }) {
  const name = boat.name || 'Boat Service';
  return (
    <Link href={`/hub/transport/boat/${boat.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-teal-800 to-cyan-900">
          <div className="w-full h-full flex items-center justify-center text-4xl">🚤</div>
          {boat.next_departure && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              Next: {boat.next_departure}
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{boat.boat_type || 'Ferry'} · {boat.route || 'Inter-island'}</p>
            </div>
            {boat.rating && <RatingBadge rating={boat.rating} reviewCount={boat.review_count} size="sm" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {boat.capacity && <span>👥 {boat.capacity} capacity</span>}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            {boat.price && <PriceTag price={boat.price} suffix="/person" size="sm" />}
            <span className="text-[10px] text-ink-tertiary font-medium">Book passage</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BoatTransportHubPage() {
  const [boats, setBoats] = useState<BoatTransport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Schedule');

  useEffect(() => {
    const fetchBoats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['boat', 'ferry', 'charter', 'marine'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            boat_type: ['Ferry', 'Water Taxi', 'Catamaran', 'Speed Boat', 'Ferry', 'Sailboat'][i % 6],
            route: ['St. Kitts ↔ Nevis', 'Basseterre ↔ Frigate Bay', 'Island Hop', 'Coastal Tour', 'St. Kitts ↔ Nevis', 'Private'][i % 6],
            capacity: 12 + (i * 8),
            next_departure: ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '6:00 PM'][i % 6],
            price: 15 + (i * 8),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 20 + Math.floor(Math.random() * 100),
            image_url: s.banner_url,
            description: s.description,
          }));
        setBoats(filtered);
      } catch (error) { console.error('Failed to fetch boat transport:', error); }
      finally { setLoading(false); }
    };
    fetchBoats();
  }, []);

  const filters = ['All', 'Ferry', 'Water Taxi', 'Speed Boat', 'Inter-island'];
  const sortOptions = ['Schedule', 'Price', 'Rating'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-blue-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚤 Boat Charters & Ferries</h1>
          <p className="text-teal-200 mb-4">Private boat and ferry services</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'ride', label: 'Rides', emoji: '🚕' },
              { id: 'delivery', label: 'Delivery', emoji: '📦' },
              { id: 'boat', label: 'Boats', emoji: '🚤' },
              { id: 'moving', label: 'Moving', emoji: '🚚' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/transport/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'boat' ? 'bg-white text-teal-900' : 'bg-white/10 text-white hover:bg-white/20'
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
                <div className="aspect-[16/9] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : boats.length === 0 ? (
          <EmptyState emoji="🚤" title="No boat services found" message="Check back later for ferry and boat listings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boats.map((b) => <BoatCard key={b.id} boat={b} />)}
          </div>
        )}
      </div>
    </div>
  );
}
