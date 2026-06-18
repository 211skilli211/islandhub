'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { Search, SlidersHorizontal, MapPin, Clock, ChevronDown } from 'lucide-react';

type Listing = {
  id: number | string;
  title: string;
  price?: number;
  image_url?: string;
  photos?: string[];
  images?: string[];
  category?: string;
  sub_category?: string;
  location?: string;
  created_at?: string;
  seller_name?: string;
  slug?: string;
  store_slug?: string;
};

type FacebookGridProps = {
  title?: string;
  seeMoreHref?: string;
  initialCategory?: string;
  limit?: number;
};

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'food', label: 'Food' },
  { id: 'product', label: 'Products' },
  { id: 'service', label: 'Services' },
  { id: 'rental', label: 'Rentals' },
  { id: 'tour', label: 'Tours' },
  { id: 'transport', label: 'Transport' },
  { id: 'event', label: 'Events' },
];

const timeAgo = (dateStr?: string) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
};

const getListingImage = (item: Listing) => {
  const raw = (Array.isArray(item.photos) && item.photos[0])
    || (Array.isArray(item.images) && item.images[0])
    || item.image_url
    || '';
  return raw ? getImageUrl(raw) : '';
};

const getListingHref = (item: Listing) => {
  if (item.store_slug) return `/store/${item.store_slug}/catalogue/${item.slug || item.id}`;
  if (item.slug) return `/listings/${item.slug}`;
  return `/listings/${item.id}`;
};

export default function FacebookGrid({
  title = 'Browse Marketplace',
  seeMoreHref = '/hub/products',
  initialCategory = 'all',
  limit = 20,
}: FacebookGridProps) {
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(limit));
      params.set('sort', 'newest');
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/listings?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.listings || data.data || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-primary">{title}</h2>
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-sm text-accent-500 hover:underline">
            See All →
          </Link>
        )}
      </div>

      
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-tertiary" />
          <input
            type="text"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-primary bg-surface-elevated text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-500/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters
              ? 'border-accent-500/30 bg-accent-500/10 text-accent-500'
              : 'border-border-primary bg-surface-elevated text-ink-secondary hover:border-accent-500/20'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      
      {showFilters && (
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-border-primary">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated border border-border-primary text-ink-secondary hover:border-accent-500/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary bg-surface-elevated overflow-hidden">
              <div className="aspect-square bg-surface-tertiary animate-pulse" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-2.5 w-2/3 bg-surface-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border-primary">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-ink-tertiary font-medium">No listings found</p>
          <p className="text-xs text-ink-tertiary mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item) => {
            const img = getListingImage(item);
            const href = getListingHref(item);
            return (
              <Link
                key={item.id}
                href={href}
                className="group rounded-xl border border-border-primary bg-surface-elevated overflow-hidden hover:border-accent-500/20 transition-all"
              >
                
                <div className="relative aspect-square bg-surface-tertiary">
                  {img ? (
                    <img
                      src={img}
                      alt={item.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl bg-surface-tertiary">
                      📦
                    </div>
                  )}
                  
                  {item.price !== undefined && item.price > 0 && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-md">
                      <span className="text-xs font-bold text-ink-primary">${item.price}</span>
                    </div>
                  )}
                </div>

                
                <div className="p-2.5">
                  <h3 className="text-xs font-medium text-ink-primary line-clamp-2 leading-snug group-hover:text-accent-500 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-ink-tertiary">
                    {item.location && (
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="h-2.5 w-2.5 shrink-0" />
                        {item.location}
                      </span>
                    )}
                    {item.created_at && (
                      <span className="flex items-center gap-0.5 shrink-0">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(item.created_at)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
