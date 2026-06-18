'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import { RatingBadge } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY MARKETPLACE — Listings hub page
// Links to /community/marketplace
// Filters: All, Electronics, Fashion, Home, Sports, Services, Vehicles
// ═══════════════════════════════════════════════════════════════════════════════

interface Listing {
  id: number;
  title: string;
  slug: string;
  price: number;
  original_price?: number;
  currency: string;
  condition: string;
  category: string;
  image_url: string;
  seller_name: string;
  seller_rating: number;
  seller_review_count: number;
  location: string;
  is_featured: boolean;
  is_negotiable: boolean;
  posted_at: string;
}

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Services', 'Vehicles'];
const SORT_OPTIONS = ['Newest', 'Price: Low', 'Price: High', 'Popular'];

const CATEGORY_EMOJIS: Record<string, string> = {
  electronics: '📱',
  fashion: '👗',
  home: '🏠',
  sports: '⚽',
  services: '🔧',
  vehicles: '🚗',
};

const CONDITION_COLORS: Record<string, string> = {
  'new': 'bg-green-500',
  'like-new': 'bg-emerald-500',
  'good': 'bg-blue-500',
  'fair': 'bg-amber-500',
};

function formatCondition(condition: string) {
  return condition.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatPostedDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CommunityMarketplaceHubPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Newest');

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/community/marketplace/listings?limit=20');
        setListings(Array.isArray(res.data) ? res.data : res.data?.listings || getSampleListings());
      } catch {
        setListings(getSampleListings());
      }
      setLoading(false);
    };
    fetchListings();
  }, []);

  const filtered = activeFilter === 'All'
    ? listings
    : listings.filter(l => l.category.toLowerCase() === activeFilter.toLowerCase());

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === 'Price: Low') return a.price - b.price;
    if (activeSort === 'Price: High') return b.price - a.price;
    if (activeSort === 'Popular') return b.seller_rating - a.seller_rating;
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  return (
    <CompactHubPage
      title="Marketplace"
      subtitle="Buy and sell with your island community — great deals on everything"
      emoji="🛒"
      gradient="from-emerald-900 via-teal-900 to-cyan-900"
      items={sorted}
      loading={loading}
      skeletonCount={8}
      filters={CATEGORIES}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={SORT_OPTIONS}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="🛒"
      emptyTitle="No listings found"
      emptyMessage="Try a different category or be the first to list something!"
      renderCard={(listing: Listing) => {
        const catKey = listing.category.toLowerCase();
        return (
          <CompactCard
            key={listing.id}
            href={`/community/marketplace/${listing.slug}`}
            imageUrl={listing.image_url}
            emoji={CATEGORY_EMOJIS[catKey] || '📦'}
            title={listing.title}
            subtitle={listing.location}
            price={listing.price}
            priceSuffix=""
            originalPrice={listing.original_price}
            rating={listing.seller_rating}
            reviewCount={listing.seller_review_count}
            badge={formatCondition(listing.condition)}
            badgeColor={CONDITION_COLORS[listing.condition.toLowerCase()] || 'bg-gray-500'}
            meta={[
              listing.is_negotiable ? 'Negotiable' : 'Fixed',
              formatPostedDate(listing.posted_at),
            ]}
            ctaLabel="View Listing"
          />
        );
      }}
      ctaSection={
        <section className="py-8 border-t border-border-primary text-center">
          <h3 className="text-lg font-bold text-ink-primary mb-2">Have Something to Sell?</h3>
          <p className="text-sm text-ink-tertiary mb-4 max-w-md mx-auto">
            List your item for free and reach thousands of buyers in your community.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/community/marketplace/sell"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors"
            >
              Sell an Item →
            </Link>
            <Link
              href="/community/marketplace/my-listings"
              className="inline-flex items-center px-5 py-2.5 rounded-lg bg-surface-elevated border border-border-primary text-ink-primary text-sm font-semibold hover:border-accent-500/30 transition-colors"
            >
              My Listings
            </Link>
          </div>
        </section>
      }
    />
  );
}

// ─── Sample Data ────────────────────────────────────────────────────────────

function getSampleListings(): Listing[] {
  return [
    {
      id: 1, title: 'iPhone 15 Pro Max — 256GB', slug: 'iphone-15-pro',
      price: 950, original_price: 1199, currency: '$', condition: 'Like-new',
      category: 'Electronics', image_url: '', seller_name: 'TechDeals SKN',
      seller_rating: 4.8, seller_review_count: 156, location: 'Basseterre, St. Kitts',
      is_featured: true, is_negotiable: true, posted_at: '2026-07-06T08:00:00',
    },
    {
      id: 2, title: 'Designer Handbag Collection', slug: 'designer-bags',
      price: 350, currency: '$', condition: 'New',
      category: 'Fashion', image_url: '', seller_name: 'Island Luxe',
      seller_rating: 4.5, seller_review_count: 42, location: 'St. John\'s, Antigua',
      is_featured: false, is_negotiable: true, posted_at: '2026-07-05T14:00:00',
    },
    {
      id: 3, title: 'Antique Wooden Dining Table', slug: 'dining-table',
      price: 200, currency: '$', condition: 'Good',
      category: 'Home', image_url: '', seller_name: 'Vintage Finds',
      seller_rating: 4.2, seller_review_count: 18, location: 'Roseau, Dominica',
      is_featured: false, is_negotiable: true, posted_at: '2026-07-04T10:00:00',
    },
    {
      id: 4, title: 'Surfboard — 6\'2" Shortboard', slug: 'surfboard-62',
      price: 180, original_price: 450, currency: '$', condition: 'Good',
      category: 'Sports', image_url: '', seller_name: 'Wave Riders',
      seller_rating: 4.9, seller_review_count: 89, location: 'The Valley, Anguilla',
      is_featured: false, is_negotiable: false, posted_at: '2026-07-06T06:00:00',
    },
    {
      id: 5, title: 'Scooter Repair Service', slug: 'scooter-repair',
      price: 50, currency: '$', condition: 'New',
      category: 'Services', image_url: '', seller_name: 'Fix-It Felix',
      seller_rating: 4.7, seller_review_count: 234, location: 'Kingstown, St. Vincent',
      is_featured: true, is_negotiable: true, posted_at: '2026-07-03T09:00:00',
    },
    {
      id: 6, title: '2019 Toyota Hilux — Low Miles', slug: 'toyota-hilux',
      price: 18500, currency: '$', condition: 'Good',
      category: 'Vehicles', image_url: '', seller_name: 'Island Auto Sales',
      seller_rating: 4.4, seller_review_count: 67, location: 'Port of Spain, Trinidad',
      is_featured: true, is_negotiable: true, posted_at: '2026-07-02T11:00:00',
    },
    {
      id: 7, title: 'MacBook Air M2 — 512GB', slug: 'macbook-m2',
      price: 780, original_price: 1099, currency: '$', condition: 'Like-new',
      category: 'Electronics', image_url: '', seller_name: 'TechDeals SKN',
      seller_rating: 4.8, seller_review_count: 156, location: 'Bassestere, St. Kitts',
      is_featured: false, is_negotiable: false, posted_at: '2026-07-06T10:00:00',
    },
    {
      id: 8, title: 'Ceramic Pottery Set', slug: 'pottery-set',
      price: 65, currency: '$', condition: 'New',
      category: 'Home', image_url: '', seller_name: 'Artisan Potter',
      seller_rating: 5.0, seller_review_count: 23, location: 'St. George\'s, Grenada',
      is_featured: false, is_negotiable: true, posted_at: '2026-07-01T15:00:00',
    },
  ];
}
