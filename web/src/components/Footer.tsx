'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Send } from 'lucide-react';

const FOOTER_HUBS = [
  { href: '/food', label: 'Food & Dining' },
  { href: '/products', label: 'Local Shopping' },
  { href: '/services', label: 'Services' },
  { href: '/rentals', label: 'Stays & Rentals' },
  { href: '/tours', label: 'Tours' },
  { href: '/transport', label: 'Transport' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/community', label: 'Community' },
];

const FOOTER_COMPANY = [
  { href: '/about', label: 'About Us' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
  { href: '/store/ibt-solutions', label: 'IBT Solutions' },
];

const FOOTER_SUPPORT = [
  { href: '/faq', label: 'FAQ' },
  { href: '/help', label: 'Help Center' },
  { href: '/safety', label: 'Safety' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-surface-secondary border-t border-border-primary">
      {/* Main footer */}
      <div className="max-w-[var(--content-max-width, 1280px)] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-display-md text-gradient-brand tracking-tight">
                IslandHub
              </span>
            </Link>
            <p className="mt-4 text-body-sm text-ink-secondary max-w-sm leading-relaxed">
              The Caribbean's premier marketplace — connecting local businesses,
              artisans, and service providers across St. Kitts & Nevis and beyond.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-6 max-w-sm">
              <label className="text-caption text-ink-secondary font-semibold block mb-2">
                Stay in the loop
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-primary border border-border-primary text-body-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 text-white shadow-sm hover:shadow-md transition-all shrink-0"
                  aria-label="Subscribe"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {subscribed && (
                <p className="mt-2 text-caption text-success-600 font-semibold">
                  ✓ Thanks for subscribing!
                </p>
              )}
            </form>

            {/* Social links */}
            <div className="flex items-center gap-4 mt-6">
              <a href="https://twitter.com/islandhub" target="_blank" rel="noopener noreferrer"
                className="text-ink-tertiary hover:text-brand-500 transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://instagram.com/islandhub" target="_blank" rel="noopener noreferrer"
                className="text-ink-tertiary hover:text-coral-500 transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://facebook.com/islandhub" target="_blank" rel="noopener noreferrer"
                className="text-ink-tertiary hover:text-brand-600 transition-colors" aria-label="Facebook">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
            </div>
          </div>

          {/* Marketplace Hubs */}
          <div>
            <h4 className="text-caption text-ink-secondary font-bold uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-3">
              {FOOTER_HUBS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-ink-secondary hover:text-ink-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-caption text-ink-secondary font-bold uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {FOOTER_COMPANY.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-ink-secondary hover:text-ink-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-caption text-ink-secondary font-bold uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {FOOTER_SUPPORT.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-ink-secondary hover:text-ink-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border-primary bg-surface-primary">
        <div className="max-w-[var(--content-max-width, 1280px)] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-caption text-ink-tertiary">
              © {new Date().getFullYear()} IslandHub. All rights reserved. Made with 💙 in St. Kitts & Nevis.
            </p>
            <div className="flex items-center gap-4">
              {/* Currency indicator */}
              <span className="text-caption text-ink-tertiary font-semibold">XCD $</span>
              {/* Status indicator */}
              <span className="flex items-center gap-1.5 text-caption text-success-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
