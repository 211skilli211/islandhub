'use client';

import React from 'react';

/* Skeleton loading states — match content shape */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse rounded-lg
        bg-surface-tertiary
        ${className}
      `}
    />
  );
}

/* Text line skeleton */
export function SkeletonText({ width = '100%' }: { width?: string }) {
  return <Skeleton className="h-4" style={{ width }} />;
}

/* Avatar / circle skeleton */
export function SkeletonAvatar({ size = 40 }: { size?: number }) {
  return <Skeleton className="rounded-full" style={{ width: size, height: size }} />;
}

/* Card skeleton */
export function SkeletonCard() {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-5 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonAvatar size={40} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

/* Table row skeleton */
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border-primary">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/* Stats card skeleton */
export function SkeletonStat() {
  return (
    <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

/* List skeleton — multiple items */
export function SkeletonList({ count = 5, type = 'card' }: { count?: number; type?: 'card' | 'row' | 'stat' }) {
  const Item = type === 'card' ? SkeletonCard : type === 'stat' ? SkeletonStat : () => (
    <tr><SkeletonTableRow /></tr>
  );

  return (
    <div className={type === 'row' ? '' : 'space-y-4'}>
      {Array.from({ length: count }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

/* Page-level skeleton */
export function SkeletonPage() {
  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStat key={i} />
        ))}
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
