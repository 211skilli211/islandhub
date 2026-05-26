'use client';

import { useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Sidebar from '@/components/layout/Sidebar';
import { Inbox, Users } from 'lucide-react';

const messagesNavItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/dashboard/messages' },
  { id: 'contacts', label: 'Contacts', icon: Users, href: '/dashboard/contacts' },
];

export default function MessagesLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = '/dashboard/messages'; // Simplified

  const handleLogout = () => {
    logout();
    router.push('/');
    toast.success('Logged out');
  };

  return (
    <Sidebar
      title="Messages"
      icon={Inbox}
      items={messagesNavItems}
      backHref="/dashboard"
      backLabel="Back to Dashboard"
      onLogout={handleLogout}
      user={user ? { name: user.name, avatar_url: user.avatar_url, role: 'Messages' } : null}
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      pathname={typeof window !== 'undefined' ? window.location.pathname : '/dashboard/messages'}
      mainClassName="lg:ml-16 xl:ml-[248px]"
    >
      {children}
    </Sidebar>
  );
}
