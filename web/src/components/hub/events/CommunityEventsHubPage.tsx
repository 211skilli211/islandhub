'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface EventItem {
  id: number; name: string; slug: string;
  category?: string; date_display?: string; venue?: string;
  price?: number; tickets_left?: number; rating?: number;
  image_url?: string; description?: string; is_free?: boolean;
}

function EventCard({ event }: { event: EventItem }) {
  const name = event.name || 'Event';
  const img = event.image_url ? getImageUrl(event.image_url) : undefined;
  return (
    <Link href={`/hub/events/community/${event.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-green-800 to-emerald-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-full bg-white/90 text-ink-primary text-[10px] font-bold">{event.category || 'Community'}</span>
          </div>
          {event.tickets_left && event.tickets_left <= 10 && (
            <div className="absolute bottom-3 left-3">
              <UrgencyCue type="scarcity" value={`${event.tickets_left} tickets left`} />
            </div>
          )}
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {event.date_display && <span>📅 {event.date_display}</span>}
            {event.venue && <span>· 📍 {event.venue}</span>}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-primary">
            {event.is_free ? (
              <span className="text-sm font-bold text-emerald-500">FREE</span>
            ) : event.price ? (
              <PriceTag price={event.price} size="sm" />
            ) : null}
            <span className="text-[10px] text-ink-tertiary font-medium">Get Tickets</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function EventsHubPage({ category, title, subtitle, emoji, gradient, subtypes }: {
  category: string; title: string; subtitle: string; emoji: string; gradient: string; subtypes: string[];
}) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            category: ['Community Gathering', 'Workshop', 'Meetup', 'Concert', 'Festival', 'Fundraiser'][i % 6],
            date_display: ['Sat Jun 14', 'Sun Jun 15', 'Fri Jun 20', 'Sat Jun 21', 'Wed Jul 2', 'Fri Jul 4'][i % 6],
            venue: ['Basseterre', 'Frigate Bay', 'Charlestown', 'Pinneys Beach', 'Fort Thomas', 'Village Green'][i % 6],
            price: i % 3 === 0 ? 0 : 10 + (i * 5),
            tickets_left: [5, 12, 25, 3, 50, 8, 15, 2, 30, 6][i % 10],
            rating: 4.3 + (Math.random() * 0.7),
            image_url: s.banner_url,
            description: s.description,
            is_free: i % 3 === 0,
          }));
        setEvents(filtered);
      } catch (error) { console.error(`Failed to fetch ${category} events:`, error); }
      finally { setLoading(false); }
    };
    fetchEvents();
  }, [category]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className={`bg-gradient-to-br ${gradient} py-6 px-4`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">{emoji} {title}</h1>
          <p className="text-white/70 mb-4">{subtitle}</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'community', label: 'Community' },
              { id: 'environment', label: 'Environment' },
              { id: 'education', label: 'Education' },
              { id: 'health', label: 'Health' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/events/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cat.id === category ? 'bg-white text-ink-primary' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar filters={['All', 'This Week', 'This Month', 'Free', 'Paid', 'Online']}
          activeFilter="All" onFilterChange={() => {}}
          sortOptions={['Date', 'Popular', 'Price']} activeSort="Date" onSortChange={() => {}} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState emoji={emoji} title={`No ${category} events`} message="Check back later for new events." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunityEventsHubPage() {
  return <EventsHubPage category="community" title="Community Events" subtitle="Local gatherings, meetups, and social events"
    emoji="📅" gradient="from-green-900 via-emerald-900 to-teal-900" subtypes={['community', 'local', 'neighborhood']} />;
}
