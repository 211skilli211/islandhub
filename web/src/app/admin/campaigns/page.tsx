'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { AdminTable } from '@/components/admin/shared/AdminTable';
import CreateCampaignModal from '@/components/admin/CreateCampaignModal';

interface CampaignColumn {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
}

export default function AdminCampaignsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [showCreateCampaign, setShowCreateCampaign] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    const campaignColumns: CampaignColumn[] = [
        { key: 'id', label: 'ID', sortable: true },
        { key: 'title', label: 'Title', sortable: true },
        { key: 'type', label: 'Type', sortable: true },
        { key: 'status', label: 'Status', render: (val) => (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                val === 'active' ? 'bg-green-100 text-green-700' : 
                val === 'pending' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-700'
            }`}>
                {val || 'pending'}
            </span>
        )},
        { key: 'goal_amount', label: 'Goal', render: (val) => val ? `$${Number(val).toLocaleString()}` : '-' },
        { key: 'created_at', label: 'Created', sortable: true },
    ];

    const handleAction = async (action: string, campaignId: number) => {
        try {
            switch (action) {
                case 'verify':
                    await api.post(`/admin/campaigns/${campaignId}/verify`);
                    toast.success('Campaign verified');
                    setRefreshKey(k => k + 1);
                    break;
                case 'delete':
                    if (confirm('Delete this campaign?')) {
                        await api.delete(`/admin/campaigns/${campaignId}`);
                        toast.success('Campaign deleted');
                        setRefreshKey(k => k + 1);
                    }
                    break;
            }
        } catch (err) {
            toast.error('Action failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Modal */}
            {showCreateCampaign && (
                <CreateCampaignModal 
                    onClose={() => setShowCreateCampaign(false)} 
                    onSuccess={() => { setShowCreateCampaign(false); setRefreshKey(k => k + 1); }} 
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Campaigns</h2>
                    <p className="text-slate-500 dark:text-slate-400">Manage fundraising campaigns and events</p>
                </div>
                <button 
                    onClick={() => setShowCreateCampaign(true)} 
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                >
                    + New Campaign
                </button>
            </div>

            {/* Table */}
            <AdminTable<any>
                key={`campaigns-${refreshKey}`}
                endpoint="/admin/campaigns"
                keyName="campaigns"
                columns={campaignColumns}
                hoverType="media"
                rowActions={[
                    { label: 'Verify', action: 'verify' },
                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                ]}
                onRowAction={(action, id) => handleAction(action, id)}
            />
        </div>
    );
}