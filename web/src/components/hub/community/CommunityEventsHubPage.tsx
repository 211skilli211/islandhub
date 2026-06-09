'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RatingBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface CommunityEvent {
  id: number; name: string; slug: string;
  event_type?: string; date_display?: string; venue?: string;
  attendee_count?: number; image_url?: string; description?: string; is_free?: boolean;
}

function EventCard({ event }: { event: CommunityEvent }) {
  const name = event.name || 'Event';
  return (
    <Link href={`/hub/community/events/${event.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-teal-800 to-cyan-900">
          {event.image_url ? (
            <img src={event.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-full bg-white/90 text-ink-primary text-[10px] font-bold">{event.event_type || 'Event'}</span>
          </div>
          {event.is_free && (
            <div className="absolute top-3 right-3">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">FREE</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-ink-tertiary">
            {event.date_display && <span>🗓️ {event.date_display}</span>}
            {event.venue && <span>📍 {event.venue}</span>}
          </div>
          {event.attendee_count && (
            <div className="mt-2 flex items-center gap-1 text-xs text-ink-tertiary">
              <span>👥 {event.attendee_count} attending</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CommunityEventsHubPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/search/featured?type=community&limit=12')
      .then((res: any) => setEvents(res.data?.events || res.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-white mb-3">
            📅 Community Events
          </motion.h1>
          <p className="text-lg text-teal-200 max-w-2xl mx-auto">
            Local gatherings, meetups, and social events across the Caribbean.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FilterBar filters={['Today', 'This Week', 'This Month', 'Free', 'Paid']} sortOptions={['Date', 'Popular', 'Distance']} activeSort="Date" onSortChange={() => {}} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState emoji="📅" title="No community events" message="Check back later for new events." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </div>
  );
}
