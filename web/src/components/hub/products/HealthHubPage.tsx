'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface HealthProduct {
  id: number; name: string; slug: string;
  category?: string; key_ingredient?: string;
  skin_type?: string; price?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
}

function HealthCard({ product }: { product: HealthProduct }) {
  const name = product.name || 'Health Product';
  const img = product.image_url ? getImageUrl(product.image_url) : undefined;
  const price = product.price || 18;
  return (
    <Link href={`/hub/products/health/${product.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-square bg-gradient-to-br from-teal-800 to-emerald-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">💊</div>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {product.rating && <RatingBadge rating={product.rating} size="sm" showCount={false} />}
          </div>
          <p className="text-xs text-ink-tertiary">{product.category || 'Wellness'}</p>
          <div className="flex flex-wrap gap-1">
            {product.key_ingredient && <span className="px-1.5 py-0.5 rounded bg-teal-500/10 text-[10px] font-medium text-teal-600">{product.key_ingredient}</span>}
            {product.skin_type && <span className="px-1.5 py-0.5 rounded bg-surface-secondary text-[10px] text-ink-tertiary">{product.skin_type}</span>}
          </div>
          <PriceTag price={price} size="sm" />
        </div>
      </div>
    </Link>
  );
}

export default function HealthHubPage() {
  const [products, setProducts] = useState<HealthProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['health_beauty', 'wellness', 'supplements'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            category: ['Skincare', 'Supplements', 'Hair Care', 'Body Care', 'Vitamins', 'Natural Remedies'][i % 6],
            key_ingredient: ['Aloe Vera', 'Coconut Oil', 'Vitamin C', 'Shea Butter', 'Tea Tree', 'Turmeric'][i % 6],
            skin_type: ['All Skin', 'Oily', 'Dry', 'Sensitive', 'Combination', 'All Types'][i % 6],
            price: 12 + (i * 6),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 5 + Math.floor(Math.random() * 70),
            image_url: s.banner_url,
            description: s.description,
          }));
        setProducts(filtered);
      } catch (error) { console.error('Failed to fetch health products:', error); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filters = ['All', 'Skincare', 'Supplements', 'Hair Care', 'Body Care', 'Natural'];
  const sortOptions = ['Popular', 'Rating', 'Price: Low', 'Price: High'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-teal-900 via-emerald-900 to-green-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">💊 Health & Beauty</h1>
          <p className="text-teal-200 mb-4">Wellness, supplements, and self-care</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'shop', label: 'Shops', emoji: '🏪' },
              { id: 'specialty', label: 'Specialty', emoji: '🎨' },
              { id: 'fashion', label: 'Fashion', emoji: '👗' },
              { id: 'health', label: 'Health', emoji: '💊' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/products/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'health' ? 'bg-white text-teal-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-3"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState emoji="💊" title="No health products found" message="Check back later for wellness listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => <HealthCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
