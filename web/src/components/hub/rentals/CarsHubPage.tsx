'use client';
import React, { useState, useEffect } from 'react';
import { CompactCard, CompactHubPage } from '@/components/hub/CompactCard';
import { FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api from '@/lib/api';

interface CarItem {
  id: number; store_id?: number; name: string; slug: string;
  make?: string; model?: string; year?: string;
  transmission?: string; seats?: number; price_per_day?: number;
  rating?: number; image_url?: string; available?: boolean;
  owner_name?: string; trip_count?: number; location?: string;
}

export default function CarsHubPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    api.get('/listings?category=rental&sub_category=car&limit=20')
      .then((res: any) => {
        const raw = Array.isArray(res.data) ? res.data : res.data?.listings || [];
        setCars(raw.slice(0, 12).map((s: any, i: number) => ({
          id: s.store_id || s.id, store_id: s.store_id,
          name: s.name || s.business_name, slug: s.slug,
          make: s.make || ['Toyota', 'Honda', 'Nissan', 'Ford', 'Hyundai'][i % 5],
          model: s.model || ['Corolla', 'Civic', 'Sentra', 'Focus', 'Elantra'][i % 5],
          year: s.year || (2020 + (i % 5)).toString(),
          transmission: (i % 2 === 0 ? 'Automatic' : 'Manual') as string,
          seats: s.seats || [4, 5, 7][i % 3],
          price_per_day: s.price_per_day || 45 + (i * 10),
          rating: s.rating || (4.0 + Math.random()),
          image_url: s.image_url || s.banner_url,
          available: true, owner_name: s.owner_name,
          location: s.location || 'Basseterre',
        })));
      })
      .catch(() => setCars([]))
      .finally(() => setLoading(false));
  }, []);

  const filters = ['All', 'Automatic', 'Manual', 'SUV', 'Sedan'];
  const sortOptions = ['Popular', 'Price: Low', 'Price: High', 'Rating'];

  return (
    <CompactHubPage
      title="Car Rentals"
      subtitle="Rent a car and explore the island"
      emoji="🚗"
      gradient="from-sky-900 via-blue-900 to-indigo-900"
      items={cars}
      loading={loading}
      filters={filters}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      sortOptions={sortOptions}
      activeSort={activeSort}
      onSortChange={setActiveSort}
      emptyEmoji="🚗"
      emptyTitle="No cars available"
      emptyMessage="Check back later for new car listings."
      renderCard={(car, i) => (
        <CompactCard
          key={car.id}
          href={`/hub/rentals/cars/${car.slug}`}
          imageUrl={car.image_url}
          emoji="🚗"
          title={car.name}
          subtitle={`${car.year} . ${car.transmission} . ${car.seats} seats`}
          price={car.price_per_day}
          priceSuffix="/day"
          rating={car.rating}
          badge={car.available ? 'Available' : undefined}
          badgeColor="bg-emerald-500"
          meta={car.location ? [car.location] : undefined}
        />
      )}
    />
  );
}
