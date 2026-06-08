'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface RecentItem {
  id: number;
  title: string;
  image_url: string;
  price: number;
  type: string;
  viewedAt: number;
}

const STORAGE_KEY = 'islandhub_recently_viewed';
const MAX_RECENT = 8;

export function getRecentlyViewed(): RecentItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addRecentlyViewed(item: Omit<RecentItem, 'viewedAt'>) {
  if (typeof window === 'undefined') return;
  const recent = getRecentlyViewed().filter(r => r.id !== item.id);
  recent.unshift({ ...item, viewedAt: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function RecentlyViewedSection() {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-ink-primary tracking-tight">Recently Viewed</h2>
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); setItems([]); }}
          className="text-xs font-bold text-ink-tertiary hover:text-ink-secondary transition-colors uppercase tracking-wider"
        >Clear</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link key={item.id} href={`/listings/${item.id}`} className="group">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-elevated border border-border-primary mb-2">
              <img
                src={item.image_url || '/assets/placeholder-listing.png'}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-xs font-bold text-ink-primary truncate group-hover:text-accent-400 transition-colors">{item.title}</p>
            <p className="text-sm font-black text-accent-400">${item.price?.toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-accent-500 text-white shadow-xl shadow-accent-500/30 flex items-center justify-center hover:bg-accent-400 transition-colors"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function CelebrationAnimation({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(() => onComplete?.(), 2000);
      return () => clearTimeout(t);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-7xl mb-4"
            >🎉</motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-black text-white drop-shadow-lg"
            >Added to cart!</motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
