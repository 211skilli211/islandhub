'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption text-ink-secondary font-semibold"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-surface-primary border border-border-primary
            text-ink-primary text-body-sm
            placeholder:text-ink-tertiary
            transition-all duration-200 ease-out
            focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? 'pl-11' : ''}
            ${iconRight ? 'pr-11' : ''}
            ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
            ${className}
          `}
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary pointer-events-none">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p className="text-caption text-danger-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-ink-tertiary">{hint}</p>
      )}
    </div>
  );
}

/* Textarea variant */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption text-ink-secondary font-semibold"
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-surface-primary border border-border-primary
          text-ink-primary text-body-sm
          placeholder:text-ink-tertiary
          transition-all duration-200 ease-out
          focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-y min-h-[100px]
          ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-caption text-danger-500 font-medium">{error}</p>
      )}
      {hint && !error && (
        <p className="text-caption text-ink-tertiary">{hint}</p>
      )}
    </div>
  );
}

/* Select variant */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-caption text-ink-secondary font-semibold"
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-surface-primary border border-border-primary
          text-ink-primary text-body-sm
          transition-all duration-200 ease-out
          focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1rem]
          ${error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/20' : ''}
          ${className}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-caption text-danger-500 font-medium">{error}</p>
      )}
    </div>
  );
}
