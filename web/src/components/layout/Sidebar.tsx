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

type SidebarState = 'closed' | 'rail' | 'expanded';
const RAIL_WIDTH = 56;
const EXPANDED_WIDTH = 240;

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

  const mobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalMobileOpen;
  const setMobileOpen = externalSetMobileOpen || setInternalMobileOpen;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'closed' || saved === 'rail' || saved === 'expanded') setState(saved);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem(storageKey, state);
  }, [state, storageKey]);

  useEffect(() => { setMobileOpen(false); }, [pathname, setMobileOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const toggleExpand = useCallback(() => {
    setState(prev => prev === 'expanded' ? 'rail' : 'expanded');
  }, []);

  const openRail = useCallback(() => {
    if (state === 'closed') setState('rail');
  }, [state]);

  const isRail = state === 'rail';
  const isExpanded = state === 'expanded';
  const isClosed = state === 'closed';
  const showSidebar = isRail || isExpanded;

  // Only add left margin in rail mode — expanded overlays, closed hides completely
  const mainMarginLeft = isRail ? RAIL_WIDTH : 0;

  return (
    <div className="min-h-screen bg-surface-primary">

      {/* ════════════════════════════════════════════════════════════════════
          EDGE TAB — visible when sidebar is fully closed
          Thin strip along left edge, click to open rail
          ════════════════════════════════════════════════════════════════════ */}
      {isClosed && (
        <button
          onClick={openRail}
          className="fixed left-0 top-0 bottom-0 z-[60] w-2.5 bg-brand-950/70 hover:bg-brand-900 transition-colors cursor-pointer group border-r border-brand-800/30"
          aria-label="Open sidebar"
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-80 transition-opacity">
            <ChevronRight size={9} className="text-brand-400" />
          </div>
        </button>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          TOGGLE BUTTON — pinned at top of sidebar
          ════════════════════════════════════════════════════════════════════ */}
      {showSidebar && (
        <button
          onClick={toggleExpand}
          className="fixed z-[70] p-1.5 rounded-md bg-brand-950/90 hover:bg-brand-900 text-ink-tertiary hover:text-ink-primary transition-all border border-brand-800/20"
          style={{
            top: '10px',
            left: isRail ? `${RAIL_WIDTH + 2}px` : `${EXPANDED_WIDTH - 32}px`,
          }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={14} /> : <Menu size={14} />}
        </button>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR PANEL
          Starts at top-0, overlays navbar when expanded (z-[60] > navbar z-50)
          Uses DS volcanic-dark surface with brand/accent colors
          ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-[60] flex flex-col bg-surface-elevated border-r border-border-primary"
            style={{ width: isRail ? RAIL_WIDTH : EXPANDED_WIDTH }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* ── Header ── */}
            <div className={`shrink-0 flex items-center border-b border-border-primary ${isRail ? 'justify-center px-0 py-4' : 'px-4 py-4'}`}>
              {!isRail && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center shrink-0">
                    <TitleIcon size={15} className="text-brand-400" />
                  </div>
                  <span className="font-semibold text-[13px] text-ink-primary truncate">{title}</span>
                </div>
              )}
              {isRail && (
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                  <TitleIcon size={15} className="text-brand-400" />
                </div>
              )}
            </div>

            {/* ── Back link ── */}
            <div className={`shrink-0 border-b border-border-primary ${isRail ? 'py-2' : 'py-2 px-3'}`}>
              <Link
                href={backHref}
                className={`flex items-center text-[11px] text-ink-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center' : 'gap-1.5'}`}
                title={isRail ? backLabel : undefined}
              >
                <ChevronLeft size={12} />
                {!isRail && <span className="truncate">{backLabel}</span>}
              </Link>
            </div>

            {/* ── Nav items ── */}
            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
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
                          ? 'bg-accent-500/10 text-accent-500'
                          : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'
                        }
                      `}
                      title={isRail ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon size={isRail ? 20 : 16} className="shrink-0" />
                      {!isRail && (
                        <span className="font-medium text-[13px] truncate">{item.label}</span>
                      )}
                    </Link>

                    {/* Rail tooltip */}
                    {isRail && isHovered && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-surface-elevated text-ink-primary text-[12px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-border-primary">
                        {item.label}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-elevated" />
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* ── Footer: Profile + Logout ── */}
            <div className={`shrink-0 border-t border-border-primary ${isRail ? 'p-2' : 'p-3'}`}>
              {user && (
                <Link
                  href="/profile"
                  className={`flex items-center rounded-lg transition-colors mb-1 ${isRail ? 'justify-center p-2' : 'gap-2.5 px-3 py-2'} text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary`}
                  title={isRail ? user.name : undefined}
                >
                  <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={13} className="text-brand-400" />
                    )}
                  </div>
                  {!isRail && (
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-ink-primary truncate">{user.name}</div>
                      {user.role && <div className="text-[10px] text-ink-tertiary truncate">{user.role}</div>}
                    </div>
                  )}
                </Link>
              )}
              <button
                onClick={onLogout}
                className={`flex items-center rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center p-2 w-full' : 'gap-2.5 px-3 py-2 w-full'}`}
                title={isRail ? 'Log out' : undefined}
              >
                <LogOut size={isRail ? 18 : 15} className="shrink-0" />
                {!isRail && <span className="text-[12px] font-medium">Log out</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          MOBILE OVERLAY DRAWER
          ════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-surface-overlay backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-[65] w-[280px] bg-surface-elevated text-ink-primary flex flex-col lg:hidden overflow-y-auto border-r border-border-primary"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-border-primary shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/15 flex items-center justify-center">
                    <TitleIcon size={15} className="text-brand-400" />
                  </div>
                  <span className="font-semibold text-[13px] text-ink-primary">{title}</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-tertiary text-ink-tertiary">
                  <ChevronLeft size={16} />
                </button>
              </div>

              {/* Mobile profile */}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 border-b border-border-primary text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/15 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-brand-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-ink-primary truncate">{user.name}</div>
                    {user.role && <div className="text-[10px] text-ink-tertiary truncate">{user.role}</div>}
                  </div>
                </Link>
              )}

              {/* Mobile back */}
              <div className="px-4 py-2 border-b border-border-primary">
                <Link href={backHref} onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 text-[11px] text-ink-tertiary hover:text-ink-secondary">
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                        active
                          ? 'bg-accent-500/10 text-accent-500'
                          : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="font-medium text-[13px] truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile footer */}
              <div className="shrink-0 border-t border-border-primary p-3 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary transition-colors"
                >
                  <User size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors w-full"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════════════
          MAIN CONTENT
          Only offset in rail mode — expanded overlays, closed hides
          ════════════════════════════════════════════════════════════════════ */}
      <main
        className="transition-all duration-300 ease-out"
        style={{ marginLeft: mainMarginLeft }}
      >
        {/* Mobile hamburger trigger */}
        <div className="lg:hidden sticky top-0 z-30 bg-surface-primary/80 backdrop-blur-lg border-b border-border-primary px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-secondary hover:text-ink-primary transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm text-ink-primary">{title}</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
