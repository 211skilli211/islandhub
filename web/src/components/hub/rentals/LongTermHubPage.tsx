'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRentalSubHubs } from '@/lib/hubConfigs';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface LongTermListing {
  id: number; name: string; slug: string;
  property_type?: string; bedrooms?: number; bathrooms?: number;
  price_per_month?: number; available_date?: string;
  pet_policy?: string; parking?: string;
  image_url?: string; description?: string;
}

function LongTermCard({ listing }: { listing: LongTermListing }) {
  const name = listing.name || listing.property_type || 'Apartment';
  const price = listing.price_per_month || 800;
  return (
    <Link href={`/hub/rentals/longterm/${listing.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[16/9] bg-surface-secondary">
          {listing.image_url ? (
            <img src={listing.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🏢</div>
          )}
          {listing.available_date && (
            <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 text-ink-primary text-[10px] font-bold">
              Available {listing.available_date}
            </span>
          )}
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            <PriceTag price={price} suffix="/month" size="sm" />
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary">
            {listing.bedrooms && <span>{listing.bedrooms} beds</span>}
            {listing.bathrooms && <span>· {listing.bathrooms} baths</span>}
            {listing.pet_policy && <span>· {listing.pet_policy}</span>}
          </div>
          <div className="flex flex-wrap gap-1">
            {listing.parking && <span className="px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-ink-tertiary">{listing.parking}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function LongTermHubPage() {
  const [listings, setListings] = useState<LongTermListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Price: Low');
  const subHubs = getRentalSubHubs();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const filtered = rawData
          .filter((s: any) => {
            const sub = (s.subtype || '').toLowerCase();
            return sub.includes('long_term') || sub.includes('monthly') || sub.includes('apartment');
          })
          .slice(0, 8)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            property_type: ['Apartment', 'House', 'Condo', 'Studio', 'Townhouse'][i % 5],
            bedrooms: 1 + (i % 4),
            bathrooms: 1 + (i % 2),
            price_per_month: 600 + (i * 200),
            available_date: ['Jun 1', 'Jul 15', 'Aug 1', 'Immediate'][i % 4],
            pet_policy: i % 2 === 0 ? 'Pets OK' : 'No pets',
            parking: ['Garage', 'Street', 'Lot', 'None'][i % 4],
            image_url: s.banner_url,
            description: s.description,
          }));
        setListings(filtered);
      } catch (error) {
        console.error('Failed to fetch long-term listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filters = ['All', '1 Bed', '2 Bed', '3+ Bed', 'Pets OK', 'Parking'];
  const sortOptions = ['Price: Low', 'Price: High', 'Newest', 'Available Soon'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-slate-800 via-slate-900 to-zinc-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🏢 Long-Term Rentals</h1>
          <p className="text-slate-300 mb-4">Monthly and annual leases across St. Kitts & Nevis</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subHubs.map((sub) => (
              <Link key={sub.categoryId} href={`/hub/rentals/${sub.categoryId}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sub.categoryId === 'longterm' ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                {sub.pageTitle}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterBar filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter}
          sortOptions={sortOptions} activeSort={activeSort} onSortChange={setActiveSort} />
      </div>
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/9] bg-surface-secondary animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState emoji="🏢" title="No long-term rentals" message="Check back later for new lease listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {listings.map((listing) => <LongTermCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </div>
    </div>
  );
}
