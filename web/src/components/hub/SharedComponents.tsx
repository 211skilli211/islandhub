'use client';

import React from 'react';

// ─── Rating Badge ────────────────────────────────────────────────────────────

interface RatingBadgeProps {
  rating?: number | string;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function RatingBadge({ rating, reviewCount, size = 'sm', showCount = true }: RatingBadgeProps) {
  const r = rating ? Number(rating) : 0;
  if (r <= 0 && !reviewCount) return null;

  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  return (
    <span className={`inline-flex items-center font-semibold text-amber-500 ${sizeClasses[size]}`}>
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {r > 0 && <span>{r.toFixed(1)}</span>}
      {showCount && reviewCount ? (
        <span className="text-ink-tertiary font-normal ml-0.5">({reviewCount})</span>
      ) : null}
    </span>
  );
}

// ─── Price Tag ───────────────────────────────────────────────────────────────

interface PriceTagProps {
  price: number | string;
  suffix?: string;
  originalPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceTag({ price, suffix = '/night', originalPrice, size = 'md', className = '' }: PriceTagProps) {
  const p = typeof price === 'string' ? parseFloat(price) : price;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <span className={`inline-flex items-baseline gap-1.5 font-bold text-ink-primary ${sizeClasses[size]} ${className}`}>
      <span>${p.toFixed(0)}</span>
      {suffix && <span className="text-xs font-normal text-ink-tertiary">{suffix}</span>}
      {originalPrice && originalPrice > p && (
        <span className="text-sm font-normal text-ink-tertiary line-through ml-1">
          ${originalPrice.toFixed(0)}
        </span>
      )}
    </span>
  );
}

// ─── Availability Badge ──────────────────────────────────────────────────────

interface AvailabilityBadgeProps {
  status: 'open' | 'closed' | 'available' | 'limited' | 'unavailable' | 'spots-left';
  label?: string;
  count?: number;
  pulse?: boolean;
}

export function AvailabilityBadge({ status, label, count, pulse = true }: AvailabilityBadgeProps) {
  const config = {
    'open': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', defaultLabel: 'Open' },
    'closed': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400', defaultLabel: 'Closed' },
    'available': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500', defaultLabel: 'Available' },
    'limited': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500', defaultLabel: 'Limited' },
    'unavailable': { bg: 'bg-ink-tertiary/10', text: 'text-ink-tertiary', dot: 'bg-ink-tertiary', defaultLabel: 'Unavailable' },
    'spots-left': { bg: 'bg-amber-500/10', text: 'text-amber-400', dot: 'bg-amber-500', defaultLabel: count ? `${count} spots left` : 'Few spots left' },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {pulse && (status === 'open' || status === 'available' || status === 'limited' || status === 'spots-left') ? (
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      )}
      {label || c.defaultLabel}
    </span>
  );
}

// ─── Urgency Cue ─────────────────────────────────────────────────────────────

interface UrgencyCueProps {
  type: 'scarcity' | 'time' | 'demand' | 'trending';
  value: string;
}

export function UrgencyCue({ type, value }: UrgencyCueProps) {
  const config = {
    scarcity: { icon: '⚡', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    time: { icon: '⏰', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
    demand: { icon: '🔥', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    trending: { icon: '📈', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  };

  const c = config[type];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${c.color} ${c.bg}`}>
      <span>{c.icon}</span>
      {value}
    </span>
  );
}

// ─── Filter Bar ──────────────────────────────────────────────────────────────

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  sortOptions?: string[];
  activeSort?: string;
  onSortChange?: (sort: string) => void;
  className?: string;
}

export function FilterBar({
  filters,
  activeFilter,
  onFilterChange,
  sortOptions,
  activeSort,
  onSortChange,
  className = '',
}: FilterBarProps) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-1 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
            activeFilter === filter
              ? 'bg-accent-500 text-white shadow-sm'
              : 'bg-surface-secondary text-ink-secondary hover:text-ink-primary border border-border-primary'
          }`}
        >
          {filter}
        </button>
      ))}

      {sortOptions && activeSort && onSortChange && (
        <div className="ml-auto shrink-0 flex items-center gap-1">
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs font-medium bg-surface-secondary border border-border-primary text-ink-secondary focus:outline-none focus:border-accent-500"
          >
            {sortOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

// ─── Image Gallery ───────────────────────────────────────────────────────────

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide';
  /** If true, shows as a swipeable carousel; if false, shows a static grid */
  carousel?: boolean;
  className?: string;
}

export function ImageGallery({
  images,
  alt = '',
  aspectRatio = 'video',
  carousel = true,
  className = '',
}: ImageGalleryProps) {
  const [current, setCurrent] = React.useState(0);
  const [imgErrors, setImgErrors] = React.useState<Set<number>>(new Set());

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
  };

  if (!images.length) {
    return (
      <div className={`${aspectClasses[aspectRatio]} bg-surface-secondary rounded-2xl flex items-center justify-center ${className}`}>
        <span className="text-3xl opacity-30">🏝️</span>
      </div>
    );
  }

  if (!carousel) {
    return (
      <div className={`grid grid-cols-2 gap-2 rounded-2xl overflow-hidden ${className}`}>
        {images.slice(0, 4).map((src, i) => (
          <div key={i} className={images.length === 1 ? 'col-span-2 aspect-video' : 'aspect-square'}>
            {imgErrors.has(i) ? (
              <div className="w-full h-full bg-surface-secondary flex items-center justify-center">
                <span className="text-2xl opacity-30">🏝️</span>
              </div>
            ) : (
              <img
                src={src}
                alt={`${alt} photo ${i + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImgErrors(prev => new Set(prev).add(i))}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${aspectClasses[aspectRatio]} rounded-2xl overflow-hidden bg-surface-secondary ${className}`}>
      {/* Slides */}
      {images.map((src, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {imgErrors.has(i) ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl opacity-30">🏝️</span>
            </div>
          ) : (
            <img
              src={src}
              alt={`${alt} photo ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgErrors(prev => new Set(prev).add(i))}
            />
          )}
        </div>
      ))}

      {/* Navigation dots */}
      {images.length > 1 && (
        <>
          {/* Prev/Next arrows */}
          <button
            onClick={() => setCurrent(p => (p - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => setCurrent(p => (p + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            →
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === current ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/40 text-white text-[10px] font-medium">
          {current + 1}/{images.length}
        </div>
      )}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🏝️', title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="text-lg font-bold text-ink-primary mb-1">{title}</h3>
      {message && <p className="text-sm text-ink-secondary mb-4">{message}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-accent-500 text-white text-sm font-semibold rounded-xl hover:bg-accent-600 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
