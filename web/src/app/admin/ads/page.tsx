'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import AdManagementTab from '@/components/admin/AdManagementTab';

export default function AdminAdsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">Advertisement Management</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Manage platform ads and promotions</p>
            </div>
            <AdManagementTab />
        </div>
    );
}