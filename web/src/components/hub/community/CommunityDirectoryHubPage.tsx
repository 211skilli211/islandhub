'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface CommunityOrg {
  id: number; name: string; slug: string;
  org_type?: string; member_count?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
}

function OrgCard({ org }: { org: CommunityOrg }) {
  const name = org.name || 'Organization';
  return (
    <Link href={`/hub/community/directory/${org.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4 hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-lg shrink-0">🏛️</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{org.org_type || 'Community Organization'}</p>
              </div>
              {org.rating && <RatingBadge rating={org.rating} reviewCount={org.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-ink-tertiary">
              {org.member_count && <span>👥 {org.member_count} members</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityDirectoryHubPage() {
  const [orgs, setOrgs] = useState<CommunityOrg[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['community_org', 'nonprofit', 'club', 'association'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            org_type: ['Non-Profit', 'Sports Club', 'Cultural Assoc', 'Youth Group', 'Senior Club', 'Volunteer'][i % 6],
            member_count: 20 + (i * 15),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 5 + Math.floor(Math.random() * 30),
            image_url: s.banner_url,
            description: s.description,
          }));
        setOrgs(filtered);
      } catch (error) { console.error('Failed to fetch community orgs:', error); }
      finally { setLoading(false); }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🏛️ Community Directory</h1>
          <p className="text-violet-200 mb-4">Local organizations, clubs, and nonprofits</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'community', label: 'Community' },
              { id: 'environment', label: 'Environment' },
              { id: 'education', label: 'Education' },
              { id: 'health', label: 'Health' },
              { id: 'sports', label: 'Sports' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/community/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cat.id === 'community' ? 'bg-white text-violet-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar filters={['All', 'Non-Profit', 'Sports', 'Cultural', 'Youth']}
          activeFilter="All" onFilterChange={() => {}}
          sortOptions={['Members', 'Rating', 'Newest']} activeSort="Members" onSortChange={() => {}} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-surface-secondary animate-pulse" />
                  <div className="flex-1"><div className="h-4 bg-surface-secondary rounded animate-pulse w-1/3" /></div>
                </div>
              </div>
            ))}
          </div>
        ) : orgs.length === 0 ? (
          <EmptyState emoji="🏛️" title="No organizations found" message="Check back later for community listings." />
        ) : (
          <div className="space-y-3">
            {orgs.map((o) => <OrgCard key={o.id} org={o} />)}
          </div>
        )}
      </div>
    </div>
  );
}
