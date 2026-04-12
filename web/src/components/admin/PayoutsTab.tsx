'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { AdminTable, Column } from './shared/AdminTable';
import toast from 'react-hot-toast';
import { Check, X, DollarSign, Wallet, CreditCard, Calendar } from 'lucide-react';

interface PayoutRequest {
    request_id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    wallet_id: number;
    amount: string;
    payout_method: string;
    payout_details: Record<string, unknown>;
    status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
    partner_type: string;
    created_at: string;
    updated_at: string;
    rejection_reason?: string;
    notes?: string;
}

export default function PayoutsTab() {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleAction = async (action: 'approve' | 'reject', request: PayoutRequest) => {
        try {
            if (action === 'approve') {
                if (!confirm(`Are you sure you want to approve this payout of $${request.amount} for ${request.user_name}?`)) return;

                await api.patch(`/financials/admin/payouts/${request.request_id}`, {
                    status: 'completed',
                    notes: 'Processed by admin'
                });
                toast.success('Payout approved and processed');
            } else if (action === 'reject') {
                const reason = prompt('Please enter a rejection reason:');
                if (!reason) return;

                await api.patch(`/financials/admin/payouts/${request.request_id}`, {
                    status: 'rejected',
                    rejection_reason: reason,
                    notes: 'Rejected by admin'
                });
                toast.success('Payout rejected');
            }
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Payout action error:', error);
            const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Action failed';
            toast.error(message);
        }
    };

    const columns: Column<PayoutRequest>[] = [
        {
            header: 'Request ID',
            accessor: 'request_id',
            className: 'w-20 text-slate-400 font-mono text-xs'
        },
        {
            header: 'Partner',
            accessor: (row) => (
                <div>
                    <div className="font-bold text-slate-900">{row.user_name}</div>
                    <div className="text-xs text-slate-500">{row.user_email}</div>
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${row.partner_type === 'vendor' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        {row.partner_type}
                    </span>
                </div>
            )
        },
        {
            header: 'Amount',
            accessor: (row) => (
                <div className="flex items-center gap-1 font-black text-emerald-600">
                    <DollarSign size={14} />
                    {parseFloat(row.amount).toFixed(2)}
                </div>
            )
        },
        {
            header: 'Method',
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                        {row.payout_method === 'bank_transfer' ? <CreditCard size={14} /> : <Wallet size={14} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase">{row.payout_method.replace('_', ' ')}</span>
                        {/* Basic details preview */}
                        <span className="text-[9px] text-slate-400 max-w-[150px] truncate">
                            {JSON.stringify(row.payout_details)}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (row) => {
                const colors = {
                    pending: 'bg-amber-100 text-amber-700',
                    processing: 'bg-blue-100 text-blue-700',
                    completed: 'bg-emerald-100 text-emerald-700',
                    rejected: 'bg-rose-100 text-rose-700',
                    cancelled: 'bg-slate-100 text-slate-500'
                };
                return (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[row.status] || colors.pending}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: 'Date',
            accessor: (row) => (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(row.created_at).toLocaleDateString()}
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payout Requests</h2>
                    <p className="text-slate-500 font-medium">Manage withdrawal requests from vendors and drivers</p>
                </div>

                {/* Summary Cards could go here */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Pending</span>
                        <span className="text-xl font-bold text-amber-500">
                            {/* We would calculate this from stats API if we had one for this, strictly UI for now */}
                            --
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden shadow-xl">
                <AdminTable<PayoutRequest>
                    key={refreshKey}
                    endpoint="/financials/admin/payouts"
                    keyName="payouts" // Assuming the API returns array directly, verify response structure
                    columns={columns}
                    rowActions={[
                        {
                            label: 'Approve',
                            action: 'approve',
                            className: 'text-emerald-600 hover:bg-emerald-50',
                            icon: <Check size={14} />,
                            condition: (row) => row.status === 'pending'
                        },
                        {
                            label: 'Reject',
                            action: 'reject',
                            className: 'text-rose-500 hover:bg-rose-50',
                            icon: <X size={14} />,
                            condition: (row) => row.status === 'pending'
                        }
                    ]}
                    onRowAction={(action, row) => {
                        if (action === 'approve' || action === 'reject') {
                            handleAction(action, row);
                        }
                    }}
                />
            </div>
        </div>
    );
}
