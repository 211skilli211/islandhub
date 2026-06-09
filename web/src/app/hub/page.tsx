'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HUB_CONFIGS } from '@/lib/hubConfigs';

const hubCategories = Object.values(HUB_CONFIGS).map((cfg) => ({
  type: cfg.type,
  slug: cfg.slug,
  title: cfg.fallbackTitle,
  subtitle: cfg.heroSubtitle,
  emoji: cfg.heroEmoji,
  gradient: cfg.theme.gradient,
  lightBg: cfg.theme.lightBg,
  lightText: cfg.theme.lightText,
}));

export default function HubRootPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Compact hero */}
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 py-10 md:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-black text-white mb-2">
            🌴 IslandHub
          </motion.h1>
          <p className="text-sm md:text-lg text-teal-200 max-w-xl mx-auto">
            Your gateway to everything the Caribbean has to offer.
          </p>
        </div>
      </section>

      {/* Category Grid — 2-col mobile, 4-col desktop */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {hubCategories.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/hub/${cat.slug}`}
                className="group block p-4 rounded-xl border border-border-primary bg-surface-elevated hover:border-accent-500/30 hover:shadow-md transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${cat.lightBg} flex items-center justify-center text-xl mb-2`}>
                  {cat.emoji}
                </div>
                <h2 className="text-sm font-bold text-ink-primary mb-0.5">{cat.title}</h2>
                <p className="text-[10px] text-ink-tertiary line-clamp-2">{cat.subtitle}</p>
                <span className={`mt-2 inline-flex items-center gap-0.5 text-[10px] font-medium ${cat.lightText}`}>
                  Explore →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
