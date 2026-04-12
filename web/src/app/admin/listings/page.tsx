'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AdminTable, Column } from '@/components/admin/shared/AdminTable';
import EditListingModal from '@/components/admin/EditListingModal';

export default function AdminListingsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [editingListing, setEditingListing] = useState<any>(null);
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

    const listingColumns: Column<any>[] = [
        { header: 'ID', accessor: 'id', sortKey: 'id' },
        { header: 'Title', accessor: 'title', sortKey: 'title' },
        { header: 'Type', accessor: 'type', sortKey: 'type' },
        { header: 'Category', accessor: 'category', sortKey: 'category' },
        { header: 'Price', accessor: (item) => `$${Number(item.price).toLocaleString()}`, sortKey: 'price' },
        { header: 'Status', accessor: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 
                item.status === 'inactive' ? 'bg-slate-100 text-slate-700' :
                'bg-amber-100 text-amber-700'
            }`}>
                {item.status || 'active'}
            </span>
        )},
        { header: 'Created', accessor: 'created_at', sortKey: 'created_at' },
    ];

    const handleAction = async (action: string, listingId: number) => {
        try {
            switch (action) {
                case 'edit':
                    const res = await api.get(`/listings/${listingId}`);
                    setEditingListing(res.data);
                    break;
                case 'promote':
                    await api.post(`/moderation/listing/${listingId}/promote`);
                    toast.success('Listing promoted');
                    setRefreshKey(k => k + 1);
                    break;
                case 'delete':
                    if (confirm('Delete this listing?')) {
                        await api.delete(`/listings/${listingId}`);
                        toast.success('Listing deleted');
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
            {/* Modal */}
            {editingListing && (
                <EditListingModal 
                    listing={editingListing} 
                    onClose={() => setEditingListing(null)} 
                    onSuccess={() => { setEditingListing(null); setRefreshKey(k => k + 1); }} 
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Global Listings</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage all marketplace listings</p>
                </div>
                <button 
                    onClick={() => router.push('/create')} 
                    className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-colors"
                >
                    + Add Listing
                </button>
            </div>

            {/* Table */}
            <AdminTable<any>
                key={`listings-${refreshKey}`}
                endpoint="/listings"
                keyName="listings"
                columns={listingColumns}
                hoverType="listing"
                bulkActions={{
                    activate: async (ids) => {
                        await Promise.all(ids.map(id => api.patch(`/listings/${id}`, { status: 'active' })));
                        toast.success(`${ids.length} listings activated`);
                    },
                    deactivate: async (ids) => {
                        await Promise.all(ids.map(id => api.patch(`/listings/${id}`, { status: 'inactive' })));
                        toast.success(`${ids.length} listings deactivated`);
                    },
                    delete: async (ids) => {
                        if (confirm(`Delete ${ids.length} listings?`)) {
                            await Promise.all(ids.map(id => api.delete(`/listings/${id}`)));
                            toast.success(`${ids.length} listings deleted`);
                        }
                    },
                    moderate: async (ids) => {
                        await Promise.all(ids.map(id => api.post(`/moderation/listing/${id}/moderate`)));
                        toast.success(`${ids.length} listings moderated`);
                    }
                }}
                rowActions={[
                    { label: 'Edit Listing', action: 'edit' },
                    { label: 'Promote', action: 'promote' },
                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                ]}
                onRowAction={(action, id) => handleAction(action, id)}
            />
        </div>
    );
}