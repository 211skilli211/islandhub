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
  border: cfg.theme.border,
  ring: cfg.theme.ring,
}));

export default function HubRootPage() {
  return (
    <div className="min-h-screen bg-background-primary">
      {/* Hub Gateway Hero */}
      <section className="bg-gradient-to-br from-ink-900 via-ocean-900 to-ink-950 py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-white mb-4"
          >
            🌴 IslandHub
          </motion.h1>
          <p className="text-lg md:text-xl text-ink-300 max-w-2xl mx-auto">
            Your gateway to everything the Caribbean has to offer. Browse categories, discover vendors, and shop local — all in one place.
          </p>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hubCategories.map((cat, i) => (
            <motion.div
              key={cat.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/hub/${cat.slug}`}
                className={`group block p-6 rounded-3xl border ${cat.border} ${cat.ring} hover:ring-2 transition-all duration-300 hover:shadow-xl bg-card-primary`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${cat.lightBg} mb-4 text-2xl`}>
                  {cat.emoji}
                </div>
                <h2 className="text-xl font-bold text-text-primary mb-1">{cat.title}</h2>
                <p className="text-sm text-text-secondary line-clamp-2">{cat.subtitle}</p>
                <div className={`mt-4 inline-flex items-center gap-1 text-sm font-medium ${cat.lightText} group-hover:translate-x-1 transition-transform`}>
                  Explore →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
