'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

interface SeaItem {
  id: number; name: string; slug: string;
  boat_type?: string; capacity?: number; captain_included?: boolean;
  price_half_day?: number; price_full_day?: number;
  rating?: number; image_url?: string; location?: string;
}

export default function SeaHubPage() {
  const [items, setItems] = useState<SeaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?category=rental&sub_category=boat,sea&limit=20')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.listings || [];
        setItems(raw.slice(0, 12).map((s: any, i: number) => ({
          id: s.store_id || s.id, name: s.name || s.business_name, slug: s.slug,
          boat_type: s.boat_type || ['Yacht', 'Speedboat', 'Catamaran', 'Jet Ski', 'Sailboat'][i % 5],
          capacity: s.capacity || [4, 6, 8, 2, 10][i % 5],
          captain_included: i % 2 === 0,
          price_half_day: s.price_half_day || 100 + (i * 25),
          price_full_day: s.price_full_day || 180 + (i * 40),
          rating: s.rating || (4.0 + Math.random()),
          image_url: s.image_url || s.banner_url,
          location: s.location || 'Basseterre',
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage
      title="Boat & Sea Rentals"
      subtitle="Boats, jet skis, and watercraft for your island adventure"
      emoji="🚤"
      gradient="from-cyan-900 via-blue-900 to-indigo-900"
      items={items}
      loading={loading}
      filters={['All', 'Yacht', 'Speedboat', 'Catamaran', 'Sailboat']}
      activeFilter="All"
      onFilterChange={() => {}}
      sortOptions={['Popular', 'Price: Low', 'Capacity']}
      activeSort="Popular"
      onSortChange={() => {}}
      emptyEmoji="🚤"
      emptyTitle="No boats available"
      emptyMessage="Check back later for new boat listings."
      renderCard={(item, i) => (
        <CompactCard
          key={item.id}
          href={`/hub/rentals/sea/${item.slug}`}
          imageUrl={item.image_url}
          emoji="🚤"
          title={item.name}
          subtitle={`${item.boat_type} . ${item.capacity} guests`}
          price={item.price_half_day}
          priceSuffix="/half day"
          rating={item.rating}
          badge={item.captain_included ? 'Captain Included' : undefined}
          badgeColor="bg-cyan-500"
          meta={item.location ? [item.location] : undefined}
        />
      )}
    />
  );
}
