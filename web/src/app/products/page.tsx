'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🛍️' },
  { id: 'Souvenirs', label: 'Souvenirs', icon: '🎁' },
  { id: 'Clothing', label: 'Clothing', icon: '👕' },
  { id: 'Art', label: 'Art & Crafts', icon: '🎨' },
  { id: 'Agro', label: 'Fresh Produce', icon: '🌿' },
];

interface Listing {
  id: string;
  type: string;
  category?: string;
  sub_category?: string;
  title: string;
  description: string;
  price?: number;
  location?: string;
  duration?: string;
  capacity?: number;
  images?: string[];
  image_url?: string;
  photos?: string[];
  metadata?: {
    inventory_count?: number;
    deadline?: string;
    shipping_info?: string;
    unavailable_dates?: string[];
    duration?: string;
    vendor_bio?: string;
    image?: string;
    beneficiary?: string;
  };
  is_promoted?: boolean;
  created_at: string;
  shop_name?: string;
  shop_logo?: string;
  shop_slug?: string;
}

function StarRating({ rating = 4.5, count = 12 }: { rating?: number; count?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${
              i < fullStars
                ? 'text-amber-400'
                : i === fullStars && hasHalf
                ? 'text-amber-400'
                : 'text-slate-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] font-bold text-slate-400 ml-1">{rating.toFixed(1)}</span>
      <span className="text-[10px] font-medium text-slate-300">({count})</span>
    </div>
  );
}

function ProductCard({ product }: { product: Listing }) {
  const imageUrl = useMemo(() => {
    const extractPhotoUrl = (photo: any): string | null => {
      if (!photo) return null;
      if (typeof photo === 'string') return photo;
      if (typeof photo === 'object' && photo.url) return photo.url;
      return null;
    };
    const primaryAsset =
      product.photos && product.photos.length > 0
        ? extractPhotoUrl(product.photos[0])
        : product.images && product.images.length > 0
        ? extractPhotoUrl(product.images[0])
        : product.image_url || product.metadata?.image || null;
    const resolved = typeof primaryAsset === 'string' && primaryAsset.startsWith('/')
      ? primaryAsset
      : getImageUrl(primaryAsset);
    return resolved || getImageUrl('file-1769965232226-73669333.jpg');
  }, [product]);

  const isNew = useMemo(() => {
    const created = new Date(product.created_at);
    const daysSince = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 14;
  }, [product.created_at]);

  const isOnSale = product.metadata?.inventory_count !== undefined && product.price !== undefined && product.price > 0;

  const detailHref = `/listings/${product.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
    >
      <Link href={detailHref} className="block flex flex-col h-full">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <img
            src={imageUrl || '/assets/placeholder-listing.png'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isNew && (
              <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                New
              </span>
            )}
            {isOnSale && product.price && product.price > 0 && (
              <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-md">
                Sale
              </span>
            )}
            {product.is_promoted && (
              <span className="px-2.5 py-1 bg-amber-400 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-200">
                Featured
              </span>
            )}
          </div>
          {/* Hover overlay */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4">
          {/* Vendor */}
          {product.shop_name && (
            <div className="flex items-center gap-1.5 mb-2">
              {product.shop_logo && (
                <div className="w-4 h-4 rounded-md bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                  <img
                    src={getImageUrl(product.shop_logo)}
                    alt={product.shop_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="text-[11px] font-semibold text-slate-400 truncate">
                {product.shop_name}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-2 group-hover:text-amber-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="mb-3">
            <StarRating rating={4.5 + Math.random() * 0.5} count={Math.floor(Math.random() * 50) + 5} />
          </div>

          {/* Price */}
          <div className="mt-auto pt-3 border-t border-slate-50">
            {product.price ? (
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-slate-900">
                  ${product.price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Price on request</span>
            )}
            {product.metadata?.inventory_count !== undefined && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${product.metadata.inventory_count > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-semibold text-slate-400">
                  {product.metadata.inventory_count > 0
                    ? `${product.metadata.inventory_count} in stock`
                    : 'Out of stock'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-full flex flex-col animate-pulse">
      <div className="aspect-square bg-slate-100" />
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div className="h-3 w-20 bg-slate-100 rounded-full" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded-full mt-auto" />
        <div className="h-5 w-24 bg-slate-100 rounded mt-1" />
      </div>
    </div>
  );
}

export default function ProductsHubPage() {
  const [products, setProducts] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('type', 'product');
      if (activeCategory !== 'all') {
        params.append('category', activeCategory);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      const res = await api.get(`/listings?${params.toString()}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.listings || [];
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (activeCategory !== 'all') {
      result = result.filter(
        (p) =>
          p.category === activeCategory ||
          p.sub_category === activeCategory
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shop_name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, activeCategory, searchQuery]);

  const promotedProducts = useMemo(() => filteredProducts.filter((p) => p.is_promoted), [filteredProducts]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroBackground
        pageKey="products"
        className="!min-h-0"
        align="center"
      >
        <div className="py-16 md:py-24 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-4">
              Island{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Products
              </span>
            </h1>
            <p className="text-base md:text-lg text-white/70 font-medium max-w-2xl mx-auto mb-8">
              Discover authentic island treasures from local artisans and vendors. Every purchase supports a small business.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search products, vendors, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-white/40 font-medium focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              {[
                { label: 'Products', value: '200+' },
                { label: 'Vendors', value: '50+' },
                { label: 'Categories', value: '4' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl md:text-2xl font-black text-amber-400">{stat.value}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </HeroBackground>

      {/* Category Filter Chips */}
      <section className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-4 overflow-x-auto scrollbar-hide">
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured / Promoted Products */}
        {!loading && promotedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Featured Products
                </h2>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                  Hand-picked by our team
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {promotedProducts.map((product) => (
                <ProductCard key={`promo-${product.id}`} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* All Products Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {activeCategory === 'all' ? 'All Products' : PRODUCT_CATEGORIES.find((c) => c.id === activeCategory)?.label || 'Products'}
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                {loading ? 'Loading...' : `${filteredProducts.length} products found`}
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </motion.div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">No products found</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Vendor CTA */}
      <section className="mt-16 mb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-10 md:p-16 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Are you a local vendor?
            </h2>
            <p className="text-white/80 text-lg font-medium mb-8 max-w-2xl mx-auto">
              Join the most vibrant marketplace in the Caribbean. Showcase your products to thousands of island visitors and locals.
            </p>
            <Link
              href="/become-vendor"
              className="inline-block px-10 py-4 bg-white text-amber-600 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-50 transition-all shadow-xl"
            >
              Start Selling Today →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
