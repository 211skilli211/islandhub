'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, AvailabilityBadge, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import api, { getImageUrl } from '@/lib/api';

interface KitchenStore {
  id: number; name: string; slug: string;
  cuisine_type?: string; rating?: number; review_count?: number;
  prep_time?: string; is_accepting_orders?: boolean;
  image_url?: string; description?: string;
  menu_items?: { name: string; price: number }[];
  is_trending?: boolean;
}

function KitchenCard({ store }: { store: KitchenStore }) {
  const name = store.name || 'Kitchen';
  const img = store.image_url ? getImageUrl(store.image_url) : undefined;
  return (
    <Link href={`/hub/food/kitchens/${store.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-amber-800 to-orange-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍳</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {store.is_accepting_orders !== false ? (
              <AvailabilityBadge status="open" label="Accepting Orders" />
            ) : (
              <AvailabilityBadge status="closed" label="Paused" />
            )}
            {store.is_trending && <UrgencyCue type="demand" value="Busy" />}
          </div>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
              <p className="text-xs text-ink-tertiary">{store.cuisine_type || 'Home Cooking'}</p>
            </div>
            {store.rating && <RatingBadge rating={store.rating} reviewCount={store.review_count} size="sm" />}
          </div>
          {store.prep_time && (
            <div className="flex items-center gap-1.5 text-xs text-ink-tertiary">
              <span>⏱️ Ready in {store.prep_time}</span>
            </div>
          )}
          {store.menu_items && store.menu_items.length > 0 && (
            <div className="pt-2 border-t border-border-primary space-y-1">
              {store.menu_items.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-ink-secondary">{item.name}</span>
                  <span className="font-semibold text-ink-primary">${item.price}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function KitchensHubPage() {
  const [stores, setStores] = useState<KitchenStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['kitchen', 'cloud_kitchen', 'home_cooking'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 10)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            cuisine_type: ['Caribbean Home Cooking', 'Vegan', 'BBQ', 'Baking', 'Meal Prep', 'Comfort Food'][i % 6],
            rating: 4.4 + (Math.random() * 0.6),
            review_count: 10 + Math.floor(Math.random() * 100),
            prep_time: `${20 + (i * 5)}-${30 + (i * 5)} min`,
            is_accepting_orders: i % 4 !== 0,
            image_url: s.banner_url,
            description: s.description,
            is_trending: i < 2,
            menu_items: [
              { name: ['Jerk Chicken Plate', 'Vegan Bowl', 'BBQ Ribs', 'Fresh Bread', 'Salad Bowl', 'Stew'][i % 6], price: 12 + (i * 3) },
              { name: ['Side Dish', 'Drink', 'Dessert'][i % 3], price: 4 + i },
            ],
          }));
        setStores(filtered);
      } catch (error) { console.error('Failed to fetch kitchens:', error); }
      finally { setLoading(false); }
    };
    fetchStores();
  }, []);

  const filters = ['All', 'Accepting Orders', 'Caribbean', 'Vegan', 'BBQ', 'Baking'];
  const sortOptions = ['Popular', 'Rating', 'Prep Time'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🍳 Cloud Kitchens & Home Cooking</h1>
          <p className="text-amber-200 mb-4">Fresh home-cooked meals delivered to your door</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'kitchen', label: 'Kitchens', emoji: '🍳' },
              { id: 'restaurant', label: 'Restaurants', emoji: '🍽️' },
              { id: 'cafe', label: 'Cafés', emoji: '☕' },
              { id: 'grill', label: 'Grills & Bars', emoji: '🍺' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/food/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'kitchen' ? 'bg-white text-amber-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-[4/3] bg-surface-secondary animate-pulse" />
                <div className="p-4"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : stores.length === 0 ? (
          <EmptyState emoji="🍳" title="No kitchens found" message="Check back later for new cloud kitchens." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stores.map((store) => <KitchenCard key={store.id} store={store} />)}
          </div>
        )}
      </div>
    </div>
  );
}
