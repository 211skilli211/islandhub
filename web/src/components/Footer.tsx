'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const FOOTER_LINKS = {
  marketplace: [
    { href: '/food', label: 'Food & Dining' },
    { href: '/products', label: 'Shop' },
    { href: '/rentals', label: 'Stays & Rentals' },
    { href: '/tours', label: 'Tours' },
    { href: '/services', label: 'Services' },
    { href: '/listings', label: 'Marketplace' },
    { href: '/events', label: 'Events' },
    { href: '/campaigns', label: 'Campaigns' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/store/ibt-solutions', label: 'IBT Solutions' },
    { href: '/become-vendor', label: 'Become a Vendor' },
    { href: '/community', label: 'Community' },
  ],
  support: [
    { href: '/help', label: 'Help Center' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

const SOCIAL_LINKS = [
  { href: 'https://facebook.com/islandhub', label: 'Facebook', icon: '📘' },
  { href: 'https://instagram.com/islandhub', label: 'Instagram', icon: '📸' },
  { href: 'https://x.com/islandhub', label: 'X (Twitter)', icon: '🐦' },
  { href: 'https://wa.me/1869', label: 'WhatsApp', icon: '💬' },
];

export default function Footer() {
  return (
    <footer className="bg-surface-tertiary border-t border-border-primary">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">

          
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏝️</span>
                <span className="text-lg font-black text-ink-primary tracking-tight">IslandHub</span>
              </div>
            </Link>
            <p className="text-sm text-ink-tertiary leading-relaxed mb-6 max-w-xs">
              The Caribbean's commerce hub. Connecting local artisans, restaurants, and services to the community.
            </p>
            
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-surface-elevated border border-border-primary flex items-center justify-center text-sm hover:bg-surface-secondary hover:border-accent-300 transition-all"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-tertiary mb-4">Marketplace</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.marketplace.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-secondary hover:text-accent-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-tertiary mb-4">Company</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.company.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-secondary hover:text-accent-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-ink-tertiary mb-4">Support</h3>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.support.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-secondary hover:text-accent-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        
        <div className="mt-12 pt-8 border-t border-border-primary">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold text-ink-primary mb-1">Stay in the loop</h3>
              <p className="text-xs text-ink-tertiary">Get updates on new vendors, deals, and island events.</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-64 px-4 py-2.5 bg-surface-elevated border border-border-primary rounded-xl text-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-accent-400 transition-all"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-accent-500 text-white rounded-xl text-sm font-bold hover:bg-accent-600 transition-colors whitespace-nowrap"
              >
                Start
              </button>
            </form>
          </div>
        </div>
      </div>

      
      <div className="border-t border-border-primary bg-surface-elevated/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-ink-tertiary">
              © {new Date().getFullYear()} IslandHub. All rights reserved. Made with 💙 in St. Kitts & Nevis.
            </p>
            <div className="flex items-center gap-4 text-xs text-ink-tertiary">
              <Link href="/terms" className="hover:text-ink-secondary transition-colors">Terms</Link>
              <span>.</span>
              <Link href="/privacy" className="hover:text-ink-secondary transition-colors">Privacy</Link>
              <span>.</span>
              <Link href="/cookies" className="hover:text-ink-secondary transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
