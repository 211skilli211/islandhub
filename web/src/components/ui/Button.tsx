'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-brand-600 to-accent-600 text-white
    hover:from-brand-700 hover:to-accent-700
    active:from-brand-800 active:to-accent-800
    shadow-md hover:shadow-lg
    disabled:from-brand-300 disabled:to-accent-300
  `,
  secondary: `
    bg-surface-secondary text-ink-primary border border-border-primary
    hover:bg-surface-tertiary hover:border-border-secondary
    active:bg-surface-tertiary
    disabled:opacity-50
  `,
  outline: `
    bg-transparent text-ink-primary border-2 border-border-primary
    hover:bg-surface-secondary hover:border-brand-500
    active:bg-surface-tertiary
    disabled:opacity-50
  `,
  ghost: `
    bg-transparent text-ink-secondary
    hover:bg-surface-secondary hover:text-ink-primary
    active:bg-surface-tertiary
    disabled:opacity-50
  `,
  danger: `
    bg-danger-600 text-white
    hover:bg-danger-700
    active:bg-danger-800
    shadow-md hover:shadow-lg
    disabled:bg-danger-300
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm font-semibold rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base font-bold rounded-xl gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  );
}

/* Icon-only button variant */
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  label: string; // aria-label
}

const iconSizeStyles: Record<string, string> = {
  sm: 'p-1.5 rounded-lg',
  md: 'p-2.5 rounded-xl',
  lg: 'p-3 rounded-xl',
};

export function IconButton({
  variant = 'ghost',
  size = 'md',
  icon,
  label,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2
        ${variantStyles[variant]}
        ${iconSizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}
