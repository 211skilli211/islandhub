'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut, User, Menu } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  isSectionSwitch?: boolean;
}

export interface SidebarUser {
  name: string;
  avatar_url?: string;
  role?: string;
}

export interface SidebarProps {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: SidebarItem[];
  backHref: string;
  backLabel: string;
  onLogout: () => void;
  user: SidebarUser | null;
  children: ReactNode;
  pathname: string;
  storageKey?: string;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

// ─── Sidebar State Machine ───────────────────────────────────────────────────
// States: 'closed' | 'rail' | 'expanded'
// - closed:  nothing visible on desktop, hamburger in navbar area
// - rail:    56px icon-only strip (default desktop)
// - expanded: 240px full sidebar overlay

type SidebarState = 'closed' | 'rail' | 'expanded';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isActiveNav(item: SidebarItem, pathname: string): boolean {
  if (item.href.includes('?')) {
    const [base, queryString] = item.href.split('?');
    if (pathname !== base) return false;
    const params = new URLSearchParams(queryString);
    const tabParam = params.get('tab');
    const currentParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return tabParam ? currentParams.get('tab') === tabParam : true;
  }
  return pathname === item.href;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Sidebar({
  title,
  icon: TitleIcon,
  items,
  backHref,
  backLabel,
  onLogout,
  user,
  children,
  pathname,
  storageKey = 'sidebar-state',
  mobileOpen: externalMobileOpen,
  setMobileOpen: externalSetMobileOpen,
}: SidebarProps) {
  const [state, setState] = useState<SidebarState>('rail');
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Use external mobile state if provided, otherwise internal
  const mobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setMobileOpen = externalSetMobileOpen || setInternalMobileOpen;

  // Restore persisted state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'closed' || saved === 'rail' || saved === 'expanded') {
        setState(saved);
      }
    }
  }, [storageKey]);

  // Persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, state);
    }
  }, [state, storageKey]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll on mobile
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleExpand = useCallback(() => {
    setState(prev => {
      if (prev === 'expanded') return 'rail';
      return 'expanded';
    });
  }, []);

  const openRail = useCallback(() => {
    if (state === 'closed') setState('rail');
  }, [state]);

  const closeSidebar = useCallback(() => {
    setState('closed');
  }, []);

  const isRail = state === 'rail';
  const isExpanded = state === 'expanded';
  const isClosed = state === 'closed';
  const showSidebar = isRail || isExpanded;

  // Width values
  const railWidth = 56;
  const expandedWidth = 240;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">

      {/* ═══ EDGE TAB: visible when sidebar is closed ═══ */}
      {isClosed && (
        <div className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center">
          {/* Thin edge strip — click to open rail */}
          <button
            onClick={openRail}
            className="h-full w-3 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer relative group"
            aria-label="Open sidebar"
          >
            {/* Chevron hint */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={10} className="text-white/50" />
            </div>
          </button>
        </div>
      )}

      {/* ═══ HAMBURGER TOGGLE: fixed at top-left when sidebar is visible ═══ */}
      {showSidebar && (
        <button
          onClick={toggleExpand}
          className="fixed top-3.5 z-50 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white/70 hover:text-white transition-all shadow-lg backdrop-blur-sm"
          style={{ left: isRail ? `${railWidth - 4}px` : `${expandedWidth - 44}px` }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>
      )}

      {/* ═══ SIDEBAR PANEL ═══ */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -expandedWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -expandedWidth, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-[#0c0f14] border-r border-white/[0.06]"
            style={{ width: isRail ? railWidth : expandedWidth }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Header */}
            <div className={`shrink-0 flex items-center border-b border-white/[0.06] ${isRail ? 'justify-center px-0 py-4' : 'px-4 py-4'}`}>
              {!isRail && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <TitleIcon size={15} className="text-emerald-400" />
                  </div>
                  <span className="font-semibold text-[13px] text-white/90 truncate">{title}</span>
                </div>
              )}
              {isRail && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <TitleIcon size={15} className="text-emerald-400" />
                </div>
              )}
            </div>

            {/* Back link */}
            <div className={`shrink-0 border-b border-white/[0.06] ${isRail ? 'py-2' : 'py-2 px-3'}`}>
              <Link
                href={backHref}
                className={`flex items-center text-[11px] text-white/30 hover:text-white/60 transition-colors ${isRail ? 'justify-center' : 'gap-1.5'}`}
                title={backLabel}
              >
                <ChevronLeft size={12} />
                {!isRail && <span className="truncate">{backLabel}</span>}
              </Link>
            </div>

            {/* Nav items */}
            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 scrollbar-thin">
              {items.map((item) => {
                const Icon = item.icon;
                const active = isActiveNav(item, pathname);
                const isHovered = hoveredItem === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative px-2"
                    onMouseEnter={() => isRail && setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      className={`
                        flex items-center rounded-lg transition-all duration-150 relative group
                        ${isRail ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-3 py-2.5'}
                        ${active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                        }
                        ${item.isSectionSwitch ? 'font-semibold' : ''}
                      `}
                      title={isRail ? item.label : undefined}
                    >
                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon size={isRail ? 20 : 17} className="shrink-0" />
                      {!isRail && (
                        <span className="font-medium text-[13px] truncate">{item.label}</span>
                      )}
                    </Link>

                    {/* Rail tooltip */}
                    {isRail && isHovered && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer: User + Logout */}
            <div className={`shrink-0 border-t border-white/[0.06] ${isRail ? 'p-2' : 'p-3'}`}>
              {/* User profile link */}
              {user && (
                <Link
                  href="/profile"
                  className={`flex items-center rounded-lg transition-colors mb-1.5 ${isRail ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} text-white/50 hover:bg-white/[0.04] hover:text-white/80`}
                  title={isRail ? user.name : undefined}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-emerald-400" />
                    )}
                  </div>
                  {!isRail && (
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-white/80 truncate">{user.name}</div>
                      {user.role && <div className="text-[10px] text-white/30 truncate">{user.role}</div>}
                    </div>
                  )}
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={onLogout}
                className={`flex items-center rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors ${isRail ? 'justify-center p-2 w-full' : 'gap-2.5 px-3 py-2 w-full'}`}
                title={isRail ? 'Log out' : undefined}
              >
                <LogOut size={isRail ? 18 : 15} className="shrink-0" />
                {!isRail && <span className="text-[12px] font-medium">Log out</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══ MOBILE OVERLAY ═══ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-[280px] bg-[#0c0f14] flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <TitleIcon size={15} className="text-emerald-400" />
                  </div>
                  <span className="font-semibold text-[13px] text-white/90">{title}</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white/80 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Back link */}
              <div className="px-4 py-2 border-b border-white/[0.06]">
                <Link
                  href={backHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors"
                >
                  <ChevronLeft size={12} />
                  {backLabel}
                </Link>
              </div>

              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveNav(item, pathname);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`
                        flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150
                        ${active
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                        }
                      `}
                    >
                      <Icon size={17} className="shrink-0" />
                      <span className="font-medium text-[13px] truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile footer */}
              <div className="shrink-0 border-t border-white/[0.06] p-3 space-y-1">
                {user && (
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={14} className="text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-white/80 truncate">{user.name}</div>
                      {user.role && <div className="text-[10px] text-white/30 truncate">{user.role}</div>}
                    </div>
                  </Link>
                )}
                <button
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors w-full"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <main
        className={`
          transition-all duration-300 ease-out
          ${isClosed ? 'md:ml-3' : isRail ? `md:ml-[${railWidth}px]` : `md:ml-[${expandedWidth}px]`}
        `}
        style={{
          marginLeft: isClosed ? '12px' : isRail ? `${railWidth}px` : `${expandedWidth}px`,
        }}
      >
        {/* Mobile hamburger trigger */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm text-slate-900 dark:text-white">{title}</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
