'use client';

import { useState } from 'react';
import { AdminTable, Column } from './shared/AdminTable';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

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
        { header: 'ID', accessor: 'id', className: 'w-16 text-ink-tertiary font-mono' },
        {
            header: 'Action Agent',
            accessor: (l) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#14b8a6]/10 flex items-center justify-center text-[10px] font-black text-[#14b8a6] border border-[#14b8a6]/20">
                        {l.admin_name?.charAt(0) || 'S'}
                    </div>
                    <div>
                        <p className="font-bold text-ink-primary leading-none">{l.admin_name || 'System Auto'}</p>
                        <p className="text-[9px] text-ink-tertiary mt-1 uppercase tracking-tighter">UID: {l.user_id}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Operation',
            accessor: (l) => (
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${l.action.includes('delete') ? 'bg-[#e11d48]/10 text-[#be123c]' :
                        l.action.includes('create') ? 'bg-emerald-500/15 text-emerald-500' :
                            l.action.includes('assign') ? 'bg-[#14b8a6]/15 text-[#14b8a6]' :
                                'bg-surface-secondary text-ink-tertiary'
                    }`}>
                    {l.action.replace(/_/g, ' ')}
                </span>
            )
        },
        {
            header: 'Target Ref',
            accessor: (l) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-ink-secondary">#{l.record_id || 'Global'}</span>
                    {l.new_values?.title && <span className="text-[9px] text-ink-tertiary truncate max-w-[120px]">{l.new_values.title}</span>}
                </div>
            )
        },
        {
            header: 'Deep Intelligence',
            accessor: (l) => (
                <div className="max-w-[200px] text-[10px] text-ink-tertiary font-medium truncate">
                    {l.new_values ? JSON.stringify(l.new_values) : 'No extra data'}
                </div>
            )
        },
        {
            header: 'Timestamp',
            accessor: (l) => (
                <div>
                    <p className="text-xs font-bold text-ink-secondary">{new Date(l.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-ink-tertiary">{new Date(l.created_at).toLocaleTimeString()}</p>
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
            <div className="bg-gradient-to-r from-ink-900 to-teal-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">Audit Intelligence Hub <EmojiIcon emoji="📜" size=40 /></h2>
                    <p className="text-ink-tertiary font-bold uppercase text-[10px] tracking-widest">Permanent Immutable Record of Administrative Operations</p>
                </div>
                <EmojiIcon emoji="🏛️" size=16 className="absolute top-0 right-0 p-10 opacity-10 text-9xl font-black" />
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
