'use client';

import { motion } from 'framer-motion';

interface ShimmerCardProps {
  layout?: 'default' | 'compact' | 'grid' | 'list';
}

export default function ShimmerCard({ layout = 'default' }: ShimmerCardProps) {
  if (layout === 'list') {
    return (
      <div className="flex items-center gap-4 p-3 sm:p-4 bg-surface-elevated rounded-2xl border border-border-primary animate-pulse">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-surface-tertiary shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-surface-tertiary rounded-lg w-3/4" />
          <div className="h-3 bg-surface-tertiary rounded-lg w-1/2" />
          <div className="h-3 bg-surface-tertiary rounded-lg w-1/4" />
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <div className="h-5 bg-surface-tertiary rounded-lg w-16" />
          <div className="h-3 bg-surface-tertiary rounded-lg w-12" />
        </div>
      </div>
    );
  }

  if (layout === 'grid') {
    return (
      <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary animate-pulse">
        <div className="aspect-square bg-surface-tertiary" />
        <div className="p-3 sm:p-4 space-y-2">
          <div className="h-4 bg-surface-tertiary rounded-lg w-3/4" />
          <div className="h-5 bg-surface-tertiary rounded-lg w-1/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-elevated rounded-2xl overflow-hidden border border-border-primary animate-pulse">
      <div className="aspect-[16/10] bg-surface-tertiary" />
      <div className="p-5 md:p-8 space-y-3">
        <div className="h-6 bg-surface-tertiary rounded-lg w-2/3" />
        <div className="h-3 bg-surface-tertiary rounded-lg w-1/4" />
        <div className="h-4 bg-surface-tertiary rounded-lg w-full" />
        <div className="h-4 bg-surface-tertiary rounded-lg w-3/4" />
        <div className="pt-4 mt-6 border-t border-border-primary flex justify-between">
          <div className="h-8 bg-surface-tertiary rounded-lg w-24" />
          <div className="h-4 bg-surface-tertiary rounded-lg w-16" />
        </div>
      </div>
    </div>
  );
}

export function ShimmerGrid({ count = 8, layout = 'default' }: { count?: number; layout?: 'default' | 'compact' | 'grid' | 'list' }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerCard key={i} layout={layout} />
      ))}
    </>
  );
}
