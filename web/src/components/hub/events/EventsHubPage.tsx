'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api, { getImageUrl } from '@/lib/api';
import { FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import { getHubConfig } from '@/lib/hubConfigs';

interface EventItem {
  id: number;
  title: string;
  slug: string;
  category?: string;
  start_date?: string;
  venue?: string;
  price?: number;
  tickets_left?: number;
  total_capacity?: number;
  image_url?: string;
  banner_url?: string;
  is_free?: boolean;
  status?: string;
}

function EventCard({ event }: { event: EventItem }) {
  const name = event.title || 'Event';
  const img = event.banner_url || event.image_url
    ? getImageUrl(event.banner_url || event.image_url)
    : undefined;
  const eventDate = event.start_date ? new Date(event.start_date) : null;
  const isSoldOut = event.tickets_left !== undefined && event.tickets_left <= 0;

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-violet-800 to-purple-900">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🎫</div>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">SOLD OUT</span>
            </div>
          )}
          {event.tickets_left !== undefined && event.tickets_left > 0 && event.tickets_left <= 10 && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {event.tickets_left} left
              </span>
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {eventDate && (
              <span>📅 {eventDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
            )}
            {event.venue && <span>· 📍 {event.venue}</span>}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            {event.is_free ? (
              <span className="text-sm font-bold text-emerald-500">FREE</span>
            ) : event.price ? (
              <span className="text-sm font-bold text-accent-500">${event.price}</span>
            ) : (
              <span className="text-xs text-ink-tertiary">TBA</span>
            )}
            <span className="text-[10px] text-ink-tertiary font-medium">
              {isSoldOut ? 'Sold Out' : 'Get Tickets'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function EventsHubPage() {
  const params = useParams();
  const category = params?.category as string | undefined;
  const config = getHubConfig('events');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Date');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/events', {
          params: {
            status: 'published',
            limit: 50,
            ...(category && category !== 'all' ? { category } : {}),
          },
        });
        const data = res.data;
        const items: EventItem[] = Array.isArray(data) ? data : data?.events || data?.data || [];
        setEvents(items);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [category]);

  const categories = config?.categories || [
    { id: 'all', title: 'All', icon: '🎫' },
    { id: 'concert', title: 'Concerts', icon: '🎵' },
    { id: 'festival', title: 'Festivals', icon: '🎪' },
    { id: 'sports', title: 'Sports', icon: '🏆' },
    { id: 'workshop', title: 'Workshops', icon: '🛠️' },
    { id: 'community', title: 'Community', icon: '🤝' },
    { id: 'theater', title: 'Theater', icon: '🎭' },
  ];

  const currentCat = category || 'all';
  const currentCatConfig = categories.find(c => c.id === currentCat);
  const title = currentCatConfig?.title || 'Events & Tickets';
  const emoji = currentCatConfig?.icon || '🎫';

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">{emoji} {title}</h1>
          <p className="text-white/70 mb-4">Discover events, buy tickets with secure QR codes</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={cat.id === 'all' ? '/hub/events' : `/hub/events/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cat.id === currentCat
                    ? 'bg-white text-ink-primary'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {cat.icon} {cat.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar
          filters={['All', 'This Week', 'This Month', 'Free', 'Paid']}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortOptions={['Date', 'Popular', 'Price']}
          activeSort={activeSort}
          onSortChange={setActiveSort}
        />
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState emoji={emoji} title="No events found" message="Check back later for new events." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-ink-primary">Hosting an Event?</h2>
          <p className="mt-2 text-ink-tertiary text-sm">
            List your event and sell tickets with secure QR codes on IslandHub.
          </p>
          <Link
            href="/events/create"
            className="mt-5 inline-block rounded-xl bg-accent-500 px-6 py-3 font-medium text-white transition-colors hover:bg-accent-600"
          >
            Create Event
          </Link>
        </div>
      </section>
    </div>
  );
}
