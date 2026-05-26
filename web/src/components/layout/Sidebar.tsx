'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Menu, LogOut } from 'lucide-react';

// ─── Types ───
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

// ─── Unified Sidebar Component ───
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-0 h-screen bg-slate-950 text-white flex flex-col z-50
          transition-all duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-14 px-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <Link href={backHref || '/'} className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
              <TitleIcon className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-bold text-sm tracking-tight truncate"
                >
                  {title}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex p-1.5 hover:bg-white/[0.06] rounded-md transition-colors"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 hover:bg-white/[0.06] rounded-md"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User (collapsed: just avatar, expanded: name + email) */}
        {user && (
          <div className={`border-b border-white/[0.06] shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs truncate text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{user.role || 'Member'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        {backHref && (
          <div className={`border-b border-white/[0.06] shrink-0 ${collapsed ? 'p-2' : 'px-3 py-2'}`}>
            <Link
              href={backHref}
              className={`flex items-center text-slate-500 hover:text-slate-300 text-xs transition-colors ${collapsed ? 'justify-center' : 'gap-2'}`}
            >
              <ChevronLeft size={14} />
              {!collapsed && <span>{backLabel || 'Back'}</span>}
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-2 space-y-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative ${
                    collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
                  } ${
                    active
                      ? 'bg-teal-600/15 text-teal-400'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-teal-400 rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon
                    size={18}
                    className={`shrink-0 ${active ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'}`}
                  />
                  {!collapsed && (
                    <span className="font-medium text-[13px] truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-teal-600/20 text-teal-400 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/[0.06] shrink-0 space-y-0.5">
          {onLogout && (
            <button
              onClick={onLogout}
              className={`flex items-center gap-2.5 rounded-lg text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 w-full transition-all ${
                collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5'
              }`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span className="font-medium text-[13px]">Logout</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
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
