'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import UserProfileDropdown from './UserProfileDropdown';
import { useTheme } from '@/components/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { getImageUrl } from '@/lib/api';
import NotificationCenter from './NotificationCenter';
import { Search, Menu, X, ShoppingCart, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { href: '/stores', label: 'Explore' },
  { href: '/food', label: 'Food', color: 'coral' },
  { href: '/products', label: 'Shop', color: 'accent' },
  { href: '/rentals', label: 'Stays', color: 'palm' },
  { href: '/tours', label: 'Tours', color: 'sand' },
];

const EXPLORE_HUBS = [
  { href: '/food', label: 'Food & Dining', emoji: '🍽️', group: 'Marketplace' },
  { href: '/products', label: 'Local Shopping', emoji: '🛍️', group: 'Marketplace' },
  { href: '/services', label: 'Services', emoji: '🛠️', group: 'Marketplace' },
  { href: '/rentals', label: 'Rentals', emoji: '🏠', group: 'Marketplace' },
  { href: '/events', label: 'Events & Tickets', emoji: '🎫', group: 'Explore' },
  { href: '/tours', label: 'Tours', emoji: '🗺️', group: 'Explore' },
  { href: '/transport', label: 'Transport', emoji: '🚕', group: 'Explore' },
  { href: '/campaigns', label: 'Campaigns', emoji: '❤️', group: 'Impact' },
  { href: '/community', label: 'Community', emoji: '🌴', group: 'Impact' },
  { href: '/listings', label: 'Marketplace', emoji: '🏪', group: 'Marketplace' },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <nav
        className={`
          sticky top-0 z-50 transition-all duration-300
          ${scrolled
            ? 'glass shadow-md border-b border-border-primary'
            : 'bg-surface-primary/95 border-b border-transparent'
          }
        `}
        style={{ height: 'var(--navbar-height, 72px)' }}
      >
        <div className="max-w-[var(--content-max-width, 1280px)] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">

            {/* ═══ LEFT: Logo + Nav Links ═══ */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <Link href="/" className="shrink-0 group">
                <span className="text-display-md text-gradient-brand tracking-tight">
                  IslandHub
                </span>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden lg:flex items-center gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="px-3 py-2 text-body-sm font-semibold text-ink-secondary hover:text-ink-primary rounded-lg hover:bg-surface-secondary transition-all duration-200"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Explore Dropdown */}
                <div
                  className="relative"
                  onMouseEnter={() => setExploreOpen(true)}
                  onMouseLeave={() => setExploreOpen(false)}
                >
                  <button className="px-3 py-2 text-body-sm font-semibold text-ink-secondary hover:text-ink-primary rounded-lg hover:bg-surface-secondary transition-all duration-200 flex items-center gap-1">
                    More
                    <svg className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: exploreOpen ? 'rotate(180deg)' : 'rotate(0)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {exploreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-64 bg-surface-elevated rounded-2xl shadow-xl border border-border-primary py-3 z-50"
                      >
                        {EXPLORE_HUBS.map((hub, i) => (
                          <Link
                            key={hub.href}
                            href={hub.href}
                            className="flex items-center gap-3 px-4 py-2.5 text-body-sm font-medium text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors"
                          >
                            <span className="text-base">{hub.emoji}</span>
                            {hub.label}
                          </Link>
                        ))}
                        <div className="my-2 border-t border-border-primary" />
                        <Link
                          href="/store/ibt-solutions"
                          className="flex items-center gap-3 px-4 py-2.5 text-body-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <span className="text-base">⚡</span>
                          IBT Solutions
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ═══ CENTER: Search (desktop) ═══ */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                  if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
                }}
                className="w-full"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary" />
                  <input
                    name="search"
                    type="search"
                    placeholder="Search the island..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-secondary border border-border-primary text-body-sm text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* ═══ RIGHT: Actions ═══ */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-all"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-all"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* Notifications (authenticated) */}
              {mounted && isAuthenticated && (
                <div className="hidden sm:block">
                  <NotificationCenter />
                </div>
              )}

              {/* Auth buttons / Profile (desktop) */}
              <div className="hidden lg:flex items-center gap-2 ml-2">
                {mounted && (
                  isAuthenticated ? (
                    <UserProfileDropdown />
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="px-4 py-2 text-body-sm font-semibold text-ink-secondary hover:text-ink-primary rounded-lg transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        className="px-5 py-2.5 text-body-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl hover:from-brand-700 hover:to-accent-700 shadow-sm transition-all"
                      >
                        Join Free
                      </Link>
                    </>
                  )
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-surface-secondary transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE DRAWER ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-lg lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[320px] bg-surface-elevated/95 backdrop-blur-xl shadow-2xl lg:hidden flex flex-col overflow-y-auto"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
                <span className="text-headline-md text-white font-bold">IslandHub</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="p-4 border-b border-white/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                    if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q)}`); setMobileOpen(false); }
                  }}
                >
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      name="search"
                      type="search"
                      placeholder="Search the island..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-body-sm text-white placeholder:text-white/40 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    />
                  </div>
                </form>
              </div>

              {/* Mobile nav links */}
              <div className="flex-1 p-4 space-y-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-body-md font-bold text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="my-3 border-t border-white/10" />
                <div className="px-4 py-2 text-caption-xs text-white/40 font-semibold uppercase tracking-wider">Marketplace Hubs</div>

                {EXPLORE_HUBS.filter(h => h.group === 'Marketplace').map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-body-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                  >
                    <span>{hub.emoji}</span>
                    {hub.label}
                  </Link>
                ))}

                <div className="my-3 border-t border-white/10" />
                <div className="px-4 py-2 text-caption-xs text-white/40 font-semibold uppercase tracking-wider">Explore</div>

                {EXPLORE_HUBS.filter(h => h.group !== 'Marketplace').map((hub) => (
                  <Link
                    key={hub.href}
                    href={hub.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-body-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
                  >
                    <span>{hub.emoji}</span>
                    {hub.label}
                  </Link>
                ))}

                <div className="my-3 border-t border-white/10" />
                <Link
                  href="/store/ibt-solutions"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-body-sm font-bold text-accent-400 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <span>⚡</span>
                  IBT Solutions
                </Link>
              </div>

              {/* Mobile auth area */}
              <div className="p-4 border-t border-white/10 shrink-0 space-y-3">
                {mounted && (
                  isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 font-bold text-sm overflow-hidden">
                          {user?.avatar_url ? (
                            <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                          )}
                        </div>
                        <div>
                          <div className="text-body-sm font-bold text-white">{user?.name}</div>
                          <div className="text-caption text-white/50">{user?.email}</div>
                        </div>
                      </div>
                      <Link href="/profile" onClick={() => setMobileOpen(false)}
                        className="block w-full px-4 py-3 text-body-sm font-semibold text-white/80 bg-white/5 rounded-xl text-center hover:bg-white/10 transition-colors">
                        Edit Profile
                      </Link>
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}
                        className="block w-full px-4 py-3 text-body-sm font-semibold text-white/80 bg-white/5 rounded-xl text-center hover:bg-white/10 transition-colors">
                        Dashboard
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" onClick={() => setMobileOpen(false)}
                          className="block w-full px-4 py-3 text-body-sm font-bold text-accent-400 bg-accent-500/10 rounded-xl text-center hover:bg-accent-500/20 transition-colors">
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                        className="w-full px-4 py-3 text-body-sm font-semibold text-red-400 bg-red-500/10 rounded-xl text-center hover:bg-red-500/20 transition-colors">
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)}
                        className="block w-full px-4 py-3 text-body-sm font-semibold text-white border border-white/20 rounded-xl text-center hover:bg-white/10 transition-colors">
                        Log in
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)}
                        className="block w-full px-4 py-3 text-body-sm font-bold text-white bg-gradient-to-r from-brand-600 to-accent-600 rounded-xl text-center shadow-sm">
                        Join IslandHub
                      </Link>
                    </>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
