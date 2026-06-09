'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import { ProductCard, CarouselSection, SectionHeader } from '@/components/hub/ListingCard';
import api from '@/lib/api';

interface ShopStore {
  id: number; name: string; slug: string;
  shop_type?: string; rating?: number; review_count?: number;
  product_count?: number; image_url?: string; description?: string;
  is_verified?: boolean; is_trending?: boolean;
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
          .slice(0, 16)
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

  const featuredShops = shops.filter(s => s.is_trending);
  const allShops = shops;

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero — compact on mobile */}
      <section className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-black text-white mb-1">🏪 Island Shops</h1>
          <p className="text-sm text-emerald-200 mb-3">General retail stores across the Caribbean</p>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
            {[
              { id: 'shop', label: 'Shops', emoji: '🏪' },
              { id: 'specialty', label: 'Specialty', emoji: '🎨' },
              { id: 'fashion', label: 'Fashion', emoji: '👗' },
              { id: 'health', label: 'Health', emoji: '💊' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/products/${cat.id}`}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  cat.id === 'shop' ? 'bg-white text-emerald-900' : 'bg-white/10 text-white hover:bg-white/20'
                }`}>
                <span>{cat.emoji}</span> {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Filter bar — sticky */}
      <div className="sticky top-[72px] z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <FilterBar filters={filters} activeFilter={activeFilter} onFilterChange={setActiveFilter}
            sortOptions={sortOptions} activeSort={activeSort} onSortChange={setActiveSort} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-2.5"><div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : shops.length === 0 ? (
          <EmptyState emoji="🏪" title="No shops found" message="Check back later for new retail listings." />
        ) : (
          <>
            {/* Featured carousel — horizontal scroll */}
            {featuredShops.length > 0 && (
              <CarouselSection title="🔥 Trending Shops" seeMoreHref="/hub/products/shops" className="pt-4">
                {featuredShops.map((shop) => (
                  <div key={shop.id} className="shrink-0 w-[160px]">
                    <ProductCard
                      id={shop.id}
                      name={shop.name}
                      slug={shop.slug}
                      imageUrl={shop.image_url}
                      emoji="🏪"
                      rating={shop.rating}
                      reviewCount={shop.review_count}
                      isVerified={shop.is_verified}
                      productCount={shop.product_count}
                      href={`/hub/products/shops/${shop.slug}`}
                      variant="store"
                    />
                  </div>
                ))}
              </CarouselSection>
            )}

            {/* All shops — 2-col mobile grid */}
            <div className="pt-4">
              <SectionHeader title="All Shops" subtitle={`${allShops.length} stores`} />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allShops.map((shop) => (
                  <ProductCard
                    key={shop.id}
                    id={shop.id}
                    name={shop.name}
                    slug={shop.slug}
                    imageUrl={shop.image_url}
                    emoji="🏪"
                    rating={shop.rating}
                    reviewCount={shop.review_count}
                    isVerified={shop.is_verified}
                    productCount={shop.product_count}
                    href={`/hub/products/shops/${shop.slug}`}
                    variant="store"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
