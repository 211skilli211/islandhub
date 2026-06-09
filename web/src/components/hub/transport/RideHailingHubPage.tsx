'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, AvailabilityBadge, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface Driver {
  id: number; name: string; slug: string;
  vehicle_type?: string; eta_minutes?: number;
  fare_estimate?: number; rating?: number; trip_count?: number;
  image_url?: string; is_available?: boolean;
}

function DriverCard({ driver }: { driver: Driver }) {
  const name = driver.name || 'Driver';
  return (
    <Link href={`/hub/transport/ride/${driver.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-lg shrink-0">🚕</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{driver.vehicle_type || 'Standard'}</p>
              </div>
              {driver.rating && <RatingBadge rating={driver.rating} size="sm" showCount={false} />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {driver.eta_minutes && <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-[10px] font-bold text-sky-600">🚗 {driver.eta_minutes} min away</span>}
              {driver.fare_estimate && <PriceTag price={driver.fare_estimate} size="sm" />}
              {driver.trip_count && <span className="text-[10px] text-ink-tertiary">{driver.trip_count} trips</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function RideHailingHubPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Nearest');

  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['ride', 'taxi', 'ride_hail'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: ['Marcus T.', 'Sarah K.', 'James L.', 'Lisa M.', 'David R.', 'Emma W.', 'Carlos P.', 'Angela S.'][i % 8],
            slug: s.slug,
            vehicle_type: ['Sedan', 'SUV', 'Minivan', 'Luxury', 'Compact', 'Sedan', 'SUV', 'Standard'][i % 8],
            eta_minutes: 2 + (i * 2),
            fare_estimate: 12 + (i * 5),
            rating: 4.5 + (Math.random() * 0.5),
            trip_count: 50 + (i * 30),
            image_url: s.banner_url,
            is_available: i % 4 !== 0,
          }));
        setDrivers(filtered);
      } catch (error) { console.error('Failed to fetch drivers:', error); }
      finally { setLoading(false); }
    };
    fetchDrivers();
  }, []);

  const filters = ['All', 'Standard', 'SUV', 'Luxury', 'Available Now'];
  const sortOptions = ['Nearest', 'Price', 'Rating'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚕 Ride Hailing</h1>
          <p className="text-sky-200 mb-4">Quick rides across St. Kitts & Nevis</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'ride', label: 'Rides', emoji: '🚕' },
              { id: 'delivery', label: 'Delivery', emoji: '📦' },
              { id: 'boat', label: 'Boats', emoji: '🚤' },
              { id: 'moving', label: 'Moving', emoji: '🚚' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/transport/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'ride' ? 'bg-white text-sky-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-secondary animate-pulse" />
                  <div className="flex-1"><div className="h-4 bg-surface-secondary rounded animate-pulse w-1/3" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : drivers.length === 0 ? (
          <EmptyState emoji="🚕" title="No drivers available" message="Check back later for ride options." />
        ) : (
          <div className="space-y-3">
            {drivers.map((d) => <DriverCard key={d.id} driver={d} />)}
          </div>
        )}
      </div>
    </div>
  );
}
