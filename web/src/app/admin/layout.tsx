'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import {
  LayoutDashboard, Users, Package, ShoppingCart, Store,
  Settings, BarChart3, Truck, Megaphone, Shield,
  FileText, CreditCard, Radio, DollarSign, Car,
  Image, UserCheck, Building2, Bot,
  ClipboardList, ChevronLeft, ChevronRight, LogOut,
  Home, ArrowLeft, Menu, X, Ticket, ChevronDown
} from 'lucide-react';
import AdminBreadcrumb from '@/components/admin/AdminBreadcrumb';

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

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['compliance']);

  useEffect(() => {
    localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isGroupActive = (groupId: string) => {
    const children = secondaryNavItems.filter(item => item.parent === groupId);
    return children.some(child => isActive(child.href));
  };

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed left-0 top-14 bottom-0 bg-[#0c0f14] text-white flex flex-col z-50
          border-r border-white/[0.06]
          transition-all duration-300 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-[52px] px-3 border-b border-white/[0.04] flex items-center justify-between shrink-0">
          <Link href="/admin/overview" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Settings size={16} className="text-emerald-400" />
            </div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-bold text-sm tracking-tight truncate">
                  Admin
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={() => setCollapsed(!collapsed)} className="hidden md:flex p-1.5 hover:bg-white/[0.06] rounded-md transition-colors">
              {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 hover:bg-white/[0.06] rounded-md">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* User */}
        {user && (
          <div className={`border-b border-white/[0.06] shrink-0 ${collapsed ? 'p-2' : 'p-3'}`}>
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
                  <p className="font-semibold text-xs truncate text-white">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role || 'Admin'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back */}
        <div className={`border-b border-white/[0.06] shrink-0 ${collapsed ? 'p-2' : 'px-3 py-2'}`}>
          <Link href="/" className={`flex items-center text-slate-500 hover:text-slate-300 text-xs transition-colors ${collapsed ? 'justify-center' : 'gap-2'}`}>
            <ArrowLeft size={14} />
            {!collapsed && <span>Back to Home</span>}
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-2 space-y-0.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const hasChildren = navGroups.find(g => g.id === item.id);
              const isExpanded = expandedGroups.includes(item.id);

              const navItemClass = collapsed
                ? 'flex-1 flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative px-2 py-2.5 justify-center' +
                  (active ? ' bg-emerald-500/10 text-emerald-400' : ' text-white/40 hover:bg-white/[0.04] hover:text-white/70')
                : 'flex-1 flex items-center gap-2.5 rounded-lg transition-all duration-150 group relative px-3 py-2.5' +
                  (active ? ' bg-emerald-500/10 text-emerald-400' : ' text-white/40 hover:bg-white/[0.04] hover:text-white/70');

              return (
                <div key={item.id}>
                  <div className="flex items-center gap-1">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={navItemClass}
                      title={collapsed ? item.label : undefined}
                    >
                      {active && (
                        <motion.div
                          layoutId="admin-sidebar-active"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-400 rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <Icon size={18} className={active ? 'shrink-0 text-emerald-400' : 'shrink-0 text-white/30 group-hover:text-white/60'} />
                      {!collapsed && <span className="font-medium text-[13px] truncate">{item.label}</span>}
                    </Link>
                    {hasChildren && !collapsed && (
                      <button
                        onClick={() => toggleGroup(item.id)}
                        className="p-1 rounded-md hover:bg-white/[0.06] transition-colors"
                      >
                        <ChevronDown size={14} className={`text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Secondary items */}
                  {hasChildren && isExpanded && !collapsed && (
                    <div className="ml-5 mt-0.5 space-y-0.5">
                      {hasChildren.items.map(sub => {
                        const SubIcon = sub.icon;
                        const subActive = isActive(sub.href);
                        return (
                          <Link
                            key={sub.id}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={subActive
                              ? 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all text-emerald-400 bg-emerald-500/10'
                              : 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-all text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'}
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
        <div className="p-2 border-t border-white/[0.06] shrink-0">
          <button
            onClick={handleLogout}
            className={collapsed
              ? 'flex items-center gap-2.5 rounded-lg text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 w-full transition-all px-2 py-2.5 justify-center'
              : 'flex items-center gap-2.5 rounded-lg text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 w-full transition-all px-3 py-2.5'}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="font-medium text-[13px]">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 transition-all duration-300 md:ml-16 xl:ml-[260px]">
        <header className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Menu size={18} className="text-slate-600 dark:text-slate-300" />
          </button>
          <span className="font-bold text-sm text-slate-900 dark:text-white">Admin</span>
          <div className="w-8" />
        </header>
        <AdminBreadcrumb />
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
