'use client';

import React from 'react';
import { AdminTable, Column } from './shared/AdminTable';
import Link from 'next/link';

interface Order {
    order_id: number;
    customer_name: string;
    store_name: string;
    total_amount: string;
    currency: string;
    status: string;
    order_type: string;
    delivery_fee: string;
    created_at: string;
}

export default function OrdersTab() {
    const columns: Column<Order>[] = [
        { header: 'ID', accessor: 'order_id', className: 'w-16 text-slate-400 font-mono' },
        {
            header: 'Customer',
            accessor: (o) => (
                <div className="font-bold text-slate-800">
                    {o.customer_name || 'Guest User'}
                </div>
            )
        },
        {
            header: 'Type',
            accessor: (o) => (
                <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${o.order_type === 'delivery' ? 'text-blue-600' : 'text-slate-400'}`}>
                        {o.order_type || 'pickup'}
                    </span>
                    {o.order_type === 'delivery' && o.delivery_fee && (
                        <span className="text-[9px] font-bold text-slate-400">+${parseFloat(o.delivery_fee).toFixed(2)} Fee</span>
                    )}
                </div>
            )
        },
        {
            header: 'Store',
            accessor: (o) => (
                <div className="text-teal-600 font-black uppercase text-[10px] tracking-widest">
                    {o.store_name || 'Platform'}
                </div>
            )
        },
        {
            header: 'Total',
            accessor: (o) => (
                <span className="font-black text-slate-900 italic">
                    ${parseFloat(o.total_amount).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Status',
            accessor: (o) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${o.status === 'paid' ? 'bg-green-100 text-green-700' :
                    o.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-500'
                    }`}>
                    {o.status}
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: (o) => (
                <div className="flex gap-2">
                    {o.status === 'ready' && o.order_type === 'delivery' && (
                        <button
                            onClick={() => {/* TODO: Open Dispatch Modal */ }}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            title="Dispatch Driver"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    )}
                </div>
            )
        },
        {
            header: 'Date',
            accessor: (o) => (
                <span className="text-xs text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Global Orders</h2>
                    <p className="text-slate-500 text-sm font-medium">Monitoring all platform transactions</p>
                </div>
            </div>

            <AdminTable<Order>
                endpoint="/admin/orders"
                keyName="orders"
                columns={columns}
                filtersConfig={{
                    status: {
                        label: 'Status',
                        options: [
                            { label: 'Pending', value: 'pending' },
                            { label: 'Paid', value: 'paid' },
                            { label: 'Preparing', value: 'preparing' },
                            { label: 'Ready', value: 'ready' },
                            { label: 'Fulfilled', value: 'fulfilled' },
                            { label: 'Cancelled', value: 'cancelled' }
                        ]
                    }
                }}
                defaultSort={{ sortBy: 'created_at', sortOrder: 'desc' }}
            />
        </div>
    );
}
