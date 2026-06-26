'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { RatingBadge, PriceTag, AvailabilityBadge, FilterBar, EmptyState, UrgencyCue } from '@/components/hub/SharedComponents';
import BookingWidget from '@/components/hub/BookingWidget';
import SimpleMap from '@/components/SimpleMap';
import api, { getImageUrl } from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Props {
  params: Promise<{ type: string; slug: string }>;
}

export default function ProviderStorefrontPage({ params }: Props) {
  const { type, slug } = use(params);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'products' | 'about'>('listings');
  const [bookingProvider, setBookingProvider] = useState<any>(null);

  useEffect(() => {
    const fetchStorefront = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/search/provider/${slug}?type=store`);
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch provider storefront:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStorefront();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-primary">
        <div className="animate-pulse">
          <div className="h-64 bg-surface-secondary" />
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
            <div className="h-8 bg-surface-secondary rounded w-1/3" />
            <div className="h-4 bg-surface-secondary rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.store) {
    return (
      <div className="min-h-screen bg-surface-primary flex items-center justify-center">
        <EmptyState emoji="🏪" title="Store not found" message="This provider may have moved or is no longer available." />
      </div>
    );
  }

  const store = data.store;
  const listings = data.listings || [];
  const products = data.products || [];

  return (
    <div className="min-h-screen bg-surface-primary">
      
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {store.logo_url && (
          <div className="absolute inset-0 opacity-20">
            <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center overflow-hidden shrink-0 shadow-xl">
              {store.logo_url ? (
                <img src={getImageUrl(store.logo_url)} alt={store.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-accent-400">{store.name?.charAt(0) || 'S'}</span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-white truncate">{store.name}</h1>
              {store.location && <EmojiIcon emoji="📍" size={16} className="text-white/60 text-sm mt-1" />}
              <div className="flex items-center gap-3 mt-2">
                {store.is_featured && (
                  <EmojiIcon emoji="★" size={16} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold" />
                )}
                {store.subtype && (
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-medium capitalize">
                    {store.subtype.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          {store.description && (
            <p className="text-white/50 mt-4 max-w-2xl line-clamp-2">{store.description}</p>
          )}
          <div className="flex gap-6 mt-4 text-sm text-white/40">
            {store.phone && <EmojiIcon emoji="📞" size={16} />}
            {store.website && <EmojiIcon emoji="🌐" size={16} />}
          </div>
        </div>
      </section>

      
      {listings.length > 0 && (
        <div className="bg-surface-elevated border-b border-border-primary overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-xs font-bold text-ink-tertiary uppercase tracking-widest shrink-0">Browse</span>
            <div className="flex gap-2 overflow-x-auto">
              {listings.slice(0, 8).map((item: any) => (
                <span key={item.id} className="shrink-0 px-3 py-1 rounded-full bg-surface-secondary text-xs text-ink-secondary font-medium whitespace-nowrap">
                  {item.name?.slice(0, 30) || 'Item'}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 bg-surface-elevated rounded-xl p-1 w-fit">
          {([
            { id: 'listings', label: `Listings (${listings.length})` },
            { id: 'products', label: `Products (${products.length})` },
            { id: 'about', label: 'About' },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === tab.id ? 'bg-accent-500 text-white shadow-lg' : 'text-ink-secondary hover:text-ink-primary'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'listings' && (
          listings.length === 0 ? (
            <EmptyState emoji="📋" title="No listings yet" message="This provider hasn't added any listings yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((item: any) => (
                <Link key={item.id} href={`/store/${store.slug}/${item.slug || item.id}`} className="group">
                  <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
                    <div className="aspect-[16/9] bg-gradient-to-br from-surface-secondary to-surface-primary">
                      {item.banner_url || item.image_url ? (
                        <img src={getImageUrl(item.banner_url || item.image_url)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <EmojiIcon emoji="📦" size={28} className="w-full h-full flex items-center justify-center text-3xl" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{item.name}</h3>
                      {item.description && <p className="text-xs text-ink-tertiary line-clamp-2">{item.description}</p>}
                      <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                        {item.price != null && <PriceTag price={item.price} size="sm" />}
                        <span className="text-xs text-accent-500 font-medium group-hover:underline">View →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'products' && (
          products.length === 0 ? (
            <EmptyState emoji="🛍️" title="No products yet" message="This provider hasn't added any products yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((item: any) => (
                <Link key={item.id} href={`/store/${store.slug}/${item.slug || item.id}`} className="group">
                  <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-lg transition-all">
                    <div className="aspect-[4/3] bg-gradient-to-br from-surface-secondary to-surface-primary">
                      {item.image_url ? (
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <EmojiIcon emoji="🛍️" size={28} className="w-full h-full flex items-center justify-center text-3xl" />
                      )}
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate">{item.name}</h3>
                      {item.price != null && <PriceTag price={item.price} size="sm" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {activeTab === 'about' && (
          <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 space-y-4">
            <h2 className="text-lg font-bold text-ink-primary">About {store.name}</h2>
            <p className="text-ink-secondary text-sm leading-relaxed">{store.description || 'No description available.'}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-primary">
              {store.phone && (
                <div>
                  <span className="text-xs text-ink-tertiary font-medium">Phone</span>
                  <p className="text-sm text-ink-primary font-bold">{store.phone}</p>
                </div>
              )}
              {store.email && (
                <div>
                  <span className="text-xs text-ink-tertiary font-medium">Email</span>
                  <p className="text-sm text-ink-primary font-bold">{store.email}</p>
                </div>
              )}
              {store.location && (
                <div>
                  <span className="text-xs text-ink-tertiary font-medium">Location</span>
                  <p className="text-sm text-ink-primary font-bold">{store.location}</p>
                </div>
              )}
              {store.website && (
                <div>
                  <span className="text-xs text-ink-tertiary font-medium">Website</span>
                  <p className="text-sm text-accent-500 font-bold"><a href={store.website} target="_blank" rel="noreferrer">Visit →</a></p>
                </div>
              )}
            </div>

            {/* Location Map */}
            {store.lat && store.lng && (
              <div className="mt-6 pt-6 border-t border-border-primary">
                <h3 className="text-sm font-bold text-ink-primary mb-3 flex items-center gap-2">
                  <span className="text-base">📍</span> Location
                </h3>
                <SimpleMap
                  center={[Number(store.lat), Number(store.lng)]}
                  zoom={14}
                  markers={[
                    {
                      lat: Number(store.lat),
                      lng: Number(store.lng),
                      label: store.name,
                      color: 'oklch(0.65 0.18 145)',
                    },
                  ]}
                  height="240px"
                />
                {store.location && (
                  <p className="text-xs text-ink-tertiary mt-2">{store.location}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      
      {bookingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setBookingProvider(null)}>
          <div className="bg-surface-primary rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-ink-primary">Book Service</h3>
              <button onClick={() => setBookingProvider(null)} className="p-2 rounded-xl hover:bg-surface-secondary text-ink-secondary"><EmojiIcon emoji="✕" size={16} /></button>
            </div>
            <BookingWidget type="calendar" />
          </div>
        </div>
      )}
    </div>
  );
}
