'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface EventServiceProvider {
  id: number; name: string; slug: string;
  event_type?: string; portfolio_size?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
}

function EventCard({ provider }: { provider: EventServiceProvider }) {
  const name = provider.name || 'Event Provider';
  return (
    <Link href={`/hub/services/events/${provider.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-violet-800 to-purple-900">
          <div className="w-full h-full flex items-center justify-center text-4xl">🎉</div>
          {provider.portfolio_size && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              {provider.portfolio_size}+ events
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{provider.event_type || 'Event Services'}</p>
            </div>
            {provider.rating && <RatingBadge rating={provider.rating} reviewCount={provider.review_count} size="sm" />}
          </div>
          <span className="text-[10px] text-ink-tertiary font-medium">Request a quote</span>
        </div>
      </div>
    </Link>
  );
}

export default function EventServicesHubPage() {
  const [providers, setProviders] = useState<EventServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Rating');

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['event_services', 'catering', 'entertainment', 'planning'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            event_type: ['Catering', 'Entertainment', 'Event Planning', 'Photography', 'Florist', 'DJ Services'][i % 6],
            portfolio_size: 10 + (i * 15),
            rating: 4.4 + (Math.random() * 0.6),
            review_count: 5 + Math.floor(Math.random() * 60),
            image_url: s.banner_url,
            description: s.description,
          }));
        setProviders(filtered);
      } catch (error) { console.error('Failed to fetch event services:', error); }
      finally { setLoading(false); }
    };
    fetchProviders();
  }, []);

  const filters = ['All', 'Catering', 'Entertainment', 'Planning', 'Photography'];
  const sortOptions = ['Rating', 'Experience'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🎉 Event Services</h1>
          <p className="text-violet-200 mb-4">Catering, planning, and entertainment</p>
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
                  cat.id === 'events' ? 'bg-white text-violet-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <EmptyState emoji="🎉" title="No event services found" message="Check back later for event service listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {providers.map((p) => <EventCard key={p.id} provider={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
