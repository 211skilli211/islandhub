
'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AdminTable, Column } from './shared/AdminTable';

interface Order {
    id: number;
    order_id: number;
    business_name: string;
    customer_name: string;
    product_title: string;
    amount: string;
    commission: string;
    net_revenue: string;
    status: string;
    created_at: string;
}

export default function RevenueTab() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await api.get('/revenue/stats');
            setStats(res.data);
        } catch (error) {
            console.error('Failed to fetch revenue stats', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const orderColumns: Column<Order>[] = [
        { header: 'Order ID', accessor: (o) => <span className="font-mono text-slate-400 text-xs">#{o.order_id}</span> },
        { header: 'Vendor', accessor: 'business_name', className: 'font-bold text-slate-900' },
        { header: 'Customer', accessor: 'customer_name' },
        { header: 'Product', accessor: (o) => <span className="truncate max-w-[150px] inline-block">{o.product_title || 'Direct Payment'}</span> },
        { header: 'Amount', accessor: (o) => <span className="font-black text-slate-900">${Number(o.amount).toLocaleString()}</span> },
        { header: 'Net Rev', accessor: (o) => <span className="font-black text-teal-600">${Number(o.net_revenue).toLocaleString()}</span> },
        {
            header: 'Status',
            accessor: (o) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${o.status === 'paid' ? 'bg-green-100 text-green-700' :
                    o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {o.status}
                </span>
            )
        },
        { header: 'Date', accessor: (o) => <span className="text-xs text-slate-400">{new Date(o.created_at).toLocaleDateString()}</span> }
    ];

    if (loading && !stats) return <div className="p-20 text-center animate-pulse text-slate-400 font-bold uppercase text-[10px]">Calculating Financials...</div>;

    const summary = stats?.summary || { gross_volume: 0, total_commission: 0, net_platform_revenue: 0, total_orders: 0 };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Total Managed Volume</p>
                    <h2 className="text-4xl font-black mb-4">${Number(summary.gross_volume || 0).toLocaleString()}</h2>
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <span>↑ 14%</span>
                        <span className="text-slate-500 font-medium">vs last month</span>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Platform Comissions</p>
                    <h2 className="text-4xl font-black text-slate-900 mb-4">${Number(summary.total_commission || 0).toLocaleString()}</h2>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full w-[35%]" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-teal-100 shadow-xl shadow-teal-100/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 mb-2">Net Platform Revenue</p>
                    <h2 className="text-4xl font-black text-teal-600 mb-4">${Number(summary.net_platform_revenue || 0).toLocaleString()}</h2>
                    <button className="text-[10px] font-black text-slate-400 hover:text-teal-600 underline uppercase tracking-widest">Withdraw Funds</button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Financial Ledger</h3>
                        <p className="text-sm font-medium text-slate-400">Detailed breakdown of all marketplace transactions</p>
                    </div>
                    <button className="px-6 py-2.5 bg-slate-100 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-slate-200 transition-all">Export CSV</button>
                </div>

                <AdminTable<Order>
                    endpoint="/revenue/orders"
                    keyName="orders"
                    columns={orderColumns}
                    filtersConfig={{
                        status: { label: 'Status', options: [{ label: 'Paid', value: 'paid' }, { label: 'Pending', value: 'pending' }, { label: 'Refunded', value: 'refunded' }] }
                    }}
                    defaultSort={{ sortBy: 'created_at', sortOrder: 'desc' }}
                />
            </div>
        </div>
    );
}
