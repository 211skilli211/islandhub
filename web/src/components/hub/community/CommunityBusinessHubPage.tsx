'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY BUSINESS — Business directory hub page
// Links to /community/business
// Filters: All, Food, Technology, Real Estate, Tourism, Professional, Retail, Healthcare
// ═══════════════════════════════════════════════════════════════════════════════

interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo_url: string;
  cover_image_url: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  employee_count: string;
  address: string;
  phone: string;
  website: string;
  founded_year: number;
}

const CATEGORIES = ['All', 'Food', 'Technology', 'Real Estate', 'Tourism', 'Professional', 'Retail', 'Healthcare'];
const SORT_OPTIONS = ['Rating', 'Reviews', 'Name'];

const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍽️',
  technology: '💻',
  'real estate': '🏠',
  tourism: '🌴',
  professional: '💼',
  retail: '🛍️',
  healthcare: '🏥',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  food: 'bg-orange-500',
  technology: 'bg-blue-500',
  'real estate': 'bg-green-500',
  tourism: 'bg-teal-500',
  professional: 'bg-indigo-500',
  retail: 'bg-pink-500',
  healthcare: 'bg-red-500',
};

export function CommunityBusinessHubPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Rating');

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const res = await api.get('/community/businesses?limit=20');
        setBusinesses(Array.isArray(res.data) ? res.data : res.data?.businesses || getSampleBusinesses());
      } catch {
        setBusinesses(getSampleBusinesses());
      }
      setLoading(false);
    };
    fetchBusinesses();
  }, []);

  const filtered = activeFilter === 'All'
    ? businesses
    : businesses.filter(b => b.category.toLowerCase() === activeFilter.toLowerCase());

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Rating') return b.rating - a.rating;
    if (activeSort === 'Reviews') return b.review_count - a.review_count;
    return a.name.localeCompare(b.name);
  });

  return (
    <CompactHubPage
      title="Business Directory"
      subtitle="Discover and connect with verified local businesses across the Caribbean"
      emoji="🏢"
      gradient="from-slate-900 via-blue-900 to-indigo-900"
      items={sorted}
      loading={loading}
      skeletonCount={8}
      filters={CATEGORIES}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="🏢"
      emptyTitle="No businesses found"
      emptyMessage="Try a different category or check back later."
      renderCard={(biz: Business) => {
        const catKey = biz.category.toLowerCase();
        return (
          <CompactCard
            key={biz.id}
            href={`/community/business/${biz.slug}`}
            imageUrl={biz.cover_image_url || biz.logo_url}
            emoji={CATEGORY_EMOJIS[catKey] || '🏢'}
            title={biz.name}
            subtitle={biz.address}
            badge={biz.is_verified ? 'Verified' : biz.category}
            badgeColor={biz.is_verified ? 'bg-blue-600' : (CATEGORY_BADGE_COLORS[catKey] || 'bg-gray-500')}
            rating={biz.rating}
            reviewCount={biz.review_count}
            meta={[
              biz.employee_count,
              biz.category,
            ]}
            ctaLabel="View Details"
          />
        );
      }}
      ctaSection={
        <section className="py-8 border-t border-border-primary text-center">
          <h3 className="text-lg font-bold text-ink-primary mb-2">Own a Business?</h3>
          <p className="text-sm text-ink-tertiary mb-4 max-w-md mx-auto">
            Get listed in our directory and reach thousands of customers across the islands.
          </p>
          <Link
            href="/community/business/claim"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
          >
            Claim Your Business →
          </Link>
        </section>
      }
    />
  );
}

// ─── Sample Data ────────────────────────────────────────────────────────────

function getSampleBusinesses(): Business[] {
  return [
    {
      id: 1, name: 'Caribbean Tech Solutions', slug: 'caribbean-tech',
      category: 'Technology', description: 'Full-service IT consulting and software development for Caribbean businesses.',
      logo_url: '', cover_image_url: '', rating: 4.8, review_count: 124, is_verified: true,
      employee_count: '50-100', address: 'Basseterre, St. Kitts', phone: '+18695550101',
      website: 'caribbeantech.com', founded_year: 2015,
    },
    {
      id: 2, name: 'Island Bistro & Grill', slug: 'island-bistro',
      category: 'Food', description: 'Farm-to-table dining with fresh local ingredients and ocean views.',
      logo_url: '', cover_image_url: '', rating: 4.6, review_count: 312, is_verified: true,
      employee_count: '10-25', address: 'The Valley, Anguilla', phone: '+12645550102',
      website: 'islandbistro.com', founded_year: 2018,
    },
    {
      id: 3, name: 'Paradise Real Estate', slug: 'paradise-re',
      category: 'Real Estate', description: 'Luxury property sales and rentals across the Caribbean islands.',
      logo_url: '', cover_image_url: '', rating: 4.5, review_count: 89, is_verified: true,
      employee_count: '25-50', address: 'St. John\'s, Antigua', phone: '+12685550103',
      website: 'paradiserealestate.com', founded_year: 2008,
    },
    {
      id: 4, name: 'Azure Bay Resort & Spa', slug: 'azure-bay',
      category: 'Tourism', description: 'Award-winning beachfront resort with world-class spa services.',
      logo_url: '', cover_image_url: '', rating: 4.9, review_count: 567, is_verified: true,
      employee_count: '100-250', address: 'Providenciales, TCI', phone: '+16495550104',
      website: 'azurebay.com', founded_year: 2010,
    },
    {
      id: 5, name: 'Island Legal Partners', slug: 'island-legal',
      category: 'Professional', description: 'Corporate law, immigration, and business formation services.',
      logo_url: '', cover_image_url: '', rating: 4.7, review_count: 56, is_verified: true,
      employee_count: '10-25', address: 'Road Town, BVI', phone: '+12845550105',
      website: 'islandlegal.com', founded_year: 2012,
    },
    {
      id: 6, name: 'Tropical Threads Boutique', slug: 'tropical-threads',
      category: 'Retail', description: 'Curated Caribbean fashion, jewelry, and artisan crafts.',
      logo_url: '', cover_image_url: '', rating: 4.4, review_count: 198, is_verified: false,
      employee_count: '5-10', address: 'Charlestown, Nevis', phone: '+18695550106',
      website: 'tropicalthreads.com', founded_year: 2020,
    },
    {
      id: 7, name: 'Island Health Clinic', slug: 'island-health',
      category: 'Healthcare', description: 'Comprehensive medical services with telehealth options.',
      logo_url: '', cover_image_url: '', rating: 4.3, review_count: 145, is_verified: true,
      employee_count: '25-50', address: 'St. George\'s, Grenada', phone: '+14735550107',
      website: 'islandhealth.com', founded_year: 2005,
    },
    {
      id: 8, name: 'Coastal Code Academy', slug: 'coastal-code',
      category: 'Technology', description: 'Coding bootcamps and tech training for Caribbean youth.',
      logo_url: '', cover_image_url: '', rating: 4.9, review_count: 78, is_verified: true,
      employee_count: '5-10', address: 'Kingstown, St. Vincent', phone: '+17845550108',
      website: 'coastalcode.com', founded_year: 2021,
    },
  ];
}
