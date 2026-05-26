'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import { getImageUrl } from '@/lib/api';
import NotificationCenter from './NotificationCenter';
import {
  Search, Menu, X, ShoppingCart, Sun, Moon,
  Home, Store, UtensilsCrossed, ShoppingBag, Bed, Map,
  Calendar, Users, MessageSquare, Heart, Zap, ChevronRight,
  User, Settings, LogOut, Bell, Compass
} from 'lucide-react';

// ─── Navigation Data ───
const PRIMARY_NAV = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/stores', label: 'Explore', icon: Compass },
  { href: '/community', label: 'Community', icon: Users },
];

const MARKETPLACE = [
  { href: '/food', label: 'Food & Dining', icon: UtensilsCrossed },
  { href: '/products', label: 'Shop', icon: ShoppingBag },
  { href: '/rentals', label: 'Stays', icon: Bed },
  { href: '/tours', label: 'Tours', icon: Map },
];

const EXPLORE = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/services', label: 'Services', icon: Zap },
  { href: '/campaigns', label: 'Campaigns', icon: Heart },
];

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => { logout(); router.push('/'); };

  const navItemClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-150";
  const navItemActiveClass = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-700 bg-teal-50 transition-all duration-150";
  const sectionLabel = "px-3 pt-4 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-400";

  return (
    <>
      {/* ═══ TOP NAV BAR ═══ */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/60'
            : 'bg-white border-b border-slate-100'
        }`}
        style={{ height: 'var(--navbar-height, 64px)' }}
      >
        <div className="max-w-[var(--content-max-width, 1280px)] mx-auto px-4 sm:px-6 h-full">
          <div className="flex items-center justify-between h-full">

            {/* LEFT: Logo + Primary Nav */}
            <div className="flex items-center gap-6">
              <Link href="/" className="shrink-0">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
                  IslandHub
                </span>
              </Link>

              {/* Desktop Primary Nav */}
              <div className="hidden lg:flex items-center gap-0.5">
                {PRIMARY_NAV.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-all duration-150"
                    >
                      <Icon size={16} className="text-slate-400" />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CENTER: Search */}
            <div className="hidden md:flex flex-1 max-w-sm mx-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                  if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
                }}
                className="w-full"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="search"
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/10 transition-all"
                  />
                </div>
              </form>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex items-center gap-1">
              {mounted && (
                <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all" aria-label="Toggle theme">
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}

              <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all" aria-label="Cart">
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {mounted && isAuthenticated && (
                <div className="hidden sm:block"><NotificationCenter /></div>
              )}

              {/* Profile / Auth */}
              <div className="hidden lg:flex items-center gap-1 ml-1">
                {mounted && (
                  isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <Link href="/profile" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                          {user?.avatar_url ? (
                            <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
                          )}
                        </div>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors">
                        Log in
                      </Link>
                      <Link href="/register" className="px-4 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                        Join
                      </Link>
                    </>
                  )
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-all ml-1"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-[280px] bg-white shadow-2xl lg:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">IslandHub</span>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Search */}
              <div className="px-3 py-3 border-b border-slate-100">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
                  if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q)}`); setMobileOpen(false); }
                }}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input name="search" type="search" placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-teal-400 transition-all" />
                  </div>
                </form>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-3 py-2">
                {/* Primary */}
                <div className="space-y-0.5">
                  {PRIMARY_NAV.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={navItemClass}>
                        <Icon size={18} className="text-slate-400" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-3 border-t border-slate-100" />
                <div className={sectionLabel}>Marketplace</div>
                <div className="space-y-0.5">
                  {MARKETPLACE.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={navItemClass}>
                        <Icon size={18} className="text-slate-400" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-3 border-t border-slate-100" />
                <div className={sectionLabel}>Explore</div>
                <div className="space-y-0.5">
                  {EXPLORE.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={navItemClass}>
                        <Icon size={18} className="text-slate-400" />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="my-3 border-t border-slate-100" />
                <Link href="/store/ibt-solutions" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all">
                  <Zap size={18} className="text-indigo-500" />
                  IBT Solutions
                </Link>
              </div>

              {/* Auth Area */}
              <div className="px-3 py-3 border-t border-slate-100 shrink-0">
                {mounted && (
                  isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-2 py-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                          {user?.avatar_url ? (
                            <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900 truncate">{user?.name}</div>
                          <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <Link href="/profile" onClick={() => setMobileOpen(false)} className={navItemClass}>
                          <User size={18} className="text-slate-400" /> Edit Profile
                        </Link>
                        <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={navItemClass}>
                          <Settings size={18} className="text-slate-400" /> Dashboard
                        </Link>
                        {user?.role === 'admin' && (
                          <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-all">
                            <Settings size={18} className="text-indigo-500" /> Admin Panel
                          </Link>
                        )}
                        <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all w-full text-left">
                          <LogOut size={18} className="text-red-400" /> Log out
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl text-center hover:bg-slate-50 transition-colors">
                        Log in
                      </Link>
                      <Link href="/register" onClick={() => setMobileOpen(false)} className="block w-full px-4 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl text-center hover:bg-slate-800 transition-colors">
                        Join IslandHub
                      </Link>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
