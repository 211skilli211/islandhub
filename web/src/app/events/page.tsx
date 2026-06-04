'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useEvents } from '@/hooks/useEvents';
import { getImageUrl } from '@/lib/api';

const CATEGORIES = [
  { value: '', label: 'All Events' },
  { value: 'music', label: 'Music & Concerts' },
  { value: 'food', label: 'Food & Drink' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'business', label: 'Business & Networking' },
  { value: 'community', label: 'Community' },
  { value: 'festival', label: 'Festivals' },
  { value: 'workshop', label: 'Workshops' },
];

const categoryIcons: Record<string, string> = {
  music: '🎵', food: '🍽️', sports: '⚽', arts: '🎨',
  business: '💼', community: '🤝', festival: '🎪', workshop: '🔧',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function EventsHubPage() {
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const { events, loading } = useEvents({ category: category || undefined, search: search || undefined, status: 'published' });

  return (
    <div className="min-h-screen bg-surface-primary dark:bg-ocean-900">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-teal-900 via-teal-900 to-ocean-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#14b8a6]/100 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight">Events Hub</h1>
          <p className="mt-4 text-lg sm:text-xl text-teal-200 max-w-2xl">
            Discover and attend the best events across the Caribbean. Secure your spot with QR-powered digital tickets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/events/my-tickets" className="px-6 py-3 bg-surface-elevated text-teal-900 rounded-xl font-bold hover:bg-teal-50 transition-colors">
              My Tickets
            </Link>
            <Link href="/events/create" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-500 transition-colors border border-teal-400">
              + Create Event
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-elevated dark:bg-ocean-800 border border-border-primary dark:border-ocean-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 dark:text-sand-50"
            />
            <svg className="absolute left-3 top-3.5 h-4 w-4 text-ink-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                  category === c.value
                    ? 'bg-teal-600 text-white'
                    : 'bg-surface-elevated dark:bg-ocean-800 text-ink-secondary dark:text-sand-200 border border-border-primary dark:border-ocean-700 hover:border-teal-300'
                }`}
              >
                {c.value ? `${categoryIcons[c.value] || '📌'} ${c.label}` : c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-surface-tertiary dark:bg-ocean-700" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-surface-tertiary dark:bg-ocean-700 rounded w-3/4" />
                  <div className="h-3 bg-surface-tertiary dark:bg-ocean-700 rounded w-1/2" />
                  <div className="h-3 bg-surface-tertiary dark:bg-ocean-700 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🎪</p>
            <h3 className="text-2xl font-black text-ink-primary dark:text-sand-50">No events found</h3>
            <p className="text-ink-tertiary dark:text-ink-tertiary mt-2">Check back later or create your own event!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Link
                key={event.event_id}
                href={`/events/${event.event_id}`}
                className="group bg-surface-elevated dark:bg-ocean-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-border-primary dark:border-ocean-700"
              >
                <div className="relative h-48 overflow-hidden">
                  {event.image_url ? (
                    <Image
                      src={getImageUrl(event.image_url) || '/placeholder-event.svg'}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                      <span className="text-5xl">{categoryIcons[event.category] || '📌'}</span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-surface-elevated/90 dark:bg-ocean-900/90 backdrop-blur-sm rounded-full text-xs font-bold text-teal-700 dark:text-teal-300">
                      {categoryIcons[event.category]} {event.category}
                    </span>
                  </div>
                  {event.tickets_sold >= event.total_capacity && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="px-4 py-2 bg-red-600 text-white rounded-lg font-black text-sm">SOLD OUT</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-black text-lg text-ink-primary dark:text-sand-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="mt-3 space-y-1.5 text-sm text-ink-tertiary dark:text-ink-tertiary">
                    <p className="flex items-center gap-2">
                      <span>📅</span> {formatDate(event.start_date)} · {formatTime(event.start_date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span> {event.venue}
                    </p>
                    <p className="flex items-center gap-2">
                      <span>👤</span> {event.organizer_name}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-ink-tertiary">From</span>
                      <p className="text-lg font-black text-teal-600 dark:text-teal-400">
                        ${event.ticket_tiers?.[0]?.price?.toLocaleString() || '0'} <span className="text-xs font-normal text-ink-tertiary">XCD</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-ink-tertiary">{event.total_capacity - event.tickets_sold} left</span>
                      <div className="w-20 h-1.5 bg-surface-tertiary dark:bg-ocean-700 rounded-full mt-1">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, (event.tickets_sold / event.total_capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
