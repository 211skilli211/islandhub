'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

interface ToolItem {
  id: number; name: string; slug: string;
  category?: string; brand?: string; condition?: string;
  price_per_day?: number; price_per_week?: number;
  rating?: number; image_url?: string; available?: boolean;
}

export default function ToolsHubPage() {
  const [items, setItems] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?category=rental&sub_category=equipment,tools&limit=20')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.listings || [];
        setItems(raw.slice(0, 12).map((s: any, i: number) => ({
          id: s.store_id || s.id, name: s.name || s.business_name, slug: s.slug,
          category: s.category || ['Power Tools', 'Camera', 'Sports', 'Camping', 'Party'][i % 5],
          brand: s.brand || ['Bosch', 'Canon', 'Nike', 'Coleman', 'Sony'][i % 5],
          condition: ['New', 'Good', 'Like New'][i % 3],
          price_per_day: s.price_per_day || 15 + (i * 5),
          price_per_week: s.price_per_week || 80 + (i * 20),
          rating: s.rating || (4.0 + Math.random()),
          image_url: s.image_url || s.banner_url,
          available: true,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage
      title="Equipment & Tools"
      subtitle="Tools, gear, and equipment for rent"
      emoji="🔧"
      gradient="from-amber-900 via-orange-900 to-red-900"
      items={items}
      loading={loading}
      filters={['All', 'Power Tools', 'Camera', 'Sports', 'Camping']}
      activeFilter="All"
      onFilterChange={() => {}}
      sortOptions={['Popular', 'Price: Low', 'Rating']}
      activeSort="Popular"
      onSortChange={() => {}}
      emptyEmoji="🔧"
      emptyTitle="No equipment available"
      emptyMessage="Check back later for new listings."
      renderCard={(item, i) => (
        <CompactCard
          key={item.id}
          href={`/hub/rentals/tools/${item.slug}`}
          imageUrl={item.image_url}
          emoji="🔧"
          title={item.name}
          subtitle={`${item.brand} · ${item.condition}`}
          price={item.price_per_day}
          priceSuffix="/day"
          rating={item.rating}
          badge={item.available ? 'Available' : undefined}
          badgeColor="bg-emerald-500"
          meta={item.category ? [item.category] : undefined}
        />
      )}
    />
  );
}
