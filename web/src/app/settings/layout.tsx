'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Sidebar from '@/components/layout/Sidebar';
import {
  User, Bell, Shield, Link2, Palette, Globe,
  Image, Store, Settings
} from 'lucide-react';

const settingsNavItems = [
  { id: 'account', label: 'Account', icon: User, href: '/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/settings?tab=notifications' },
  { id: 'privacy', label: 'Privacy', icon: Shield, href: '/settings?tab=privacy' },
  { id: 'security', label: 'Security', icon: Shield, href: '/settings?tab=security' },
  { id: 'connected', label: 'Connected', icon: Link2, href: '/settings?tab=connected' },
  { id: 'appearance', label: 'Appearance', icon: Palette, href: '/settings?tab=appearance' },
  { id: 'language', label: 'Language', icon: Globe, href: '/settings?tab=language' },
  { id: 'media-library', label: 'Media Library', icon: Image, href: '/settings?tab=media-library' },
  { id: 'vendor', label: 'Vendor', icon: Store, href: '/settings?tab=vendor' },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('settings-sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = '/settings'; // Simplified for settings

  useEffect(() => {
    localStorage.setItem('settings-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  return (
    <Sidebar
      title="Settings"
      icon={Settings}
      items={settingsNavItems}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
      onLogout={handleLogout}
      user={user ? { name: user.name, avatar_url: user.avatar_url, role: user.role } : null}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      pathname={typeof window !== 'undefined' ? window.location.pathname : '/settings'}
      mainClassName="md:ml-16 xl:ml-[248px]"
    >
      {children}
    </Sidebar>
  );
}
