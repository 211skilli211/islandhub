'use client';

import { useEffect, useState, useCallback } from 'react';

// ─── Reduced Motion Detection ───────────────────────────────────────────────
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return prefersReduced;
}

// ─── Keyboard Navigation Helper ─────────────────────────────────────────────
export function useKeyboardNavigation(ref: React.RefObject<HTMLElement | null>, onActivate?: () => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate?.();
      }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  }, [ref, onActivate]);
}

// ─── Focus Visible (keyboard-only focus rings) ──────────────────────────────
export function useFocusVisible() {
  const [isKeyboard, setIsKeyboard] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Tab') setIsKeyboard(true); };
    const onMouseDown = () => setIsKeyboard(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('mousedown', onMouseDown); };
  }, []);
  return isKeyboard;
}

// ─── Filter Persistence ─────────────────────────────────────────────────────
const FILTER_PREFIX = 'islandhub_filter_';

export function getPersistedFilter(key: string): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return '';
  try { return localStorage.getItem(FILTER_PREFIX + key) || ''; } catch { return ''; }
}

export function setPersistedFilter(key: string, value: string) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    if (value) localStorage.setItem(FILTER_PREFIX + key, value);
    else localStorage.removeItem(FILTER_PREFIX + key);
  } catch { /* quota exceeded */ }
}

// ─── Screen Reader Announcements ────────────────────────────────────────────
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return;
  const el = document.createElement('div');
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', priority);
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => document.body.removeChild(el), 1000);
}

// ─── Success State Hook ─────────────────────────────────────────────────────
export function useSuccessState(duration = 3000) {
  const [isSuccess, setIsSuccess] = useState(false);
  const trigger = useCallback(() => {
    setIsSuccess(true);
    announceToScreenReader('Action completed successfully');
    setTimeout(() => setIsSuccess(false), duration);
  }, [duration]);
  return { isSuccess, trigger };
}

// ─── Error State Hook ───────────────────────────────────────────────────────
export function useErrorState() {
  const [error, setError] = useState<string | null>(null);
  const set = useCallback((msg: string) => {
    setError(msg);
    announceToScreenReader(`Error: ${msg}`, 'assertive');
  }, []);
  const clear = useCallback(() => setError(null), []);
  return { error, setError: set, clearError: clear };
}
