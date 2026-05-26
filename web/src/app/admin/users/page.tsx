'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { AdminTable, Column } from '@/components/admin/shared/AdminTable';
import EditUserModal from '@/components/admin/EditUserModal';
import CreateUserModal from '@/components/admin/CreateUserModal';

export default function AdminUsersPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [roleChangeUser, setRoleChangeUser] = useState<any>(null);
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

    const userColumns: Column<any>[] = [
        { header: 'ID', accessor: 'id', sortKey: 'id' },
        { header: 'Name', accessor: 'name', sortKey: 'name' },
        { header: 'Email', accessor: 'email', sortKey: 'email' },
        { header: 'Role', accessor: 'role', sortKey: 'role' },
        { header: 'Status', accessor: (item) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {item.is_active ? 'Active' : 'Suspended'}
            </span>
        )},
        { header: 'Joined', accessor: 'created_at', sortKey: 'created_at' },
    ];

    const handleAction = async (action: string, userId: number) => {
        try {
            switch (action) {
                case 'edit_profile':
                    const res = await api.get(`/users/${userId}`);
                    setEditingUser(res.data);
                    break;
                case 'verify':
                    await api.patch(`/users/${userId}`, { email_verified: true });
                    toast.success('Email verified');
                    setRefreshKey(k => k + 1);
                    break;
                case 'unverify':
                    await api.patch(`/users/${userId}`, { email_verified: false });
                    toast.success('Email unverified');
                    setRefreshKey(k => k + 1);
                    break;
                case 'verify_driver':
                    await api.patch(`/users/${userId}`, { is_verified_driver: true });
                    toast.success('Driver verified');
                    setRefreshKey(k => k + 1);
                    break;
                case 'unverify_driver':
                    await api.patch(`/users/${userId}`, { is_verified_driver: false });
                    toast.success('Driver unverified');
                    setRefreshKey(k => k + 1);
                    break;
                case 'toggle_status':
                    const userRes = await api.get(`/users/${userId}`);
                    await api.patch(`/users/${userId}`, { is_active: !userRes.data.is_active });
                    toast.success('Status updated');
                    setRefreshKey(k => k + 1);
                    break;
                case 'change_role':
                    const roleRes = await api.get(`/users/${userId}`);
                    setRoleChangeUser(roleRes.data);
                    break;
                case 'delete':
                    if (confirm('Delete this user? This cannot be undone.')) {
                        await api.delete(`/users/${userId}`);
                        toast.success('User deleted');
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
            {roleChangeUser && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-elevated dark:bg-surface-tertiary p-8 rounded-3xl shadow-2xl w-full max-w-md border border-border-primary dark:border-border-primary">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-ink-primary dark:text-ink-tertiary">Change Role</h3>
                            <p className="text-ink-tertiary dark:text-ink-tertiary mt-2">Update role for {roleChangeUser.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {['admin', 'vendor', 'driver', 'rider', 'moderator', 'buyer'].map((role) => (
                                <button
                                    key={role}
                                    onClick={async () => {
                                        try {
                                            await api.patch(`/users/${roleChangeUser.id}`, { role });
                                            toast.success('Role updated');
                                            setRoleChangeUser(null);
                                            setRefreshKey(k => k + 1);
                                        } catch (err) {
                                            toast.error('Failed to update role');
                                        }
                                    }}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        roleChangeUser.role === role 
                                            ? 'border-teal-500 bg-accent-500/10 dark:bg-accent-800/20' 
                                            : 'border-border-primary dark:border-border-primary hover:border-teal-500'
                                    }`}
                                >
                                    <span className="font-black uppercase text-xs tracking-widest block">{role}</span>
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setRoleChangeUser(null)} 
                            className="w-full py-4 text-ink-tertiary dark:text-ink-tertiary font-black uppercase text-xs tracking-widest"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {editingUser && (
                <EditUserModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSuccess={() => { setEditingUser(null); setRefreshKey(k => k + 1); }} 
                />
            )}

            {showCreateUser && (
                <CreateUserModal 
                    onClose={() => setShowCreateUser(false)} 
                    onSuccess={() => { setShowCreateUser(false); setRefreshKey(k => k + 1); }} 
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary dark:text-white">User Accounts</h2>
                    <p className="text-ink-tertiary dark:text-ink-tertiary">Manage all registered users on the platform</p>
                </div>
                <button 
                    onClick={() => setShowCreateUser(true)} 
                    className="px-5 py-2.5 bg-surface-tertiary dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-surface-tertiary transition-colors"
                >
                    + New User
                </button>
            </div>

            {/* Table */}
            <AdminTable<any>
                key={`users-${refreshKey}`}
                endpoint="/admin/users"
                keyName="users"
                columns={userColumns}
                searchable={true}
                searchPlaceholder="Search by name or email..."
                hoverType="user"
                bulkActions={{
                    activate: async (ids) => {
                        await Promise.all(ids.map(id => api.patch(`/admin/users/${id}`, { is_active: true })));
                        toast.success(`${ids.length} users activated`);
                    },
                    deactivate: async (ids) => {
                        await Promise.all(ids.map(id => api.patch(`/admin/users/${id}`, { is_active: false })));
                        toast.success(`${ids.length} users deactivated`);
                    },
                    delete: async (ids) => {
                        if (confirm(`Delete ${ids.length} users? This cannot be undone.`)) {
                            await Promise.all(ids.map(id => api.delete(`/admin/users/${id}`)));
                            toast.success(`${ids.length} users deleted`);
                        }
                    }
                }}
                rowActions={[
                    { label: 'Edit Profile', action: 'edit_profile' },
                    { label: 'Change Role', action: 'change_role' },
                    { label: 'Verify Email', action: 'verify', condition: (u: any) => !u.email_verified },
                    { label: 'Unverify Email', action: 'unverify', condition: (u: any) => u.email_verified },
                    { label: 'Verify Driver', action: 'verify_driver', condition: (u: any) => (u.role?.startsWith('driver') || u.role === 'rider') && !u.is_verified_driver },
                    { label: 'Unverify Driver', action: 'unverify_driver', condition: (u: any) => (u.role?.startsWith('driver') || u.role === 'rider') && u.is_verified_driver },
                    { label: 'Toggle Status', action: 'toggle_status' },
                    { label: 'Delete User', action: 'delete', className: 'text-red-500' }
                ]}
                onRowAction={(action, item) => handleAction(action, item.id)}
            />
        </div>
    );
}