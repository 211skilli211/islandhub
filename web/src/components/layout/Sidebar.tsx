'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Menu, LogOut } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  href: string;
  badge?: number;
}

interface SidebarProps {
  title: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  items: NavItem[];
  backHref?: string;
  backLabel?: string;
  onLogout?: () => void;
  user?: { name?: string; avatar_url?: string; role?: string } | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  pathname: string;
  children: React.ReactNode;
  mainClassName?: string;
}

export default function Sidebar({
  title,
  icon: TitleIcon,
  items,
  backHref,
  backLabel,
  onLogout,
  user,
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
  pathname,
  children,
  mainClassName = '',
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (href: string) => {
    if (href.includes('?')) {
      const [base, queryString] = href.split('?');
      const params = new URLSearchParams(queryString);
      const tabParam = params.get('tab');
      if (pathname !== base) return false;
      if (base === '/dashboard' && tabParam) {
        const currentTab = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('tab');
        return currentTab === tabParam;
      }
      return true;
    }
    if (href === '/dashboard') {
      return pathname === '/dashboard' && !new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('tab');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const currentActiveItem = items.find(item => isActive(item.href));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══ */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 248 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-14 bottom-0 z-50
          bg-[#0c0f14] border-r border-white/[0.06]
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* ── Header ── */}
        <div className="h-[52px] px-3 flex items-center justify-between shrink-0 border-b border-white/[0.04]">
          <Link href={backHref || '/'} className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <TitleIcon size={16} className="text-emerald-400" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  className="font-semibold text-[13px] text-white/90 tracking-tight truncate"
                >
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-all"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-md text-white/30 hover:text-white/70 hover:bg-white/[0.04]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── User Section ── */}
        {user && (
          <div className={`shrink-0 border-b border-white/[0.04] ${collapsed ? 'p-2' : 'px-3 py-2.5'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold shrink-0 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[12px] text-white/80 truncate">{user.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{user.role || 'Member'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Search (expanded only) ── */}
        {!collapsed && (
          <div className="px-3 py-2 shrink-0">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${title.toLowerCase()}...`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value;
                    if (q.trim()) setMobileOpen(false);
                  }
                }}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg py-2 px-3 text-[12px] text-white/70 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/30 focus:bg-white/[0.05] transition-all"
              />
            </div>
          </div>
        )}

        {/* ── Back Link ── */}
        {backHref && (
          <div className={`shrink-0 border-b border-white/[0.04] ${collapsed ? 'p-2' : 'px-3 py-1.5'}`}>
            <Link
              href={backHref}
              className={`flex items-center text-white/25 hover:text-white/60 text-[11px] transition-colors ${collapsed ? 'justify-center' : 'gap-1.5'}`}
            >
              <ChevronLeft size={12} />
              {!collapsed && <span>{backLabel || 'Back'}</span>}
            </Link>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <div className="px-2 space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isHovered = hoveredItem === item.id;

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative
                      ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'}
                      ${active
                        ? 'bg-emerald-500/[0.08] text-emerald-400'
                        : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-pill"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        active
                          ? 'text-emerald-400'
                          : 'text-white/30 group-hover:text-white/60'
                      }`}
                    />
                    {!collapsed && (
                      <span className="font-medium text-[13px] truncate">{item.label}</span>
                    )}
                    {!collapsed && item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {collapsed && isHovered && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
                      <div className="bg-[#1a1f2e] border border-white/[0.08] rounded-lg px-3 py-1.5 shadow-xl shadow-black/30">
                        <span className="text-[12px] font-medium text-white/80 whitespace-nowrap">{item.label}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* ── Footer ── */}
        <div className="p-2 border-t border-white/[0.04] shrink-0 space-y-0.5">
          {onLogout && (
            <button
              onClick={onLogout}
              className={`
                flex items-center gap-2.5 rounded-lg text-white/25 hover:bg-white/[0.04] hover:text-white/60 w-full transition-all
                ${collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'}
              `}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span className="font-medium text-[13px]">Logout</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ${mainClassName}`}>
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <span className="font-bold text-sm text-slate-900 dark:text-white">{title}</span>
          <div className="w-8" />
        </header>
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
