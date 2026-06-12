'use client';

import Link from 'next/link';
import FacebookGrid from '@/components/marketplace/FacebookGrid';
import NewArrivals from '@/components/marketplace/NewArrivals';

const QUICK_LINKS = [
  { emoji: '🔥', label: 'Deals', href: '/deals', desc: 'Hot offers & promotions', gradient: 'from-rose-500 to-red-600' },
  { emoji: '✨', label: 'New Arrivals', href: '#new-arrivals', desc: 'Just listed items', gradient: 'from-amber-500 to-orange-600' },
  { emoji: '🏷️', label: 'Categories', href: '#browse', desc: 'Shop by category', gradient: 'from-teal-500 to-cyan-600' },
  { emoji: '⭐', label: 'Top Rated', href: '/hub/products?sort=rating', desc: 'Highest rated products', gradient: 'from-purple-500 to-indigo-600' },
];

export default function ProductsMarketplacePage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-800 via-cyan-900 to-teal-900 py-10 md:py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Marketplace</h1>
          <p className="text-sm md:text-base text-white/60 max-w-xl mx-auto">
            Discover local brands, Caribbean products, and exclusive deals from island shops.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="rounded-xl border border-border-primary bg-surface-elevated p-4 text-center hover:border-accent-500/30 transition-all group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">{link.emoji}</span>
              <h3 className="text-sm font-semibold text-ink-primary">{link.label}</h3>
              <p className="text-[10px] text-ink-tertiary mt-0.5">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <div id="new-arrivals">
        <NewArrivals title="✨ Just Landed" seeMoreHref="/hub/products?sort=newest" limit={10} />
      </div>

      {/* Browse All Listings — Facebook Marketplace Grid */}
      <div id="browse" className="border-t border-border-primary pt-6">
        <FacebookGrid title="Browse All Products" seeMoreHref="/hub/products/all" initialCategory="product" limit={24} />
      </div>

      {/* Bottom CTA */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-gradient-to-r from-teal-600/20 to-cyan-600/20 border border-accent-500/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-ink-primary">Own a Shop?</h2>
          <p className="mt-2 text-ink-tertiary text-sm">
            List your products on IslandHub and reach thousands of Caribbean shoppers.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/become-vendor"
              className="rounded-xl bg-accent-500 px-6 py-3 font-medium text-white transition-colors hover:bg-accent-600"
            >
              Sell on IslandHub
            </Link>
            <Link
              href="/deals"
              className="rounded-xl border border-border-primary bg-surface-elevated px-6 py-3 font-medium text-ink-secondary transition-colors hover:border-accent-500/20 hover:text-ink-primary"
            >
              Browse Deals →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
