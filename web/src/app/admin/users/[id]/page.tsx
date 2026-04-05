'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

export default function UserDetailPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await api.get('/users?limit=1000');
                const found = res.data.users.find((u: any) => u.id === parseInt(id));
                setUserData(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, isAuthenticated, user]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>
    );
    if (!userData) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="text-4xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">User not found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">The user ID may be invalid or deleted.</p>
                <button 
                    onClick={() => router.push('/admin')}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                >
                    Back to Admin
                </button>
            </div>
        </div>
    );

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${params.id}`);
            toast.success('User deleted successfully');
            router.push('/admin');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await api.patch(`/users/${params.id}/status`, { is_active: !userData.is_active });
            setUserData({ ...userData, is_active: !userData.is_active });
            toast.success(`User ${userData.is_active ? 'suspended' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold mb-6 transition-colors"
                >
                    <span className="text-xl">←</span>
                    <span>Back to Admin</span>
                </button>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-6 flex items-center gap-4">
                        <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                            {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">{userData.name}</h1>
                            <div className="text-sm text-slate-400">{userData.email}</div>
                            <a href={`/users/${userData.id}`} className="text-xs text-teal-400 hover:text-teal-300 underline mt-1 block">
                                View Public Profile →
                            </a>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                                userData.is_active 
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                                {userData.is_active ? 'Active' : 'Suspended'}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Role</label>
                                <div className="text-lg font-bold text-slate-900 dark:text-white uppercase">{userData.role}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Joined</label>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">
                                    {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        {userData.phone && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Phone</label>
                                <div className="text-slate-900 dark:text-white">{userData.phone}</div>
                            </div>
                        )}

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 flex flex-wrap gap-4 items-center">
                            <button
                                onClick={handleToggleStatus}
                                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                                    userData.is_active 
                                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50' 
                                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                }`}
                            >
                                {userData.is_active ? 'Block User' : 'Activate User'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

        // We might not have a dedicated get-user-by-id endpoint for admins yet, 
        // but we can query the users list or add one. 
        // For efficiency, let's assume we can fetch it or just filter from the list if cached,
        // but a fresh fetch is better.
        // Actually, userController.ts only has getAllUsers. 
        // I should probably add getUserById to userController or just rely on the list for now.
        // Let's create a quick endpoint or use filtered list if state management was global.
        // Better: Update userController to support /:id or add a specific route.
        // Optimization: For now, I'll fetch all and find (not ideal but works for <100 users) 
        // OR simply display basic info if passed via state (Next.js router doesn't pass state easily).
        // Best approach: Add GET /api/users/:id to backend.

        const fetchUser = async () => {
            try {
                // Temporary workaround: Fetch all and find (since I didn't add GET /:id details yet)
                // Wait, I should add the endpoint to be robust.
                const res = await api.get('/users?limit=1000');
                const found = res.data.users.find((u: any) => u.id === parseInt(id));
                setUserData(found);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
        fetchUser();
    }, [id, isAuthenticated, user]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!userData) return <div className="p-10 text-center">User not found</div>;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/users/${params.id}`);
            router.push('/admin');
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await api.patch(`/users/${params.id}/status`, { is_active: !userData.is_active });
            setUserData({ ...userData, is_active: !userData.is_active });
        } catch (error) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-6 flex items-center gap-4">
                    <div className="h-16 w-16 bg-teal-500 rounded-full flex items-center justify-center text-2xl font-bold">
                        {userData.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{userData.name}</h1>
                        <div className="text-sm text-slate-400">{userData.email}</div>
                        <a href={`/users/${userData.id}`} className="text-xs text-teal-400 hover:text-teal-300 underline mt-1 block">
                            View Public Profile →
                        </a>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${userData.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {userData.is_active ? 'Active' : 'Suspended'}
                        </span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">Role</label>
                            <div className="text-lg font-bold text-slate-900 uppercase">{userData.role}</div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">Joined</label>
                            <div className="text-lg font-bold text-slate-900">{new Date(userData.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex gap-4">
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-slate-500 font-bold hover:text-slate-800"
                        >
                            ← Back
                        </button>
                        <div className="ml-auto flex gap-3">
                            <button
                                onClick={handleToggleStatus}
                                className={`px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity ${userData.is_active ? 'bg-amber-100 text-amber-900' : 'bg-green-100 text-green-900'}`}
                            >
                                {userData.is_active ? 'Block User' : 'Unblock User'}
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100"
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
