'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface DeliveryService {
  id: number; name: string; slug: string;
  package_size?: string; urgency?: string;
  price_estimate?: number; rating?: number; review_count?: number;
  image_url?: string; description?: string;
  delivery_time?: string;
}

function DeliveryCard({ service }: { service: DeliveryService }) {
  const name = service.name || 'Delivery';
  return (
    <Link href={`/hub/transport/delivery/${service.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg shrink-0">📦</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{service.package_size || 'Package Delivery'}</p>
              </div>
              {service.rating && <RatingBadge rating={service.rating} reviewCount={service.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {service.urgency && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-[10px] font-bold text-amber-600">{service.urgency}</span>}
              {service.delivery_time && <span className="text-[10px] text-ink-tertiary">· {service.delivery_time}</span>}
            </div>
            {service.price_estimate && (
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-border-primary">
                <PriceTag price={service.price_estimate} size="sm" />
                <span className="text-[10px] text-ink-tertiary">Track in real-time</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DeliveryHubPage() {
  const [services, setServices] = useState<DeliveryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Price');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['delivery', 'courier', 'package'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            package_size: ['Small', 'Medium', 'Large', 'Extra Large', 'Small', 'Medium'][i % 6],
            urgency: ['Same Day', 'Express', 'Standard', 'Next Day', 'Same Day', 'Express'][i % 6],
            price_estimate: 8 + (i * 4),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 10 + Math.floor(Math.random() * 80),
            image_url: s.banner_url,
            description: s.description,
            delivery_time: ['30 min', '1 hour', '2 hours', 'Same day', '45 min', '1.5 hours'][i % 6],
          }));
        setServices(filtered);
      } catch (error) { console.error('Failed to fetch delivery services:', error); }
      finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  const filters = ['All', 'Same Day', 'Express', 'Standard', 'Small', 'Large'];
  const sortOptions = ['Price', 'Speed', 'Rating'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">📦 Package Delivery</h1>
          <p className="text-amber-200 mb-4">Send packages and goods across the island</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'ride', label: 'Rides', emoji: '🚕' },
              { id: 'delivery', label: 'Delivery', emoji: '📦' },
              { id: 'boat', label: 'Boats', emoji: '🚤' },
              { id: 'moving', label: 'Moving', emoji: '🚚' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/transport/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'delivery' ? 'bg-white text-amber-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <EmptyState emoji="📦" title="No delivery services" message="Check back later for delivery options." />
        ) : (
          <div className="space-y-3">
            {services.map((s) => <DeliveryCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
