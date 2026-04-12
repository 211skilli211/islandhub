'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { initActivityTracking, isSessionExpired, SESSION_CONFIG } from '@/lib/session';
import toast from 'react-hot-toast';

export default function SessionMonitor() {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize activity tracking
    initActivityTracking();

    // Check session status periodically
    const interval = setInterval(() => {
      if (isSessionExpired()) {
        // Clear activity tracking
        localStorage.removeItem('lastActivity');
        
        // Show toast and logout
        logout();
        toast.error('Logged out due to inactivity');
        router.push('/login?expired=true');
      }
    }, SESSION_CONFIG.CHECK_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [isAuthenticated, logout, router]);

  // This component doesn't render anything
  return null;
}