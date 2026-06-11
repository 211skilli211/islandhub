'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';

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
            <div className="flex gap-4 p-1 bg-surface-secondary rounded-2xl w-fit">
                {[
                    { id: 'vendor', label: 'Vendors', icon: '🛍️' },
                    { id: 'customer', label: 'Customers', icon: '✨' },
                    { id: 'creator', label: 'Creators', icon: '❤️' }
                ].map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setActiveTab(role.id as any)}
                        className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all ${activeTab === role.id ? 'bg-surface-elevated text-accent-400 shadow-md' : 'text-ink-tertiary hover:text-ink-secondary'}`}
                    >
                        <span>{role.icon}</span>
                        {role.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-surface-elevated rounded-[2.5rem] shadow-xl shadow-black/10/50 border border-border-primary overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-secondary/50">
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-ink-tertiary">User / Entity</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-ink-tertiary">Current Tier</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-ink-tertiary">Status</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-ink-tertiary">Period End</th>
                            <th className="p-6 font-black text-[10px] uppercase tracking-[0.2em] text-ink-tertiary text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-border-primary border-t-teal-600" />
                                </td>
                            </tr>
                        ) : subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-ink-tertiary font-bold italic">No subscriptions found for this category.</td>
                            </tr>
                        ) : (
                            subscriptions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-surface-secondary/30 transition-colors">
                                    <td className="p-6">
                                        <div className="font-black text-ink-primary leading-tight">
                                            {activeTab === 'vendor' ? sub.business_name : sub.name}
                                        </div>
                                        <div className="text-[10px] text-ink-tertiary font-bold">{sub.email}</div>
                                    </td>
                                    <td className="p-6">
                                        <select
                                            value={sub.tier}
                                            onChange={(e) => handleUpdate(sub, e.target.value, sub.status)}
                                            className="bg-surface-secondary border-transparent rounded-lg text-xs font-black uppercase tracking-widest text-ink-secondary px-3 py-1.5 focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
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
                                            sub.status === 'past_due' ? 'bg-sand-500/10 text-sand-500' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="text-xs font-bold text-ink-tertiary">
                                            {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : 'N/A'}
                                        </div>
                                        {sub.cancel_at_period_end && (
                                            <div className="text-[8px] font-black uppercase text-[#e11d48] mt-1">Pending Cancellation</div>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button
                                            onClick={() => handleUpdate(sub, sub.tier, sub.status === 'active' ? 'suspended' : 'active')}
                                            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${sub.status === 'active' ? 'bg-[#e11d48]/5 text-[#e11d48] hover:bg-[#e11d48]/10' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15'
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
