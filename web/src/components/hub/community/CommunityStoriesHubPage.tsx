'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Story {
  id: number; user_name: string; profile_photo_url: string;
  media_url: string; content: string; created_at: string;
  view_count: number; reaction_count: number; is_viewed: boolean;
}

const FILTERS = ['All', 'Trending', 'Recent', 'Unseen'];
const SORT_OPTIONS = ['Recent', 'Popular', 'Most Viewed'];

function timeAgo(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

export function CommunityStoriesHubPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Recent');

  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stories/feed?limit=20');
        setStories(Array.isArray(res.data) ? res.data : res.data?.stories || getSampleStories());
      } catch { setStories(getSampleStories()); }
      setLoading(false);
    };
    fetchStories();
  }, []);

  const filteredStories = activeFilter === 'All' ? stories
    : activeFilter === 'Trending' ? stories.filter(s => s.reaction_count > 50)
    : activeFilter === 'Recent' ? stories.filter(s => {
        const d = new Date(s.created_at);
        return (Date.now() - d.getTime()) < 24 * 60 * 60 * 1000;
      })
    : activeFilter === 'Unseen' ? stories.filter(s => !s.is_viewed)
    : stories;

  return (
    <CompactHubPage
      title="Community Stories"
      subtitle="Real stories and experiences from island residents"
      emoji="📸"
      gradient="from-violet-900 via-purple-900 to-fuchsia-900"
      items={stories}
      loading={loading}
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="📸"
      emptyTitle="No stories found"
      emptyMessage="Be the first to share your story!"
      renderCard={(story: Story) => (
        <CompactCard
          key={story.id}
          href={`/community/stories#story-${story.id}`}
          imageUrl={story.media_url}
          emoji={story.is_viewed ? '👀' : '<EmojiIcon emoji="✨" size={16} />'}
          title={story.user_name}
          subtitle={story.content.length > 50 ? story.content.slice(0, 50) + '...' : story.content}
          badge={timeAgo(story.created_at)}
          badgeColor="bg-violet-500"
          meta={[
            `${story.view_count} views`,
            `❤️ ${story.reaction_count}`,
          ]}
          ctaLabel="Read Story"
        />
      )}
    />
  );
}

function getSampleStories(): Story[] {
  return [
    { id: 1, user_name: 'Maria Santos', profile_photo_url: '', media_url: '', content: 'IslandHub helped me grow my catering business from 5 to 50 clients in just 3 months! The community support has been incredible.', created_at: '2026-07-05T10:00:00', view_count: 156, reaction_count: 42, is_viewed: false },
    { id: 2, user_name: 'James Wilson', profile_photo_url: '', media_url: '', content: 'Found the perfect vacation rental for my family through this platform. Amazing experience from booking to checkout!', created_at: '2026-07-05T09:00:00', view_count: 89, reaction_count: 23, is_viewed: true },
    { id: 3, user_name: 'Sarah Chen', profile_photo_url: '', media_url: '', content: 'Just launched my handmade jewelry collection! Each piece is inspired by the colors of the Caribbean sea.', created_at: '2026-07-04T15:00:00', view_count: 234, reaction_count: 67, is_viewed: false },
    { id: 4, user_name: 'David Thompson', profile_photo_url: '', media_url: '', content: 'Our beach cleanup removed 200lbs of plastic this weekend. Thank you to everyone who joined! Next one is July 20.', created_at: '2026-07-03T12:00:00', view_count: 312, reaction_count: 89, is_viewed: false },
    { id: 5, user_name: 'Lisa Park', profile_photo_url: '', media_url: '', content: 'The sunset yoga sessions have become my favorite part of the week. So peaceful. Join us every Wednesday at West Beach!', created_at: '2026-07-02T18:00:00', view_count: 178, reaction_count: 45, is_viewed: true },
    { id: 6, user_name: 'Carlos Rivera', profile_photo_url: '', media_url: '', content: 'Just listed my boat for charter on IslandHub. Already got 3 bookings in the first day! The platform is amazing for small businesses.', created_at: '2026-07-01T08:00:00', view_count: 95, reaction_count: 31, is_viewed: false },
    { id: 7, user_name: 'Emma Rodriguez', profile_photo_url: '', media_url: '', content: 'Attended my first IslandHub networking event last night. Met so many amazing entrepreneurs. Already planning collaborations!', created_at: '2026-06-30T20:00:00', view_count: 145, reaction_count: 38, is_viewed: false },
    { id: 8, user_name: 'Michael Brown', profile_photo_url: '', media_url: '', content: 'Sold my first auction item through the platform. The bidding process was smooth and the buyer was great. 5 stars!', created_at: '2026-06-29T14:00:00', view_count: 67, reaction_count: 19, is_viewed: true },
    { id: 9, user_name: 'Aisha Johnson', profile_photo_url: '', media_url: '', content: 'Our group just hit 1000 members! Thank you to everyone in the Island Foodies community. Let\'s keep sharing recipes!', created_at: '2026-06-28T11:00:00', view_count: 423, reaction_count: 156, is_viewed: false },
    { id: 10, user_name: 'Tom Henderson', profile_photo_url: '', media_url: '', content: 'The virtual investment seminar I hosted through IslandHub had 150+ attendees. The future of community learning is here.', created_at: '2026-06-27T09:00:00', view_count: 156, reaction_count: 42, is_viewed: false },
  ];
}
