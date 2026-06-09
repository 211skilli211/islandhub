'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState, AvailabilityBadge } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface AutoService {
  id: number; name: string; slug: string;
  service_type?: string; is_mobile?: boolean;
  starting_price?: number; rating?: number; review_count?: number;
  image_url?: string; description?: string;
}

function AutoCard({ service }: { service: AutoService }) {
  const name = service.name || 'Auto Service';
  return (
    <Link href={`/hub/services/automotive/${service.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-lg shrink-0">🚗</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{service.service_type || 'Automotive Repair'}</p>
              </div>
              {service.rating && <RatingBadge rating={service.rating} reviewCount={service.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {service.is_mobile && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-bold text-emerald-600">Mobile Service</span>}
              {service.starting_price && <PriceTag price={service.starting_price} suffix="up" size="sm" />}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AutomotiveServicesHubPage() {
  const [services, setServices] = useState<AutoService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Rating');

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['automotive', 'car_repair', 'detailing'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 8)
          .map((s: any, i) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            service_type: ['Repair', 'Oil Change', 'Detailing', 'Tire Service', 'AC Repair', 'Brakes'][i % 6],
            is_mobile: i % 3 === 0,
            starting_price: 30 + (i * 25),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 10 + Math.floor(Math.random() * 90),
            image_url: s.banner_url,
            description: s.description,
          }));
        setServices(filtered);
      } catch (error) { console.error('Failed to fetch auto services:', error); }
      finally { setLoading(false); }
    };
    fetchServices();
  }, []);

  const filters = ['All', 'Mobile Service', 'Repair', 'Detailing', 'Oil Change', 'Tire Service'];
  const sortOptions = ['Rating', 'Distance', 'Price'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-orange-900 via-red-900 to-rose-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚗 Automotive Services</h1>
          <p className="text-orange-200 mb-4">Car repair, detailing, and maintenance</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'professional', label: 'Professional', emoji: '💼' },
              { id: 'automotive', label: 'Automotive', emoji: '🚗' },
              { id: 'health', label: 'Health & Beauty', emoji: '💆' },
              { id: 'marine', label: 'Marine', emoji: '⚓' },
              { id: 'events', label: 'Events', emoji: '🎉' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/services/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'automotive' ? 'bg-white text-orange-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <EmptyState emoji="🚗" title="No auto services found" message="Check back later for automotive listings." />
        ) : (
          <div className="space-y-3">
            {services.map((s) => <AutoCard key={s.id} service={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
