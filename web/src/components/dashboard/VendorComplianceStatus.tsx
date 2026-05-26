'use client';

import { useState, useEffect } from 'react';
import { api, getImageUrl } from '@/lib/api';
import Link from 'next/link';

interface ComplianceSummary {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    notStarted: number;
    required: number;
    isCompliant: boolean;
    percentage: number;
}

interface ComplianceRequirement {
    id: number;
    name: string;
    description: string;
    category: string;
    is_required: boolean;
}

interface ComplianceItem {
    id: number;
    requirement_id: number;
    status: string;
    document_url?: string;
    submitted_at?: string;
    name: string;
    description: string;
    category: string;
    is_required: boolean;
}

interface VendorComplianceStatusProps {
    vendorId: number;
    compact?: boolean;
}

export default function VendorComplianceStatus({ vendorId, compact = false }: VendorComplianceStatusProps) {
    const [summary, setSummary] = useState<ComplianceSummary | null>(null);
    const [items, setItems] = useState<ComplianceItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCompliance();
    }, [vendorId]);

    const fetchCompliance = async () => {
        try {
            const [summaryRes, itemsRes] = await Promise.all([
                api.get(`/compliance/vendor/${vendorId}/summary`),
                api.get(`/compliance/vendor/${vendorId}`)
            ]);
            setSummary(summaryRes.data);
            setItems([...itemsRes.data.inProgress, ...itemsRes.data.notStarted]);
        } catch (error) {
            console.error('Failed to fetch compliance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'submitted': return 'bg-sand-500/10 text-sand-500 border-sand-500/20';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-surface-secondary text-ink-tertiary0 border-border-primary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return '✓';
            case 'submitted': return '⏳';
            case 'rejected': return '✕';
            default: return '○';
        }
    };

    if (loading) {
        return (
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6 animate-pulse">
                <div className="h-4 bg-surface-tertiary rounded w-1/3 mb-4"></div>
                <div className="h-2 bg-surface-tertiary rounded w-full"></div>
            </div>
        );
    }

    if (!summary) return null;

    if (compact) {
        return (
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-ink-secondary">Compliance</span>
                    <span className={`text-xs font-black uppercase px-2 py-1 rounded-full ${
                        summary.isCompliant ? 'bg-green-100 text-green-700' : 'bg-sand-500/10 text-sand-500'
                    }`}>
                        {summary.isCompliant ? 'Complete' : 'Incomplete'}
                    </span>
                </div>
                <div className="h-2 bg-surface-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-accent-500/100 rounded-full transition-all"
                        style={{ width: `${summary.percentage}%` }}
                    />
                </div>
                <p className="text-xs text-ink-tertiary mt-2">{summary.approved}/{summary.total} requirements met</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Card */}
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-black text-ink-primary">Vendor Compliance</h3>
                        <p className="text-sm text-ink-tertiary0">Complete all requirements to verify your business</p>
                    </div>
                    <div className={`text-center px-4 py-2 rounded-xl ${
                        summary.isCompliant ? 'bg-green-50 border border-green-200' : 'bg-sand-500/5 border border-sand-500/20'
                    }`}>
                        <p className="text-2xl font-black text-ink-primary">{summary.percentage}%</p>
                        <p className="text-xs text-ink-tertiary0">Complete</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-3 bg-surface-secondary rounded-full overflow-hidden mb-4">
                    <div 
                        className={`h-full rounded-full transition-all ${
                            summary.isCompliant ? 'bg-green-500' : 'bg-accent-500/100'
                        }`}
                        style={{ width: `${summary.percentage}%` }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-surface-secondary rounded-xl">
                        <p className="text-lg font-black text-green-600">{summary.approved}</p>
                        <p className="text-xs text-ink-tertiary">Approved</p>
                    </div>
                    <div className="p-3 bg-surface-secondary rounded-xl">
                        <p className="text-lg font-black text-sand-500">{summary.pending}</p>
                        <p className="text-xs text-ink-tertiary">Pending</p>
                    </div>
                    <div className="p-3 bg-surface-secondary rounded-xl">
                        <p className="text-lg font-black text-red-600">{summary.rejected}</p>
                        <p className="text-xs text-ink-tertiary">Rejected</p>
                    </div>
                    <div className="p-3 bg-surface-secondary rounded-xl">
                        <p className="text-lg font-black text-ink-secondary">{summary.notStarted}</p>
                        <p className="text-xs text-ink-tertiary">Not Started</p>
                    </div>
                </div>
            </div>

            {/* Requirements List */}
            <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
                <div className="p-4 bg-surface-secondary border-b border-border-primary">
                    <h3 className="font-black text-ink-secondary">Requirements</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-secondary">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                    item.status === 'approved' ? 'bg-green-100 text-green-600' :
                                    item.status === 'submitted' ? 'bg-sand-500/10 text-sand-500' :
                                    item.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                    'bg-surface-secondary text-ink-tertiary'
                                }`}>
                                    {getStatusIcon(item.status)}
                                </div>
                                <div>
                                    <p className="font-bold text-ink-secondary">
                                        {item.name}
                                        {item.is_required && <span className="text-red-500 ml-1">*</span>}
                                    </p>
                                    <p className="text-xs text-ink-tertiary">{item.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                                {item.status === 'pending' && (
                                    <Link 
                                        href={`/dashboard?tab=compliance&requirement=${item.requirement_id}`}
                                        className="px-4 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600"
                                    >
                                        Start
                                    </Link>
                                )}
                                {item.status === 'rejected' && (
                                    <button className="text-xs text-red-600 hover:underline">
                                        View Reason
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
