'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Sidebar from '@/components/layout/Sidebar';
import {
  Home, Building2, Users, MessageCircle, Calendar,
  Briefcase, MapPin, Gavel, ShoppingBag, Plus, Search, ArrowLeft
} from 'lucide-react';

const communityNavItems = [
  { id: 'feed', label: 'Feed', icon: Home, href: '/community' },
  { id: 'business', label: 'Business', icon: Building2, href: '/community/business' },
  { id: 'groups', label: 'Groups', icon: Users, href: '/community/groups' },
  { id: 'stories', label: 'Stories', icon: MessageCircle, href: '/community/stories' },
  { id: 'events', label: 'Events', icon: Calendar, href: '/community/events' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/community/jobs' },
  { id: 'map', label: 'Map', icon: MapPin, href: '/community/map' },
  { id: 'auctions', label: 'Auctions', icon: Gavel, href: '/community/auctions' },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, href: '/community/marketplace' },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('community-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('community-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Don't show sidebar on messages page
  if (pathname.includes('/messages')) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  return (
    <Sidebar
      title="Community"
      icon={Users}
      items={communityNavItems}
      backHref="/"
      backLabel="Back to Home"
      onLogout={handleLogout}
      user={user ? { name: user.name, avatar_url: user.avatar_url, role: user.role } : null}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      pathname={pathname}
      mainClassName="md:ml-16 xl:ml-60"
    >
      {children}
    </Sidebar>
  );
}
