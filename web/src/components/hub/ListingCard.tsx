'use client';

import React from 'react';
import Link from 'next/link';
import { RatingBadge, UrgencyCue } from '@/components/hub/SharedComponents';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import { getImageUrl } from '@/lib/api';

// ─── Discount Badge ───────────────────────────────────────────────────────────

interface DiscountBadgeProps {
  value: string;
  position?: 'top-left' | 'bottom-left';
}

export function DiscountBadge({ value, position = 'top-left' }: DiscountBadgeProps) {
  return (
    <span className={`absolute ${position === 'top-left' ? 'top-2 left-2' : 'bottom-2 left-2'} px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold z-10`}>
      {value}
    </span>
  );
}

// ─── Urgency Badge ────────────────────────────────────────────────────────────

interface UrgencyBadgeProps {
  value: string;
  variant?: 'limited' | 'countdown' | 'trending' | 'scarcity';
}

export function UrgencyBadge({ value, variant = 'limited' }: UrgencyBadgeProps) {
  const colors = {
    limited: 'text-red-500',
    countdown: 'text-red-500',
    trending: 'text-amber-500',
    scarcity: 'text-orange-500',
  };
  return (
    <span className={`text-[10px] font-bold ${colors[variant]}`}>
      {value}
    </span>
  );
}

// ─── Product Card (Amazon-style 2-col mobile grid) ────────────────────────────

interface ProductCardProps {
  id: number | string;
  name: string;
  slug: string;
  imageUrl?: string;
  emoji?: string;
  price?: number;
  originalPrice?: number;
  suffix?: string;
  rating?: number;
  reviewCount?: number;
  discount?: string;
  urgency?: string;
  urgencyVariant?: 'limited' | 'countdown' | 'trending' | 'scarcity';
  badges?: { label: string; color?: string }[];
  href: string;
  variant?: 'product' | 'service' | 'store' | 'vendor';
  // Service-specific
  providerName?: string;
  availability?: string;
  // Store-specific
  productCount?: number;
  isVerified?: boolean;
}

export function ProductCard({
  name, slug, imageUrl, emoji = '📦', price, originalPrice, suffix,
  rating, reviewCount, discount, urgency, urgencyVariant,
  badges, href, variant = 'product', providerName, availability,
  productCount, isVerified,
}: ProductCardProps) {
  const img = imageUrl ? getImageUrl(imageUrl) : undefined;

  return (
    <Link href={href} className="block group">
      <div className="bg-surface-elevated rounded-xl border border-border-primary overflow-hidden hover:border-accent-500/30 hover:shadow-md transition-all">
        
        <div className="relative aspect-square bg-surface-secondary">
          {img ? (
            <img src={img} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-gradient-to-br from-surface-secondary to-surface-tertiary">
              <EmojiIcon emoji={emoji || '📦'} size={32} />
            </div>
          )}
          
          {discount && <DiscountBadge value={discount} />}
          
          {isVerified && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-emerald-500/90 text-white text-[9px] font-bold">
              ✓
            </span>
          )}
        </div>

        
        <div className="p-2.5 space-y-1">
          
          <h3 className="text-xs font-medium text-ink-primary group-hover:text-accent-500 line-clamp-2 leading-tight">
            {name}
          </h3>

          
          {providerName && (
            <p className="text-[10px] text-ink-tertiary truncate">{providerName}</p>
          )}

          
          {rating && rating > 0 && (
            <div className="flex items-center gap-1">
              <RatingBadge rating={rating} reviewCount={reviewCount} size="sm" />
            </div>
          )}

          
          {price !== undefined && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-ink-primary">${price.toFixed(0)}</span>
              {suffix && <span className="text-[10px] text-ink-tertiary">{suffix}</span>}
              {originalPrice && originalPrice > price && (
                <span className="text-[10px] text-ink-tertiary line-through">${originalPrice.toFixed(0)}</span>
              )}
            </div>
          )}

          
          {urgency && (
            <UrgencyBadge value={urgency} variant={urgencyVariant || 'limited'} />
          )}

          
          {availability && (
            <p className="text-[10px] text-emerald-500 font-medium">{availability}</p>
          )}

          
          {productCount !== undefined && (
            <p className="text-[10px] text-ink-tertiary">{productCount} products</p>
          )}

          
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {badges.map((b, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded bg-surface-secondary text-[9px] font-medium text-ink-secondary">
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Horizontal Carousel Section ──────────────────────────────────────────────

interface CarouselSectionProps {
  title: string;
  seeMoreHref?: string;
  seeMoreLabel?: string;
  children: React.ReactNode;
  className?: string;
}

export function CarouselSection({ title, seeMoreHref, seeMoreLabel = 'See more', children, className = '' }: CarouselSectionProps) {
  return (
    <section className={`py-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-ink-primary">{title}</h2>
        {seeMoreHref && (
          <Link href={seeMoreHref} className="text-xs font-medium text-accent-500 hover:text-accent-400">
            {seeMoreLabel} →
          </Link>
        )}
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {children}
      </div>
    </section>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeMoreHref?: string;
  seeMoreLabel?: string;
}

export function SectionHeader({ title, subtitle, seeMoreHref, seeMoreLabel = 'See more' }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="text-lg font-bold text-ink-primary">{title}</h2>
        {subtitle && <p className="text-xs text-ink-tertiary mt-0.5">{subtitle}</p>}
      </div>
      {seeMoreHref && (
        <Link href={seeMoreHref} className="text-xs font-medium text-accent-500 hover:text-accent-400 shrink-0">
          {seeMoreLabel} →
        </Link>
      )}
    </div>
  );
}
