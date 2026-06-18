'use client';

import React from 'react';

type BadgeVariant = 'default' | 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-tertiary text-ink-secondary',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  success: 'bg-palm-100 text-palm-700 dark:bg-palm-900/40 dark:text-palm-300',
  warning: 'bg-sand-100 text-sand-700 dark:bg-sand-900/40 dark:text-sand-300',
  danger: 'bg-coral-100 text-coral-700 dark:bg-coral-900/40 dark:text-coral-300',
  info: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-ink-tertiary',
  brand: 'bg-brand-500',
  accent: 'bg-accent-500',
  success: 'bg-palm-500',
  warning: 'bg-sand-500',
  danger: 'bg-coral-500',
  info: 'bg-brand-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-[11px] font-semibold',
  md: 'px-2.5 py-1 text-xs font-bold',
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

/* Status badge — common pattern for active/pending/suspended */
interface StatusBadgeProps {
  status: 'active' | 'pending' | 'suspended' | 'inactive' | 'approved' | 'rejected';
  size?: BadgeSize;
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string; dot: boolean }> = {
  active: { variant: 'success', label: 'Active', dot: true },
  approved: { variant: 'success', label: 'Approved', dot: true },
  pending: { variant: 'warning', label: 'Pending', dot: true },
  suspended: { variant: 'danger', label: 'Suspended', dot: true },
  inactive: { variant: 'default', label: 'Inactive', dot: true },
  rejected: { variant: 'danger', label: 'Rejected', dot: true },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.inactive;
  return (
    <Badge variant={config.variant} size={size} dot={config.dot}>
      {config.label}
    </Badge>
  );
}
