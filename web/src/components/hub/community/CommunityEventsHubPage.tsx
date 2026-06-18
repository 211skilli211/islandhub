'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

interface Event {
  event_id: number; title: string; slug: string;
  date: string; end_date?: string; location: string;
  category: string; rsvp_count: number; max_attendees?: number;
  ticket_price?: number; cover_image_url: string;
  organizer_name: string; status: string; is_virtual: boolean;
}

const CATEGORIES = ['All', 'Food', 'Arts', 'Music', 'Fitness', 'Community', 'Business'];
const SORT_OPTIONS = ['Date', 'Popular', 'Price'];

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days}d away`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getCategoryEmoji(category: string) {
  const icons: Record<string, string> = {
    food: '🍽️', arts: '🎨', music: '🎵', fitness: '💪',
    community: '🤝', sports: '⚽', business: '💼',
  };
  return icons[category] || '📅';
}

export function CommunityHubEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Date');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await api.get('/community-events?limit=20');
        setEvents(Array.isArray(res.data) ? res.data : res.data?.events || getSampleEvents());
      } catch { setEvents(getSampleEvents()); }
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filteredEvents = activeFilter === 'All'
    ? events
    : events.filter(e => e.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <CompactHubPage
      title="Community Events"
      subtitle="Local gatherings, festivals, and meetups across the Caribbean"
      emoji="📅"
      gradient="from-green-900 via-emerald-900 to-teal-900"
      items={events}
      loading={loading}
      filters={CATEGORIES}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="📅"
      emptyTitle="No events found"
      emptyMessage="Check back later for new events."
      renderCard={(event: Event) => (
        <CompactCard
          key={event.event_id}
          href={`/community/events#event-${event.event_id}`}
          imageUrl={event.cover_image_url}
          emoji={getCategoryEmoji(event.category)}
          title={event.title}
          subtitle={event.location}
          badge={formatEventDate(event.date)}
          badgeColor="bg-emerald-500"
          meta={[
            event.ticket_price ? `$${event.ticket_price}` : 'Free',
            `${event.rsvp_count} going`,
            event.is_virtual ? 'Virtual' : 'In-person',
          ]}
          ctaLabel="RSVP"
        />
      )}
    />
  );
}

function getSampleEvents(): Event[] {
  return [
    { event_id: 1, title: 'Island Food Festival 2026', slug: 'food-festival', date: '2026-07-15T11:00:00', end_date: '2026-07-15T21:00:00', location: 'Downtown Market Plaza', category: 'food', rsvp_count: 234, max_attendees: 500, cover_image_url: '', organizer_name: 'Island Tourism Board', status: 'upcoming', is_virtual: false },
    { event_id: 2, title: 'Beach Cleanup Day', slug: 'beach-cleanup', date: '2026-07-20T08:00:00', end_date: '2026-07-20T12:00:00', location: 'South Beach', category: 'community', rsvp_count: 89, cover_image_url: '', organizer_name: 'Environmental Club', status: 'upcoming', is_virtual: false },
    { event_id: 3, title: 'Local Artists Market', slug: 'artists-market', date: '2026-07-22T10:00:00', end_date: '2026-07-22T17:00:00', location: 'Harbor Square', category: 'arts', rsvp_count: 156, cover_image_url: '', organizer_name: 'Arts Collective', status: 'upcoming', is_virtual: false },
    { event_id: 4, title: 'Sunset Yoga on the Beach', slug: 'sunset-yoga', date: '2026-07-07T17:30:00', end_date: '2026-07-07T18:30:00', location: 'West Beach', category: 'fitness', rsvp_count: 45, max_attendees: 50, cover_image_url: '', organizer_name: 'Wellness Center', status: 'upcoming', is_virtual: false },
    { event_id: 5, title: 'Island Music Festival', slug: 'music-fest', date: '2026-08-10T18:00:00', end_date: '2026-08-12T23:00:00', location: 'Amphitheater Park', category: 'music', rsvp_count: 567, max_attendees: 2000, ticket_price: 25, cover_image_url: '', organizer_name: 'Music Society', status: 'upcoming', is_virtual: false },
    { event_id: 6, title: 'Farmers Market', slug: 'farmers-market', date: '2026-07-08T06:00:00', end_date: '2026-07-08T12:00:00', location: 'Town Square', category: 'food', rsvp_count: 312, cover_image_url: '', organizer_name: 'Farmers Association', status: 'upcoming', is_virtual: false },
    { event_id: 7, title: 'Business Networking Mixer', slug: 'biz-mixer', date: '2026-07-25T18:00:00', location: 'Marina Club', category: 'business', rsvp_count: 78, cover_image_url: '', organizer_name: 'Chamber of Commerce', status: 'upcoming', is_virtual: false },
    { event_id: 8, title: 'Caribbean Cooking Class', slug: 'cooking-class', date: '2026-07-12T14:00:00', location: 'Community Kitchen', category: 'food', rsvp_count: 24, max_attendees: 30, ticket_price: 15, cover_image_url: '', organizer_name: 'Chef Maria', status: 'upcoming', is_virtual: false },
    { event_id: 9, title: 'Virtual Investment Seminar', slug: 'investment-seminar', date: '2026-07-18T10:00:00', location: 'Online', category: 'business', rsvp_count: 156, cover_image_url: '', organizer_name: 'Finance Group', status: 'upcoming', is_virtual: true },
    { event_id: 10, title: 'Beach Volleyball Tournament', slug: 'volleyball', date: '2026-07-26T09:00:00', location: 'Pinneys Beach', category: 'sports', rsvp_count: 89, cover_image_url: '', organizer_name: 'Sports Club', status: 'upcoming', is_virtual: false },
    { event_id: 11, title: 'Art Exhibition Opening', slug: 'art-exhibition', date: '2026-07-14T17:00:00', location: 'National Gallery', category: 'arts', rsvp_count: 67, cover_image_url: '', organizer_name: 'Gallery Collective', status: 'upcoming', is_virtual: false },
    { event_id: 12, title: 'Community Town Hall', slug: 'town-hall', date: '2026-07-30T18:00:00', location: 'Community Center', category: 'community', rsvp_count: 234, cover_image_url: '', organizer_name: 'Local Council', status: 'upcoming', is_virtual: false },
  ];
}
