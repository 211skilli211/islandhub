'use client';

import React, { useState, useCallback } from 'react';
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

// ─── Category Tiles Grid (Best Buy style) ─────────────────────────────────────

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
      <h2 className="text-base font-bold text-ink-primary mb-3">{title}</h2>
      <div className={`grid ${colClass[columns]} gap-3`}>
        {tiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="w-full aspect-square rounded-xl bg-surface-elevated border border-border-primary overflow-hidden flex items-center justify-center group-hover:border-accent-500/30 transition-all">
              {tile.imageUrl ? (
                <img src={tile.imageUrl} alt={tile.label} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-2xl leading-none"><EmojiIcon emoji={tile.emoji || '📦'} size={28} /></span>
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-ink-secondary group-hover:text-accent-500 text-center leading-tight">
              {tile.label}
            </span>
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
