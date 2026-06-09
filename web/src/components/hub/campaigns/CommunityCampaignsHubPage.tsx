'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PriceTag, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface CampaignItem {
  id: number; name: string; slug: string;
  cause_type?: string; raised?: number; goal?: number;
  days_left?: number; supporters?: number;
  image_url?: string; description?: string;
}

function CampaignCard({ campaign }: { campaign: CampaignItem }) {
  const name = campaign.name || 'Campaign';
  const img = campaign.image_url ? getImageUrl(campaign.image_url) : undefined;
  const pct = campaign.goal ? Math.min(100, Math.round((campaign.raised || 0) / campaign.goal * 100)) : 0;

  return (
    <Link href={`/hub/campaigns/community/${campaign.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/10] bg-gradient-to-br from-rose-800 to-pink-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">❤️</div>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-full bg-white/90 text-ink-primary text-[10px] font-bold">{campaign.cause_type || 'Community'}</span>
          </div>
        </div>
        <div className="p-4 space-y-2">
          <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-ink-primary">${campaign.raised || 0} raised</span>
              <span className="text-ink-tertiary">of ${campaign.goal || 0}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-ink-tertiary">
            {campaign.supporters && <span>👥 {campaign.supporters} supporters</span>}
            {campaign.days_left && <span className="text-amber-500 font-medium">⏰ {campaign.days_left} days left</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CampaignsHubPage({ category, title, subtitle, emoji, gradient, subtypes }: {
  category: string; title: string; subtitle: string; emoji: string; gradient: string; subtypes: string[];
}) {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
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
            cause_type: ['Community Project', 'Environmental', 'Education', 'Health', 'Animal Welfare', 'Arts'][i % 6],
            raised: 500 + (i * 300),
            goal: 2000 + (i * 1000),
            days_left: [7, 14, 21, 3, 30, 10, 5, 45, 12, 8][i % 10],
            supporters: 15 + (i * 10),
            image_url: s.banner_url,
            description: s.description,
          }));
        setCampaigns(filtered);
      } catch (error) { console.error(`Failed to fetch ${category} campaigns:`, error); }
      finally { setLoading(false); }
    };
    fetchCampaigns();
  }, [category]);

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className={`bg-gradient-to-br ${gradient} py-12 px-4`}>
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
              <Link key={cat.id} href={`/hub/campaigns/${cat.id}`}
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
        <FilterBar filters={['All', 'Urgent', 'Newest', 'Most Funded']}
          activeFilter="All" onFilterChange={() => {}}
          sortOptions={['Most Urgent', 'Most Funded', 'Newest']} activeSort="Most Urgent" onSortChange={() => {}} />
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
        ) : campaigns.length === 0 ? (
          <EmptyState emoji={emoji} title={`No ${category} campaigns`} message="Check back later for new campaigns." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommunityCampaignsHubPage() {
  return <CampaignsHubPage category="community" title="Community Fundraisers" subtitle="Local community projects and causes"
    emoji="❤️" gradient="from-rose-900 via-pink-900 to-red-900" subtypes={['community', 'local', 'neighborhood']} />;
}
