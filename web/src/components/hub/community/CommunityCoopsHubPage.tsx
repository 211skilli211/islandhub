'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY COOPERATIVES — Co-ops hub page
// Links to /community/coops
// Filters: All, Retail, Agriculture, Transportation, Technology, Professional
// ═══════════════════════════════════════════════════════════════════════════════

interface Cooperative {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  member_count: number;
  savings_pct: number;
  location: string;
  founded_year: number;
  is_recruiting: boolean;
  website: string;
}

const CATEGORIES = ['All', 'Retail', 'Agriculture', 'Transportation', 'Technology', 'Professional'];
const SORT_OPTIONS = ['Members', 'Savings', 'Name'];

const CATEGORY_EMOJIS: Record<string, string> = {
  retail: '🛒',
  agriculture: '🌾',
  transportation: '🚐',
  technology: '💻',
  professional: '🤝',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  retail: 'bg-rose-500',
  agriculture: 'bg-amber-500',
  transportation: 'bg-cyan-500',
  technology: 'bg-violet-500',
  professional: 'bg-emerald-500',
};

export function CommunityCoopsHubPage() {
  const [coops, setCoops] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Members');

  useEffect(() => {
    const fetchCoops = async () => {
      setLoading(true);
      try {
        const res = await api.get('/community/cooperatives?limit=20');
        setCoops(Array.isArray(res.data) ? res.data : res.data?.cooperatives || getSampleCoops());
      } catch {
        setCoops(getSampleCoops());
      }
      setLoading(false);
    };
    fetchCoops();
  }, []);

  const filtered = activeFilter === 'All'
    ? coops
    : coops.filter(c => c.category.toLowerCase() === activeFilter.toLowerCase());

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Members') return b.member_count - a.member_count;
    if (activeSort === 'Savings') return b.savings_pct - a.savings_pct;
    return a.name.localeCompare(b.name);
  });

  return (
    <CompactHubPage
      title="Cooperatives"
      subtitle="Member-owned businesses saving money and building community together"
      emoji="🤝"
      gradient="from-amber-900 via-orange-900 to-yellow-900"
      items={sorted}
      loading={loading}
      skeletonCount={8}
      filters={CATEGORIES}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="🤝"
      emptyTitle="No cooperatives found"
      emptyMessage="Try a different category or start your own cooperative."
      renderCard={(coop: Cooperative) => {
        const catKey = coop.category.toLowerCase();
        return (
          <CompactCard
            key={coop.id}
            href={`/community/coops/${coop.slug}`}
            imageUrl={coop.cover_image_url || coop.logo_url}
            emoji={CATEGORY_EMOJIS[catKey] || '🤝'}
            title={coop.name}
            subtitle={coop.location}
            badge={`${coop.savings_pct}% savings`}
            badgeColor="bg-amber-600"
            meta={[
              `${coop.member_count.toLocaleString()} members`,
              coop.category,
              coop.is_recruiting ? 'Recruiting' : 'Active',
            ]}
            ctaLabel="Learn More"
          />
        );
      }}
      ctaSection={
        <section className="py-8 border-t border-border-primary text-center">
          <h3 className="text-lg font-bold text-ink-primary mb-2">Start a Cooperative</h3>
          <p className="text-sm text-ink-tertiary mb-4 max-w-md mx-auto">
            Join forces with your neighbors to save money and build a stronger local economy.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/community/coops/create"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
            >
              Start a Co-op →
            </Link>
            <Link
              href="/community/coops/about"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-surface-elevated border border-border-primary text-ink-primary text-sm font-semibold hover:border-accent-500/30 transition-colors"
            >
              How It Works
            </Link>
          </div>
        </section>
      }
    />
  );
}

// ─── Sample Data ────────────────────────────────────────────────────────────

function getSampleCoops(): Cooperative[] {
  return [
    {
      id: 1, name: 'Island Grocery Co-op', slug: 'island-grocery',
      category: 'Retail', description: 'Bulk buying cooperative for fresh produce and household essentials.',
      logo_url: '', cover_image_url: '', member_count: 1250, savings_pct: 22,
      location: 'St. John\'s, Antigua', founded_year: 2016, is_recruiting: true,
      website: 'islandgrocery.coop',
    },
    {
      id: 2, name: 'Caribbean Farmers Alliance', slug: 'farmers-alliance',
      category: 'Agriculture', description: 'Collective farming, shared equipment, and direct market access.',
      logo_url: '', cover_image_url: '', member_count: 890, savings_pct: 30,
      location: 'Roseau, Dominica', founded_year: 2014, is_recruiting: true,
      website: 'farmersalliance.coop',
    },
    {
      id: 3, name: 'Island Transit Cooperative', slug: 'island-transit',
      category: 'Transportation', description: 'Member-owned bus and shuttle services connecting island communities.',
      logo_url: '', cover_image_url: '', member_count: 340, savings_pct: 18,
      location: 'Basseterre, St. Kitts', founded_year: 2019, is_recruiting: false,
      website: 'islandtransit.coop',
    },
    {
      id: 4, name: 'Tech Services Collective', slug: 'tech-collective',
      category: 'Technology', description: 'Shared IT infrastructure and web services for small businesses.',
      logo_url: '', cover_image_url: '', member_count: 156, savings_pct: 35,
      location: 'Kingstown, St. Vincent', founded_year: 2021, is_recruiting: true,
      website: 'techcollective.coop',
    },
    {
      id: 5, name: 'Island Professionals Network', slug: 'pro-network',
      category: 'Professional', description: 'Freelancers and consultants sharing resources and referrals.',
      logo_url: '', cover_image_url: '', member_count: 425, savings_pct: 25,
      location: 'Port of Spain, Trinidad', founded_year: 2018, is_recruiting: true,
      website: 'profnetwork.coop',
    },
    {
      id: 6, name: 'Home Goods Buying Club', slug: 'home-goods',
      category: 'Retail', description: 'Group purchasing for furniture, appliances, and home supplies.',
      logo_url: '', cover_image_url: '', member_count: 670, savings_pct: 20,
      location: 'Castries, St. Lucia', founded_year: 2017, is_recruiting: false,
      website: 'homegoods.coop',
    },
    {
      id: 7, name: 'Fishermen\'s Cooperative', slug: 'fishermen-coop',
      category: 'Agriculture', description: 'Sustainable fishing cooperative with shared cold storage and distribution.',
      logo_url: '', cover_image_url: '', member_count: 210, savings_pct: 28,
      location: 'Codrington, Barbuda', founded_year: 2015, is_recruiting: true,
      website: 'fishermen.coop',
    },
    {
      id: 8, name: 'Clean Energy Co-op', slug: 'clean-energy',
      category: 'Technology', description: 'Community-owned solar installations and energy sharing.',
      logo_url: '', cover_image_url: '', member_count: 180, savings_pct: 40,
      location: 'Road Town, BVI', founded_year: 2022, is_recruiting: true,
      website: 'cleanenergy.coop',
    },
  ];
}
