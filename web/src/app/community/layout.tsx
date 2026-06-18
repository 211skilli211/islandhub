'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import CommunityTopBar from '@/components/CommunityTopBar';
import {
  Home, Users, Calendar, MessageCircle, ShoppingBag,
  Building2, Briefcase, Gavel, MapPin, User, LogOut
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

  if (pathname.includes('/messages')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      
      <CommunityTopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-surface-overlay" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-surface-elevated border-r border-border-primary z-50 overflow-y-auto">
            <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

        
        <div className="h-36" />
        
        
        <div className="flex">
        
        <aside className="hidden lg:block w-[260px] shrink-0 bg-surface-elevated border-r border-border-primary sticky top-14 h-[calc(100vh-56px)] overflow-y-auto">
          <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
        </aside>

        
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
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
      
      <Link href="/profile" onClick={onClose}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-secondary transition-colors">
        <div className="w-9 h-9 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={16} className="text-brand-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-ink-primary truncate">{user?.name || 'Guest'}</div>
          {user?.role && <div className="text-[10px] text-ink-tertiary truncate">{user.role}</div>}
        </div>
      </Link>

      
      {SIDEBAR_SECTIONS.map((section, sIdx) => (
        <div key={sIdx} className="space-y-0.5">
          {section.items.map(item => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.id} href={item.href} onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  active ? 'bg-accent-500/10 text-accent-500' : 'text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary'
                }`}>
                <Icon size={18} className="shrink-0" />
                <span className="text-[13px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}

      
      <div className="pt-2 border-t border-border-primary">
        <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Your shortcuts</div>
        <div className="space-y-0.5">
          {SHORTCUTS.map(sc => (
            <Link key={sc.label} href={sc.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-ink-secondary hover:bg-surface-secondary hover:text-ink-primary transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {sc.label.charAt(0)}
              </div>
              <span className="text-[12px] font-medium truncate">{sc.label}</span>
            </Link>
          ))}
        </div>
      </div>

      
      <div className="pt-2 border-t border-border-primary">
        <div className="flex flex-wrap gap-x-2 gap-y-1 px-3 text-[10px] text-ink-tertiary">
          <Link href="/about" onClick={onClose} className="hover:underline">About</Link>
          <span>.</span>
          <Link href="/privacy" onClick={onClose} className="hover:underline">Privacy</Link>
          <span>.</span>
          <Link href="/terms" onClick={onClose} className="hover:underline">Terms</Link>
          <span>.</span>
          <Link href="/help" onClick={onClose} className="hover:underline">Help</Link>
        </div>
      </div>

      
      <button onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-ink-tertiary hover:bg-surface-secondary hover:text-ink-secondary transition-colors w-full">
        <LogOut size={16} className="shrink-0" />
        <span className="text-[12px] font-medium">Log out</span>
      </button>
    </div>
  );
}
