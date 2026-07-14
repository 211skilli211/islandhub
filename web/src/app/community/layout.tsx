'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import CommunityTopBar from '@/components/CommunityTopBar';
import {
  Home, Users, Calendar, MessageCircle, ShoppingBag,
  Building2, Briefcase, Gavel, MapPin, User, LogOut,
  Search, PlusSquare, Heart, Plus, Bell
} from 'lucide-react';
import Link from 'next/link';

const SIDEBAR_SECTIONS = [
  {
    items: [
      { id: 'feed', label: 'Feed', icon: Home, href: '/community' },
      { id: 'groups', label: 'Groups', icon: Users, href: '/community/groups' },
      { id: 'events', label: 'Events', icon: Calendar, href: '/community/events' },
      { id: 'stories', label: 'Stories', icon: MessageCircle, href: '/community/stories' },
      { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, href: '/community/marketplace' },
      { id: 'business', label: 'Business', icon: Building2, href: '/community/business' },
      { id: 'jobs', label: 'Jobs', icon: Briefcase, href: '/community/jobs' },
      { id: 'auctions', label: 'Auctions', icon: Gavel, href: '/community/auctions' },
      { id: 'map', label: 'Island Map', icon: MapPin, href: '/community/map' },
    ]
  }
];

const SHORTCUTS = [
  { label: 'SKN Bridge Trade', href: '/groups/skn-bridge' },
  { label: 'St. Kitts Foodies', href: '/groups/stkitts-foodies' },
  { label: 'Island Events', href: '/groups/island-events' },
];

// Mobile bottom nav items (Instagram-style)
const BOTTOM_NAV = [
  { id: 'feed', label: 'Home', icon: Home, href: '/community' },
  { id: 'search', label: 'Search', icon: Search, href: '/community/search' },
  { id: 'create', label: 'Create', icon: PlusSquare, href: '/community/stories', isCreate: true },
  { id: 'notifications', label: 'Alerts', icon: Bell, href: '/community/notifications' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  // Messages has its own layout
  if (pathname.includes('/messages')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Top bar */}
      <CommunityTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-lg" onClick={() => setSidebarOpen(false)} />
                <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface-elevated/95 backdrop-blur-xl border-r border-border-primary z-50 overflow-y-auto shadow-2xl">
                  <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
                </aside>
              </div>
            )}

      {/* Top spacing for fixed top bar */}
      <div className="h-14" />

      {/* Main content area */}
      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0 bg-surface-elevated border-r border-border-primary sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-20 lg:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile bottom nav (Instagram-style) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-surface-elevated/95 backdrop-blur-xl border-t border-border-primary safe-area-bottom">
              <div className="flex items-center justify-around h-14 px-2">
                {BOTTOM_NAV.map(item => {
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;

                  if (item.isCreate) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => router.push(item.href)}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25 active:scale-90 transition-transform"
                        aria-label={item.label}
                      >
                        <Icon size={20} className="text-white" />
                      </button>
                    );
                  }

                  const linkClass = `flex flex-col items-center justify-center gap-0.5 min-w-[60px] py-1 transition-colors ${
                    active ? 'text-accent-500' : 'text-tertiary hover:text-secondary'
                  }`;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={linkClass}
                    >
                      <Icon size={22} fill={active ? 'currentColor' : 'none'} />
                      <span className={`text-[9px] font-bold tracking-tight ${active ? 'text-accent-500' : 'text-tertiary'}`}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </nav>
    </div>
  );
}

function SidebarContent({ pathname, user, onLogout, onClose }: {
  pathname: string;
  user: any;
  onLogout: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="p-3 space-y-4">
      {/* User profile card */}
      <Link href="/profile" onClick={onClose}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-secondary transition-colors group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 p-[2px] shrink-0">
          <div className="w-full h-full rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={16} className="text-accent-400" />
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-primary truncate">{user?.name || 'Guest'}</div>
                    {user?.role && <div className="text-[10px] text-tertiary truncate font-medium">{user.role}</div>}
                  </div>
      </Link>

      {/* Navigation sections */}
            {SIDEBAR_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = pathname === item.href || pathname.startsWith(item.href + '/');
                  const linkClass = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    active
                      ? 'bg-accent-500/10 text-accent-500 font-bold'
                      : 'text-theme-secondary hover:bg-surface-secondary hover:text-theme-primary'
                  }`;
                  return (
                    <Link key={item.id} href={item.href} onClick={onClose}
                      className={linkClass}>
                      <Icon size={20} className="shrink-0" />
                      <span className="text-sm font-medium truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            {/* Shortcuts */}
            <div className="pt-3 border-t border-border-primary">
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-theme-tertiary">Your shortcuts</div>
              <div className="space-y-0.5">
                {SHORTCUTS.map(sc => (
                  <Link key={sc.label} href={sc.href} onClick={onClose}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-theme-secondary hover:bg-surface-secondary hover:text-theme-primary transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {sc.label.charAt(0)}
                    </div>
                    <span className="text-sm font-medium truncate">{sc.label}</span>
                  </Link>
                ))}
              </div>
            </div>

      {/* Footer links */}
      <div className="pt-3 border-t border-border-primary">
        <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-[10px] text-theme-tertiary">
                  <Link href="/about" onClick={onClose} className="hover:underline">About</Link>
                  <span>.</span>
                  <Link href="/privacy" onClick={onClose} className="hover:underline">Privacy</Link>
                  <span>.</span>
                  <Link href="/terms" onClick={onClose} className="hover:underline">Terms</Link>
                  <span>.</span>
                  <Link href="/help" onClick={onClose} className="hover:underline">Help</Link>
                </div>
      </div>

      {/* Logout */}
      <button onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-theme-secondary hover:bg-surface-secondary hover:text-theme-primary transition-colors w-full">
        <LogOut size={16} className="shrink-0" />
        <span className="text-sm font-medium">Log out</span>
      </button>
    </div>
  );
}