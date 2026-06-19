'use client';

import React from 'react';
import Link from 'next/link';
import { RatingBadge } from '@/components/hub/SharedComponents';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { getImageUrl } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT CARD — Amazon/Best Buy style for ALL hub listing pages
// Square image, tight padding, small text, 2-col mobile grid
// ═══════════════════════════════════════════════════════════════════════════════

interface CompactCardProps {
  href: string;
  imageUrl?: string;
  emoji?: string;
  title: string;
  subtitle?: string;
  price?: number;
  priceSuffix?: string;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  badgeColor?: string;
  meta?: string[];
  ctaLabel?: string;
  className?: string;
}

export function CompactCard({
  href, imageUrl, emoji = '📦', title, subtitle, price, priceSuffix = '/night',
  originalPrice, rating, reviewCount, badge, badgeColor = 'bg-accent-500',
  meta, ctaLabel, className = '',
}: CompactCardProps) {
  const img = imageUrl ? getImageUrl(imageUrl) : undefined;

  return (
    <Link href={href} className={`block group ${className}`}>
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-md transition-all">
        
        <div className="relative aspect-square bg-surface-secondary">
          {img ? (
            <img src={img} alt={title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl leading-none bg-gradient-to-br from-surface-secondary to-surface-tertiary">
              <EmojiIcon emoji={emoji} size={32} />
            </div>
          )}
          
          {badge && (
            <span className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>

        
        <div className="p-2.5 space-y-1">
          
          <h3 className="text-xs font-bold text-ink-primary group-hover:text-accent-500 line-clamp-2 leading-tight">
            {title}
          </h3>

          
          {subtitle && (
            <p className="text-[10px] text-ink-tertiary truncate">{subtitle}</p>
          )}

          
          {meta && meta.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {meta.map((m, i) => (
                <span key={i} className="text-[9px] text-ink-tertiary">{m}</span>
              ))}
            </div>
          )}

          
          {rating && rating > 0 && (
            <RatingBadge rating={rating} reviewCount={reviewCount} size="sm" />
          )}

          
          {price !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-ink-primary">${price.toFixed(0)}</span>
              {priceSuffix && <span className="text-[9px] text-ink-tertiary">{priceSuffix}</span>}
              {originalPrice && originalPrice > price && (
                <span className="text-[9px] text-ink-tertiary line-through ml-0.5">${originalPrice.toFixed(0)}</span>
              )}
            </div>
          )}

          
          {ctaLabel && (
            <span className="inline-block text-[10px] font-semibold text-accent-500 group-hover:text-accent-400">
              {ctaLabel} →
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPACT HUB PAGE WRAPPER — consistent layout for ALL hub category pages
// ═══════════════════════════════════════════════════════════════════════════════

interface CompactHubPageProps {
  title: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  loading?: boolean;
  skeletonCount?: number;
  emptyEmoji?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  filters?: string[];
  activeFilter?: string;
  onFilterChange?: (f: string) => void;
  sortOptions?: string[];
  activeSort?: string;
  onSortChange?: (s: string) => void;
  ctaSection?: React.ReactNode;
}

export function CompactHubPage({
  title, subtitle, emoji, gradient, items, renderCard,
  loading = false, skeletonCount = 6,
  emptyEmoji = '📦', emptyTitle = 'No items found', emptyMessage = 'Check back later.',
  filters, activeFilter, onFilterChange,
  sortOptions, activeSort, onSortChange,
  ctaSection,
}: CompactHubPageProps) {
  return (
    <div className="min-h-screen bg-surface-primary">
      
      <section className={`bg-gradient-to-br ${gradient} py-6 px-4`}>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-black text-white mb-1 leading-tight"><EmojiIcon emoji={emoji} size={28} className="inline-block mr-1" /> {title}</h1>
          <p className="text-sm text-white/70 max-w-xl mx-auto">{subtitle}</p>
        </div>
      </section>

      
      {filters && activeFilter && onFilterChange && (
        <div className="sticky top-[72px] z-30 bg-surface-primary/95 backdrop-blur-sm border-b border-border-primary">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => onFilterChange(f)}
                  className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-semibold transition-all ${
                    activeFilter === f
                      ? 'bg-accent-500 text-white'
                      : 'bg-surface-secondary text-ink-secondary hover:text-ink-primary border border-border-primary'
                  }`}
                >
                  {f}
                </button>
              ))}
              {sortOptions && activeSort && onSortChange && (
                <select
                  value={activeSort}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="ml-auto shrink-0 px-2 py-1 rounded-lg text-[10px] font-medium bg-surface-secondary border border-border-primary text-ink-secondary"
                >
                  {sortOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>
      )}

      
      <div className="max-w-7xl mx-auto px-4 py-4 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden">
                <div className="aspect-square bg-surface-secondary animate-pulse" />
                <div className="p-2.5 space-y-1.5">
                  <div className="h-3 bg-surface-secondary rounded animate-pulse w-3/4" />
                  <div className="h-2.5 bg-surface-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3"><EmojiIcon emoji={emptyEmoji} size={40} /></div>
            <h3 className="text-base font-bold text-ink-primary mb-1">{emptyTitle}</h3>
            <p className="text-xs text-ink-tertiary">{emptyMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((item, i) => renderCard(item, i))}
          </div>
        )}
      </div>

      
      {ctaSection}
    </div>
  );
}
