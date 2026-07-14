'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// ─── Hero Slider (Best Buy style manual carousel) ─────────────────────────────

export interface HeroSlide {
  id: string;
  badge?: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
  disclaimer?: string;
  gradient: string; // e.g. 'from-blue-600 to-cyan-500'
  imageUrl?: string;
  imageAlt?: string;
  sponsoredBy?: string;
}

interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function HeroSlider({ slides, autoPlay = false, autoPlayInterval = 5000, className = '' }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play
  React.useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(next, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, next, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <section className={`relative overflow-hidden rounded-2xl ${className}`}>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className={`relative bg-gradient-to-br ${slide.gradient} min-h-[220px] sm:min-h-[280px] flex flex-col justify-end p-5 sm:p-8`}
        >
          
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt={slide.imageAlt || ''}
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
            />
          )}

          
          <div className="relative z-10 text-white max-w-lg">
            {slide.sponsoredBy && (
              <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">{slide.sponsoredBy}</p>
            )}
            {slide.badge && (
              <span className="inline-block px-2 py-0.5 rounded bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                {slide.badge}
              </span>
            )}
            <h2 className="text-xl sm:text-3xl font-black text-white mb-1.5 leading-tight">{slide.headline}</h2>
            {slide.subheadline && (
              <p className="text-sm sm:text-base text-white/80 mb-3 line-clamp-2">{slide.subheadline}</p>
            )}
            {slide.ctaText && slide.ctaHref && (
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-900 text-xs font-bold rounded-lg hover:bg-white/90 transition-colors"
              >
                {slide.ctaText} →
              </Link>
            )}
            {slide.disclaimer && (
              <p className="text-[9px] text-white/50 mt-2">{slide.disclaimer}</p>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white items-center justify-center hover:bg-black/50 transition-colors z-20"
            aria-label="Previous slide"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white items-center justify-center hover:bg-black/50 transition-colors z-20"
            aria-label="Next slide"
          >
            ›
          </button>
        </>
      )}
    </section>
  );
}

// ─── Category Tiles Grid (Minimalist style) ─────────────────────────────────────

interface CategoryTile {
  id: string;
  label: string;
  imageUrl?: string;
  emoji?: string;
  href: string;
}

interface CategoryTilesProps {
  title: string;
  tiles: CategoryTile[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function CategoryTiles({ title, tiles, columns = 3, className = '' }: CategoryTilesProps) {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <section className={`py-4 ${className}`}>
      <h2 className="text-base font-bold text-theme-primary mb-3">{title}</h2>
      <div className={`grid ${colClass[columns]} gap-3`}>
        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="group relative block aspect-square rounded-xl bg-surface-primary border border-border-primary overflow-hidden flex flex-col p-4 group-hover:border-accent-500/30 group-hover:shadow-md transition-all"
          >
            {/* Top-left icon - direct on background, dark color */}
            <div className="absolute top-3 left-3 z-10 text-theme-primary">
              {tile.imageUrl ? (
                <span className="text-[10px] font-bold">•</span>
              ) : (
                <EmojiIcon emoji={tile.emoji || '📦'} size={24} />
              )}
            </div>
            
            {/* Center area - clean, empty */}
            <div className="flex-1 w-full" />
            
            {/* Bottom label - directly on clean background */}
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[10px] sm:text-xs font-medium text-theme-primary leading-tight truncate block">
                {tile.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Dynamic Category Tiles (API-driven) ───────────────────────────────────────

interface DynamicTile {
  tile_key: string;
  tile_label: string;
  tile_emoji: string;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
}

interface DynamicCategoryTilesProps {
  title: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function DynamicCategoryTiles({ title, columns = 3, className = '' }: DynamicCategoryTilesProps) {
  const [tiles, setTiles] = useState<DynamicTile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTiles = async () => {
      try {
        const res = await fetch('/api/tile-assets/public');
        if (res.ok) {
          const data = await res.json();
          // Filter active tiles and sort by display_order
          const activeTiles = (data || [])
            .filter((t: DynamicTile) => t.is_active)
            .sort((a: DynamicTile, b: DynamicTile) => a.display_order - b.display_order);
          setTiles(activeTiles);
        }
      } catch (e) {
        console.error('Failed to fetch tile assets:', e);
      }
      setLoading(false);
    };

    fetchTiles();
  }, []);

  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  // Default fallback tiles (matching homepage categoryTiles and admin tile manager)
  const fallbackTiles: DynamicTile[] = [
    // Homepage Main Categories
    { tile_key: 'food', tile_label: 'Food & Dining', tile_emoji: '🍽️', image_url: null, is_active: true, display_order: 1 },
    { tile_key: 'products', tile_label: 'Shopping', tile_emoji: '🛍️', image_url: null, is_active: true, display_order: 2 },
    { tile_key: 'services', tile_label: 'Services', tile_emoji: '🛠️', image_url: null, is_active: true, display_order: 3 },
    { tile_key: 'rentals', tile_label: 'Rentals', tile_emoji: '🏠', image_url: null, is_active: true, display_order: 4 },
    { tile_key: 'tours', tile_label: 'Tours', tile_emoji: '🗺️', image_url: null, is_active: true, display_order: 5 },
    { tile_key: 'transport', tile_label: 'Transport', tile_emoji: '🚕', image_url: null, is_active: true, display_order: 6 },
    { tile_key: 'events', tile_label: 'Events', tile_emoji: '🎫', image_url: null, is_active: true, display_order: 7 },
    { tile_key: 'campaigns', tile_label: 'Campaigns', tile_emoji: '❤️', image_url: null, is_active: true, display_order: 8 },
    { tile_key: 'community', tile_label: 'Community', tile_emoji: '🌴', image_url: null, is_active: true, display_order: 9 },

    // On-Demand Services (Homepage RequestServicesSection)
    { tile_key: 'taxi', tile_label: 'Request a Ride', tile_emoji: '🚕', image_url: null, is_active: true, display_order: 10 },
    { tile_key: 'food-delivery', tile_label: 'Order Food', tile_emoji: '🍔', image_url: null, is_active: true, display_order: 11 },
    { tile_key: 'delivery', tile_label: 'Pickup & Delivery', tile_emoji: '📦', image_url: null, is_active: true, display_order: 12 },

    // Service Subcategories
    { tile_key: 'services-professional', tile_label: 'Professional Services', tile_emoji: '💼', image_url: null, is_active: true, display_order: 13 },
    { tile_key: 'services-automotive', tile_label: 'Automotive Services', tile_emoji: '🚗', image_url: null, is_active: true, display_order: 14 },
    { tile_key: 'services-health', tile_label: 'Health & Beauty', tile_emoji: '💆', image_url: null, is_active: true, display_order: 15 },
    { tile_key: 'services-marine', tile_label: 'Marine Services', tile_emoji: '⚓', image_url: null, is_active: true, display_order: 16 },
    { tile_key: 'services-events', tile_label: 'Event Services', tile_emoji: '🎉', image_url: null, is_active: true, display_order: 17 },

    // Hot Deals Section Tiles
    { tile_key: 'hot-deals-electronics', tile_label: 'Electronics & Gadgets', tile_emoji: '📱', image_url: null, is_active: true, display_order: 18 },
    { tile_key: 'hot-deals-fashion', tile_label: 'Fashion & Accessories', tile_emoji: '👗', image_url: null, is_active: true, display_order: 19 },
    { tile_key: 'hot-deals-rentals', tile_label: 'Vacation Rentals', tile_emoji: '🏠', image_url: null, is_active: true, display_order: 20 },
    { tile_key: 'hot-deals-tours', tile_label: 'Tour Bundles', tile_emoji: '🗺️', image_url: null, is_active: true, display_order: 21 },

    // Business Solutions Section
    { tile_key: 'biz-ai', tile_label: 'AI Employees', tile_emoji: '🤖', image_url: null, is_active: true, display_order: 22 },
    { tile_key: 'biz-web', tile_label: 'Web & App Design', tile_emoji: '💻', image_url: null, is_active: true, display_order: 23 },
    { tile_key: 'biz-automation', tile_label: 'Automation', tile_emoji: '⚙️', image_url: null, is_active: true, display_order: 24 },
    { tile_key: 'biz-coops', tile_label: 'Co-ops', tile_emoji: '🤝', image_url: null, is_active: true, display_order: 25 },
  ];

  const displayTiles = tiles.length > 0 ? tiles : fallbackTiles;

  if (loading && tiles.length === 0) {
    return (
      <section className={`py-4 ${className}`}>
        <h2 className="text-base font-bold text-theme-primary mb-3">{title}</h2>
        <div className={`grid ${colClass[columns]} gap-3`}>
          {fallbackTiles.map((tile) => (
            <Link
              key={tile.tile_key}
              href={`/hub/${tile.tile_key}`}
              className="group relative block aspect-square rounded-xl bg-surface-primary border border-border-primary overflow-hidden flex flex-col p-4 group-hover:border-accent-500/30 group-hover:shadow-md transition-all"
            >
              <div className="absolute top-3 left-3 z-10 text-theme-primary">
                <EmojiIcon emoji={tile.tile_emoji} size={24} />
              </div>
              <div className="flex-1 w-full" />
              <div className="absolute bottom-3 left-3 right-3 text-left">
                <span className="text-[10px] sm:text-xs font-medium text-theme-primary leading-tight truncate block">
                  {tile.tile_label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-4 ${className}`}>
      <h2 className="text-base font-bold text-theme-primary mb-3">{title}</h2>
      <div className={`grid ${colClass[columns]} gap-3`}>
        {displayTiles.map((tile) => (
          <Link
            key={tile.tile_key}
            href={`/hub/${tile.tile_key}`}
            className="group relative block aspect-square rounded-xl bg-surface-primary border border-border-primary overflow-hidden flex flex-col p-4 group-hover:border-accent-500/30 group-hover:shadow-md transition-all"
          >
            {/* Top-left icon - direct on background, dark color */}
            <div className="absolute top-3 left-3 z-10 text-theme-primary">
              {tile.image_url ? (
                <span className="text-[10px] font-bold">•</span>
              ) : (
                <EmojiIcon emoji={tile.tile_emoji || '📦'} size={24} />
              )}
            </div>
            
            {/* Center area - background image if available, otherwise clean */}
            {tile.image_url && (
              <div className="absolute inset-0 -m-4">
                <img
                  src={tile.image_url}
                  alt={tile.tile_label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Center area - clean, empty */}
            <div className="flex-1 w-full relative z-10" />
            
            {/* Bottom label - directly on clean background */}
            <div className="absolute bottom-3 left-3 right-3 text-left">
              <span className="text-[10px] sm:text-xs font-medium text-theme-primary leading-tight truncate block">
                {tile.tile_label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Deal Card (Best Buy style) ───────────────────────────────────────────────

interface DealCardProps {
  imageUrl?: string;
  emoji?: string;
  offerText: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export function DealCard({ imageUrl, emoji, offerText, description, ctaText = 'Shop now', ctaHref = '#', className = '' }: DealCardProps) {
  return (
    <div className={`bg-surface-elevated rounded-xl border border-border-primary overflow-hidden ${className}`}>
      <div className="aspect-[4/3] bg-surface-secondary flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={offerText} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl"><EmojiIcon emoji={emoji || '🏷️'} size={32} /></span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-ink-primary mb-1">{offerText}</p>
        {description && <p className="text-[10px] text-ink-tertiary line-clamp-2 mb-2">{description}</p>}
        <Link href={ctaHref} className="text-[11px] font-semibold text-accent-500 hover:text-accent-400 inline-flex items-center gap-0.5">
          {ctaText} →
        </Link>
      </div>
    </div>
  );
}

// ─── Promo Card (Best Buy style — larger with headline) ───────────────────────

interface PromoCardProps {
  imageUrl?: string;
  emoji?: string;
  headline: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  className?: string;
}

export function PromoCard({ imageUrl, emoji, headline, description, ctaText = 'Explore', ctaHref = '#', className = '' }: PromoCardProps) {
  return (
    <div className={`bg-surface-elevated rounded-xl border border-border-primary overflow-hidden ${className}`}>
      <div className="aspect-[4/3] bg-gradient-to-br from-surface-secondary to-surface-tertiary flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={headline} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <span className="text-3xl"><EmojiIcon emoji={emoji || '🎯'} size={32} /></span>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-ink-primary mb-0.5">{headline}</h3>
        {description && <p className="text-[10px] text-ink-tertiary line-clamp-2 mb-2">{description}</p>}
        <Link href={ctaHref} className="text-[11px] font-semibold text-accent-500 hover:text-accent-400 inline-flex items-center gap-0.5">
          {ctaText} →
        </Link>
      </div>
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

interface ContentSectionProps {
  title: string;
  subtitle?: string;
  titleAlign?: 'left' | 'center';
  seeMoreHref?: string;
  seeMoreLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function ContentSection({ title, subtitle, titleAlign = 'center', seeMoreHref, seeMoreLabel = 'See more', children, className = '' }: ContentSectionProps) {
  return (
    <section className={`py-5 ${className}`}>
      <div className={`mb-4 ${titleAlign === 'center' ? 'text-center' : ''}`}>
        <h2 className={`text-base font-bold text-ink-primary leading-tight ${titleAlign === 'center' ? 'mx-auto' : ''}`}>{title}</h2>
        {subtitle && <p className="text-xs text-ink-tertiary mt-1 leading-relaxed">{subtitle}</p>}
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-xs font-medium text-accent-500 hover:text-accent-400 shrink-0 mt-1.5 inline-block">
            {seeMoreLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
