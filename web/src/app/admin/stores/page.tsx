'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AdminTable } from '@/components/admin/shared/AdminTable';
import EditStoreModal from '@/components/admin/EditStoreModal';
import CreateStoreModal from '@/components/admin/CreateStoreModal';
import BadgeSelector from '@/components/marketplace/BadgeSelector';

interface StoreColumn {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
}

export default function AdminStoresPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [editingStore, setEditingStore] = useState<any>(null);
    const [showCreateStore, setShowCreateStore] = useState(false);
    const [badgeStore, setBadgeStore] = useState<any>(null);
    const [badgeSelection, setBadgeSelection] = useState<string[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

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

    const storeColumns: StoreColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'vendor_name', label: 'Vendor', sortable: true },
        { key: 'category', label: 'Category', sortable: true },
        { key: 'status', label: 'Status', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                val === 'active' ? 'bg-green-100 text-green-700' : 
                val === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
            }`}>
                {val || 'active'}
            </span>
        )},
        { key: 'created_at', label: 'Created', sortable: true },
    ];

    const handleAction = async (action: string, storeId: number) => {
        try {
            switch (action) {
                case 'edit':
                    const res = await api.get(`/stores/${storeId}`);
                    setEditingStore(res.data);
                    break;
                case 'badges':
                    const storeRes = await api.get(`/stores/${storeId}`);
                    setBadgeStore(storeRes.data);
                    setBadgeSelection(storeRes.data.badges || []);
                    break;
                case 'toggle_status':
                    const sRes = await api.get(`/stores/${storeId}`);
                    await api.patch(`/stores/${storeId}`, { 
                        is_active: sRes.data.is_active === false }
                    );
                    toast.success('Status updated');
                    setRefreshKey(k => k + 1);
                    break;
                case 'delete':
                    if (confirm('Delete this store?')) {
                        await api.delete(`/stores/${storeId}`);
                        toast.success('Store deleted');
                        setRefreshKey(k => k + 1);
                    }
                    break;
            }
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Modals */}
            {editingStore && (
                <EditStoreModal 
                    store={editingStore} 
                    isOpen={!!editingStore}
                    onClose={() => setEditingStore(null)} 
                    onSuccess={() => { setEditingStore(null); setRefreshKey(k => k + 1); }} 
                />
            )}

            {showCreateStore && (
                <CreateStoreModal 
                    isOpen={showCreateStore}
                    onClose={() => setShowCreateStore(false)} 
                    onSuccess={() => { setShowCreateStore(false); setRefreshKey(k => k + 1); }} 
                />
            )}

            {badgeStore && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Store Badges</h3>
                        <BadgeSelector selectedBadges={badgeSelection} onChange={setBadgeSelection} />
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setBadgeStore(null)} 
                                className="flex-1 py-4 text-slate-400 dark:text-slate-400 font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    await api.put(`/stores/${badgeStore.id}`, { badges: badgeSelection });
                                    toast.success('Badges updated');
                                    setBadgeStore(null);
                                    setRefreshKey(k => k + 1);
                                }}
                                className="flex-1 py-4 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vendor Stores</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage all vendor stores on the platform</p>
                </div>
                <button 
                    onClick={() => setShowCreateStore(true)} 
                    className="px-5 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                    + New Store
                </button>
            </div>

            {/* Table */}
            <AdminTable<any>
                key={`stores-${refreshKey}`}
                endpoint="/admin/stores"
                keyName="stores"
                columns={storeColumns}
                hoverType="store"
                rowActions={[
                    { label: 'Edit', action: 'edit' },
                    { label: 'Badges', action: 'badges' },
                    { label: 'Status', action: 'toggle_status' },
                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                ]}
                onRowAction={(action, id) => handleAction(action, id)}
            />
        </div>
    );
}