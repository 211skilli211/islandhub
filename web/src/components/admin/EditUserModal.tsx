
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    bio?: string;
    avatar_url?: string;
}

interface EditUserModalProps {
    user: User;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditUserModal({ user, onClose, onSuccess }: EditUserModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        role: user.role || 'buyer',
        is_active: user.is_active,
        bio: user.bio || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch(`/admin/users/${user.id}`, formData);
            toast.success('User updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update user', error);
            toast.error('Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Edit User Profile</h3>
                        <p className="text-sm font-medium text-slate-400">Manage account details for {user.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2 scrollbar-thin">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all font-bold text-slate-700"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">User Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all font-bold text-slate-700 appearance-none bg-no-repeat bg-[right_1.25rem_center] bg-[length:1rem]"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")` }}
                            >
                                <option value="buyer">Buyer</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                                <option value="creator">Creator</option>
                                <option value="donor">Donor</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Status</label>
                            <div className="flex bg-slate-100 p-1 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: true })}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${formData.is_active ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Active
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: false })}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${!formData.is_active ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}
                                >
                                    Suspended
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">User Bio / Internal Notes</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full px-5 py-4 rounded-[2rem] border border-slate-200 focus:ring-4 focus:ring-teal-50 focus:border-teal-500 transition-all font-medium text-slate-600 leading-relaxed h-32"
                            placeholder="Add administrative notes or update user bio..."
                        />
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-slate-400 font-black uppercase text-xs tracking-widest hover:text-slate-600 hover:bg-slate-50 transition-colors rounded-2xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 rounded-2xl"
                        >
                            {loading ? 'Saving...' : 'Update Record 💾'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
