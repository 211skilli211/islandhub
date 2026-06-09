'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getRentalSubHubs } from '@/lib/hubConfigs';

const emojiMap: Record<string, string> = {
  stays: '🏖️',
  cars: '🚗',
  sea: '🚤',
  longterm: '🏢',
  equipment: '🔧',
};

const descriptionMap: Record<string, string> = {
  stays: 'Vacation homes, villas, and beach houses',
  cars: 'Rent a car and explore the island',
  sea: 'Boats, jet skis, and watercraft',
  longterm: 'Monthly and annual leases',
  equipment: 'Tools, gear, and equipment for rent',
};

export default function RentalsGatewayPage() {
  const subHubs = getRentalSubHubs();

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-900 via-cyan-900 to-teal-800 py-6 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-black text-white mb-3"
          >
            🏠 Island Rentals
          </motion.h1>
          <p className="text-lg text-teal-200 max-w-2xl mx-auto">
            From beachfront villas to tools and equipment — find everything you need for your island stay.
          </p>
        </div>
      </section>

      {/* Sub-hub Cards */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subHubs.map((sub, i) => (
            <motion.div
              key={sub.categoryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={`/hub/rentals/${sub.categoryId}`}
                className="group block p-6 rounded-2xl border border-border-primary bg-surface-elevated hover:border-accent-500/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-4xl mb-3">
                  {emojiMap[sub.categoryId] || '📦'}
                </div>
                <h2 className="text-xl font-bold text-ink-primary mb-1 group-hover:text-accent-500 transition-colors">
                  {sub.pageTitle}
                </h2>
                <p className="text-sm text-ink-secondary mb-3">
                  {descriptionMap[sub.categoryId] || sub.subtitle}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-accent-500 group-hover:translate-x-1 transition-transform">
                  Browse →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
