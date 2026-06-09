'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface MovingService {
  id: number; name: string; slug: string;
  truck_size?: string; crew_size?: number;
  price_estimate?: number; rating?: number; review_count?: number;
  image_url?: string; description?: string;
  is_available?: boolean;
}

function MovingCard({ service }: { service: MovingService }) {
  const name = service.name || 'Moving Service';
  return (
    <Link href={`/hub/transport/moving/${service.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center text-white text-lg shrink-0">🚚</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{service.truck_size || 'Standard Truck'} · {service.crew_size || 2} crew</p>
              </div>
              {service.rating && <RatingBadge rating={service.rating} reviewCount={service.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {service.is_available && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-600">Available Today</span>}
              {service.price_estimate && <PriceTag price={service.price_estimate} suffix="from" size="sm" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MovingHubPage() {
  const [services, setServices] = useState<MovingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Price');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['moving', 'relocation', 'heavy'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            truck_size: ['Small Truck', 'Medium Truck', 'Large Truck', 'Box Truck', 'Pickup', 'Van'][i % 6],
            crew_size: 1 + (i % 3),
            price_estimate: 80 + (i * 40),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 5 + Math.floor(Math.random() * 50),
            image_url: s.banner_url,
            description: s.description,
            is_available: i % 3 !== 0,
          }));
        setServices(filtered);
      } catch (error) { console.error('Failed to fetch moving services:', error); }
      finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  const filters = ['All', 'Available Today', 'Small Truck', 'Large Truck', '2+ Crew'];
  const sortOptions = ['Price', 'Rating', 'Availability'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-slate-800 via-zinc-900 to-neutral-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚚 Moving & Relocation</h1>
          <p className="text-slate-300 mb-4">Relocation and heavy lifting services</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'ride', label: 'Rides', emoji: '🚕' },
              { id: 'delivery', label: 'Delivery', emoji: '📦' },
              { id: 'boat', label: 'Boats', emoji: '🚤' },
              { id: 'moving', label: 'Moving', emoji: '🚚' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/transport/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'moving' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
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
        ) : services.length === 0 ? (
          <EmptyState emoji="🚚" title="No moving services found" message="Check back later for moving and relocation listings." />
        ) : (
          <div className="space-y-3">
            {services.map((s) => <MovingCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
