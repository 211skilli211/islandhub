'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RatingBadge, PriceTag, AvailabilityBadge, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api, { getImageUrl } from '@/lib/api';

interface TourListing {
  id: number; name: string; slug: string;
  tour_type?: string; duration?: string; difficulty?: string;
  max_guests?: number; price_per_person?: number;
  rating?: number; review_count?: number; spots_left?: number;
  image_url?: string; description?: string; includes?: string[];
  guide_name?: string; is_trending?: boolean;
}

function TourCard({ tour, index }: { tour: TourListing; index: number }) {
  const name = tour.name || 'Tour';
  const img = tour.image_url ? getImageUrl(tour.image_url) : undefined;
  const price = tour.price_per_person || 65;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link href={`/hub/tours/land/${tour.slug}`} className="block group">
        <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-emerald-800 to-teal-900">
            {img ? (
              <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🥾</div>
            )}
            <div className="absolute top-3 left-3 flex gap-1.5">
              {tour.difficulty && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  tour.difficulty === 'Easy' ? 'bg-emerald-500/80 text-white' :
                  tour.difficulty === 'Moderate' ? 'bg-amber-500/80 text-white' :
                  'bg-red-500/80 text-white'
                }`}>
                  {tour.difficulty}
                </span>
              )}
              {tour.is_trending && <UrgencyCue type="trending" value="Popular" />}
            </div>
            {tour.spots_left && tour.spots_left <= 5 && (
              <div className="absolute bottom-3 left-3">
                <UrgencyCue type="scarcity" value={`${tour.spots_left} spots left`} />
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary">{tour.tour_type || 'Land Tour'} · {tour.duration || '3 hours'}</p>
              </div>
              {tour.rating && <RatingBadge rating={tour.rating} reviewCount={tour.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-tertiary">
              {tour.max_guests && <span>👥 Max {tour.max_guests}</span>}
              {tour.guide_name && <span>· 🧑‍🏫 {tour.guide_name}</span>}
            </div>
            {tour.includes && tour.includes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tour.includes.slice(0, 3).map((item, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-[10px] font-medium text-emerald-600">✓ {item}</span>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-border-primary">
              <PriceTag price={price} suffix="/person" size="sm" />
              <span className="text-[10px] text-ink-tertiary font-medium">Free cancellation</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function LandToursHubPage() {
  const [tours, setTours] = useState<TourListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['land', 'hiking', 'history', 'nature', 'culture'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            tour_type: ['Hiking', 'History Walk', 'Nature Trail', 'Cultural Tour', 'Bird Watching', 'Heritage Walk'][i % 6],
            duration: ['2 hours', '3 hours', '4 hours', 'Half day', 'Full day', '2.5 hours'][i % 6],
            difficulty: ['Easy', 'Moderate', 'Challenging'][i % 3],
            max_guests: 6 + (i * 2),
            price_per_person: 45 + (i * 15),
            rating: 4.5 + (Math.random() * 0.5),
            review_count: 15 + Math.floor(Math.random() * 150),
            spots_left: [3, 5, 8, 12, 2, 6, 10, 4, 7, 9, 1, 11][i % 12],
            image_url: s.banner_url,
            description: s.description,
            includes: [
              ['Guide', 'Water', 'Snacks'][i % 3],
              ['Transport', 'Photos', 'Equipment'][i % 3],
              ['Lunch', 'Entrance fees'][i % 2],
            ].slice(0, 2),
            guide_name: ['Marcus', 'Sarah', 'James', 'Lisa', 'David', 'Emma'][i % 6],
            is_trending: i < 3,
          }));
        setTours(filtered);
      } catch (error) { console.error('Failed to fetch land tours:', error); }
      finally { setLoading(false); }
    };
    fetchTours();
  }, []);

  const filters = ['All', 'Easy', 'Moderate', 'Challenging', 'Half Day', 'Full Day', 'Family Friendly'];
  const sortOptions = ['Popular', 'Rating', 'Duration', 'Price'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-green-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🥾 Land Tours & Hiking</h1>
          <p className="text-emerald-200 mb-4">Hiking trails, history walks, and nature tours</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'land', label: 'Land', emoji: '🥾' },
              { id: 'sea', label: 'Sea', emoji: '🌊' },
              { id: 'adventure', label: 'Adventure', emoji: '🧗' },
              { id: 'charter', label: 'Charters', emoji: '⛵' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/tours/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'land' ? 'bg-white text-emerald-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                <span>{cat.emoji}</span> {cat.label}
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
        ) : tours.length === 0 ? (
          <EmptyState emoji="🥾" title="No land tours found" message="Check back later for new tour listings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tours.map((tour, i) => <TourCard key={tour.id} tour={tour} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
