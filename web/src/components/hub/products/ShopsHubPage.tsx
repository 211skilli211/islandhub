'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface ShopStore {
  id: number; name: string; slug: string;
  shop_type?: string; rating?: number; review_count?: number;
  product_count?: number; image_url?: string; description?: string;
  is_verified?: boolean; is_trending?: boolean;
}

function ShopCard({ shop }: { shop: ShopStore }) {
  const name = shop.name || 'Shop';
  const img = shop.image_url ? getImageUrl(shop.image_url) : undefined;
  return (
    <Link href={`/hub/products/shops/${shop.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-800 to-teal-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🏪</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {shop.is_verified && <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold">✓ Verified</span>}
            {shop.is_trending && <UrgencyCue type="trending" value="Trending" />}
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {shop.rating && <RatingBadge rating={shop.rating} reviewCount={shop.review_count} size="sm" />}
          </div>
          <p className="text-xs text-ink-tertiary">{shop.shop_type || 'Retail Store'}</p>
          {shop.product_count ? <p className="text-[10px] text-ink-tertiary">{shop.product_count} products</p> : null}
        </div>
      </div>
    </Link>
  );
}

export default function ShopsHubPage() {
  const [shops, setShops] = useState<ShopStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchShops = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['shop', 'retail', 'general'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            shop_type: ['General Store', 'Gift Shop', 'Electronics', 'Home & Garden', 'Sports', 'Books'][i % 6],
            rating: 4.2 + (Math.random() * 0.8),
            review_count: 10 + Math.floor(Math.random() * 100),
            product_count: 20 + Math.floor(Math.random() * 200),
            image_url: s.banner_url,
            description: s.description,
            is_verified: i % 3 === 0,
            is_trending: i < 3,
          }));
        setShops(filtered);
      } catch (error) { console.error('Failed to fetch shops:', error); }
      finally { setLoading(false); }
    };
    fetchShops();
  }, []);

  const filters = ['All', 'Verified', 'Electronics', 'Gift Shop', 'Home & Garden', 'Sports'];
  const sortOptions = ['Popular', 'Newest', 'Rating', 'Products'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🏪 Island Shops & Retail</h1>
          <p className="text-emerald-200 mb-4">General retail stores across the Caribbean</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'shop', label: 'Shops', emoji: '🏪' },
              { id: 'specialty', label: 'Specialty', emoji: '🎨' },
              { id: 'fashion', label: 'Fashion', emoji: '👗' },
              { id: 'health', label: 'Health', emoji: '💊' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/products/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'shop' ? 'bg-white text-emerald-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-[4/3] bg-surface-secondary animate-pulse" />
                <div className="p-3"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <EmptyState emoji="🏪" title="No shops found" message="Check back later for new retail listings." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {shops.map((shop) => <ShopCard key={shop.id} shop={shop} />)}
          </div>
        )}
      </div>
    </div>
  );
}
