'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import BroadcastTab from '@/components/admin/BroadcastTab';

export default function AdminBroadcastsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Broadcasts</h2>
                <p className="text-slate-500 dark:text-slate-400">Send notifications and announcements to users</p>
            </div>
            <BroadcastTab />
        </div>
    );
}