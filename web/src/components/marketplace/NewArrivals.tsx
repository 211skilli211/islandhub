'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

type NewArrival = {
  id: number | string;
  title: string;
  price?: number;
  image_url?: string;
  photos?: string[];
  images?: string[];
  created_at?: string;
  slug?: string;
  store_slug?: string;
  category?: string;
};

type NewArrivalsProps = {
  title?: string;
  seeMoreHref?: string;
  limit?: number;
};

const getArrivalImage = (item: NewArrival) => {
  const raw = (Array.isArray(item.photos) && item.photos[0])
    || (Array.isArray(item.images) && item.images[0])
    || item.image_url
    || '';
  return raw ? getImageUrl(raw) : '';
};

const getArrivalHref = (item: NewArrival) => {
  if (item.store_slug) return `/store/${item.store_slug}/catalogue/${item.slug || item.id}`;
  if (item.slug) return `/listings/${item.slug}`;
  return `/listings/${item.id}`;
};

export default function NewArrivals({
  title = '✨ New Arrivals',
  seeMoreHref = '/hub/products?sort=newest',
  limit = 12,
}: NewArrivalsProps) {
  const [items, setItems] = useState<NewArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/listings?limit=${limit}&sort=newest`);
        if (res.ok) {
          const data = await res.json();
          setItems(Array.isArray(data) ? data : data.listings || data.data || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [limit]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-lg font-semibold text-ink-primary mb-4">{title}</h2>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[180px] rounded-xl border border-border-primary bg-surface-elevated overflow-hidden">
              <div className="aspect-square bg-surface-tertiary animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-tertiary rounded animate-pulse" />
                <div className="h-2.5 w-1/2 bg-surface-tertiary rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {seeMoreHref && (
            <Link href={seeMoreHref} className="text-sm text-accent-500 hover:underline">
              See All →
            </Link>
          )}
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg border border-border-primary bg-surface-elevated text-ink-secondary hover:border-accent-500/20 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg border border-border-primary bg-surface-elevated text-ink-secondary hover:border-accent-500/20 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => {
          const img = getArrivalImage(item);
          const href = getArrivalHref(item);
          return (
            <Link
              key={item.id}
              href={href}
              className="shrink-0 w-[180px] group rounded-xl border border-border-primary bg-surface-elevated overflow-hidden hover:border-accent-500/20 transition-all"
            >
              <div className="relative aspect-square bg-surface-tertiary">
                {img ? (
                  <img
                    src={img}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-amber-500 rounded text-[9px] font-bold text-white">
                  NEW
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-xs font-medium text-ink-primary line-clamp-2 leading-snug group-hover:text-accent-500 transition-colors">
                  {item.title}
                </h3>
                {item.price !== undefined && item.price > 0 && (
                  <p className="mt-1 text-sm font-semibold text-accent-500">${item.price}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
