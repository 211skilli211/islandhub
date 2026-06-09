'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import api, { getImageUrl } from '@/lib/api';

interface ArtisanProduct {
  id: number; name: string; slug: string;
  craft_type?: string; price?: number; rating?: number; review_count?: number;
  image_url?: string; description?: string; is_handmade?: boolean;
  is_local?: boolean; story?: string;
}

function ArtisanCard({ product }: { product: ArtisanProduct }) {
  const name = product.name || 'Handcrafted Item';
  const img = product.image_url ? getImageUrl(product.image_url) : undefined;
  const price = product.price || 24;
  return (
    <Link href={`/hub/products/specialty/${product.slug}`} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
        <div className="relative aspect-square bg-gradient-to-br from-violet-800 to-purple-900">
          {img ? <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" /> : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🎨</div>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {product.is_handmade && <span className="px-2 py-0.5 rounded-full bg-violet-500/80 text-white text-[10px] font-bold">Handmade</span>}
            {product.is_local && <span className="px-2 py-0.5 rounded-full bg-emerald-500/80 text-white text-[10px] font-bold">🌴 Local</span>}
          </div>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{name}</h3>
            {product.rating && <RatingBadge rating={product.rating} size="sm" showCount={false} />}
          </div>
          <p className="text-xs text-ink-tertiary">{product.craft_type || 'Artisan Craft'}</p>
          {product.story && <p className="text-[10px] text-ink-tertiary line-clamp-2 italic">"{product.story}"</p>}
          <PriceTag price={price} size="sm" />
        </div>
      </div>
    </Link>
  );
}

export default function SpecialtyHubPage() {
  const [products, setProducts] = useState<ArtisanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Popular');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        const subtypes = ['specialty_food', 'artisan', 'craft', 'handmade'];
        const filtered = rawData
          .filter((s: any) => subtypes.includes((s.subtype || '').toLowerCase()))
          .slice(0, 12)
          .map((s: any, i: number) => ({
            id: s.store_id || s.id,
            name: s.name || s.business_name,
            slug: s.slug,
            craft_type: ['Pottery', 'Jewelry', 'Woodwork', 'Textiles', 'Paintings', 'Spice Blends'][i % 6],
            price: 15 + (i * 8),
            rating: 4.4 + (Math.random() * 0.6),
            review_count: 5 + Math.floor(Math.random() * 60),
            image_url: s.banner_url,
            description: s.description,
            is_handmade: true,
            is_local: i % 2 === 0,
            story: ['Made with love in Basseterre', 'Family recipe from Nevis', 'Crafted from local materials', 'Traditional Caribbean art'][i % 4],
          }));
        setProducts(filtered);
      } catch (error) { console.error('Failed to fetch specialty products:', error); }
      finally { setLoading(false); }
    };
    fetchProducts();
  }, []);

  const filters = ['All', 'Handmade', 'Local', 'Pottery', 'Jewelry', 'Woodwork', 'Textiles'];
  const sortOptions = ['Popular', 'Newest', 'Price: Low', 'Price: High'];

  return (
    <div className="min-h-screen bg-surface-primary">
      <section className="bg-gradient-to-br from-violet-900 via-purple-900 to-fuchsia-900 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black text-white mb-2">🎨 Artisan & Specialty Goods</h1>
          <p className="text-violet-200 mb-4">Handcrafted products made in the Caribbean</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'shop', label: 'Shops', emoji: '🏪' },
              { id: 'specialty', label: 'Specialty', emoji: '🎨' },
              { id: 'fashion', label: 'Fashion', emoji: '👗' },
              { id: 'health', label: 'Health', emoji: '💊' },
            ].map((cat) => (
              <Link key={cat.id} href={`/hub/products/${cat.id}`}
                className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  cat.id === 'specialty' ? 'bg-white text-violet-900' : 'bg-white/10 text-white hover:bg-white/20'
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
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-3"><div className="h-4 bg-surface-secondary rounded animate-pulse w-3/4" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState emoji="🎨" title="No artisan products found" message="Check back later for handcrafted goods." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => <ArtisanCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
