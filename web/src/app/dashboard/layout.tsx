'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Sidebar from '@/components/layout/Sidebar';
import {
  LayoutDashboard, Package, ShoppingCart, Store,
  Settings, CreditCard, MessageSquare, Car, PackageCheck,
  BarChart3, Percent, Shield, Palette, Star, TrendingUp,
  FileText, Truck, MapPin, ChevronDown, User
} from 'lucide-react';

// Role-based nav item generators
const getBuyerNav = () => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'activity', label: 'Activity', icon: FileText, href: '/dashboard?tab=activity' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
  { id: 'wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet' },
];

const getVendorNav = () => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard?tab=overview' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
  { id: 'products', label: 'Products', icon: Package, href: '/dashboard?tab=menu' },
  { id: 'promotions', label: 'Promotions', icon: Percent, href: '/dashboard?tab=promotions' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/vendor/analytics' },
  { id: 'payouts', label: 'Payouts', icon: TrendingUp, href: '/dashboard/vendor/payouts' },
  { id: 'reviews', label: 'Reviews', icon: Star, href: '/dashboard?tab=reviews' },
  { id: 'branding', label: 'Branding', icon: Palette, href: '/dashboard/vendor/branding' },
];

const getDriverNav = () => [
  { id: 'driver-hub', label: 'Driver Hub', icon: Car, href: '/dashboard?tab=driver-hub' },
  { id: 'active-jobs', label: 'Active Jobs', icon: PackageCheck, href: '/dashboard?tab=active-jobs' },
  { id: 'earnings', label: 'Earnings', icon: CreditCard, href: '/dashboard?tab=earnings' },
  { id: 'vehicle', label: 'Vehicle', icon: Truck, href: '/dashboard?tab=vehicle' },
  { id: 'history', label: 'History', icon: FileText, href: '/dashboard?tab=history' },
  { id: 'ratings', label: 'Ratings', icon: Star, href: '/dashboard?tab=ratings' },
];

const ROLE_SECTIONS = [
  { id: 'buyer' as const, label: 'Buyer', icon: LayoutDashboard, href: '/dashboard?tab=activity' },
  { id: 'vendor' as const, label: 'Vendor', icon: Store, href: '/dashboard?tab=overview' },
  { id: 'driver' as const, label: 'Driver', icon: Car, href: '/dashboard?tab=driver-hub' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const currentTab = searchParams.get('tab');
  const hasVendorRole = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'creator';
  const hasDriverRole = user?.role === 'driver' || user?.is_verified_driver;

  const driverTabs = ['driver-hub', 'active-jobs', 'earnings', 'vehicle', 'driver-verification', 'documents', 'history', 'ratings'];
  const vendorTabs = ['overview', 'orders', 'menu', 'promotions', 'reviews', 'branding', 'onboarding', 'delivery', 'shipping', 'compliance', 'analytics', 'payouts'];

  let currentSection: 'buyer' | 'vendor' | 'driver' = 'buyer';
  if (currentTab && driverTabs.includes(currentTab)) currentSection = 'driver';
  else if (currentTab && vendorTabs.includes(currentTab)) currentSection = 'vendor';
  else if (pathname.startsWith('/dashboard/vendor')) currentSection = 'vendor';
  else if (pathname.startsWith('/dashboard/driver')) currentSection = 'driver';

  const navItems = currentSection === 'vendor' ? getVendorNav() : currentSection === 'driver' ? getDriverNav() : getBuyerNav();

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  const sectionTitle = currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : 'Dashboard';
  const sectionIcon = currentSection === 'driver' ? Car : currentSection === 'vendor' ? Store : LayoutDashboard;
  const roleLabel = currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : user?.role || 'User';

  const availableRoles = ROLE_SECTIONS.filter(r => {
    if (r.id === 'vendor') return hasVendorRole;
    if (r.id === 'driver') return hasDriverRole;
    return true;
  });

  const switchRole = (roleId: 'buyer' | 'vendor' | 'driver') => {
    const role = ROLE_SECTIONS.find(r => r.id === roleId);
    if (role) router.push(role.href);
    setRoleOpen(false);
  };

  return (
    <Sidebar
      title={sectionTitle}
      icon={sectionIcon}
      items={navItems}
      backHref="/"
      backLabel="Back to Home"
      onLogout={handleLogout}
      user={user ? { name: user.name, avatar_url: user.avatar_url, role: roleLabel } : null}
      pathname={pathname}
      storageKey="dashboard-sidebar-state"
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    >
      {/* Role Switcher — only show if user has multiple roles */}
      {availableRoles.length > 1 && (
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-surface-elevated border border-border-primary rounded-xl hover:border-accent-300 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-500/10 flex items-center justify-center">
                  <User size={12} className="text-accent-500" />
                </div>
                <span className="text-xs font-bold text-ink-primary">{roleLabel}</span>
              </div>
              <ChevronDown size={14} className={`text-ink-tertiary transition-transform ${roleOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-border-primary rounded-xl shadow-xl z-50 overflow-hidden">
                {availableRoles.map(role => {
                  const RoleIcon = role.icon;
                  const isActive = currentSection === role.id;
                  return (
                    <button
                      key={role.id}
                      onClick={() => switchRole(role.id)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-accent-500/10 text-accent-500' : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                      }`}
                    >
                      <RoleIcon size={15} className="shrink-0" />
                      <span className="text-xs font-bold">{role.label}</span>
                      {isActive && <span className="ml-auto text-[9px] font-bold text-accent-500 uppercase">Active</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-ink-tertiary">Loading...</div></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
