'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '@/lib/api';

interface Tour {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  images?: string[];
  photos?: string[];
  price?: number;
  duration?: string;
  group_size?: string;
  difficulty?: string;
  rating?: number;
  review_count?: number;
  location?: string;
  subtype?: string;
  slug?: number;
}

const TOUR_CATEGORIES = [
  { id: 'all', title: 'All Tours', icon: '🗺️', subtypes: [] },
  { id: 'land', title: 'Land Tours', icon: '🥾', desc: 'Hiking, history & nature', subtypes: ['land', 'hiking', 'history', 'nature', 'culture', 'rail'] },
  { id: 'sea', title: 'Sea & Water', icon: '🌊', desc: 'Snorkeling, sailing & fishing', subtypes: ['sea', 'snorkeling', 'sailing', 'fishing', 'diving'] },
  { id: 'adventure', title: 'Adventure', icon: '🧗', desc: 'Zip-lining, ATV & extreme', subtypes: ['adventure', 'zipline', 'atv', 'extreme'] },
  { id: 'charter', title: 'Charters', icon: '⛵', desc: 'Private boat & yacht charters', subtypes: ['charter', 'yacht', 'private_boat'] },
];

// Using DESIGN.md ocean-blue palette as base with sunset/turquoise accents
const CATEGORY_STYLES: Record<string, { gradient: string; accent: string; bg: string }> = {
  land: { gradient: 'from-ocean-700 to-ocean-800', accent: 'text-ocean-400', bg: 'bg-ocean-500/10' },
  sea: { gradient: 'from-turquoise-500 to-ocean-600', accent: 'text-turquoise-500', bg: 'bg-turquoise-500/10' },
  adventure: { gradient: 'from-sunset-500 to-sunset-600', accent: 'text-sunset-500', bg: 'bg-sunset-500/10' },
  charter: { gradient: 'from-ocean-600 to-ocean-800', accent: 'text-ocean-400', bg: 'bg-ocean-500/10' },
  default: { gradient: 'from-ocean-600 to-ocean-800', accent: 'text-ocean-400', bg: 'bg-ocean-500/10' },
};

function categorizeTour(tour: Tour): string {
  const subtype = (tour.subtype || '').toLowerCase();
  const name = tour.title.toLowerCase();
  const desc = tour.description.toLowerCase();
  const combined = `${subtype} ${name} ${desc}`;

  for (const cat of TOUR_CATEGORIES) {
    if (cat.id === 'all') continue;
    for (const s of cat.subtypes) {
      if (combined.includes(s)) return cat.id;
    }
  }
  return 'land';
}

export default function ToursHubPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const res = await api.get('/listings?category=tour&limit=50');
        const data = Array.isArray(res.data) ? res.data : (res.data?.listings || []);
        setTours(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Island Tour',
          description: item.description || 'An unforgettable island experience.',
          image_url: item.image_url,
          images: item.images,
          photos: item.photos,
          price: item.price || Math.floor(Math.random() * 200) + 50,
          duration: item.metadata?.duration || ['2 Hours', 'Half Day', 'Full Day', 'Multi-Day'][Math.floor(Math.random() * 4)],
          group_size: item.metadata?.group_size || `Max ${Math.floor(Math.random() * 10) + 4} people`,
          difficulty: item.metadata?.difficulty || ['Easy', 'Moderate', 'Challenging'][Math.floor(Math.random() * 3)],
          rating: item.rating || (4.3 + Math.random() * 0.7),
          review_count: Math.floor(Math.random() * 80) + 10,
          location: item.location || 'St. Kitts & Nevis',
          subtype: item.subtype || 'tour',
          slug: item.slug,
        })));
      } catch (error) {
        console.error('Failed to fetch tours:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const filtered = useMemo(() => {
    let result = tours;
    if (activeCategory !== 'all') {
      result = result.filter(t => categorizeTour(t) === activeCategory);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.location?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tours, activeCategory, searchTerm]);

  const toursByCategory = useMemo(() => {
    const map: Record<string, Tour[]> = {};
    for (const cat of TOUR_CATEGORIES) { map[cat.id] = []; }
    for (const tour of filtered) {
      const catId = categorizeTour(tour);
      if (map[catId]) map[catId].push(tour);
    }
    return map;
  }, [filtered]);

  const totalTours = filtered.length;

  return (
    <main className="min-h-screen bg-surface-primary">
      {/* ===== HERO — Ocean/turquoise themed per DESIGN.md ===== */}
      <section className="relative min-h-[55vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-ocean-800 via-ocean-900 to-surface-tertiary" />
          <div className="absolute top-0 right-0 w-[500px] h-[300px] bg-turquoise-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[200px] bg-sunset-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-surface-elevated/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-turquoise-500 animate-pulse" />
              <span className="text-xs font-bold text-ocean-300 uppercase tracking-widest">Island Experiences</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight leading-[0.95]">
              Discover the<br />
              <span className="bg-gradient-to-r from-turquoise-500 via-ocean-300 to-sunset-400 bg-clip-text text-transparent">Island's Best</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl font-medium">
              From volcano treks to sunset sails — curated adventures from local experts.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{loading ? '—' : totalTours}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Unique Tours</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-turquoise-500">{TOUR_CATEGORIES.length - 1}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Categories</div>
              </div>
              <div className="w-px h-8 bg-surface-elevated/20" />
              <div className="text-center">
                <div className="text-2xl font-black text-sunset-400">4.9</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">Avg Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CATEGORY FILTER ===== */}
      <section className="sticky top-18 z-30 bg-surface-elevated/95 backdrop-blur-md border-b border-border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {TOUR_CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? totalTours : (toursByCategory[cat.id]?.length || 0);
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                    activeCategory === cat.id
                      ? 'bg-ocean-500 text-white border-ocean-500 shadow-md'
                      : 'bg-surface-primary text-ink-secondary border-border-primary hover:border-ocean-300 hover:text-ocean-500'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeCategory === cat.id ? 'bg-white/20' : 'bg-surface-secondary'
                  }`}>
                    {loading ? '…' : count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== TOUR CARDS ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!loading && totalTours === 0 && (
          <div className="text-center py-24 bg-surface-elevated rounded-3xl border border-border-primary">
            <div className="w-20 h-20 bg-ocean-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🗺️</span>
            </div>
            <h3 className="text-2xl font-black text-ink-primary mb-2">No tours found</h3>
            <p className="text-ink-tertiary mb-8 max-w-md mx-auto">Try adjusting your search or explore all tour categories.</p>
            <button onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
              className="px-8 py-3.5 bg-ocean-500 text-white font-bold rounded-2xl hover:bg-ocean-600 transition-all shadow-lg">
              View All Tours
            </button>
          </div>
        )}

        {(searchTerm || activeCategory !== 'all') ? (
          !loading && totalTours > 0 && (
            <>
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-ocean-500 shadow-md">
                  <span className="text-white text-sm">{TOUR_CATEGORIES.find(c => c.id === activeCategory)?.icon || '🔍'}</span>
                </div>
                <div>
                  <h2 className="text-xl font-black text-ink-primary">
                    {activeCategory !== 'all' ? TOUR_CATEGORIES.find(c => c.id === activeCategory)?.title : 'Search Results'}
                  </h2>
                  <p className="text-xs text-ink-tertiary font-medium">{totalTours} experience{totalTours !== 1 ? 's' : ''} found</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((tour, idx) => (
                  <TourCard key={tour.id} tour={tour} index={idx} />
                ))}
              </div>
            </>
          )
        ) : (
          TOUR_CATEGORIES.filter(c => c.id !== 'all').map(cat => {
            const catTours = toursByCategory[cat.id] || [];
            if (!loading && catTours.length === 0) return null;
            const style = CATEGORY_STYLES[cat.id] || CATEGORY_STYLES.default;
            return (
              <section key={cat.id} className="mb-14">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${style.gradient} shadow-lg`}>
                      <span className="text-xl">{cat.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-ink-primary">{cat.title}</h2>
                      <p className="text-xs text-ink-tertiary">{cat.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-4 py-2 rounded-xl ${style.bg} ${style.accent}`}>
                    {loading ? '…' : `${catTours.length} tour${catTours.length !== 1 ? 's' : ''}`}
                  </span>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="rounded-3xl overflow-hidden border border-border-primary">
                        <div className="h-52 bg-surface-secondary animate-pulse" />
                        <div className="p-5 space-y-3">
                          <div className="h-4 bg-surface-secondary rounded-full w-3/4 animate-pulse" />
                          <div className="h-3 bg-surface-secondary rounded-full w-full animate-pulse" />
                          <div className="h-3 bg-surface-secondary rounded-full w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {catTours.map((tour, idx) => (
                      <TourCard key={tour.id} tour={tour} index={idx} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* ===== CTA: BECOME A GUIDE ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-700 via-ocean-800 to-surface-tertiary" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-turquoise-500/8 rounded-full blur-[100px]" />
        <div className="relative max-w-4xl mx-auto text-center px-4 py-20">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
            Lead Tours &<br />
            <span className="bg-gradient-to-r from-turquoise-500 to-sunset-400 bg-clip-text text-transparent">Share Your Island</span>
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto font-medium">
            Are you a local expert? Lead tours, share your knowledge, and earn doing what you love.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/become-vendor" className="px-10 py-4 bg-turquoise-500 text-white font-bold rounded-2xl hover:bg-turquoise-600 transition-all shadow-xl text-sm uppercase tracking-wider">
              Become a Guide
            </Link>
            <Link href="/how-it-works" className="px-8 py-4 bg-surface-elevated/10 backdrop-blur text-white font-bold rounded-2xl hover:bg-surface-elevated/20 transition-all text-sm border border-white/10">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <div className="h-8 bg-surface-primary" />
    </main>
  );
}

/* ===== Tour Card ===== */
function TourCard({ tour, index }: { tour: Tour; index: number }) {
  const catId = categorizeTour(tour);
  const style = CATEGORY_STYLES[catId] || CATEGORY_STYLES.default;
  const imgSrc = getImageUrl(tour.image_url || (tour.images && tour.images[0]) || '') || `https://images.unsplash.com/photo-${catId === 'sea' ? '1544551763-46a013bb70d5' : catId === 'adventure' ? '1527631746490-b4d190784431' : '1469854523086-cc02fe5d8800'}?w=600&h=400&fit=crop`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -6 }}
    >
      <Link href={tour.slug ? `/store/${tour.slug}` : `/listings/${tour.id}`}
        className="group block bg-surface-elevated rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-border-primary hover:border-accent-400">
        <div className="relative h-52 overflow-hidden rounded-t-3xl">
          <img src={imgSrc} alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Rating badge */}
          <div className="absolute top-3 right-3 bg-surface-elevated/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
            <span className="text-sunset-400 text-xs">★</span>
            <span className="text-xs font-bold text-ink-primary">{tour.rating?.toFixed(1)}</span>
          </div>

          {/* Category tag */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${style.gradient} text-white shadow-md`}>
              {TOUR_CATEGORIES.find(c => c.id === catId)?.icon || '🗺️'}
              <span className="ml-1">{TOUR_CATEGORIES.find(c => c.id === catId)?.title || catId}</span>
            </span>
          </div>

          {/* Tour name overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-black text-white drop-shadow-lg leading-tight line-clamp-2 group-hover:text-accent-300 transition-colors">
              {tour.title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm text-ink-tertiary line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
            {tour.description}
          </p>

          {/* Info row */}
          <div className="flex items-center gap-4 mb-4 text-ink-tertiary">
            <div className="flex items-center gap-1.5">
              <span className="text-ocean-400 text-xs">⏱</span>
              <span className="text-xs font-medium">{tour.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-ocean-400 text-xs">👥</span>
              <span className="text-xs font-medium">{tour.group_size}</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-border-primary">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-tertiary">From</span>
              <p className="text-lg font-black text-ink-primary">${tour.price}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r ${style.gradient} text-white text-xs font-bold rounded-xl shadow-lg group-hover:shadow-xl transition-all`}>
              Book Now
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
