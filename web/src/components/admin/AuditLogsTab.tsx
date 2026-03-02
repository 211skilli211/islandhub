'use client';

import { useState } from 'react';
import { AdminTable, Column } from './shared/AdminTable';

interface AuditLog {
    id: number;
    user_id: number;
    admin_name?: string;
    action: string;
    record_id: number;
    new_values: any;
    ip_address: string;
    created_at: string;
}

export default function AuditLogsTab() {
    const auditColumns: Column<AuditLog>[] = [
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 font-mono' },
        {
            header: 'Action Agent',
            accessor: (l) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 border border-indigo-100">
                        {l.admin_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 leading-none">{l.admin_name || 'System Auto'}</p>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter">UID: {l.user_id}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Operation',
            accessor: (l) => (
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${l.action.includes('delete') ? 'bg-rose-100 text-rose-700' :
                        l.action.includes('create') ? 'bg-emerald-100 text-emerald-700' :
                            l.action.includes('assign') ? 'bg-indigo-100 text-indigo-700' :
                                'bg-slate-100 text-slate-500'
                    }`}>
                    {l.action.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            header: 'Target Ref',
            accessor: (l) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700">#{l.record_id || 'Global'}</span>
                    {l.new_values?.title && <span className="text-[9px] text-slate-400 truncate max-w-[120px]">{l.new_values.title}</span>}
                </div>
            )
        },
        {
            header: 'Deep Intelligence',
            accessor: (l) => (
                <div className="max-w-[200px] text-[10px] text-slate-500 font-medium truncate">
                    {l.new_values ? JSON.stringify(l.new_values) : 'No extra data'}
                </div>
            )
        },
        {
            header: 'Timestamp',
            accessor: (l) => (
                <div>
                    <p className="text-xs font-bold text-slate-700">{new Date(l.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-slate-400">{new Date(l.created_at).toLocaleTimeString()}</p>
                </div>
            )
        }
    ];

    const filtersConfig = {
        action: {
            label: 'Action Type',
            options: [
                { label: 'Create User', value: 'create_user' },
                { label: 'Delete User', value: 'delete_user' },
                { label: 'Update Pricing', value: 'update_pricing' },
                { label: 'Assign Driver', value: 'admin_assign_driver' },
                { label: 'Cancel Job', value: 'admin_cancel_job' }
            ]
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Audit Intelligence Hub 📜</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Permanent Immutable Record of Administrative Operations</p>
                </div>
                <div className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black">🏛️</div>
            </div>

            <AdminTable<AuditLog>
                endpoint="/admin/audit-logs"
                keyName="audit_logs"
                columns={auditColumns}
                filtersConfig={filtersConfig}
                idKey="id"
            />
        </div>
    );
}
