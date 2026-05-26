'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from '@/components/admin/shared/AdminTable';
import { Store, ExternalLink, Edit, Trash2, Eye } from 'lucide-react';

interface PartnerStore {
    id: number;
    store_id?: number;
    name: string;
    slug: string;
    category: string;
    status: string;
    is_active: boolean;
    created_at: string;
    vendor_name?: string;
}

export default function AdminIBTPartnerStoresPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [refreshKey, setRefreshKey] = useState(0);
    const [stores, setStores] = useState<PartnerStore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        const fetchPartnerStores = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/stores');
                const allStores = res.data.stores || res.data || [];
                // Filter for IBT partner stores (vendor_id = 2 is the admin/IBT vendor)
                const partnerStores = allStores.filter((s: any) => s.vendor_id === 2 || s.vendor_name === 'IBT Solutions');
                setStores(partnerStores);
            } catch (error) {
                console.error('Failed to fetch partner stores:', error);
                toast.error('Failed to load partner stores');
            } finally {
                setLoading(false);
            }
        };
        fetchPartnerStores();
    }, [refreshKey]);

    const handleToggleStatus = async (store: PartnerStore) => {
        try {
            await api.patch(`/stores/${store.store_id || store.id}`, {
                is_active: !store.is_active
            });
            toast.success(`Store ${store.is_active ? 'deactivated' : 'activated'}`);
            setRefreshKey(k => k + 1);
        } catch {
            toast.error('Failed to update store status');
        }
    };

    const handleDelete = async (store: PartnerStore) => {
        if (!confirm(`Delete "${store.name}"? This cannot be undone.`)) return;
        try {
            await api.delete(`/stores/${store.store_id || store.id}`);
            toast.success('Store deleted');
            setRefreshKey(k => k + 1);
        } catch {
            toast.error('Failed to delete store');
        }
    };

    const columns: Column<PartnerStore>[] = [
        { header: 'ID', accessor: 'id', sortKey: 'id' },
        { header: 'Name', accessor: 'name', sortKey: 'name' },
        { header: 'Slug', accessor: 'slug', sortKey: 'slug' },
        { header: 'Category', accessor: 'category', sortKey: 'category' },
        {
            header: 'Status',
            accessor: (item) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { header: 'Created', accessor: 'created_at', sortKey: 'created_at' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary dark:text-white">Partner Stores</h2>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Manage IBT Solutions partner storefronts</p>
                </div>
                <a
                    href="/admin/stores"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors"
                >
                    <Store className="w-4 h-4" />
                    All Stores
                </a>
            </div>

            {/* Partner Store Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-surface-secondary dark:bg-surface-tertiary animate-pulse rounded-2xl" />
                    ))}
                </div>
            ) : stores.length === 0 ? (
                <div className="text-center py-16 bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-slate-700">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-ink-primary dark:text-white mb-2">No Partner Stores</h3>
                    <p className="text-ink-tertiary mb-6">Get started by creating a partner store.</p>
                    <a href="/admin/stores" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600 transition-colors">
                        Create Store
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stores.map(store => (
                        <div key={store.store_id || store.id} className="bg-surface-elevated dark:bg-surface-tertiary rounded-2xl border border-border-primary dark:border-slate-700 p-5 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-ink-primary dark:text-white">{store.name}</h3>
                                    <p className="text-xs text-ink-tertiary">/{store.slug}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {store.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="text-xs text-ink-tertiary mb-4">
                                {store.category} • Created {new Date(store.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`/store/${store.slug}`}
                                    target="_blank"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-surface-secondary dark:bg-slate-700 text-ink-secondary dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-surface-tertiary dark:hover:bg-slate-600 transition-colors"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                </a>
                                <a
                                    href={`/admin/ibt-partners/products?store=${store.store_id || store.id}`}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sand-500/10 text-sand-500 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    Products
                                </a>
                                <button
                                    onClick={() => handleToggleStatus(store)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                                        store.is_active
                                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                >
                                    {store.is_active ? 'Disable' : 'Enable'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
