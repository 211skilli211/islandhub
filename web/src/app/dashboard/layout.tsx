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
  FileText, Truck, MapPin
} from 'lucide-react';

// Role-based nav item generators
const getBuyerNav = (currentTab: string | null) => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'activity', label: 'Activity', icon: FileText, href: '/dashboard?tab=activity' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/messages' },
  { id: 'wallet', label: 'Wallet', icon: CreditCard, href: '/dashboard?tab=wallet' },
];

const getVendorNav = (currentTab: string | null) => [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/dashboard?tab=overview' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, href: '/dashboard?tab=orders' },
  { id: 'products', label: 'Products', icon: Package, href: '/dashboard?tab=menu' },
  { id: 'promotions', label: 'Promotions', icon: Percent, href: '/dashboard?tab=promotions' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/dashboard/vendor/analytics' },
  { id: 'payouts', label: 'Payouts', icon: TrendingUp, href: '/dashboard/vendor/payouts' },
  { id: 'reviews', label: 'Reviews', icon: Star, href: '/dashboard?tab=reviews' },
  { id: 'branding', label: 'Branding', icon: Palette, href: '/dashboard/vendor/branding' },
];

const getDriverNav = (currentTab: string | null) => [
  { id: 'driver-hub', label: 'Driver Hub', icon: Car, href: '/dashboard?tab=driver-hub' },
  { id: 'active-jobs', label: 'Active Jobs', icon: PackageCheck, href: '/dashboard?tab=active-jobs' },
  { id: 'earnings', label: 'Earnings', icon: CreditCard, href: '/dashboard?tab=earnings' },
  { id: 'vehicle', label: 'Vehicle', icon: Truck, href: '/dashboard?tab=vehicle' },
  { id: 'history', label: 'History', icon: FileText, href: '/dashboard?tab=history' },
  { id: 'ratings', label: 'Ratings', icon: Star, href: '/dashboard?tab=ratings' },
];

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentTab = searchParams.get('tab');
  const hasVendorRole = user?.role === 'vendor' || user?.role === 'admin' || user?.role === 'creator';
  const hasDriverRole = user?.role === 'driver' || user?.is_verified_driver;

  // Determine section from URL
  const driverTabs = ['driver-hub', 'active-jobs', 'earnings', 'vehicle', 'driver-verification', 'documents', 'history', 'ratings'];
  const vendorTabs = ['overview', 'orders', 'menu', 'promotions', 'reviews', 'branding', 'onboarding', 'delivery', 'shipping', 'compliance', 'analytics', 'payouts'];

  let currentSection: 'buyer' | 'vendor' | 'driver' = 'buyer';
  if (currentTab && driverTabs.includes(currentTab)) currentSection = 'driver';
  else if (currentTab && vendorTabs.includes(currentTab)) currentSection = 'vendor';
  else if (pathname.startsWith('/dashboard/vendor')) currentSection = 'vendor';
  else if (pathname.startsWith('/dashboard/driver')) currentSection = 'driver';

  // Get nav items for current section
  let navItems = getBuyerNav(currentTab);
  if (currentSection === 'vendor') navItems = getVendorNav(currentTab);
  if (currentSection === 'driver') navItems = getDriverNav(currentTab);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  const sectionTitle = currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : 'Dashboard';
  const sectionIcon = currentSection === 'driver' ? Car : currentSection === 'vendor' ? Store : LayoutDashboard;
  const roleLabel = currentSection === 'driver' ? 'Driver' : currentSection === 'vendor' ? 'Vendor' : user?.role || 'User';

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
      {children}
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Loading...</div></div>}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
