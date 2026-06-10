'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

interface Group {
  id: number; name: string; slug: string;
  description: string; cover_image_url: string;
  privacy: 'public' | 'private' | 'invite_only';
  member_count: number; post_count: number;
  category?: string; is_member: boolean;
}

const FILTERS = ['All', 'Food', 'Activities', 'Business', 'Sports', 'Arts', 'Fitness'];
const SORT_OPTIONS = ['Popular', 'Newest', 'Most Active'];

function getCategoryEmoji(category: string) {
  const icons: Record<string, string> = {
    food: '🍽️', activities: '🏖️', business: '💼',
    sports: '⚽', arts: '🎨', fitness: '💪', community: '🤝',
  };
  return icons[category] || '👥';
}

export function CommunityGroupsHubPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await api.get('/groups?limit=20');
        setGroups(Array.isArray(res.data) ? res.data : res.data?.groups || getSampleGroups());
      } catch { setGroups(getSampleGroups()); }
      setLoading(false);
    };
    fetchGroups();
  }, []);

  const filteredGroups = activeFilter === 'All'
    ? groups
    : groups.filter(g => (g.category || '').toLowerCase() === activeFilter.toLowerCase());

  return (
    <CompactHubPage
      title="Community Groups"
      subtitle="Find your people and join the conversation"
      emoji="👥"
      gradient="from-teal-900 via-cyan-900 to-blue-900"
      items={groups}
      loading={loading}
      filters={FILTERS}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="👥"
      emptyTitle="No groups found"
      emptyMessage="Start a group and bring people together!"
      renderCard={(group: Group) => (
        <CompactCard
          key={group.id}
          href={`/community/groups#group-${group.id}`}
          imageUrl={group.cover_image_url}
          emoji={getCategoryEmoji(group.category || 'community')}
          title={group.name}
          subtitle={group.privacy === 'private' ? '🔒 Private Group' : group.privacy === 'invite_only' ? '🔐 Invite Only' : '🌐 Public Group'}
          badge={`${group.member_count.toLocaleString()} members`}
          badgeColor="bg-teal-500"
          meta={[`${group.post_count} posts`]}
          ctaLabel={group.is_member ? 'View' : 'Join'}
        />
      )}
    />
  );
}

function getSampleGroups(): Group[] {
  return [
    { id: 1, name: 'Island Foodies', slug: 'island-foodies', description: 'Share recipes, discover local restaurants, and connect with food lovers.', cover_image_url: '', privacy: 'public', member_count: 1250, post_count: 342, category: 'food', is_member: false },
    { id: 2, name: 'Water Sports Enthusiasts', slug: 'water-sports', description: 'From surfing to diving, share your aquatic adventures.', cover_image_url: '', privacy: 'public', member_count: 890, post_count: 156, category: 'activities', is_member: true },
    { id: 3, name: 'Local Business Network', slug: 'biz-network', description: 'Connect with local entrepreneurs, share tips, and grow.', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 89, category: 'business', is_member: false },
    { id: 4, name: 'Beach Cleanup Crew', slug: 'cleanup-crew', description: 'Join monthly beach cleanup events and keep our shores beautiful.', cover_image_url: '', privacy: 'public', member_count: 234, post_count: 45, category: 'community', is_member: false },
    { id: 5, name: 'Island Artists Collective', slug: 'artists-collective', description: 'Showcase your art, collaborate with fellow creators.', cover_image_url: '', privacy: 'public', member_count: 345, post_count: 78, category: 'arts', is_member: false },
    { id: 6, name: 'Real Estate & Rentals', slug: 'real-estate', description: 'Find your dream home or list your property.', cover_image_url: '', privacy: 'private', member_count: 678, post_count: 123, category: 'business', is_member: false },
    { id: 7, name: 'Football League', slug: 'football', description: 'Local football matches and tournaments.', cover_image_url: '', privacy: 'public', member_count: 456, post_count: 234, category: 'sports', is_member: false },
    { id: 8, name: 'Yoga & Wellness', slug: 'yoga-wellness', description: 'Daily yoga sessions and wellness tips.', cover_image_url: '', privacy: 'public', member_count: 567, post_count: 189, category: 'fitness', is_member: true },
    { id: 9, name: 'Photography Club', slug: 'photography', description: 'Share your best shots and learn new techniques.', cover_image_url: '', privacy: 'public', member_count: 389, post_count: 567, category: 'arts', is_member: false },
    { id: 10, name: 'Investment Club', slug: 'investment', description: 'Learn about investing and grow your wealth.', cover_image_url: '', privacy: 'invite_only', member_count: 123, post_count: 45, category: 'business', is_member: false },
    { id: 11, name: 'Surfing & Board Sports', slug: 'surfing', description: 'Find the best surf spots and share your rides.', cover_image_url: '', privacy: 'public', member_count: 234, post_count: 89, category: 'sports', is_member: false },
    { id: 12, name: 'Cooking & Recipes', slug: 'cooking', description: 'Share recipes and cooking tips from around the island.', cover_image_url: '', privacy: 'public', member_count: 789, post_count: 456, category: 'food', is_member: false },
  ];
}
