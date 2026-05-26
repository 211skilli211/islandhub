'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Store,
  Settings, BarChart3, Truck, Megaphone, Shield,
  FileText, CreditCard, Radio, DollarSign, Car,
  Image, UserCheck, Building2, Bot,
  ClipboardList, ChevronLeft, ChevronRight, LogOut,
  Home, ArrowLeft, Menu, X, Ticket, ChevronDown, User
} from 'lucide-react';

const adminNavItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin/overview' },
  { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
  { id: 'events', label: 'Events', icon: Ticket, href: '/admin/events' },
  { id: 'listings', label: 'Listings', icon: Package, href: '/admin/listings' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
  { id: 'stores', label: 'Stores', icon: Store, href: '/admin/stores' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'dispatch', label: 'Dispatch', icon: Truck, href: '/admin/dispatch' },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/admin/campaigns' },
  { id: 'compliance', label: 'Compliance', icon: Shield, href: '/admin/compliance' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, href: '/admin/revenue' },
  { id: 'payouts', label: 'Payouts', icon: CreditCard, href: '/admin/payouts' },
  { id: 'drivers', label: 'Drivers', icon: Car, href: '/admin/drivers' },
  { id: 'broadcasts', label: 'Broadcasts', icon: Radio, href: '/admin/broadcasts' },
  { id: 'logistics', label: 'Logistics', icon: Truck, href: '/admin/logistics' },
  { id: 'media', label: 'Media', icon: Image, href: '/admin/assets' },
  { id: 'ibt-partners', label: 'IBT Partners', icon: Building2, href: '/admin/ibt-partners' },
  { id: 'ads', label: 'Ads', icon: Megaphone, href: '/admin/ads' },
  { id: 'agent', label: 'Agent', icon: Bot, href: '/admin/agent' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
];

const secondaryNavItems = [
  { id: 'kyc', label: 'KYC Requests', icon: UserCheck, href: '/admin/kyc', parent: 'compliance' },
  { id: 'kyb', label: 'KYB Verification', icon: Building2, href: '/admin/kyb-verification', parent: 'compliance' },
  { id: 'logs', label: 'Audit Logs', icon: ClipboardList, href: '/admin/logs', parent: 'compliance' },
  { id: 'compliance-analytics', label: 'Analytics', icon: BarChart3, href: '/admin/compliance-analytics', parent: 'compliance' },
  { id: 'campaigns-pending', label: 'Pending', icon: Megaphone, href: '/admin/campaigns/pending', parent: 'campaigns' },
  { id: 'assets-hero', label: 'Hero Assets', icon: Image, href: '/admin/assets-hero', parent: 'media' },
  { id: 'ibt-partners-stores', label: 'Stores', icon: Store, href: '/admin/ibt-partners/stores', parent: 'ibt-partners' },
  { id: 'ibt-partners-products', label: 'Products', icon: Package, href: '/admin/ibt-partners/products', parent: 'ibt-partners' },
];

const navGroups = [
  { id: 'compliance', label: 'Compliance', items: secondaryNavItems.filter(i => i.parent === 'compliance') },
  { id: 'campaigns', label: 'Campaigns', items: secondaryNavItems.filter(i => i.parent === 'campaigns') },
  { id: 'media', label: 'Media', items: secondaryNavItems.filter(i => i.parent === 'media') },
  { id: 'ibt-partners', label: 'IBT Partners', items: secondaryNavItems.filter(i => i.parent === 'ibt-partners') },
];

type SidebarState = 'closed' | 'rail' | 'expanded';
const RAIL_WIDTH = 56;
const EXPANDED_WIDTH = 260;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [state, setState] = useState<SidebarState>('rail');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['compliance']);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Restore persisted state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-state');
      if (saved === 'closed' || saved === 'rail' || saved === 'expanded') {
        setState(saved);
      }
    }
  }, []);

  // Persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-sidebar-state', state);
    }
  }, [state]);

  // Close mobile on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  const isRail = state === 'rail';
  const isExpanded = state === 'expanded';
  const isClosed = state === 'closed';
  const showSidebar = isRail || isExpanded;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* ═══ EDGE TAB: visible when closed ═══ */}
      {isClosed && (
        <div className="fixed left-0 top-0 bottom-0 z-40 flex flex-col items-center">
          <button
            onClick={() => setState('rail')}
            className="h-full w-3 bg-slate-900/80 hover:bg-slate-800 transition-colors cursor-pointer relative group"
            aria-label="Open sidebar"
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={10} className="text-white/50" />
            </div>
          </button>
        </div>
      )}

      {/* ═══ HAMBURGER TOGGLE: fixed at top-left ═══ */}
      {showSidebar && (
        <button
          onClick={() => setState(isExpanded ? 'rail' : 'expanded')}
          className="fixed top-3.5 z-50 p-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white/70 hover:text-white transition-all shadow-lg backdrop-blur-sm"
          style={{ left: isRail ? `${RAIL_WIDTH - 4}px` : `${EXPANDED_WIDTH - 44}px` }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={16} /> : <Menu size={16} />}
        </button>
      )}

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
              initial={{ x: -EXPANDED_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -EXPANDED_WIDTH }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-[60] w-[280px] bg-[#0c0f14] text-white flex flex-col lg:hidden overflow-y-auto"
            >
              {/* Mobile header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/[0.06] shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                    <Settings size={15} className="text-emerald-400" />
                  </div>
                  <span className="font-bold text-sm">Admin</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50">
                  <X size={16} />
                </button>
              </div>
              {/* Mobile user */}
              {user && (
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.06] text-white/60 hover:text-white/90"
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
                    <div className="text-[10px] text-white/30">{user.role || 'Admin'}</div>
                  </div>
                </Link>
              )}
              {/* Mobile nav */}
              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const hasChildren = navGroups.find(g => g.id === item.id);
                  return (
                    <div key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${
                          active
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                        }`}
                      >
                        <Icon size={17} className="shrink-0" />
                        <span className="font-medium text-[13px] truncate">{item.label}</span>
                      </Link>
                      {hasChildren && (
                        <div className="ml-5 mt-0.5 space-y-0.5">
                          {hasChildren.items.map(sub => {
                            const SubIcon = sub.icon;
                            const subActive = isActive(sub.href);
                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
                                  subActive
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                                }`}
                              >
                                <SubIcon size={15} className="shrink-0" />
                                <span className="font-medium truncate">{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
              {/* Mobile footer */}
              <div className="p-3 border-t border-white/[0.06] shrink-0 space-y-1">
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/50 hover:bg-white/[0.04] hover:text-white/80 transition-colors"
                >
                  <User size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Profile</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors w-full"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-30 bg-[#0c0f14] text-white flex flex-col border-r border-white/[0.06] hidden lg:flex"
            style={{ width: isRail ? RAIL_WIDTH : EXPANDED_WIDTH }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Header */}
            <div className={`shrink-0 flex items-center border-b border-white/[0.06] ${isRail ? 'justify-center px-0 py-4' : 'px-4 py-4'}`}>
              {!isRail && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Settings size={15} className="text-emerald-400" />
                  </div>
                  <span className="font-bold text-sm tracking-tight truncate">Admin</span>
                </div>
              )}
              {isRail && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Settings size={15} className="text-emerald-400" />
                </div>
              )}
            </div>

            {/* User */}
            {user && (
              <Link
                href="/profile"
                className={`shrink-0 border-b border-white/[0.06] flex items-center transition-colors text-white/50 hover:bg-white/[0.04] hover:text-white/80 ${isRail ? 'justify-center p-2' : 'gap-2.5 px-3 py-2.5'}`}
                title={isRail ? user.name : undefined}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {!isRail && (
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[12px] truncate text-white/80">{user.name}</p>
                    <p className="text-[10px] text-white/30 capitalize">{user.role || 'Admin'}</p>
                  </div>
                )}
              </Link>
            )}

            {/* Back to Home */}
            <div className={`shrink-0 border-b border-white/[0.06] ${isRail ? 'py-2' : 'py-2 px-3'}`}>
              <Link
                href="/"
                className={`flex items-center text-white/30 hover:text-white/60 transition-colors ${isRail ? 'justify-center' : 'gap-1.5'}`}
                title={isRail ? 'Back to Home' : undefined}
              >
                <ArrowLeft size={12} />
                {!isRail && <span className="text-[11px]">Back to Home</span>}
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-2 space-y-0.5">
              <div className="px-2">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const hasChildren = navGroups.find(g => g.id === item.id);
                  const isGroupExpanded = expandedGroups.includes(item.id);
                  const isHovered = hoveredItem === item.id;

                  const itemClass = isRail
                    ? 'flex items-center justify-center rounded-lg transition-all duration-150 group relative px-0 py-2.5' + (active ? ' bg-emerald-500/10 text-emerald-400' : ' text-white/40 hover:bg-white/[0.04] hover:text-white/70')
                    : 'flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative px-3 py-2.5' + (active ? ' bg-emerald-500/10 text-emerald-400' : ' text-white/40 hover:bg-white/[0.04] hover:text-white/70');

                  return (
                    <div
                      key={item.id}
                      onMouseEnter={() => isRail && setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center gap-1">
                        <Link
                          href={item.href}
                          className={itemClass}
                          title={isRail ? item.label : undefined}
                        >
                          {active && (
                            <motion.div
                              layoutId="admin-sidebar-active"
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                          )}
                          <Icon size={isRail ? 20 : 17} className="shrink-0" />
                          {!isRail && <span className="font-medium text-[13px] truncate">{item.label}</span>}
                        </Link>
                        {hasChildren && !isRail && (
                          <button
                            onClick={() => toggleGroup(item.id)}
                            className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
                          >
                            <ChevronDown size={14} className={`text-slate-500 transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {/* Rail tooltip */}
                      {isRail && isHovered && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-slate-800 text-white text-[12px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
                        </div>
                      )}

                      {/* Secondary items */}
                      {hasChildren && isGroupExpanded && !isRail && (
                        <div className="ml-5 mt-0.5 space-y-0.5">
                          {hasChildren.items.map(sub => {
                            const SubIcon = sub.icon;
                            const subActive = isActive(sub.href);
                            return (
                              <Link
                                key={sub.id}
                                href={sub.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${
                                  subActive
                                    ? 'text-emerald-400 bg-emerald-500/10'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
                                }`}
                              >
                                <SubIcon size={15} className="shrink-0" />
                                <span className="font-medium truncate">{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className={`shrink-0 border-t border-white/[0.06] ${isRail ? 'p-2' : 'p-3'}`}>
              <button
                onClick={handleLogout}
                className={`flex items-center rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/60 transition-colors ${isRail ? 'justify-center p-2 w-full' : 'gap-2.5 px-3 py-2 w-full'}`}
                title={isRail ? 'Log out' : undefined}
              >
                <LogOut size={isRail ? 18 : 15} className="shrink-0" />
                {!isRail && <span className="font-medium text-[12px]">Log out</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ═══ MAIN CONTENT ═══ */}
      <main
        className="transition-all duration-300 ease-out"
        style={{
          marginLeft: isClosed ? '12px' : isRail ? `${RAIL_WIDTH}px` : `${EXPANDED_WIDTH}px`,
        }}
      >
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Admin</span>
          <div className="w-8" />
        </div>

        <AdminBreadcrumb />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
