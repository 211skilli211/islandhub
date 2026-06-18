'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import api from '@/lib/api';

interface PropertyItem {
  id: number; name: string; slug: string;
  property_type?: string; bedrooms?: number; bathrooms?: number;
  sqft?: number; price_per_month?: number; available_date?: string;
  rating?: number; image_url?: string; address?: string; pet_friendly?: boolean;
}

export default function LongTermHubPage() {
  const [items, setItems] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/listings?category=rental&sub_category=long_term,apartment&limit=20')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.listings || [];
        setItems(raw.slice(0, 12).map((s: any, i: number) => ({
          id: s.store_id || s.id, name: s.name || s.business_name, slug: s.slug,
          property_type: s.property_type || ['Apartment', 'House', 'Condo', 'Townhouse'][i % 4],
          bedrooms: s.bedrooms || [1, 2, 3, 2][i % 4],
          bathrooms: s.bathrooms || [1, 1, 2, 2][i % 4],
          sqft: s.sqft || 800 + (i * 200),
          price_per_month: s.price_per_month || 800 + (i * 200),
          available_date: s.available_date || 'Available Now',
          rating: s.rating || (4.0 + Math.random()),
          image_url: s.image_url || s.banner_url,
          address: s.address || ['Basseterre', 'Frigate Bay', 'Sandy Point', 'Charlestown'][i % 4],
          pet_friendly: i % 3 === 0,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CompactHubPage
      title="Long-Term Rentals"
      subtitle="Monthly and annual leases across the Caribbean"
      emoji="🏢"
      gradient="from-amber-900 via-yellow-900 to-orange-900"
      items={items}
      loading={loading}
      filters={['All', 'Apartment', 'House', 'Condo', 'Pet Friendly']}
      activeFilter="All"
      onFilterChange={() => {}}
      sortOptions={['Popular', 'Price: Low', 'Price: High']}
      activeSort="Popular"
      onSortChange={() => {}}
      emptyEmoji="🏢"
      emptyTitle="No properties available"
      emptyMessage="Check back later for new long-term rental listings."
      renderCard={(item, i) => (
        <CompactCard
          key={item.id}
          href={`/hub/rentals/longterm/${item.slug}`}
          imageUrl={item.image_url}
          emoji="🏢"
          title={item.name}
          subtitle={`${item.bedrooms} bed . ${item.bathrooms} bath . ${item.sqft} sqft`}
          price={item.price_per_month}
          priceSuffix="/month"
          rating={item.rating}
          badge={item.pet_friendly ? 'Pet Friendly' : undefined}
          badgeColor="bg-emerald-500"
          meta={item.address ? [item.address] : undefined}
        />
      )}
    />
  );
}
