'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubscriptionsTab() {
    const [activeTab, setActiveTab] = useState<'vendor' | 'customer' | 'creator'>('vendor');
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/subscriptions?type=${activeTab}`);
            setSubscriptions(res.data);
        } catch (error) {
            console.error('Failed to fetch subscriptions', error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [activeTab]);

    const handleUpdate = async (sub: any, newTier: string, newStatus: string) => {
        try {
            await api.put('/admin/subscriptions', {
                id: sub.id,
                type: activeTab,
                tier: newTier,
                status: newStatus
            });
            toast.success('Subscription updated successfully');
            fetchSubscriptions();
        } catch (error) {
            console.error('Failed to update subscription', error);
            toast.error('Update failed');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Role Switcher */}
            <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
                {[
                    { id: 'vendor', label: 'Vendors', icon: '🛍️' },
                    { id: 'customer', label: 'Customers', icon: '✨' },
                    { id: 'creator', label: 'Creators', icon: '❤️' }
                ].map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setActiveTab(role.id as any)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === role.id ? 'bg-white text-teal-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <span>{role.icon}</span>
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">User / Entity</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Current Tier</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Status</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Period End</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-teal-600" />
                                </td>
                            </tr>
                        ) : subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-slate-300 font-bold italic">No subscriptions found for this category.</td>
                            </tr>
                        ) : (
                            subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="p-6">
                                        <div className="font-black text-slate-900 leading-tight">
                                            {activeTab === 'vendor' ? sub.business_name : sub.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-bold">{sub.email}</div>
                                    </td>
                                    <td className="p-6">
                                        <select
                                            value={sub.tier}
                                            onChange={(e) => handleUpdate(sub, e.target.value, sub.status)}
                                            className="bg-slate-50 border-transparent rounded-lg text-xs font-black uppercase tracking-widest text-slate-700 px-3 py-1.5 focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
                                        >
                                            {activeTab === 'vendor' && (
                                                <>
                                                    <option value="basic">Basic</option>
                                                    <option value="premium">Premium</option>
                                                    <option value="enterprise">Enterprise</option>
                                                </>
                                            )}
                                            {activeTab === 'customer' && (
                                                <>
                                                    <option value="vip">VIP</option>
                                                    {/* In theory they might have others but we have VIP */}
                                                </>
                                            )}
                                            {activeTab === 'creator' && (
                                                <>
                                                    <option value="individual">Individual</option>
                                                    <option value="organization">Organization</option>
                                                    <option value="nonprofit">Nonprofit</option>
                                                </>
                                            )}
                                        </select>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-700' :
                                            sub.status === 'past_due' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs font-bold text-slate-500">
                                            {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
                                        </div>
                                        {sub.cancel_at_period_end && (
                                            <div className="text-[8px] font-black uppercase text-rose-500 mt-1">Pending Cancellation</div>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleUpdate(sub, sub.tier, sub.status === 'active' ? 'suspended' : 'active')}
                                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${sub.status === 'active' ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                }`}
                                        >
                                            {sub.status === 'active' ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
