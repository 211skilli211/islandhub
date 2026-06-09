'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface BeautyProvider {
  id: number; name: string; slug: string;
  treatment?: string; duration?: string; price?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
  next_available?: string;
}

function BeautyCard({ provider }: { provider: BeautyProvider }) {
  const name = provider.name || 'Provider';
  return (
    <Link href={`/hub/services/health/${provider.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-pink-800 to-rose-900">
          <div className="w-full h-full flex items-center justify-center text-4xl">💆</div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{provider.treatment || 'Spa & Wellness'}</p>
            </div>
            {provider.rating && <RatingBadge rating={provider.rating} reviewCount={provider.review_count} size="sm" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {provider.duration && <span>⏱ {provider.duration}</span>}
            {provider.next_available && <span className="text-emerald-500">· Next: {provider.next_available}</span>}
          </div>
          {provider.price && (
            <div className="flex items-center justify-between pt-1 border-t border-border-primary">
              <PriceTag price={provider.price} size="sm" />
              <span className="text-[10px] text-ink-tertiary">Free cancellation</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function BeautyServicesHubPage() {
  const [providers, setProviders] = useState<BeautyProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Rating');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['health_beauty', 'spa', 'wellness', 'salon'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            treatment: ['Massage', 'Facial', 'Manicure', 'Hair Styling', 'Body Treatment', 'Couples Spa'][i % 6],
            duration: ['30 min', '45 min', '60 min', '75 min', '90 min', '2 hours'][i % 6],
            price: 45 + (i * 20),
            rating: 4.5 + (Math.random() * 0.5),
            review_count: 12 + Math.floor(Math.random() * 100),
            image_url: s.banner_url,
            description: s.description,
            next_available: ['Today', 'Tomorrow', 'This week', 'Mon', 'Wed', 'Fri'][i % 6],
          }));
        setProviders(filtered);
      } catch (error) { console.error('Failed to fetch beauty providers:', error); }
      finally { setLoading(false); }
    };
    fetchProviders();
  }, []);

  const filters = ['All', 'Massage', 'Facial', 'Hair', 'Nails', 'Couples'];
  const sortOptions = ['Rating', 'Price', 'Next Available'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-pink-900 via-rose-900 to-fuchsia-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">💆 Health & Beauty Services</h1>
          <p className="text-pink-200 mb-4">Spa, salon, and wellness treatments</p>
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
                  cat.id === 'health' ? 'bg-white text-pink-900' : 'bg-white/10 text-white hover:bg-white/20'
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
                <div className="aspect-[16/9] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <EmptyState emoji="💆" title="No beauty services found" message="Check back later for spa and salon listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((p) => <BeautyCard key={p.id} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
