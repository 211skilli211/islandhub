'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRentalSubHubs } from '@/lib/hubConfigs';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api from '@/lib/api';

interface CarListing {
  id: number; store_id?: number; name: string; slug: string;
  make?: string; model?: string; year?: string;
  transmission?: 'Automatic' | 'Manual';
  seats?: number; price_per_day?: number;
  rating?: number; location?: string;
  features?: string[]; description?: string;
  image_url?: string; available?: boolean; owner_name?: string;
  trip_count?: number;
}

function CarCard({ car, index }: { car: CarListing; index: number }) {
  const name = car.name || `${car.year || ''} ${car.make || 'Car'} ${car.model || ''}`.trim();
  const price = car.price_per_day || 45;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link href={`/hub/rentals/cars/${car.slug}`} className="block group">
        <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-surface-secondary">
            {car.image_url ? (
              <img src={car.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🚗</div>
            )}
            {car.available && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">Available</span>
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              {car.rating && <RatingBadge rating={car.rating} size="sm" showCount={false} />}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-tertiary">
              {car.transmission && <span>{car.transmission}</span>}
              {car.seats && <span>· {car.seats} seats</span>}
              {car.location && <span>· {car.location}</span>}
            </div>
            {car.features && car.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {car.features.slice(0, 3).map((f, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-ink-tertiary">{f}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <PriceTag price={price} suffix="/day" size="sm" />
              {car.trip_count ? (
                <span className="text-[10px] text-ink-tertiary">{car.trip_count} trips</span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CarsHubPage() {
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');
  const subHubs = getRentalSubHubs();

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        // Use stores with car-related subtypes or category=fallback = show all until DB has car rentals
        const filtered = rawData
          .filter((s: any) => {
            const sub = (s.subtype || '').toLowerCase();
            const cat = (s.category || '').toLowerCase();
            return sub.includes('car') || sub.includes('auto') || cat === 'transport';
          })
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            store_id: s.store_id,
            name: s.name || s.business_name,
            slug: s.slug,
            make: ['Toyota', 'Honda', 'Nissan', 'Ford', 'Hyundai'][i % 5],
            model: ['Corolla', 'Civic', 'Sentra', 'Focus', 'Elantra'][i % 5],
            year: (2020 + (i % 6)).toString(),
            transmission: i % 2 === 0 ? 'Automatic' : 'Manual',
            seats: 4 + (i % 3),
            price_per_day: 45 + (i * 15),
            rating: 4.5 + (Math.random() * 0.5),
            location: 'St. Kitts',
            features: ['Bluetooth', 'A/C', 'USB', 'GPS'].slice(0, 2 + (i % 3)),
            description: s.description,
            image_url: s.banner_url,
            available: true,
            owner_name: s.business_name,
            trip_count: 5 + (i * 3),
          }));
        setCars(filtered);
      } catch (error) {
        console.error('Failed to fetch cars:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const filters = ['All', 'Automatic', 'Manual', 'SUV', 'Sedan', '7+ Seats'];
  const sortOptions = ['Popular', 'Price: Low', 'Price: High', 'Rating', 'Trips'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🚗 Car Rentals</h1>
          <p className="text-sky-200 mb-4">Rent a car and explore the island at your own pace</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {subHubs.map((sub) => (
              <Link key={sub.categoryId} href={`/hub/rentals/${sub.categoryId}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  sub.categoryId === 'cars' ? 'bg-white text-sky-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-surface-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <EmptyState emoji="🚗" title="No cars available" message="Check back later for new car rentals." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map((car, i) => <CarCard key={car.store_id || car.id} car={car} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
