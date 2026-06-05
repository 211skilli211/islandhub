'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import HeroBackground from '@/components/HeroBackground';

/* ── Types ── */

interface Store {
  id: number;
  store_id?: number;
  name: string;
  business_name: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  branding_color: string | null;
  category: string;
  subtype: string;
  slug: string;
  rating: number | null;
  badges: string[] | null;
  is_featured: boolean;
  admin_rating: number | null;
  owner_name: string | null;
}

/* ── Categories ── */

const CATEGORIES = [
  { id: 'stays',   label: 'Stays & Homes',  icon: '🏠', desc: 'Villas, apartments, studios', gradient: 'from-ocean-500 to-brand-700',    subtypes: ['stays','apartment','villa','condo','studio','home','house'] },
  { id: 'vehicles', label: 'Vehicles',        icon: '🚗', desc: 'Cars, jeeps, ATVs, bikes', gradient: 'from-sunset-500 to-sunset-700',  subtypes: ['car','vehicle','suv','scooter','bike','motorcycle','jeep'] },
  { id: 'sea',     label: 'Sea & Aquatic',   icon: '⛵', desc: 'Boats, jet skis, yachts',  gradient: 'from-turquoise-400 to-ocean-600', subtypes: ['boat','yacht','jet_ski','sea','water','marine','charter'] },
  { id: 'equipment', label: 'Equipment',     icon: '🔧', desc: 'Tools, gear, machinery',   gradient: 'from-ink-500 to-surface-tertiary', subtypes: ['equipment','tools','gear','machinery'] },
  { id: 'property', label: 'Land & Property', icon: '🏘️', desc: 'Land, commercial, warehouses', gradient: 'from-brand-600 to-brand-800', subtypes: ['land','property','real_estate','commercial','warehouse'] },
];

function categorise(store: Store): string {
  const haystack = `${store.subtype} ${store.name} ${store.business_name} ${store.description} ${store.category}`.toLowerCase();
  for (const c of CATEGORIES) {
    for (const s of c.subtypes) {
      if (haystack.includes(s)) return c.id;
    }
  }
  return 'stays';
}

/* ── Components ── */

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-3.5 h-3.5 ${i < full ? 'text-sunset-400' : (i === full && half ? 'text-sunset-400' : 'text-border-tertiary')}`}
          fill={i < full ? 'currentColor' : (i === full && half ? 'currentColor' : 'none')} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
      <span className="ml-1 text-xs font-bold text-ink-secondary">{rating.toFixed(1)}</span>
    </div>
  );
}

function ProviderCard({ store, index }: { store: Store; index: number }) {
  const name = store.business_name || store.name || 'Provider';
  const rating = store.rating || store.admin_rating;
  const cat = CATEGORIES.find(c => categorise(store) === c.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -4 }}
    >
      <Link
        href={`/store/${store.slug}`}
        className="group block bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary hover:border-accent-400 hover:shadow-xl transition-all duration-300"
      >
        {/* Banner */}
        <div className="relative h-36 overflow-hidden">
          {store.banner_url ? (
            <img src={getImageUrl(store.banner_url)} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${cat?.gradient || 'from-brand-500 to-brand-700'} flex items-center justify-center`}>
              <span className="text-5xl opacity-40">{cat?.icon || '🏝️'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {/* Logo */}
          <div className="absolute -bottom-6 left-4">
            <div className="w-12 h-12 rounded-xl border-2 border-surface-elevated overflow-hidden bg-surface-secondary shadow-lg">
              {store.logo_url ? (
                <img src={getImageUrl(store.logo_url)} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-black text-ink-tertiary">{name.charAt(0)}</div>
              )}
            </div>
          </div>
          {/* Category badge */}
          {cat && (
            <div className="absolute top-3 right-3 bg-surface-elevated/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-ink-secondary flex items-center gap-1">
              <span>{cat.icon}</span> {cat.label}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pt-8 pb-4 px-4">
          <h3 className="text-sm font-black text-ink-primary group-hover:text-accent-400 transition-colors line-clamp-1">{name}</h3>
          {store.owner_name && (
            <p className="text-[11px] text-ink-tertiary mt-0.5">by {store.owner_name}</p>
          )}
          <p className="text-xs text-ink-tertiary mt-1.5 line-clamp-2 leading-relaxed">{store.description}</p>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-primary">
            {rating ? (
              <StarRating rating={Number(rating)} />
            ) : (
              <span className="text-[10px] text-ink-tertiary font-medium">New provider</span>
            )}
            {store.badges && store.badges.length > 0 && (
              <span className="text-[10px] bg-accent-400/10 text-accent-500 font-bold px-2 py-0.5 rounded-full">
                ✓ {store.badges[0]}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ── Main Page ── */

export default function RentalsPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/stores');
        const raw = Array.isArray(res.data) ? res.data : (res.data?.stores || []);
        setStores(raw.map((s: any) => ({
          id: s.store_id || s.id,
          store_id: s.store_id,
          name: s.name || '',
          business_name: s.business_name || s.name || '',
          description: s.description || '',
          logo_url: s.logo_url || null,
          banner_url: s.banner_url || null,
          branding_color: s.branding_color || null,
          category: s.category || '',
          subtype: s.subtype || '',
          slug: s.slug || '',
          rating: s.rating || s.admin_rating || null,
          badges: s.badges || null,
          is_featured: s.is_featured || false,
          admin_rating: s.admin_rating || null,
          owner_name: s.owner_name || null,
        })));
      } catch {
        // Silent — show empty state
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let result = stores;
    if (activeCat !== 'all') {
      result = result.filter(s => categorise(s) === activeCat);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        `${s.name} ${s.business_name} ${s.description} ${s.subtype}`.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stores, activeCat, search]);

  const grouped = useMemo(() => {
    const map: Record<string, Store[]> = {};
    for (const c of CATEGORIES) map[c.id] = [];
    for (const s of filtered) {
      const cat = categorise(s);
      if (map[cat]) map[cat].push(s);
    }
    return map;
  }, [filtered]);

  return (
    <main className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <HeroBackground pageKey="rental-hub" fallbackTitle="Island Rentals" className="min-h-[55vh]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
            <span className="text-sm">🏝️</span>
            <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Island Rentals</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 drop-shadow-lg leading-tight">
            Rent from <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-sunset-300 bg-clip-text text-transparent">Local Providers</span>
          </h1>
          <p className="text-lg text-white/75 mb-10 font-medium max-w-xl mx-auto">
            Homes, vehicles, boats, equipment and more — all from verified Caribbean businesses.
          </p>

          {/* Search */}
          <div className="bg-surface-elevated rounded-full p-2 shadow-2xl flex items-center gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center gap-3 px-5">
              <svg className="w-5 h-5 text-accent-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search providers, rentals..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full py-2.5 text-ink-primary font-medium placeholder-ink-tertiary focus:outline-none text-sm bg-transparent"
              />
            </div>
            <button className="bg-accent-400 text-brand-950 px-7 py-3 rounded-full font-bold text-sm hover:bg-accent-300 transition-all shadow-lg shrink-0">
              Search
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8">
            {[
              { value: loading ? '—' : stores.length, label: 'Providers' },
              { value: CATEGORIES.length, label: 'Categories' },
              { value: '100%', label: 'Local' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </HeroBackground>

      {/* Category Tiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(activeCat === cat.id ? 'all' : cat.id)} className="text-left">
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 ${activeCat === cat.id ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-primary' : ''}`}>
                <span className="text-3xl mb-2 block">{cat.icon}</span>
                <h3 className="text-sm font-black mb-0.5">{cat.label}</h3>
                <p className="text-[11px] text-white/70">{cat.desc}</p>
                <span className="mt-3 inline-block text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full">
                  {loading ? '…' : (activeCat === 'all' ? (grouped[cat.id]?.length || 0) : filtered.length)} providers
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🏝️</span>
            <h3 className="text-2xl font-black text-ink-primary mb-2">No providers found</h3>
            <p className="text-ink-tertiary mb-6">Try adjusting your search or browse a different category.</p>
            <button onClick={() => { setSearch(''); setActiveCat('all'); }} className="px-8 py-3 bg-accent-400 text-brand-950 font-bold rounded-full text-sm">
              View All
            </button>
          </div>
        )}

        {(search || activeCat !== 'all') ? (
          /* Filtered Results */
          !loading && filtered.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-ink-primary mb-6">
                {search ? `Results for "${search}"` : CATEGORIES.find(c => c.id === activeCat)?.label}
                <span className="text-sm font-medium text-ink-tertiary ml-2">({filtered.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((store, idx) => <ProviderCard key={store.store_id || store.id} store={store} index={idx} />)}
              </div>
            </div>
          )
        ) : (
          /* Grouped by Category */
          CATEGORIES.map(cat => {
            const items = grouped[cat.id] || [];
            if (!loading && items.length === 0) return null;
            return (
              <section key={cat.id} className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-white text-lg`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-ink-primary">{cat.label}</h2>
                      <p className="text-xs text-ink-tertiary">{cat.desc}</p>
                    </div>
                  </div>
                  <Link href={`/rental-hub/${cat.id === 'vehicles' ? 'vehicles' : cat.id === 'equipment' ? 'equipment-tools' : cat.id === 'property' ? 'property' : cat.id === 'sea' ? 'sea-rentals' : 'stays'}`}
                    className="text-xs font-bold text-accent-500 hover:text-accent-400 transition-colors">
                    View all →
                  </Link>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-elevated border border-border-primary" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.slice(0, 3).map((store, idx) => <ProviderCard key={store.store_id || store.id} store={store} index={idx} />)}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}
