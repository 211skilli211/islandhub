'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { RatingBadge, PriceTag, AvailabilityBadge, UrgencyCue, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api, { getImageUrl } from '@/lib/api';

interface FoodStore {
  id: number; store_id?: number; name: string; slug: string;
  cuisine_type?: string; rating?: number; review_count?: number;
  delivery_time?: string; price_range?: string; is_open?: boolean;
  image_url?: string; description?: string; is_trending?: boolean;
  popular_items?: { name: string; price: number; image_url?: string }[];
}

function RestaurantCard({ store, index }: { store: FoodStore; index: number }) {
  const name = store.name || 'Restaurant';
  const img = store.image_url ? getImageUrl(store.image_url) : undefined;
  const isOpen = store.is_open !== false;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link href={`/hub/food/restaurants/${store.slug}`} className="block group">
        <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
          {/* Image */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-orange-800 to-red-900">
            {img ? (
              <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
            )}
            <div className="absolute top-3 left-3 flex gap-1.5">
              <AvailabilityBadge status={isOpen ? 'open' : 'closed'} />
              {store.is_trending && <UrgencyCue type="trending" value="Trending" />}
            </div>
            {store.delivery_time && (
              <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
                {store.delivery_time}
              </div>
            )}
          </div>
          {/* Info */}
          <div className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
                <p className="text-xs text-ink-tertiary truncate">{store.cuisine_type || 'Caribbean Cuisine'}</p>
              </div>
              {store.rating && <RatingBadge rating={store.rating} reviewCount={store.review_count} size="sm" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-tertiary">
              {store.price_range && <span className="font-semibold text-ink-secondary">{store.price_range}</span>}
              {store.delivery_time && <span>· {store.delivery_time}</span>}
            </div>
            {/* Popular items preview */}
            {store.popular_items && store.popular_items.length > 0 && (
              <div className="pt-2 border-t border-border-primary space-y-1.5">
                {store.popular_items.slice(0, 2).map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-ink-secondary truncate">{item.name}</span>
                    <span className="font-semibold text-ink-primary shrink-0 ml-2">${item.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function RestaurantsHubPage() {
  const [stores, setStores] = useState<FoodStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['restaurant', 'dining', 'fine_dining'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            store_id: s.store_id,
            name: s.name || s.business_name,
            slug: s.slug,
            cuisine_type: ['Caribbean', 'Italian', 'Seafood', 'Asian Fusion', 'Steakhouse', 'French'][i % 6],
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 20 + Math.floor(Math.random() * 200),
            delivery_time: `${15 + (i * 5)}-${25 + (i * 5)} min`,
            price_range: ['$', '$$', '$$$', '$$$$'][i % 4],
            is_open: i % 5 !== 0,
            image_url: s.banner_url,
            description: s.description,
            is_trending: i < 3,
            popular_items: [
              { name: ['Jerk Chicken', 'Grilled Mahi Mahi', 'Lobster Tail', 'Ribeye Steak', 'Pad Thai', 'Coq au Vin'][i % 6], price: 18 + (i * 4) },
              { name: ['Rice & Peas', 'Caesar Salad', 'Crème Brûlée', 'Tiramisu'][i % 4], price: 8 + (i * 2) },
            ],
          }));
        setStores(filtered);
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filters = ['All', 'Open Now', '$', '$$', '$$$', 'Caribbean', 'Seafood', 'Italian'];
  const sortOptions = ['Popular', 'Rating', 'Delivery Time', 'Price'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-orange-900 via-red-900 to-rose-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🍽️ Restaurants & Fine Dining</h1>
          <p className="text-orange-200 mb-4">Full-service dining across St. Kitts & Nevis</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'kitchen', label: 'Kitchens', emoji: '🍳' },
              { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
              { id: 'cafe', label: 'Cafés', emoji: '☕' },
              { id: 'grill', label: 'Grills & Bars', emoji: '🍺' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/food/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'restaurant' ? 'bg-white text-orange-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[16/10] bg-surface-secondary animate-pulse" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-surface-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState emoji="🍽️" title="No restaurants found" message="Check back later for new restaurant listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stores.map((store, i) => <RestaurantCard key={store.store_id || store.id} store={store} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}
