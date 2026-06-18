'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import { ContentSection } from '@/components/hub/MarketplaceSections';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY DIRECTORY — Main hub page showing featured content from all sections
// Links to full pages: /community/events, /community/groups, /community/stories, /community/auctions
// ═══════════════════════════════════════════════════════════════════════════════

interface CommunityEvent {
  event_id: number; title: string; slug: string;
  date: string; location: string; category: string;
  rsvp_count: number; max_attendees?: number; ticket_price?: number;
  cover_image_url: string; organizer_name: string; status: string;
}

interface CommunityGroup {
  id: number; name: string; slug: string;
  description: string; cover_image_url: string;
  privacy: string; member_count: number; post_count: number;
  category?: string; is_member: boolean;
}

interface CommunityStory {
  id: number; user_name: string; profile_photo_url: string;
  media_url: string; content: string; created_at: string;
  view_count: number; reaction_count: number; is_viewed: boolean;
}

interface CommunityAuction {
  id: number; title: string; slug: string;
  currentBid: number; timeLeft: string; image: string;
  bids: number; isLive: boolean;
}

const EVENT_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌴' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'arts', label: 'Arts', emoji: '🎨' },
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'community', label: 'Community', emoji: '🤝' },
];

const GROUP_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🌴' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'activities', label: 'Activities', emoji: '🏖️' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'arts', label: 'Arts', emoji: '🎨' },
];

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
    community: '🤝', sports: '⚽', business: '💼', activities: '🏖️',
  };
  return icons[category] || '📅';
}

export function CommunityDirectoryHubPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [stories, setStories] = useState<CommunityStory[]>([]);
  const [auctions, setAuctions] = useState<CommunityAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // Fetch events
        const eventsRes = await api.get('/community-events?limit=8');
        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data?.events || getSampleEvents());
      } catch { setEvents(getSampleEvents()); }
      try {
        // Fetch groups
        const groupsRes = await api.get('/groups?limit=8');
        setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.groups || getSampleGroups());
      } catch { setGroups(getSampleGroups()); }
      try {
        // Fetch stories
        const storiesRes = await api.get('/stories/feed?limit=6');
        setStories(Array.isArray(storiesRes.data) ? storiesRes.data : storiesRes.data?.stories || getSampleStories());
      } catch { setStories(getSampleStories()); }
      try {
        // Fetch auctions
        const auctionsRes = await api.get('/auctions?limit=4');
        setAuctions(Array.isArray(auctionsRes.data) ? auctionsRes.data : auctionsRes.data?.auctions || getSampleAuctions());
      } catch { setAuctions(getSampleAuctions()); }
      setLoading(false);
    };
    fetchAll();
  }, []);

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(e => e.category === activeFilter);

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-1 leading-tight">🌴 Island Community</h1>
          <p className="text-sm text-white/70 max-w-xl mx-auto">Events, stories, groups, and auctions across the Caribbean</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">

        {/* ─── EVENTS SECTION ─── */}
        <ContentSection title="Upcoming Events" subtitle="Local gatherings, festivals, and meetups" seeMoreHref="/community/events" seeMoreLabel="All Events">
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {EVENT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeFilter === cat.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-surface-elevated text-ink-secondary border border-border-primary hover:border-emerald-500/30'
                }`}>
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                  <div className="aspect-square bg-surface-secondary animate-pulse" />
                  <div className="p-2.5 space-y-1"><div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-ink-tertiary text-sm">No events found. <Link href="/community/events" className="text-emerald-500 hover:underline">Create one</Link></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredEvents.slice(0, 8).map(event => (
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
                  ]}
                  ctaLabel="RSVP"
                />
              ))}
            </div>
          )}
        </ContentSection>

        {/* ─── GROUPS SECTION ─── */}
        <ContentSection title="Community Groups" subtitle="Find your people and join the conversation" seeMoreHref="/community/groups" seeMoreLabel="All Groups">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                  <div className="aspect-square bg-surface-secondary animate-pulse" />
                  <div className="p-2.5 space-y-1"><div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-ink-tertiary text-sm">No groups found. <Link href="/community/groups" className="text-emerald-500 hover:underline">Start one</Link></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {groups.slice(0, 8).map(group => (
                <CompactCard
                  key={group.id}
                  href={`/community/groups#group-${group.id}`}
                  imageUrl={group.cover_image_url}
                  emoji={getCategoryEmoji(group.category || 'community')}
                  title={group.name}
                  subtitle={group.privacy === 'private' ? '🔒 Private' : '🌐 Public'}
                  badge={`${group.member_count.toLocaleString()} members`}
                  badgeColor="bg-teal-500"
                  meta={[`${group.post_count} posts`]}
                  ctaLabel={group.is_member ? 'View' : 'Join'}
                />
              ))}
            </div>
          )}
        </ContentSection>

        {/* ─── STORIES SECTION ─── */}
        <ContentSection title="Community Stories" subtitle="Real stories from island residents" seeMoreHref="/community/stories" seeMoreLabel="All Stories">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                  <div className="aspect-square bg-surface-secondary animate-pulse" />
                  <div className="p-2.5 space-y-1"><div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-8 text-ink-tertiary text-sm">No stories yet. <Link href="/community/stories" className="text-emerald-500 hover:underline">Share yours</Link></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {stories.slice(0, 6).map(story => (
                <CompactCard
                  key={story.id}
                  href={`/community/stories#story-${story.id}`}
                  imageUrl={story.media_url}
                  emoji={story.is_viewed ? '👀' : '✨'}
                  title={story.user_name}
                  subtitle={story.content.slice(0, 40) + (story.content.length > 40 ? '...' : '')}
                  badge={`${story.view_count} views`}
                  badgeColor="bg-violet-500"
                  meta={[`❤️ ${story.reaction_count}`]}
                  ctaLabel="Read"
                />
              ))}
            </div>
          )}
        </ContentSection>

        {/* ─── AUCTIONS SECTION ─── */}
        <ContentSection title="Live Auctions" subtitle="Bid on unique island items in real-time" seeMoreHref="/community/auctions" seeMoreLabel="All Auctions">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                  <div className="aspect-square bg-surface-secondary animate-pulse" />
                  <div className="p-2.5 space-y-1"><div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-8 text-ink-tertiary text-sm">No live auctions. <Link href="/community/auctions" className="text-emerald-500 hover:underline">Start one</Link></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {auctions.slice(0, 4).map(auction => (
                <CompactCard
                  key={auction.id}
                  href={`/community/auctions#auction-${auction.id}`}
                  imageUrl={auction.image}
                  emoji="🔨"
                  title={auction.title}
                  subtitle={`$${auction.currentBid} current bid`}
                  badge={auction.timeLeft}
                  badgeColor="bg-red-500"
                  meta={[`${auction.bids} bids`]}
                  ctaLabel="Bid Now"
                />
              ))}
            </div>
          )}
        </ContentSection>

        {/* ─── CTA ─── */}
        <section className="text-center py-8 border-t border-border-primary">
          <h3 className="text-lg font-bold text-ink-primary mb-2">Join the Community</h3>
          <p className="text-sm text-ink-tertiary mb-4 max-w-md mx-auto">Connect with locals, share stories, and be part of island life!</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/community/events" className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
              📅 Browse Events
            </Link>
            <Link href="/community/groups" className="px-4 py-2 rounded-lg bg-surface-elevated border border-border-primary text-ink-primary text-sm font-medium hover:border-emerald-500/30 transition-colors">
              👥 Join Groups
            </Link>
            <Link href="/community/stories" className="px-4 py-2 rounded-lg bg-surface-elevated border border-border-primary text-ink-primary text-sm font-medium hover:border-emerald-500/30 transition-colors">
              📸 Share Stories
            </Link>
            <Link href="/community/auctions" className="px-4 py-2 rounded-lg bg-surface-elevated border border-border-primary text-ink-primary text-sm font-medium hover:border-emerald-500/30 transition-colors">
              🔨 Live Auctions
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Sample Data ────────────────────────────────────────────────────────────

function getSampleEvents(): CommunityEvent[] {
  return [
    { event_id: 1, title: 'Island Food Festival 2026', slug: 'food-festival', date: '2026-07-15T11:00:00', location: 'Downtown Market Plaza', category: 'food', rsvp_count: 234, max_attendees: 500, cover_image_url: '', organizer_name: 'Island Tourism Board', status: 'upcoming' },
    { event_id: 2, title: 'Beach Cleanup Day', slug: 'beach-cleanup', date: '2026-07-20T08:00:00', location: 'South Beach', category: 'community', rsvp_count: 89, cover_image_url: '', organizer_name: 'Environmental Club', status: 'upcoming' },
    { event_id: 3, title: 'Local Artists Market', slug: 'artists-market', date: '2026-07-22T10:00:00', location: 'Harbor Square', category: 'arts', rsvp_count: 156, cover_image_url: '', organizer_name: 'Arts Collective', status: 'upcoming' },
    { event_id: 4, title: 'Sunset Yoga on the Beach', slug: 'sunset-yoga', date: '2026-07-07T17:30:00', location: 'West Beach', category: 'fitness', rsvp_count: 45, max_attendees: 50, cover_image_url: '', organizer_name: 'Wellness Center', status: 'upcoming' },
    { event_id: 5, title: 'Island Music Festival', slug: 'music-fest', date: '2026-08-10T18:00:00', location: 'Amphitheater Park', category: 'music', rsvp_count: 567, max_attendees: 2000, ticket_price: 25, cover_image_url: '', organizer_name: 'Music Society', status: 'upcoming' },
    { event_id: 6, title: 'Farmers Market', slug: 'farmers-market', date: '2026-07-08T06:00:00', location: 'Town Square', category: 'food', rsvp_count: 312, cover_image_url: '', organizer_name: 'Farmers Association', status: 'upcoming' },
    { event_id: 7, title: 'Business Networking Mixer', slug: 'biz-mixer', date: '2026-07-25T18:00:00', location: 'Marina Club', category: 'business', rsvp_count: 78, cover_image_url: '', organizer_name: 'Chamber of Commerce', status: 'upcoming' },
    { event_id: 8, title: 'Caribbean Cooking Class', slug: 'cooking-class', date: '2026-07-12T14:00:00', location: 'Community Kitchen', category: 'food', rsvp_count: 24, max_attendees: 30, ticket_price: 15, cover_image_url: '', organizer_name: 'Chef Maria', status: 'upcoming' },
  ];
}

function getSampleGroups(): CommunityGroup[] {
  return [
    { id: 1, name: 'Island Foodies', slug: 'island-foodies', description: 'Share recipes and discover local restaurants', cover_image_url: '', privacy: 'public', member_count: 1250, post_count: 342, category: 'food', is_member: false },
    { id: 2, name: 'Water Sports Enthusiasts', slug: 'water-sports', description: 'From surfing to diving, share aquatic adventures', cover_image_url: '', privacy: 'public', member_count: 890, post_count: 156, category: 'activities', is_member: true },
    { id: 3, name: 'Local Business Network', slug: 'biz-network', description: 'Connect with local entrepreneurs', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 89, category: 'business', is_member: false },
    { id: 4, name: 'Beach Cleanup Crew', slug: 'cleanup-crew', description: 'Monthly beach cleanup events', cover_image_url: '', privacy: 'public', member_count: 234, post_count: 45, category: 'community', is_member: false },
    { id: 5, name: 'Island Artists Collective', slug: 'artists-collective', description: 'Showcase art and celebrate island culture', cover_image_url: '', privacy: 'public', member_count: 345, post_count: 78, category: 'arts', is_member: false },
    { id: 6, name: 'Real Estate & Rentals', slug: 'real-estate', description: 'Find your dream home or list your property', cover_image_url: '', privacy: 'private', member_count: 678, post_count: 123, category: 'community', is_member: false },
    { id: 7, name: 'Football League', slug: 'football', description: 'Local football matches and tournaments', cover_image_url: '', privacy: 'public', member_count: 456, post_count: 234, category: 'sports', is_member: false },
    { id: 8, name: 'Yoga & Wellness', slug: 'yoga-wellness', description: 'Daily yoga sessions and wellness tips', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 189, category: 'fitness', is_member: true },
  ];
}

function getSampleStories(): CommunityStory[] {
  return [
    { id: 1, user_name: 'Maria Santos', profile_photo_url: '', media_url: '', content: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months!', created_at: '2026-07-05T10:00:00', view_count: 156, reaction_count: 42, is_viewed: false },
    { id: 2, user_name: 'James Wilson', profile_photo_url: '', media_url: '', content: 'Found the perfect vacation rental for my family through this platform. Amazing experience!', created_at: '2026-07-05T09:00:00', view_count: 89, reaction_count: 23, is_viewed: true },
    { id: 3, user_name: 'Sarah Chen', profile_photo_url: '', media_url: '', content: 'Just launched my handmade jewelry collection! Check it out', created_at: '2026-07-04T15:00:00', view_count: 234, reaction_count: 67, is_viewed: false },
    { id: 4, user_name: 'David Thompson', profile_photo_url: '', media_url: '', content: 'Our beach cleanup removed 200lbs of plastic this weekend. Thank you to everyone who joined!', created_at: '2026-07-03T12:00:00', view_count: 312, reaction_count: 89, is_viewed: false },
    { id: 5, user_name: 'Lisa Park', profile_photo_url: '', media_url: '', content: 'The sunset yoga sessions have become my favorite part of the week. So peaceful.', created_at: '2026-07-02T18:00:00', view_count: 178, reaction_count: 45, is_viewed: true },
    { id: 6, user_name: 'Carlos Rivera', profile_photo_url: '', media_url: '', content: 'Just listed my boat for charter. Already got 3 bookings in the first day!', created_at: '2026-07-01T08:00:00', view_count: 95, reaction_count: 31, is_viewed: false },
  ];
}

function getSampleAuctions(): CommunityAuction[] {
  return [
    { id: 1, title: 'Vintage Island Surfboard', slug: 'surfboard', currentBid: 250, timeLeft: '2h 15m', image: '', bids: 12, isLive: true },
    { id: 2, title: 'Handmade Crafts Collection', slug: 'crafts', currentBid: 85, timeLeft: '5h 30m', image: '', bids: 8, isLive: true },
    { id: 3, title: 'Local Art Piece', slug: 'art-piece', currentBid: 420, timeLeft: '1h 45m', image: '', bids: 15, isLive: true },
    { id: 4, title: 'Antique Nautical Compass', slug: 'compass', currentBid: 175, timeLeft: '3h 00m', image: '', bids: 6, isLive: true },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUCTIONS — Full auction listing page for /hub/community/auctions
// ═══════════════════════════════════════════════════════════════════════════════

export function CommunityAuctionsHubPage() {
  const [auctions, setAuctions] = useState<CommunityAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Ending Soon');

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/auctions?limit=20');
        setAuctions(Array.isArray(res.data) ? res.data : res.data?.auctions || getSampleAuctions());
      } catch { setAuctions(getSampleAuctions()); }
      setLoading(false);
    };
    fetchAuctions();
  }, []);

  return (
    <CompactHubPage
      title="Live Auctions"
      subtitle="Bid on unique island items in real-time"
      emoji="🔨"
      gradient="from-amber-900 via-orange-900 to-red-900"
      items={auctions}
      loading={loading}
      filters={['All', 'Ending Soon', 'Most Bids', 'Newly Listed']}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={['Ending Soon', 'Most Bids', 'Price: Low', 'Price: High']}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="🔨"
      emptyTitle="No live auctions"
      emptyMessage="Check back later for new auctions."
      renderCard={(auction: CommunityAuction) => (
        <CompactCard
          key={auction.id}
          href={`/community/auctions#auction-${auction.id}`}
          imageUrl={auction.image}
          emoji="🔨"
          title={auction.title}
          subtitle={`$${auction.currentBid} current bid`}
          badge={auction.timeLeft}
          badgeColor="bg-red-500"
          meta={[`${auction.bids} bids`]}
          ctaLabel="Bid Now"
        />
      )}
    />
  );
}
