'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RatingBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface Group {
  id: number; name: string; slug: string;
  category?: string; member_count?: number;
  description?: string; image_url?: string;
  is_active?: boolean;
}

function GroupCard({ group }: { group: Group }) {
  const name = group.name || 'Group';
  return (
    <Link href={`/hub/community/groups/${group.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-2xl shrink-0">
            {group.image_url ? (
              <img src={group.image_url} alt={name} className="w-full h-full object-cover rounded-2xl" loading="lazy" />
            ) : (
              '👥'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            <p className="text-xs text-ink-tertiary mt-0.5">{group.category || 'Community Group'}</p>
            {group.description && <p className="text-xs text-ink-secondary mt-1 line-clamp-2">{group.description}</p>}
            <div className="flex items-center gap-3 mt-2 text-xs text-ink-tertiary">
              {group.member_count && <span>👥 {group.member_count} members</span>}
              {group.is_active && <span className="text-emerald-500 font-medium">● Active</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityGroupsHubPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/search/featured?type=community&limit=12')
      .then((res: any) => setGroups(res.data?.groups || res.data || []))
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-white mb-3">
            👥 Community Groups
          </motion.h1>
          <p className="text-lg text-teal-200 max-w-2xl mx-auto">
            Interest-based groups and clubs across the Caribbean.
          </p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <FilterBar filters={['All', 'Active', 'New', 'Popular']} sortOptions={['Members', 'Active', 'Newest']} activeSort="Members" onSortChange={() => {}} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-surface-secondary animate-pulse" />
                  <div className="flex-1"><div className="h-4 bg-surface-secondary rounded animate-pulse w-1/2" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <EmptyState emoji="👥" title="No groups yet" message="Start a group and bring the community together!" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.map((g) => <GroupCard key={g.id} group={g} />)}
          </div>
        )}
      </div>
    </div>
  );
}
