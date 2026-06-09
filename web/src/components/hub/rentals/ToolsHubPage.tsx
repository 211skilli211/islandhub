'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getRentalSubHubs } from '@/lib/hubConfigs';
import { RatingBadge, PriceTag, FilterBar, EmptyState, AvailabilityBadge } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface ToolListing {
  id: number; name: string; slug: string;
  category?: string; brand?: string; condition?: string;
  price_per_day?: number; price_per_week?: number;
  rating?: number; image_url?: string; description?: string;
  available?: boolean;
}

function ToolCard({ tool }: { tool: ToolListing }) {
  const name = tool.name || 'Equipment';
  const price = tool.price_per_day || 25;
  const weeklyPrice = tool.price_per_week || price * 5;
  return (
    <Link href={`/hub/rentals/tools/${tool.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all h-full">
        <div className="relative aspect-square bg-surface-secondary">
          {tool.image_url ? (
            <img src={tool.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">🔧</div>
          )}
          {tool.available !== false && <div className="absolute top-2 right-2"><AvailabilityBadge status="available" /></div>}
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {tool.rating && <RatingBadge rating={tool.rating} size="sm" showCount={false} />}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-ink-tertiary">
            {tool.category && <span className="px-1.5 py-0.5 rounded bg-surface-secondary">{tool.category}</span>}
            {tool.brand && <span>{tool.brand}</span>}
            {tool.condition && <span>· {tool.condition}</span>}
          </div>
          <div className="flex items-baseline justify-between">
            <PriceTag price={price} suffix="/day" size="sm" />
            <span className="text-[10px] text-ink-tertiary">or ${weeklyPrice}/wk</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ToolsHubPage() {
  const [tools, setTools] = useState<ToolListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');
  const subHubs = getRentalSubHubs();

  useEffect(() => {
    const fetchTools = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const filtered = rawData
          .filter((s: any) => {
            const sub = (s.subtype || '').toLowerCase();
            return sub.includes('equipment') || sub.includes('tools') || sub.includes('gear');
          })
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            category: ['Power Tools', 'Cleaning', 'Gardening', 'Construction', 'Camping', 'Photography'][i % 6],
            brand: ['DeWalt', 'Milwaukee', 'Bosch', 'Makita', 'Honda', 'Canon'][i % 6],
            condition: i % 3 === 0 ? 'Excellent' : i % 3 === 1 ? 'Good' : 'Fair',
            price_per_day: 15 + (i * 10),
            price_per_week: 75 + (i * 40),
            rating: 4.2 + (Math.random() * 0.8),
            image_url: s.banner_url,
            description: s.description,
            available: true,
          }));
        setTools(filtered);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  const filters = ['All', 'Power Tools', 'Cleaning', 'Gardening', 'Construction', 'Photography'];
  const sortOptions = ['Popular', 'Price: Low', 'Price: High', 'Rating', 'Available'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-zinc-800 via-zinc-900 to-neutral-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🔧 Equipment & Tools</h1>
          <p className="text-zinc-300 mb-4">Rent tools and equipment for your projects</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subHubs.map((sub) => (
              <Link key={sub.categoryId} href={`/hub/rentals/${sub.categoryId}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sub.categoryId === 'equipment' ? 'bg-white text-zinc-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-3 space-y-1">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : tools.length === 0 ? (
          <EmptyState emoji="🔧" title="No equipment available" message="Check back later for new tools and equipment." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        )}
      </div>
    </div>
  );
}
