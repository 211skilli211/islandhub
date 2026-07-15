'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import { Search, Clock, Tag, Flame, Gift, Truck, Percent, ArrowDownAZ, Timer, MapPin } from 'lucide-react';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

type Deal = {
  id: number | string;
  title: string;
  description?: string;
  original_price?: number;
  sale_price?: number;
  discount_percent?: number;
  discount_type?: 'percentage' | 'bogo' | 'free_shipping' | 'flash' | 'clearance';
  image_url?: string;
  photos?: string[];
  shop_name?: string;
  shop_slug?: string;
  location?: string;
  ends_at?: string;
  starts_at?: string;
  category?: string;
  slug?: string;
  stock?: number;
};

const DEAL_FILTERS = [
  { id: 'all', label: 'All Deals', icon: Tag },
  { id: 'percentage', label: '% Off', icon: Percent },
  { id: 'bogo', label: 'BOGO', icon: Gift },
  { id: 'free_shipping', label: 'Free Ship', icon: Truck },
  { id: 'flash', label: 'Flash Sale', icon: Flame },
  { id: 'clearance', label: 'Clearance', icon: ArrowDownAZ },
];

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest' },
  { id: 'ending_soon', label: 'Ending Soon' },
  { id: 'biggest_savings', label: 'Biggest Savings' },
  { id: 'price_low', label: 'Price: Low → High' },
];

const getDealImage = (item: Deal) => {
  const raw = (Array.isArray(item.photos) && item.photos[0]) || item.image_url || '';
  return raw ? getImageUrl(raw) : '';
};

const getDealHref = (item: Deal) => {
  if (item.shop_slug) return `/store/${item.shop_slug}/catalogue/${item.slug || item.id}`;
  if (item.slug) return `/listings/${item.slug}`;
  return `/listings/${item.id}`;
};

const getTimeLeft = (endsAt?: string) => {
  if (!endsAt) return null;
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs >= 24) return `${Math.floor(hrs / 24)}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
};

const getDiscountBadge = (deal: Deal) => {
  if (deal.discount_type === 'bogo') return { text: 'Buy 1 Get 1', color: 'bg-purple-500' };
  if (deal.discount_type === 'free_shipping') return { text: 'Free Shipping', color: 'bg-blue-500' };
  if (deal.discount_type === 'flash') return { text: '⚡ Flash Sale', color: 'bg-red-500' };
  if (deal.discount_type === 'clearance') return { text: 'Clearance', color: 'bg-amber-600' };
  if (deal.discount_percent) return { text: `-${deal.discount_percent}%`, color: 'bg-rose-500' };
  return null;
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeSort, setActiveSort] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (activeFilter !== 'all') params.set('type', activeFilter);
      params.set('sort', activeSort);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/promotions/active?${params}`);
      if (res.ok) {
        const data = await res.json();
        setDeals(Array.isArray(data) ? data : data.promotions || data.data || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeFilter, activeSort, searchQuery]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return (
    <div className="min-h-screen bg-theme-primary">
      <section className="bg-gradient-to-br from-rose-900 via-red-900 to-amber-900 py-10 md:py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
            <EmojiIcon emoji="🔥" size={40} /> Deals & Promotions
          </h1>
          <p className="text-sm md:text-base text-white/70 max-w-xl mx-auto">
            Limited-time offers, flash sales, and exclusive discounts from Caribbean businesses.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-border-primary bg-input text-sm text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <select
            value={activeSort}
            onChange={(e) => setActiveSort(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border-primary bg-input text-sm text-theme-primary focus:outline-none focus:border-accent-primary/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {DEAL_FILTERS.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-theme-tertiary text-theme-secondary hover:bg-theme-secondary hover:text-theme-primary'
                }`}
              >
                <Icon className="h-3 w-3" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border-primary bg-card overflow-hidden">
                <div className="aspect-[4/3] bg-theme-tertiary animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-theme-tertiary rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-theme-tertiary rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-theme-tertiary rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border-primary">
            <EmojiIcon emoji="🏷️" size={40} className="text-4xl mb-3" />
            <p className="text-theme-tertiary font-medium text-lg">No deals found</p>
            <p className="text-sm text-theme-tertiary mt-1">Check back later for new promotions</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {deals.map((deal) => {
              const img = getDealImage(deal);
              const href = getDealHref(deal);
              const badge = getDiscountBadge(deal);
              const timeLeft = getTimeLeft(deal.ends_at);
              const savings = deal.original_price && deal.sale_price
                ? (deal.original_price - deal.sale_price).toFixed(2)
                : null;

              return (
                <Link
                  key={deal.id}
                  href={href}
                  className="group rounded-2xl border border-border-primary bg-card overflow-hidden hover:border-accent-primary/30 hover:shadow-lg hover:shadow-accent-primary/10 transition-all duration-200"
                >
                  <div className="relative aspect-[4/3] bg-theme-tertiary">
                    {img ? (
                      <img
                        src={img}
                        alt={deal.title}
                        className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-4xl bg-gradient-to-br from-rose-500/10 to-amber-500/10">
                        🏷️
                      </div>
                    )}

                    {badge && (
                      <span className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-xs font-bold text-white ${badge.color}`}>
                        {badge.text}
                      </span>
                    )}

                    {timeLeft && timeLeft !== 'Expired' && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-lg">
                        <Timer className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-bold text-white">{timeLeft}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-theme-primary line-clamp-2 group-hover:text-accent-primary transition-colors">
                      {deal.title}
                    </h3>

                    {deal.shop_name && (
                      <p className="mt-1 text-xs text-theme-tertiary flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {deal.shop_name}
                      </p>
                    )}

                    <div className="mt-2 flex items-baseline gap-2">
                      {deal.sale_price !== undefined && deal.sale_price > 0 && (
                        <span className="text-lg font-bold text-accent-primary">${deal.sale_price}</span>
                      )}
                      {deal.original_price && deal.sale_price && deal.original_price > deal.sale_price && (
                        <span className="text-sm text-theme-tertiary line-through">${deal.original_price}</span>
                      )}
                      {savings && (
                        <span className="text-xs font-medium text-success-primary bg-success-primary/10 px-1.5 py-0.5 rounded">
                          Save ${savings}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border-primary">
                      <span className="text-xs font-medium text-accent-primary group-hover:underline">
                        View Deal →
                      </span>
                      {deal.stock !== undefined && deal.stock < 5 && deal.stock > 0 && (
                        <span className="text-[10px] font-medium text-danger-primary">
                          Only {deal.stock} left
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}