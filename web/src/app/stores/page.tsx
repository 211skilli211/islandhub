'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

interface Store {
  id: number;
  store_id: number;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  branding_color?: string;
  category: string;
  subtype: string;
  slug: string;
  rating?: number;
  vendor_name?: string;
}

const CATEGORY_CONFIG: Record<string, any> = {
  food: { title: 'Food & Dining', desc: 'Restaurants, kitchens, cafés, and fresh local flavors', icon: '🍴', gradient: 'from-orange-500 to-red-600', accent: 'rose' },
  product: { title: 'Shopping', desc: 'Local brands, crafts, souvenirs, and island products', icon: '📦', gradient: 'from-amber-500 to-orange-600', accent: 'amber' },
  service: { title: 'Services', desc: 'Professional services, automotive, health, marine, and more', icon: '🛠', gradient: 'from-emerald-500 to-teal-600', accent: 'emerald' },
  rental: { title: 'Rentals', desc: 'Stays, rides, boats, and equipment for your island journey', icon: '🏠', gradient: 'from-purple-500 to-indigo-600', accent: 'purple' },
  default: { title: 'Marketplace Directory', desc: 'Discover all our trusted partners and vendors', icon: '🏪', gradient: 'from-slate-700 to-slate-900', accent: 'slate' },
};

const ALL_CATEGORIES = [
  { key: 'all', label: 'All Stores', icon: '🏪' },
  { key: 'food', label: 'Food & Dining', icon: '🍴' },
  { key: 'product', label: 'Shopping', icon: '📦' },
  { key: 'service', label: 'Services', icon: '🛠' },
  { key: 'rental', label: 'Rentals', icon: '🏠' },
];

export default function StoresPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-slate-100 border-t-teal-600 rounded-full" /></div>}>
      <StoresContent />
    </Suspense>
  );
}

function StoresContent() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchStores = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const rawData = Array.isArray(res.data) ? res.data : (res.data.stores || []);
        setStores(rawData.map((s: any) => ({
          id: s.store_id || s.id,
          store_id: s.store_id || s.id,
          name: s.name,
          description: s.description,
          logo_url: s.logo_url,
          banner_url: s.banner_url,
          branding_color: s.branding_color || '#0066CC',
          category: s.category || '',
          subtype: s.subtype || '',
          slug: s.slug,
          rating: s.rating,
          vendor_name: s.vendor_name,
        })));
      } catch (error) {
        console.error('Failed to fetch stores', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const filteredStores = stores.filter(s => {
    const matchesCategory = activeCategory === 'all' || s.category?.toLowerCase() === activeCategory;
    const matchesSearch = !searchTerm || 
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subtype?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group stores by category for section view
  const storesByCategory = filteredStores.reduce((acc: Record<string, Store[]>, store) => {
    const cat = store.category?.toLowerCase() || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(store);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <HeroBackground pageKey="stores" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-300 text-xs font-bold uppercase tracking-[0.2em] mb-6">
              Marketplace
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Our Stores</h1>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
              Discover trusted local businesses, artisans, and service providers across the Caribbean
            </p>
            {/* Search */}
            <div className="max-w-xl mx-auto relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search stores, categories, services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/95 backdrop-blur-sm rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/30 font-medium shadow-xl"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {/* Stats */}
            <div className="flex justify-center gap-8 mt-8 text-white/60 text-sm font-medium">
              <span>{stores.length} Stores</span>
              <span>•</span>
              <span>{Object.keys(storesByCategory).length} Categories</span>
              <span>•</span>
              <span>Caribbean Wide</span>
            </div>
          </motion.div>
        </div>
      </HeroBackground>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {ALL_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat.key
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Store Sections by Category */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-slate-500 font-bold text-lg">No stores found</p>
            <p className="text-slate-400 text-sm mt-2">Try adjusting your search or filters</p>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }} className="mt-4 text-teal-600 font-bold text-sm hover:underline">
              Clear all filters
            </button>
          </div>
        ) : activeCategory !== 'all' ? (
          // Single category grid view
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {CATEGORY_CONFIG[activeCategory]?.title || 'Stores'}
              <span className="text-slate-400 font-medium text-base ml-3">({filteredStores.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store, idx) => (
                <StoreCard key={store.id} store={store} index={idx} />
              ))}
            </div>
          </div>
        ) : (
          // All categories — section view
          Object.entries(storesByCategory).map(([category, categoryStores]) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;
            return (
              <div key={category} className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <h2 className="text-2xl font-black text-slate-900">{config.title}</h2>
                    <span className="text-slate-400 font-medium text-sm">({categoryStores.length})</span>
                  </div>
                  <button
                    onClick={() => setActiveCategory(category)}
                    className="text-teal-600 font-bold text-sm hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryStores.slice(0, 3).map((store, idx) => (
                    <StoreCard key={store.id} store={store} index={idx} />
                  ))}
                </div>
              </div>
            );
          })
        )}

        {/* CTA */}
        <div className="mt-16 text-center py-16 bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl">
          <h2 className="text-3xl font-black text-white mb-4">Own a Business?</h2>
          <p className="text-white/70 max-w-lg mx-auto mb-8">Join our marketplace and reach thousands of customers across the Caribbean</p>
          <Link href="/become-vendor" className="inline-block px-8 py-4 bg-white text-teal-700 rounded-2xl font-bold text-lg hover:bg-teal-50 transition-colors shadow-xl">
            Become a Vendor →
          </Link>
        </div>
      </div>
    </div>
  );
}

function StoreCard({ store, index }: { store: Store; index: number }) {
  const categoryColors: Record<string, string> = {
    food: 'from-orange-400 to-red-500',
    product: 'from-amber-400 to-orange-500',
    service: 'from-emerald-400 to-teal-500',
    rental: 'from-purple-400 to-indigo-500',
  };
  const gradientClass = categoryColors[store.category?.toLowerCase()] || 'from-slate-400 to-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/store/${store.slug}`}
        className="block bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden group"
      >
        {/* Banner */}
        <div className={`h-28 w-full relative overflow-hidden bg-gradient-to-r ${gradientClass}`}>
          {store.banner_url ? (
            <img src={getImageUrl(store.banner_url)} alt="" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full" />
              <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Category badge */}
          <span className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 capitalize">
            {store.subtype?.replace(/_/g, ' ') || store.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border-2 border-white shadow-lg shrink-0 -mt-8 relative z-10">
              {store.logo_url ? (
                <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${gradientClass}`}>
                  {store.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors truncate">{store.name}</h3>
              {store.rating && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-amber-400 text-sm">★</span>
                  <span className="text-sm font-bold text-slate-700">{Number(store.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          {store.description && (
            <p className="text-sm text-slate-500 line-clamp-2 mb-4">{store.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Visit Store →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
