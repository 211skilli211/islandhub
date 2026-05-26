'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';
import SiloSubNav from '@/app/rental-hub/SiloSubNav';

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url?: string;
  images?: string[];
  location?: string;
  subtype?: string;
  bedrooms?: number;
  bathrooms?: number;
  guests?: number;
  amenities?: string[];
  rating?: number;
  review_count?: number;
  slug?: string;
}

const PROPERTY_TYPES = [
  { id: 'all', label: 'All', icon: '🏝️' },
  { id: 'villa', label: 'Villas', icon: '🏛️' },
  { id: 'apartment', label: 'Apartments', icon: '🏢' },
  { id: 'studio', label: 'Studios', icon: '🛏️' },
  { id: 'condo', label: 'Condos', icon: '🏠' },
  { id: 'cottage', label: 'Cottages', icon: '🏡' },
];

const AMENITY_ICONS: Record<string, string> = {
  'wifi': '📶', 'pool': '🏊', 'ac': '❄️', 'parking': '🅿️',
  'kitchen': '🍳', 'washer': '🧺', 'tv': '📺', 'balcony': '🌅',
  'garden': '🌴', 'beach': '🏖️', 'gym': '💪', 'security': '🔒',
};

export default function StaysHubPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [guestsFilter, setGuestsFilter] = useState(0);

  useEffect(() => {
    const fetchStays = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?category=rental&sub_category=stays,apartment,villa,condo,studio,cottage');
        const data = Array.isArray(res.data) ? res.data : (res.data.listings || []);
        setListings(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Untitled',
          description: item.description || '',
          price: item.price || null,
          image_url: item.image_url || (item.images && item.images[0]),
          location: item.location || item.pickup_location?.address || 'St. Kitts',
          subtype: item.subtype || 'apartment',
          bedrooms: item.metadata?.bedrooms || null,
          bathrooms: item.metadata?.bathrooms || null,
          guests: item.metadata?.guests || null,
          amenities: item.metadata?.amenities || null,
          rating: item.rating || null,
          review_count: null,
          slug: item.slug,
        })));
      } catch (error) {
        console.error('Failed to fetch stays:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStays();
  }, []);

  const filtered = useMemo(() => {
    let result = listings;
    if (activeType !== 'all') {
      result = result.filter(l => l.subtype?.toLowerCase().includes(activeType));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    }
    if (guestsFilter > 0) {
      result = result.filter(l => (l.guests || 0) >= guestsFilter);
    }
    return result;
  }, [listings, activeType, searchQuery, guestsFilter]);

  const featured = filtered.slice(0, 3);
  const remaining = filtered.slice(3);

    const SILOS = [
        { id: 'stays', title: 'Stays & Homes', icon: '🏠', href: '/rental-hub/stays' },
        { id: 'vehicles', title: 'Vehicles', icon: '🚗', href: '/rental-hub/vehicles' },
        { id: 'sea', title: 'Sea & Aquatic', icon: '⛵', href: '/rental-hub/sea-rentals' },
        { id: 'equipment', title: 'Equipment & Tools', icon: '🛠️', href: '/rental-hub/equipment-tools' },
        { id: 'property', title: 'Land & Property', icon: '🏘️', href: '/rental-hub/property' },
    ];

    return (
    <main className="min-h-screen bg-surface-primary">
      <SiloSubNav current="stays" silos={SILOS} />

      {/* ===== HERO — Immersive with search overlay ===== */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-900 via-brand-800 to-surface-tertiary" />
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
          {/* Warm glow accents per DESIGN.md */}
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-sunset-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-turquoise-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-turquoise-500 animate-pulse" />
              <span className="text-xs font-bold text-sand-100 uppercase tracking-widest">Island Stays</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-[0.95]">
              Find Your<br />
              <span className="bg-gradient-to-r from-sand-100 via-turquoise-500 to-sunset-400 bg-clip-text text-transparent">
                Island Home
              </span>
            </h1>
            <p className="text-lg text-sand-200/70 mb-10 max-w-xl font-medium">
              Villas, apartments, cottages and studios — handpicked stays across St. Kitts & Nevis.
            </p>

            {/* Search bar — Airbnb style */}
            <div className="bg-surface-elevated rounded-2xl p-2 shadow-2xl max-w-3xl flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4">
                <svg className="w-5 h-5 text-sunset-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by location, property name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 text-ink-primary font-medium placeholder:text-ink-tertiary focus:outline-none text-sm bg-transparent"
                />
              </div>
              <div className="hidden sm:block w-px bg-border-primary" />
              <div className="flex items-center gap-3 px-4">
                <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider whitespace-nowrap">Guests</span>
                <select
                  value={guestsFilter}
                  onChange={(e) => setGuestsFilter(Number(e.target.value))}
                  className="py-3 text-ink-primary font-medium focus:outline-none text-sm bg-transparent cursor-pointer"
                >
                  <option value={0}>Any</option>
                  <option value={2}>2+</option>
                  <option value={4}>4+</option>
                  <option value={6}>6+</option>
                </select>
              </div>
              <button className="bg-sunset-500 hover:bg-sunset-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{loading ? '—' : listings.length}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Properties</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-turquoise-500">4.9</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Avg Rating</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-sunset-400">24/7</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sand-200/50">Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PROPERTY TYPE FILTER ===== */}
      <section className="sticky top-18 z-30 bg-surface-elevated/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {PROPERTY_TYPES.map(type => {
              const count = type.id === 'all' ? listings.length : listings.filter(l => l.subtype?.toLowerCase().includes(type.id)).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                    activeType === type.id
                      ? 'bg-ocean-500 text-white border-ocean-500 shadow-md'
                      : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-ocean-300 hover:text-ocean-500'
                  }`}
                >
                  <span>{type.icon}</span>
                  <span>{type.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeType === type.id ? 'bg-white/20' : 'bg-surface-secondary'
                  }`}>
                    {loading ? '…' : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROPERTIES ===== */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-ink-primary tracking-tight">Featured Stays</h2>
              <p className="text-sm text-ink-tertiary">Hand-picked properties for an unforgettable island experience</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((item, idx) => (
              <FeaturedStayCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* ===== ALL LISTINGS ===== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-ink-primary">
            {activeType !== 'all' ? `${PROPERTY_TYPES.find(t => t.id === activeType)?.label || 'Results'}` : 'All Properties'}
            <span className="ml-2 text-sm font-bold text-ink-tertiary">({filtered.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-surface-secondary rounded-2xl mb-3" />
                <div className="h-4 bg-surface-secondary rounded-full w-3/4 mb-2" />
                <div className="h-3 bg-surface-secondary rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 bg-surface-elevated rounded-3xl border border-border-primary">
            <span className="text-5xl mb-4 block">🏘️</span>
            <h3 className="text-xl font-black text-ink-primary mb-2">No properties found</h3>
            <p className="text-ink-tertiary mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveType('all'); setGuestsFilter(0); }}
              className="px-6 py-3 bg-ocean-500 text-white font-bold rounded-xl"
            >
              View All Stays
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(remaining.length > 0 ? remaining : filtered).map((item, idx) => (
              <StayCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* ===== CTA: BECOME A HOST ===== */}
      <section className="relative overflow-hidden mt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-900 to-surface-tertiary" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sunset-500/5 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-sand-100 uppercase tracking-widest">Become a Host</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight">
            Have a Property?<br />
            <span className="bg-gradient-to-r from-turquoise-500 to-sunset-400 bg-clip-text text-transparent">Start Earning Today</span>
          </h2>
          <p className="text-sand-200/70 text-lg mb-10 max-w-xl mx-auto font-medium">
            List your villa, apartment, or cottage and connect with travelers from around the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/become-vendor" className="px-10 py-4 bg-sunset-500 text-white font-bold rounded-2xl hover:bg-sunset-600 transition-all shadow-xl text-sm uppercase tracking-wider">
              List Your Property
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-surface-elevated/10 backdrop-blur text-white font-bold rounded-2xl hover:bg-surface-elevated/20 transition-all text-sm border border-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Spacer for footer */}
      <div className="h-8 bg-surface-primary" />
    </main>
  );
}

/* ===== Featured Stay Card — Large, premium ===== */
function FeaturedStayCard({ item, index }: { item: Listing; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group md:col-span-1"
    >
      <Link href={item.slug ? `/store/${item.slug}` : `/listings/${item.id}`}>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3">
          {item.image_url ? (
            <img src={getImageUrl(item.image_url)} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ocean-700 to-ocean-900 flex items-center justify-center">
              <span className="text-5xl opacity-40">🏠</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-surface-elevated/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
            <span className="text-lg font-black text-ink-primary">${item.price}</span>
            <span className="text-xs text-ink-tertiary font-medium"> / night</span>
          </div>
          {/* Location */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-black text-white drop-shadow-lg leading-tight">{item.title}</h3>
            <p className="text-xs text-white/70 font-medium">{item.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-tertiary">
          <span className="font-bold text-sunset-400">★ {item.rating?.toFixed(1)}</span>
          <span>({item.review_count} reviews)</span>
          <span>·</span>
          <span>{item.bedrooms} bed</span>
          <span>·</span>
          <span>{item.guests} guests</span>
        </div>
      </Link>
    </motion.div>
  );
}

/* ===== Standard Stay Card ===== */
function StayCard({ item, index }: { item: Listing; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={item.slug ? `/store/${item.slug}` : `/listings/${item.id}`}>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-surface-secondary">
          {item.image_url ? (
            <img src={getImageUrl(item.image_url)} alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ocean-600/30 to-ocean-800/30 flex items-center justify-center">
              <span className="text-4xl opacity-40">🏠</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 bg-surface-elevated/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-sm">
            <span className="text-sm font-black text-ink-primary">${item.price}</span>
            <span className="text-[10px] text-ink-tertiary"> / night</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-ink-primary group-hover:text-ocean-500 transition-colors line-clamp-1 leading-tight">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-sunset-400 text-xs">★</span>
              <span className="text-xs font-bold text-ink-primary">{item.rating?.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-xs text-ink-tertiary line-clamp-1">{item.location}</p>
          <div className="flex items-center gap-2 text-[10px] text-ink-tertiary font-medium">
            <span>{item.bedrooms} bed</span>
            <span>·</span>
            <span>{item.bathrooms} bath</span>
            <span>·</span>
            <span>{item.guests} guests</span>
          </div>
          {item.amenities && item.amenities.length > 0 && (
            <div className="flex gap-1 pt-1">
              {item.amenities.slice(0, 4).map(a => (
                <span key={a} className="text-xs" title={a}>{AMENITY_ICONS[a] || '✓'}</span>
              ))}
              {item.amenities.length > 4 && (
                <span className="text-[10px] text-ink-tertiary">+{item.amenities.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
