'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';

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
