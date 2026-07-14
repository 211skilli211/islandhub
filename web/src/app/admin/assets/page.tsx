'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import AssetLibrary from '@/components/admin/AssetLibrary';
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import TileManagerPage from './tile-manager/page';

export default function AdminAssetsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary dark:text-white">Media Library</h2>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Manage images, videos, and media assets</p>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 border-b border-border-primary">
                <button
                    className="px-4 py-2 text-sm font-semibold text-accent-500 border-b-2 border-accent-500"
                >
                    <EmojiIcon emoji="🖼️" size={16} className="inline mr-1" /> Media Library
                </button>
                <button
                    className="px-4 py-2 text-sm font-semibold text-ink-tertiary hover:text-ink-primary transition-colors"
                    onClick={() => router.push('/admin/assets/tile-manager')}
                >
                    <EmojiIcon emoji="🏷️" size={16} className="inline mr-1" /> Tile Manager
                </button>
                <button
                    className="px-4 py-2 text-sm font-semibold text-ink-tertiary hover:text-ink-primary transition-colors"
                    onClick={() => router.push('/admin/assets-hero')}
                >
                    <EmojiIcon emoji="🦸" size={16} className="inline mr-1" /> Hero Assets
                </button>
            </div>

            {/* Media Library Content */}
            <AssetLibrary />
        </div>
    );
}