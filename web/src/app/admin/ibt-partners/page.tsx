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
            color: 'bg-teal-500',
        },
        {
            id: 'products',
            title: 'Partner Products',
            description: 'Manage products and offerings for each partner store',
            icon: Package,
            href: '/admin/ibt-partners/products',
            color: 'bg-amber-500',
        },
        {
            id: 'hero',
            title: 'Hero Assets',
            description: 'Manage hero images and banners for partner landing pages',
            icon: Image,
            href: '/admin/assets-hero',
            color: 'bg-violet-500',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">IBT Partners</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage IBT Solutions partner stores, products, and branding</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sections.map(section => {
                    const Icon = section.icon;
                    return (
                        <Link
                            key={section.id}
                            href={section.href}
                            className="group bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 ${section.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{section.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{section.description}</p>
                        </Link>
                    );
                })}
            </div>

            {/* Quick Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Partner Stores</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div className="text-2xl font-black text-teal-600">1</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Active Stores</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div className="text-2xl font-black text-amber-600">4</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Products</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div className="text-2xl font-black text-violet-600">2</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Hero Assets</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-900 rounded-xl">
                        <div className="text-2xl font-black text-emerald-600">1</div>
                        <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Partners</div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Link href="/admin/ibt-partners/stores" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Add Partner Store</div>
                            <div className="text-xs text-slate-500">Create a new partner storefront</div>
                        </div>
                    </Link>
                    <Link href="/admin/ibt-partners/products" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="font-bold text-slate-900 dark:text-white text-sm">Add Product</div>
                            <div className="text-xs text-slate-500">Add products to a partner store</div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
