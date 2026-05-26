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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-sidebar-state');
      if (saved === 'closed' || saved === 'rail' || saved === 'expanded') setState(saved);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('admin-sidebar-state', state);
  }, [state]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

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
    <div className="min-h-screen bg-surface-primary">

      {/* EDGE TAB — visible when closed */}
      {isClosed && (
        <button
          onClick={() => setState('rail')}
          className="fixed left-0 top-0 bottom-0 z-[60] w-2.5 bg-brand-950/70 hover:bg-brand-900 transition-colors cursor-pointer group border-r border-brand-800/30"
          aria-label="Open sidebar"
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 opacity-0 group-hover:opacity-80 transition-opacity">
            <ChevronRight size={9} className="text-brand-400" />
          </div>
        </button>
      )}

      {/* TOGGLE BUTTON */}
      {showSidebar && (
        <button
          onClick={() => setState(isExpanded ? 'rail' : 'expanded')}
          className="fixed z-[70] p-1.5 rounded-md bg-surface-elevated/90 hover:bg-surface-tertiary text-ink-secondary hover:text-ink-primary transition-all border border-border-primary"
          style={{
            top: '10px',
            left: isRail ? `${RAIL_WIDTH + 2}px` : `${EXPANDED_WIDTH - 32}px`,
          }}
          aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? <ChevronLeft size={14} /> : <Menu size={14} />}
        </button>
      )}

      {/* MOBILE OVERLAY */}
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
              initial={{ x: -EXPANDED_WIDTH }}
              animate={{ x: 0 }}
              exit={{ x: -EXPANDED_WIDTH }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="fixed left-0 top-0 bottom-0 z-[65] w-[280px] bg-surface-elevated text-ink-primary flex flex-col lg:hidden overflow-y-auto border-r border-border-primary"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border-primary shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <Settings size={15} className="text-accent-500" />
                  </div>
                  <span className="font-bold text-sm">Admin</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-tertiary text-ink-secondary">
                  <X size={16} />
                </button>
              </div>
              {user && (
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-4 py-3 border-b border-border-primary text-ink-secondary hover:text-ink-primary">
                  <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : <User size={14} className="text-accent-500" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-ink-primary truncate">{user.name}</div>
                    <div className="text-[10px] text-ink-tertiary">{user.role || 'Admin'}</div>
                  </div>
                </Link>
              )}
              <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const hasChildren = navGroups.find(g => g.id === item.id);
                  return (
                    <div key={item.id}>
                      <Link href={item.href} onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-accent-500/10 text-accent-500' : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'}`}>
                        <Icon size={17} className="shrink-0" />
                        <span className="font-medium text-[13px] truncate">{item.label}</span>
                      </Link>
                      {hasChildren && (
                        <div className="ml-5 mt-0.5 space-y-0.5">
                          {hasChildren.items.map(sub => {
                            const SubIcon = sub.icon;
                            const subActive = isActive(sub.href);
                            return (
                              <Link key={sub.id} href={sub.href} onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${subActive ? 'text-accent-500 bg-accent-500/10' : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-tertiary'}`}>
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
              <div className="p-3 border-t border-border-primary shrink-0 space-y-1">
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary transition-colors">
                  <User size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Profile</span>
                </Link>
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors w-full">
                  <LogOut size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium">Log out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR — starts at top-0, overlays navbar when expanded */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -EXPANDED_WIDTH, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="fixed left-0 top-0 bottom-0 z-[60] bg-surface-elevated text-ink-primary flex flex-col border-r border-border-primary hidden lg:flex"
            style={{ width: isRail ? RAIL_WIDTH : EXPANDED_WIDTH }}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Header */}
            <div className={`shrink-0 flex items-center border-b border-border-primary ${isRail ? 'justify-center px-0 py-4' : 'px-4 py-4'}`}>
              {!isRail && (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Settings size={15} className="text-accent-500" />
                  </div>
                  <span className="font-bold text-sm tracking-tight truncate text-ink-primary">Admin</span>
                </div>
              )}
              {isRail && (
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                  <Settings size={15} className="text-accent-500" />
                </div>
              )}
            </div>

            {/* User */}
            {user && (
              <Link href="/profile"
                className={`shrink-0 border-b border-border-primary flex items-center transition-colors text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary ${isRail ? 'justify-center p-2' : 'gap-2.5 px-3 py-2.5'}`}
                title={isRail ? user.name : undefined}>
                <div className="w-7 h-7 rounded-full bg-brand-500/10 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user.name?.charAt(0).toUpperCase() || 'U')}
                </div>
                {!isRail && (
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[12px] truncate text-ink-primary">{user.name}</p>
                    <p className="text-[10px] text-ink-tertiary capitalize">{user.role || 'Admin'}</p>
                  </div>
                )}
              </Link>
            )}

            {/* Back to Home */}
            <div className={`shrink-0 border-b border-border-primary ${isRail ? 'py-2' : 'py-2 px-3'}`}>
              <Link href="/" className={`flex items-center text-ink-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center' : 'gap-1.5'}`} title={isRail ? 'Back to Home' : undefined}>
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
                    ? `flex items-center justify-center rounded-lg transition-all duration-150 group relative px-0 py-2.5${active ? ' bg-accent-500/10 text-accent-500' : ' text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'}`
                    : `flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative px-3 py-2.5${active ? ' bg-accent-500/10 text-accent-500' : ' text-ink-secondary hover:bg-surface-tertiary hover:text-ink-primary'}`;

                  return (
                    <div key={item.id} onMouseEnter={() => isRail && setHoveredItem(item.id)} onMouseLeave={() => setHoveredItem(null)}>
                      <div className="flex items-center gap-1">
                        <Link href={item.href} className={itemClass} title={isRail ? item.label : undefined}>
                          {active && (
                            <motion.div layoutId="admin-sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full" transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                          )}
                          <Icon size={isRail ? 20 : 17} className="shrink-0" />
                          {!isRail && <span className="font-medium text-[13px] truncate">{item.label}</span>}
                        </Link>
                        {hasChildren && !isRail && (
                          <button onClick={() => toggleGroup(item.id)} className="p-1 rounded-md hover:bg-surface-tertiary transition-colors">
                            <ChevronDown size={14} className={`text-ink-tertiary transition-transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>

                      {isRail && isHovered && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1.5 bg-surface-tertiary text-ink-primary text-[12px] font-medium rounded-lg shadow-xl whitespace-nowrap z-50 pointer-events-none border border-border-primary">
                          {item.label}
                          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-surface-tertiary" />
                        </div>
                      )}

                      {hasChildren && isGroupExpanded && !isRail && (
                        <div className="ml-5 mt-0.5 space-y-0.5">
                          {hasChildren.items.map(sub => {
                            const SubIcon = sub.icon;
                            const subActive = isActive(sub.href);
                            return (
                              <Link key={sub.id} href={sub.href}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all ${subActive ? 'text-accent-500 bg-accent-500/10' : 'text-ink-tertiary hover:text-ink-secondary hover:bg-surface-tertiary'}`}>
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
            <div className={`shrink-0 border-t border-border-primary ${isRail ? 'p-2' : 'p-3'}`}>
              <button onClick={handleLogout}
                className={`flex items-center rounded-lg text-ink-tertiary hover:bg-surface-tertiary hover:text-ink-secondary transition-colors ${isRail ? 'justify-center p-2 w-full' : 'gap-2.5 px-3 py-2 w-full'}`}
                title={isRail ? 'Log out' : undefined}>
                <LogOut size={isRail ? 18 : 15} className="shrink-0" />
                {!isRail && <span className="font-medium text-[12px]">Log out</span>}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="transition-all duration-300 ease-out" style={{ marginLeft: isRail ? RAIL_WIDTH : 0 }}>
        <div className="lg:hidden sticky top-0 z-30 bg-surface-primary/80 backdrop-blur-lg border-b border-border-primary px-4 py-3 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg hover:bg-surface-secondary text-ink-secondary transition-colors">
            <Menu size={20} />
          </button>
          <span className="font-bold text-sm text-ink-primary">Admin</span>
          <div className="w-8" />
        </div>
        <AdminBreadcrumb />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
