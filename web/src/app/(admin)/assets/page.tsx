'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import AssetLibrary from '@/components/admin/AssetLibrary';

export default function AdminAssetsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Media Library</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage images, videos, and media assets</p>
            </div>
            <AssetLibrary />
        </div>
    );
}