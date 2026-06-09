'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRentalSubHubs } from '@/lib/hubConfigs';
import { RatingBadge, PriceTag, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface BoatListing {
  id: number; name: string; slug: string; boat_type?: string;
  capacity?: number; captain_included?: boolean;
  half_day_price?: number; full_day_price?: number;
  rating?: number; image_url?: string; description?: string;
}

function SeaCard({ boat, index }: { boat: BoatListing; index: number }) {
  const name = boat.name || 'Boat';
  const price = boat.half_day_price || 200;
  return (
    <Link href={`/hub/rentals/sea/${boat.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-cyan-800 to-blue-900">
          {boat.image_url ? (
            <img src={boat.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🚤</div>
          )}
          {boat.captain_included && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-cyan-500 text-white text-[10px] font-bold">Captain Included</span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {boat.rating && <RatingBadge rating={boat.rating} size="sm" showCount={false} />}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {boat.boat_type && <span>{boat.boat_type}</span>}
            {boat.capacity && <span>· Up to {boat.capacity} people</span>}
          </div>
          <PriceTag price={price} suffix="/half day" size="sm" />
        </div>
      </div>
    </Link>
  );
}

export default function SeaHubPage() {
  const [boats, setBoats] = useState<BoatListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');
  const subHubs = getRentalSubHubs();

  useEffect(() => {
    const fetchBoats = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const filtered = rawData
          .filter((s: any) => {
            const sub = (s.subtype || '').toLowerCase();
            return sub.includes('boat') || sub.includes('marine') || sub.includes('charter') || sub.includes('sea');
          })
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            boat_type: ['Yacht', 'Catamaran', 'Speed Boat', 'Sailboat', 'Fishing Boat'][i % 5],
            capacity: 4 + (i * 2),
            captain_included: i % 2 === 0,
            half_day_price: 150 + (i * 75),
            full_day_price: 250 + (i * 100),
            rating: 4.5 + (Math.random() * 0.5),
            image_url: s.banner_url,
            description: s.description,
          }));
        setBoats(filtered);
      } catch (error) {
        console.error('Failed to fetch boats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoats();
  }, []);

  const filters = ['All', 'Yacht', 'Catamaran', 'Speed Boat', 'Sailboat', 'Fishing', 'Captain Included'];
  const sortOptions = ['Popular', 'Price: Low', 'Price: High', 'Capacity'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚤 Sea & Boat Rentals</h1>
          <p className="text-cyan-200 mb-4">Explore the Caribbean waters — yachts, catamarans, and fishing boats</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subHubs.map((sub) => (
              <Link key={sub.categoryId} href={`/hub/rentals/${sub.categoryId}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sub.categoryId === 'sea' ? 'bg-white text-cyan-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                {sub.pageTitle}
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
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : boats.length === 0 ? (
          <EmptyState emoji="🚤" title="No boats available" message="Check back later for new sea rentals." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {boats.map((boat, i) => <SeaCard key={boat.id} boat={boat} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
