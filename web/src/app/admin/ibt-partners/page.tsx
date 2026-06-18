'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { Store, Package, Image, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminIBTPartnersPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    const sections = [
        {
            id: 'stores',
            title: 'Partner Stores',
            description: 'Manage IBT partner stores and their storefronts',
            icon: Store,
            href: '/admin/ibt-partners/stores',
            color: 'bg-accent-500/100',
        },
        {
            id: 'products',
            title: 'Partner Products',
            description: 'Manage products and offerings for each partner store',
            icon: Package,
            href: '/admin/ibt-partners/products',
            color: 'bg-sand-500/50',
        },
        {
            id: 'hero',
            title: 'Hero Assets',
            description: 'Manage hero images and banners for partner landing pages',
            icon: Image,
            href: '/admin/assets-hero',
            color: 'bg-sunset-500',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-ink-primary dark:text-white">IBT Partners</h2>
                <p className="text-ink-tertiary dark:text-ink-tertiary">Manage IBT Solutions partner stores, products, and branding</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <Link
                            key={section.id}
                            href={section.href}
                            className="group bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-border-primary p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-ink-primary dark:text-white mb-2">{section.title}</h3>
                            <p className="text-sm text-ink-tertiary dark:text-ink-tertiary">{section.description}</p>
                        </Link>
                    );
                })}
            </div>

            
            <div className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-border-primary p-6">
                <h3 className="text-lg font-bold text-ink-primary dark:text-white mb-4">Partner Stores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl">
                        <div className="text-2xl font-black text-accent-400">1</div>
                        <div className="text-xs text-ink-tertiary font-bold uppercase tracking-wider mt-1">Active Stores</div>
                    </div>
                    <div className="text-center p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl">
                        <div className="text-2xl font-black text-sand-500">4</div>
                        <div className="text-xs text-ink-tertiary font-bold uppercase tracking-wider mt-1">Products</div>
                    </div>
                    <div className="text-center p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl">
                        <div className="text-2xl font-black text-sunset-500">2</div>
                        <div className="text-xs text-ink-tertiary font-bold uppercase tracking-wider mt-1">Hero Assets</div>
                    </div>
                    <div className="text-center p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl">
                        <div className="text-2xl font-black text-emerald-400">1</div>
                        <div className="text-xs text-ink-tertiary font-bold uppercase tracking-wider mt-1">Partners</div>
                    </div>
                </div>
            </div>

            
            <div className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-border-primary p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-ink-primary dark:text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link href="/admin/ibt-partners/stores" className="flex items-center gap-3 p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl hover:bg-accent-500/10 dark:hover:bg-accent-800/20 transition-colors">
                        <div className="w-10 h-10 bg-accent-500/100 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-ink-primary dark:text-white text-sm">Add Partner Store</div>
                            <div className="text-xs text-ink-tertiary">Create a new partner storefront</div>
                        </div>
                    </Link>
                    <Link href="/admin/ibt-partners/products" className="flex items-center gap-3 p-4 bg-surface-primary dark:bg-surface-tertiary rounded-xl hover:bg-sand-500/5 dark:hover:bg-sand-800/20 transition-colors">
                        <div className="w-10 h-10 bg-sand-500/50 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-ink-primary dark:text-white text-sm">Add Product</div>
                            <div className="text-xs text-ink-tertiary">Add products to a partner store</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
