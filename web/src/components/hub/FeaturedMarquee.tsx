'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface Provider {
  id: string;
  name: string;
  business_name?: string;
  slug: string;
  logo_url?: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  subtype?: string;
}

interface FeaturedMarqueeProps {
  providers: Provider[];
  hubType: string;
}

export default function FeaturedMarquee({ providers, hubType }: FeaturedMarqueeProps) {
  if (!providers || providers.length === 0) return null;

  const scrollProviders = [...providers, ...providers]; // duplicate for infinite scroll

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-surface-elevated via-surface-primary to-surface-elevated border-y border-border-primary">
      
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface-primary to-transparent z-10 pointer-events-none" />
      
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-primary to-transparent z-10 pointer-events-none" />

      <div className="py-4">
        <div className="flex items-center gap-2 px-4 mb-3">
          <span className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Featured</span>
          <div className="h-px flex-1 bg-border-primary" />
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="flex gap-4 px-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            {scrollProviders.map((provider, i) => (
              <Link
                key={`${provider.id}-${i}`}
                href={`/hub/${hubType}/store/${provider.slug}`}
                className="shrink-0 group"
              >
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-surface-elevated border border-border-primary hover:border-accent-500/30 hover:shadow-lg transition-all">
                  
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center overflow-hidden shrink-0">
                    {provider.logo_url ? (
                      <img src={provider.logo_url} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-accent-500 font-bold text-sm">
                        {(provider.name || provider.business_name || 'P').charAt(0)}
                      </span>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-ink-primary group-hover:text-accent-500 truncate max-w-[160px]">
                      {provider.name || provider.business_name}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      {provider.rating && (
                        <EmojiIcon emoji="★" size=16 className="text-[10px] font-bold text-amber-500" />
                      )}
                      {provider.subtype && (
                        <span className="text-[10px] text-ink-tertiary capitalize">{provider.subtype.replace(/_/g, ' ')}</span>
                      )}
                    </div>
                  </div>
                  {provider.is_featured && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-bold text-amber-600">
                      ★
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
