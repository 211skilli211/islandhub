'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import HeroAssetTab from '@/components/admin/HeroAssetTab';

export default function AdminHeroAssetsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">Hero Assets</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Manage homepage hero images and videos</p>
            </div>
            <HeroAssetTab />
        </div>
    );
}