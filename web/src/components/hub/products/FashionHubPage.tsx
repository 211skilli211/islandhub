'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface FashionProduct {
  id: number; name: string; slug: string;
  brand?: string; style?: string; price?: number;
  rating?: number; review_count?: number;
  image_url?: string; description?: string;
  sizes?: string[]; colors?: string[];
}

function FashionCard({ product }: { product: FashionProduct }) {
  const name = product.name || 'Fashion Item';
  const img = product.image_url ? getImageUrl(product.image_url) : undefined;
  const price = product.price || 35;
  return (
    <Link href={`/hub/products/fashion/${product.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-pink-800 to-rose-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {product.rating && <RatingBadge rating={product.rating} size="sm" showCount={false} />}
          </div>
          <p className="text-xs text-ink-tertiary">{product.brand || 'Island Style'} · {product.style || 'Casual'}</p>
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 4).map((s, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded border border-border-primary text-[10px] text-ink-tertiary">{s}</span>
              ))}
            </div>
          )}
          <PriceTag price={price} size="sm" />
        </div>
      </div>
    </Link>
  );
}

export default function FashionHubPage() {
  const [products, setProducts] = useState<FashionProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['fashion', 'clothing', 'shoes', 'accessories'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            brand: ['Island Wear', 'Caribbean Style', 'Tropical Threads', 'Beach Vibes', 'Sunset Apparel', 'Ocean Breeze'][i % 6],
            style: ['Casual', 'Beach', 'Formal', 'Sport', 'Resort', 'Streetwear'][i % 6],
            price: 25 + (i * 12),
            rating: 4.3 + (Math.random() * 0.7),
            review_count: 8 + Math.floor(Math.random() * 80),
            image_url: s.banner_url,
            description: s.description,
            sizes: [['S', 'M', 'L'], ['M', 'L', 'XL'], ['XS', 'S', 'M', 'L'], ['One Size'][i % 4]][i % 4],
            colors: [['Blue', 'White'], ['Black', 'Red'], ['Green', 'Yellow']][i % 3],
          }));
        setProducts(filtered);
      } catch (error) { console.error('Failed to fetch fashion:', error); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filters = ['All', 'Casual', 'Beach', 'Formal', 'Sport', 'Resort', 'One Size'];
  const sortOptions = ['Popular', 'Newest', 'Price: Low', 'Price: High'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-pink-900 via-rose-900 to-red-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">👗 Fashion & Accessories</h1>
          <p className="text-pink-200 mb-4">Clothing, shoes, and island style</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'shop', label: 'Shops', emoji: '🏪' },
              { id: 'specialty', label: 'Specialty', emoji: '🎨' },
              { id: 'fashion', label: 'Fashion', emoji: '👗' },
              { id: 'health', label: 'Health', emoji: '💊' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/products/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'fashion' ? 'bg-white text-pink-900' : 'bg-white/10 text-white hover:bg-white/20'
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-[3/4] bg-surface-secondary animate-pulse" />
                <div className="p-3"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState emoji="👗" title="No fashion items found" message="Check back later for new style listings." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => <FashionCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
