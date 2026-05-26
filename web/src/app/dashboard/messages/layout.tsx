'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import Sidebar from '@/components/layout/Sidebar';
import { Inbox, Users } from 'lucide-react';

const messagesNavItems = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, href: '/dashboard/messages' },
  { id: 'contacts', label: 'Contacts', icon: Users, href: '/dashboard/contacts' },
];

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      pathname={pathname}
      storageKey="messages-sidebar-state"
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
    >
      {children}
    </Sidebar>
  );
}
