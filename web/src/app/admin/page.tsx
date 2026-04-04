'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import {
    getBgClass,
    getTextClass,
    getBorderClass,
    getCardBaseClasses,
    getButtonClasses,
    getLinkClasses,
    getShadowClass,
    cnTheme
} from '@/lib/theme-helpers';
import { useTheme } from '@/components/ThemeContext';
import api, { getImageUrl, BASE_URL } from '@/lib/api';
import AdminSettingsTab from '@/components/admin/AdminSettingsTab';
import OverviewTab from '@/components/admin/OverviewTab';
import EditListingModal from '@/components/admin/EditListingModal';
import CreateUserModal from '@/components/admin/CreateUserModal';
import CreateCampaignModal from '@/components/admin/CreateCampaignModal';
import AddAssetModal from '@/components/admin/AddAssetModal';
import EditUserModal from '@/components/admin/EditUserModal';
import EditStoreModal from '@/components/admin/EditStoreModal';
import CreateStoreModal from '@/components/admin/CreateStoreModal';
import SubscriptionsTab from '@/components/admin/SubscriptionsTab';
import RevenueTab from '@/components/admin/RevenueTab';
import BroadcastTab from '@/components/admin/BroadcastTab';
import HeroAssetTab from '@/components/admin/HeroAssetTab';
import BadgeSelector, { BadgeList } from '@/components/marketplace/BadgeSelector';
import { AdminTable, Column } from '@/components/admin/shared/AdminTable';
import toast, { Toaster } from 'react-hot-toast';
import DriversTab from '@/components/admin/DriversTab';
import LogisticsRatesTab from '@/components/admin/LogisticsRatesTab';
import OrdersTab from '@/components/admin/OrdersTab';
import AuditLogsTab from '@/components/admin/AuditLogsTab';
import AdManagementTab from '@/components/admin/AdManagementTab';
import InlineEdit from '@/components/admin/shared/InlineEdit';
import PayoutsTab from '@/components/admin/PayoutsTab';
import KybVerificationTab from '@/app/admin/kyb-verification/page';
import AgentCommandCenter from '@/components/admin/AgentCommandCenter';
import AssetLibrary from '@/components/admin/AssetLibrary';
import KYCReviewModal from '@/components/admin/KYCReviewModal';
import ComplianceAnalytics from '@/components/admin/ComplianceAnalytics';

// Interfaces for Data Types
interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    country: string;
    avatar_url?: string;
    profile_photo_url?: string;
    is_active: boolean;
    is_verified_driver: boolean;
    email_verified: boolean;
    created_at: string;
}

interface Listing {
    id: number;
    title: string;
    slug: string;
    owner_name?: string;
    creator_id?: number;
    type: string;
    category: string;
    price: string;
    status: string;
    is_promoted: boolean;
    image_url?: string;
    images?: string[];
    photos?: string[]; // Legacy support
    created_at: string;
}

interface Campaign {
    id: number;
    campaign_id: number;
    title: string;
    goal_amount: string;
    current_amount: string;
    status: string;
    verified: boolean;
    created_at: string;
}

interface Store {
    id: number;
    store_id: number;
    name: string;
    owner_name?: string;
    vendor_id?: number;
    category: string;
    category_type?: string;
    subscription_type: string;
    slug: string;
    status: string;
    logo_url?: string;
    created_at: string;
    admin_rating?: number;
    badges?: string[];
}

interface Media {
    id: number;
    filename: string;
    url: string;
    file_type: string;
    file_size: number;
    user_name?: string;
    created_at: string;
}

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

export default function AdminPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'orders' | 'campaigns' | 'stores' | 'subscriptions' | 'assets' | 'assets-hero' | 'kyc' | 'kyb-verification' | 'settings' | 'logs' | 'revenue' | 'broadcasts' | 'drivers' | 'logistics-rates' | 'ads' | 'payouts' | 'agent-center' | 'compliance-analytics'>('overview');

    // Modals
    const [showCreateUser, setShowCreateUser] = useState(false);
    const [showCreateStore, setShowCreateStore] = useState(false);
    const [showCreateCampaign, setShowCreateCampaign] = useState(false);
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingListing, setEditingListing] = useState<any>(null);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [settingsTab, setSettingsTab] = useState<'general' | 'vendor' | 'moderation' | 'export'>('general');
    const [roleChangeUser, setRoleChangeUser] = useState<User | null>(null);

    // Badges State
    const [badgeStore, setBadgeStore] = useState<Store | null>(null);
    const [badgeSelection, setBadgeSelection] = useState<string[]>([]);

    // Settings State
    const [settings, setSettings] = useState<any>({});
    const [savingSettings, setSavingSettings] = useState(false);

    // KYC
    const [kycList, setKycList] = useState<any[]>([]);
    const [selectedKYC, setSelectedKYC] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchGlobalData = async () => {
        try {
            const [statsRes, kycRes, settingsRes] = await Promise.allSettled([
                api.get('/admin/stats'),
                api.get('/kyc/admin/pending'),
                api.get('/admin/settings')
            ]);

            if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
            if (kycRes.status === 'fulfilled') setKycList(kycRes.value.data);

            if (settingsRes.status === 'fulfilled') {
                const sData = settingsRes.value.data?.settings || settingsRes.value.data;
                const sMap: any = {};
                if (Array.isArray(sData)) {
                    sData.forEach((s: any) => {
                        if (s?.setting_key) sMap[s.setting_key] = s.setting_value;
                    });
                } else if (typeof sData === 'object' && sData !== null) {
                    Object.assign(sMap, sData);
                }
                setSettings(sMap);
            }
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            console.error('Failed to fetch admin globals', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setIsMounted(true);
        if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super-admin')) {
            fetchGlobalData();
        }
    }, [isAuthenticated, user]);

    if (!isMounted) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 dark:border-slate-700 border-t-teal-600 dark:border-t-teal-400" />
            </div>
        );
    }

    if (!isAuthenticated) return null;
    if (user?.role !== 'admin' && user?.role !== 'super-admin') {
        return (
            <div className="min-h-screen pt-20 text-center dark:bg-slate-950">
                <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Denied</h1>
                <p className="mt-2">You do not have permission to view this page.</p>
                <button onClick={() => router.push('/dashboard')} className="mt-4 text-teal-600 dark:text-teal-400 underline">Go to Dashboard</button>
            </div>
        );
    }

    // --- Column Definitions ---
    const userColumns: Column<User>[] = [
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 dark:text-slate-400' },
        {
            header: 'Avatar',
            accessor: (u) => (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                    {u.avatar_url || u.profile_photo_url ? (
                        <img src={getImageUrl(u.avatar_url || u.profile_photo_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 bg-slate-50 dark:bg-slate-800 uppercase">{u.name?.charAt(0)}</div>
                    )}
                </div>
            )
        },
        {
            header: 'Name',
            sortKey: 'name',
            accessor: 'name',
            editable: true,
            renderView: (u) => (
                <Link href={`/users/${u.id}`} className="flex items-center gap-2 group" onClick={e => e.stopPropagation()}>
                    <div>
                        <div className="font-bold text-slate-900 dark:text-slate-50 group-hover:text-teal-600 transition-colors">{u.name}</div>
                        <div className="text-xs text-slate-400 dark:text-slate-400">{u.email}</div>
                    </div>
                </Link>
            ),
            onEdit: async (u, val) => {
                await api.patch(`/admin/users/${u.id}`, { name: val });
                toast.success('User name updated');
                fetchGlobalData();
            }
        },
        {
            header: 'Role',
            accessor: (u) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setRoleChangeUser(u); }}
                    className="relative z-10 uppercase text-[10px] font-black tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 hover:bg-teal-100 hover:text-teal-600 transition-colors flex items-center gap-1 group/role cursor-pointer"
                >
                    {u.role}
                    <svg className="w-2 h-2 opacity-0 group-hover/role:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
            )
        },
        { header: 'Country', accessor: 'country' },
        {
            header: 'Status', accessor: (u) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.is_active ? 'Active' : 'Suspended'}
                </span>
            )
        },
        {
            header: 'Verified', accessor: (u) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.email_verified ? 'bg-teal-100 text-teal-700' : 'bg-amber-100 text-amber-700'}`}>
                    {u.email_verified ? '✓' : '✕'}
                </span>
            )
        },
        { header: 'Created', sortKey: 'created_at', accessor: (u) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(u.created_at).toLocaleDateString()}</span> }
    ];

    const listingColumns: Column<Listing>[] = [
        {
            header: 'Preview',
            accessor: (l) => {
                const img = l.image_url || l.images?.[0] || l.photos?.[0];
                // Clean up stringified array if needed (Postgres oddity sometimes)
                const finalImg = (typeof img === 'string' && img.startsWith('["'))
                    ? JSON.parse(img)[0]
                    : img;

                return (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                        {finalImg ? (
                            <img src={getImageUrl(finalImg)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 bg-slate-50 dark:bg-slate-800 uppercase">No IMG</div>
                        )}
                    </div>
                );
            }
        },
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 dark:text-slate-400' },
        {
            header: 'Title',
            sortKey: 'title',
            accessor: 'title',
            editable: true,
            renderView: (l) => <Link href={`/listings/${l.slug || l.id}`} className="font-bold text-slate-800 dark:text-slate-100 hover:text-teal-600 transition-colors block leading-tight" onClick={e => e.stopPropagation()}>{l.title}</Link>,
            onEdit: async (l, val) => {
                await api.put(`/listings/${l.id}`, { title: val });
                toast.success('Title updated');
                fetchGlobalData();
            }
        },
        {
            header: 'Owner',
            accessor: (l) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{l.owner_name || 'No Owner'}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 font-mono">UID: {l.creator_id}</span>
                </div>
            )
        },
        {
            header: 'Slug',
            accessor: (l) => (
                <InlineEdit
                    value={l.slug}
                    onSave={async (newVal) => {
                        await api.put(`/listings/${l.id}`, { slug: newVal });
                        toast.success('Listing slug updated');
                    }}
                    className="text-[10px] font-mono text-slate-400 dark:text-slate-400 lowercase"
                />
            )
        },
        { header: 'Type', accessor: 'type', className: 'uppercase text-[10px] font-black mr-2' },
        { header: 'Category', accessor: 'category' },
        {
            header: 'Price',
            accessor: 'price',
            editable: true,
            renderView: (l) => l.price ? `$${parseFloat(l.price).toLocaleString()}` : '-',
            onEdit: async (l, val) => {
                // Remove non-numeric chars except dot
                const cleanVal = val.replace(/[^0-9.]/g, '');
                await api.put(`/listings/${l.id}`, { price: parseFloat(cleanVal) });
                toast.success('Price updated');
                fetchGlobalData();
            }
        },
        { header: 'Status', accessor: 'status' },
        { header: 'Created', sortKey: 'created_at', accessor: (l) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(l.created_at).toLocaleDateString()}</span> }
    ];

    const campaignColumns: Column<Campaign>[] = [
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 dark:text-slate-400' },
        {
            header: 'Title',
            sortKey: 'title',
            accessor: 'title',
            editable: true,
            renderView: (c) => <Link href={`/campaigns/${c.id}`} className="font-bold text-slate-800 dark:text-slate-100 hover:text-indigo-600 transition-colors" onClick={e => e.stopPropagation()}>{c.title}</Link>,
            onEdit: async (c, val) => {
                await api.patch(`/admin/campaigns/${c.id}`, { title: val });
                toast.success('Title updated');
                fetchGlobalData();
            }
        },
        {
            header: 'Goal',
            accessor: 'goal_amount',
            editable: true,
            renderView: (c) => <span className="font-mono">${parseInt(c.goal_amount).toLocaleString()}</span>,
            onEdit: async (c, val) => {
                await api.patch(`/admin/campaigns/${c.id}`, { goal_amount: parseFloat(val) });
                toast.success('Goal updated');
                fetchGlobalData();
            }
        },
        { header: 'Raised', accessor: (c) => <span className="font-mono text-green-600">${parseInt(c.current_amount || '0').toLocaleString()}</span> },
        { header: 'Verified', accessor: (c) => c.verified ? '✅' : '⏳' },
        { header: 'Created', sortKey: 'created_at', accessor: (c) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span> }
    ];

    const storeColumns: Column<Store>[] = [
        {
            header: 'Logo',
            accessor: (s) => (
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm">
                    {s.logo_url ? (
                        <img src={getImageUrl(s.logo_url)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-300 bg-slate-50 dark:bg-slate-800">{s.name?.charAt(0)}</div>
                    )}
                </div>
            )
        },
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 dark:text-slate-400' },
        { header: 'Type', accessor: 'category_type', className: 'uppercase text-[10px] font-black text-teal-600' },
        {
            header: 'Name',
            sortKey: 'name',
            accessor: 'name',
            editable: true,
            renderView: (s) => (
                <div>
                    <Link href={`/store/${s.slug}`} className="font-bold text-slate-800 dark:text-slate-100 hover:text-teal-600 transition-colors block leading-tight" onClick={e => e.stopPropagation()}>{s.name}</Link>
                </div>
            ),
            onEdit: async (s, val) => {
                await api.put(`/stores/${s.store_id}`, { name: val });
                toast.success('Store name updated');
                fetchGlobalData();
            }
        },
        {
            header: 'Owner',
            accessor: (s) => (
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{s.owner_name || 'No Owner'}</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 font-mono">UID: {s.vendor_id}</span>
                </div>
            )
        },
        {
            header: 'Slug',
            accessor: (s) => (
                <InlineEdit
                    value={s.slug}
                    onSave={async (newVal) => {
                        await api.put(`/stores/${s.store_id}`, { slug: newVal });
                        toast.success('Slug updated');
                    }}
                    className="text-[10px] font-mono text-slate-400 dark:text-slate-400 lowercase"
                />
            )
        },
        { header: 'Status', accessor: 'status' },
        { header: 'Created', sortKey: 'created_at', accessor: (s) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(s.created_at).toLocaleDateString()}</span> }
    ];

    const mediaColumns: Column<Media>[] = [
        {
            header: 'Preview', accessor: (m) => (
                <a href={getImageUrl(m.url)} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden flex items-center justify-center">
                    {m.file_type?.startsWith('image/') ? (
                        <img src={getImageUrl(m.url)} alt={m.filename} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-400">FILE</span>
                    )}
                </a>
            )
        },
        { header: 'Filename', accessor: (m) => <div className="max-w-[200px] truncate font-medium text-slate-800 dark:text-slate-100">{m.filename}</div> },
        { header: 'Size', accessor: (m) => <span className="text-xs text-slate-400 dark:text-slate-400">{(m.file_size / 1024).toFixed(1)} KB</span> },
        { header: 'Date', accessor: (m) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(m.created_at).toLocaleDateString()}</span> }
    ];

    const auditColumns: Column<AuditLog>[] = [
        { header: 'ID', accessor: 'id', className: 'w-16 text-slate-400 dark:text-slate-400' },
        { header: 'Action', accessor: (l) => <span className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">{l.action.replace(/_/g, ' ')}</span> },
        { header: 'Admin', accessor: (l) => <span className="font-bold">{l.admin_name || 'System'}</span> },
        { header: 'Ref ID', accessor: (l) => <span className="text-slate-400 dark:text-slate-400 font-medium">#{l.record_id || 'N/A'}</span> },
        { header: 'Time', accessor: (l) => <span className="text-xs text-slate-400 dark:text-slate-400">{new Date(l.created_at).toLocaleTimeString()}</span> }
    ];

    const handleAction = async (tab: string, action: string, item: any) => {
        try {
            if (tab === 'users') {
                if (action === 'toggle_status') await api.patch(`/admin/users/${item.id}`, { is_active: !item.is_active });
                if (action === 'verify') await api.patch(`/admin/users/${item.id}`, { email_verified: true });
                if (action === 'unverify') await api.patch(`/admin/users/${item.id}`, { email_verified: false });
                if (action === 'verify_driver') await api.patch(`/admin/users/${item.id}`, { is_verified_driver: true });
                if (action === 'unverify_driver') await api.patch(`/admin/users/${item.id}`, { is_verified_driver: false });
                if (action === 'delete') {
                    if (confirm(`⚠️ Are you sure you want to permanently DELETE user "${item.name}"?`)) {
                        const check = prompt(`To confirm, please type the user's name: ${item.name}`);
                        if (check === item.name) {
                            await api.delete(`/admin/users/${item.id}`);
                        } else {
                            toast.error('Name mismatch. Deletion cancelled.');
                            return;
                        }
                    } else {
                        return;
                    }
                }
                if (action === 'edit_profile') setEditingUser(item);
            } else if (tab === 'listings' || tab === 'campaigns') {
                if (action === 'edit') setEditingListing(item);
                if (action === 'delete') { if (confirm('Delete listing?')) await api.delete(`/listings/${item.id}`); }
                if (action === 'verify' && tab === 'campaigns') await api.patch(`/campaigns/${item.id}/verify`);
            } else if (tab === 'stores') {
                if (action === 'edit') setEditingStore(item);
                if (action === 'approve') await api.put(`/stores/${item.id}`, { status: 'active' });
                if (action === 'view_kyc') {
                    // Fetch KYC docs and show in alert or modal
                    const res = await api.get(`/kyc/vendor/${item.vendor_id}`);
                    if (res.data && res.data.documents) {
                        const docs = res.data.documents;
                        const docList = Object.entries(docs).map(([k, v]) => `${k}: ${v}`).join('\n');
                        alert(`KYC Documents for ${item.name}:\n\n${docList || 'No documents found'}`);
                    } else {
                        alert('No KYC documents found for this vendor');
                    }
                }
                if (action === 'suspend') await api.put(`/stores/${item.id}`, { status: 'suspended' });
                if (action === 'delete') { if (confirm('Delete store?')) await api.delete(`/stores/${item.id}`); }
                if (action === 'badges') { setBadgeStore(item); setBadgeSelection(item.badges || []); }
                if (action === 'toggle_status') await api.patch(`/stores/${item.id}/status`, { status: item.status === 'active' ? 'suspended' : 'active' });
            } else if (tab === 'assets') {
                if (action === 'delete') { if (confirm('Delete file?')) await api.delete(`/uploads/${item.filename}`); }
                if (action === 'regenerate') await api.post(`/admin/assets/regenerate`, { filename: item.filename });
            }
            toast.success('Action successful');
            fetchGlobalData();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const updateRole = async (newRole: string) => {
        if (!roleChangeUser) return;
        try {
            await api.patch(`/admin/users/${roleChangeUser.id}`, { role: newRole });
            toast.success('Role updated successfully');
            setRoleChangeUser(null);
            fetchGlobalData();
        } catch (error: any) {
            toast.error('Failed to update role');
        }
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const formatted = Object.entries(settings).map(([key, val]) => ({
                setting_key: key,
                setting_value: String(val)
            }));
            await api.put('/admin/settings', { settings: formatted });
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleExport = (type: string) => {
        window.open(`${BASE_URL}/admin/export/${type}`, '_blank');
        toast.success(`Exporting ${type}...`);
    };

    const handleKycAction = async (id: number, action: 'approve' | 'reject', reason?: string) => {
        try {
            if (action === 'reject' && reason) {
                await api.post(`/kyc/admin/${id}/reject`, { reason });
            } else {
                await api.post(`/kyc/admin/${id}/${action}`);
            }
            toast.success(`KYC ${action}d`);
            fetchGlobalData();
        } catch (error) {
            toast.error('KYC action failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-800 py-8 px-4 sm:px-6 lg:px-8">
            <Toaster position="bottom-right" />

            {/* Modals */}
            {roleChangeUser && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Change Role</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Update role for {roleChangeUser.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {['admin', 'vendor', 'driver', 'rider', 'moderator', 'buyer'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => updateRole(role)}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${roleChangeUser.role === role ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 dark:border-slate-700'}`}
                                >
                                    <span className="font-black uppercase text-xs tracking-widest block">{role}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setRoleChangeUser(null)} className="w-full py-4 text-slate-400 dark:text-slate-400 font-black uppercase text-xs tracking-widest">Cancel</button>
                    </div>
                </div>
            )}

            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSuccess={fetchGlobalData} />}
            {editingListing && <EditListingModal listing={editingListing} onClose={() => setEditingListing(null)} onSuccess={fetchGlobalData} />}
            {editingStore && <EditStoreModal store={editingStore} isOpen={!!editingStore} onClose={() => setEditingStore(null)} onSuccess={fetchGlobalData} />}
            {showCreateStore && <CreateStoreModal isOpen={showCreateStore} onClose={() => setShowCreateStore(false)} onSuccess={fetchGlobalData} />}
            {showCreateUser && <CreateUserModal onClose={() => setShowCreateUser(false)} onSuccess={fetchGlobalData} />}
            {showCreateCampaign && <CreateCampaignModal onClose={() => setShowCreateCampaign(false)} onSuccess={fetchGlobalData} />}
            {showAddAsset && <AddAssetModal onClose={() => setShowAddAsset(false)} onSuccess={fetchGlobalData} />}

            {selectedKYC && (
                <KYCReviewModal 
                    submission={selectedKYC} 
                    onClose={() => setSelectedKYC(null)} 
                    onAction={handleKycAction}
                />
            )}

            {badgeStore && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg">
                        <BadgeSelector selectedBadges={badgeSelection} onChange={setBadgeSelection} />
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setBadgeStore(null)} className="flex-1 py-4 text-slate-400 dark:text-slate-400">Cancel</button>
                            <button
                                onClick={async () => {
                                    await api.put(`/stores/${badgeStore.id}`, { badges: badgeSelection });
                                    toast.success('Badges updated');
                                    setBadgeStore(null);
                                    fetchGlobalData();
                                }}
                                className="flex-1 py-4 bg-teal-600 text-white rounded-xl"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50 tracking-tight">Marketplace Admin</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Control center for all platform entities</p>
                    </div>
                    {/* Quick Creation Panel for Admin */}
                    <div className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 dark:border-slate-600 shadow-sm">
                        <button onClick={() => setShowCreateUser(true)} className="p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-all" title="Add User">👤+</button>
                        <button onClick={() => setShowCreateStore(true)} className="p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-all" title="Create Store">🏪+</button>
                        <button onClick={() => setShowCreateCampaign(true)} className="p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-all" title="New Campaign">📣+</button>
                        <button onClick={() => router.push('/create')} className="p-2 hover:bg-slate-50 dark:bg-slate-800 rounded-xl transition-all" title="Add Listing">📦+</button>
                    </div>
                </header>

                <div className="flex overflow-x-auto mb-8 border-b border-slate-200 dark:border-slate-600 bg-white rounded-t-2xl px-2 gap-1 scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Overview ✨' },
                        { id: 'users', label: 'Users' },
                        { id: 'listings', label: 'Listings' },
                        { id: 'orders', label: 'Orders 📦' },
                        { id: 'campaigns', label: 'Campaigns' },
                        { id: 'stores', label: 'Stores' },
                        { id: 'subscriptions', label: 'Subscriptions 🏷️' },
                        { id: 'revenue', label: 'Revenue 📊' },
                        { id: 'payouts', label: 'Payouts 💸' },
                        { id: 'drivers', label: 'Drivers 🚗' },
                        { id: 'broadcasts', label: 'Broadcasts 📢' },
                        { id: 'logistics-rates', label: 'Logistics Rates 💵' },
                        { id: 'assets-hero', label: 'Hero Assets 🎬' },
                        { id: 'assets', label: 'Media Lib 📂' },
                        { id: 'kyc', label: `KYC ${kycList.length > 0 ? `(${kycList.length})` : ''}` },
                        { id: 'kyb-verification', label: 'KYB Verification 🔒' },
                        { id: 'compliance-analytics', label: 'Compliance 📈' },
                        { id: 'ads', label: 'Advertisements 📺' },
                        { id: 'agent-center', label: 'Agent Center 🤖' },
                        { id: 'logs', label: 'Audit Logs 📜' },
                        { id: 'settings', label: 'Settings ⚙️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 font-black uppercase tracking-widest text-[11px] border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'border-teal-500 text-teal-600'
                                : 'border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {(() => {
                            switch (activeTab) {
                                case 'overview':
                                    return stats ? (
                                        <OverviewTab stats={stats} onNavigate={setActiveTab} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center p-20 text-slate-400 dark:text-slate-400 animate-pulse">
                                            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mb-4"></div>
                                            <p className="font-bold uppercase tracking-widest text-xs">Loading Analytics...</p>
                                        </div>
                                    );
                                case 'revenue': return <RevenueTab />;
                                case 'payouts': return <PayoutsTab />;
                                case 'drivers': return <DriversTab />;
                                case 'broadcasts': return <BroadcastTab />;
                                case 'logistics-rates': return <LogisticsRatesTab />;
                                case 'orders': return <OrdersTab />;
                                case 'users':
                                    return (
                                        <div>
                                            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">User Accounts</h2>
                                                <div className="flex flex-wrap gap-3">
                                                    <select 
                                                        onChange={(e) => {
                                                            const url = new URL(window.location.href);
                                                            if (e.target.value) url.searchParams.set('role', e.target.value);
                                                            else url.searchParams.delete('role');
                                                            // Trigger refresh - in a real impl this would be state
                                                            }}
                                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                                                    >
                                                        <option value="">All Roles</option>
                                                        <option value="buyer">Buyer</option>
                                                        <option value="vendor">Vendor</option>
                                                        <option value="driver">Driver</option>
                                                        <option value="moderator">Moderator</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <select 
                                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold"
                                                    >
                                                        <option value="">All Status</option>
                                                        <option value="active">Active</option>
                                                        <option value="suspended">Suspended</option>
                                                    </select>
                                                    <button onClick={() => setShowCreateUser(true)} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl">+ New User</button>
                                                </div>
                                            </div>
                                            <AdminTable<User>
                                                endpoint="/admin/users"
                                                keyName="users"
                                                columns={userColumns}
                                                searchable={true}
                                                searchPlaceholder="Search by name or email..."
                                                hoverType="user"
                                                bulkActions={{
                                                    activate: async (ids) => {
                                                        await Promise.all(ids.map(id => api.patch(`/admin/users/${id}`, { is_active: true })));
                                                    },
                                                    deactivate: async (ids) => {
                                                        await Promise.all(ids.map(id => api.patch(`/admin/users/${id}`, { is_active: false })));
                                                    },
                                                    delete: async (ids) => {
                                                        if (confirm(`⚠️ Delete ${ids.length} users? This cannot be undone.`)) {
                                                            await Promise.all(ids.map(id => api.delete(`/admin/users/${id}`)));
                                                        }
                                                    }
                                                }}
                                                rowActions={[
                                                    { label: 'Edit Profile', action: 'edit_profile' },
                                                    { label: 'Verify Email', action: 'verify', condition: (u) => !u.email_verified },
                                                    { label: 'Unverify Email', action: 'unverify', condition: (u) => u.email_verified },
                                                    { label: 'Verify Driver', action: 'verify_driver', condition: (u) => (u.role?.startsWith('driver') || u.role === 'rider') && !u.is_verified_driver },
                                                    { label: 'Unverify', action: 'unverify_driver', condition: (u) => (u.role?.startsWith('driver') || u.role === 'rider') && u.is_verified_driver },
                                                    { label: 'Toggle Status', action: 'toggle_status' },
                                                    { label: 'Delete User', action: 'delete', className: 'text-red-500' }
                                                ]}
                                                onRowAction={(a, i) => handleAction('users', a, i)}
                                            />
                                        </div>
                                    );
                                case 'listings':
                                    return (
                                        <div>
                                            <div className="mb-4 flex justify-between items-center">
                                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Global Listings</h2>
                                                <button onClick={() => router.push('/create')} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl">+ Add Listing</button>
                                            </div>
                                            <AdminTable<Listing>
                                                endpoint="/listings"
                                                keyName="listings"
                                                columns={listingColumns}
                                                hoverType="listing"
                                                bulkActions={{
                                                    activate: async (ids) => {
                                                        await Promise.all(ids.map(id => api.patch(`/listings/${id}`, { status: 'active' })));
                                                    },
                                                    deactivate: async (ids) => {
                                                        await Promise.all(ids.map(id => api.patch(`/listings/${id}`, { status: 'inactive' })));
                                                    },
                                                    delete: async (ids) => {
                                                        if (confirm(`⚠️ Delete ${ids.length} listings?`)) {
                                                            await Promise.all(ids.map(id => api.delete(`/listings/${id}`)));
                                                        }
                                                    },
                                                    moderate: async (ids) => {
                                                        await Promise.all(ids.map(id => api.post(`/moderation/listing/${id}/moderate`)));
                                                    }
                                                }}
                                                rowActions={[
                                                    { label: 'Edit Listing', action: 'edit' },
                                                    { label: 'Promote', action: 'promote' },
                                                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                                                ]}
                                                onRowAction={(a, i) => handleAction('listings', a, i)}
                                            />
                                        </div>
                                    );
                                case 'campaigns':
                                    return (
                                        <div>
                                            <div className="mb-4 flex justify-between items-center">
                                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Campaigns</h2>
                                                <button onClick={() => setShowCreateCampaign(true)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl">+ New Campaign</button>
                                            </div>
                                            <AdminTable<Campaign>
                                                endpoint="/admin/campaigns"
                                                keyName="campaigns"
                                                columns={campaignColumns}
                                                hoverType="media"
                                                rowActions={[
                                                    { label: 'Edit', action: 'edit' },
                                                    { label: 'Verify', action: 'verify' },
                                                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                                                ]}
                                                onRowAction={(a, i) => handleAction('campaigns', a, i)}
                                            />
                                        </div>
                                    );
                                case 'stores':
                                    return (
                                        <div>
                                            <div className="mb-4 flex justify-between items-center">
                                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Vendor Stores</h2>
                                                <button onClick={() => setShowCreateStore(true)} className="px-5 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl">+ New Store</button>
                                            </div>
                                            <AdminTable<Store>
                                                key={`stores-${refreshKey}`}
                                                endpoint="/admin/stores"
                                                keyName="stores"
                                                columns={storeColumns}
                                                hoverType="store"
                                                rowActions={[
                                                    { label: 'Edit', action: 'edit' },
                                                    { label: 'Badges', action: 'badges' },
                                                    { label: 'Status', action: 'toggle_status' },
                                                    { label: 'Delete', action: 'delete', className: 'text-red-500' }
                                                ]}
                                                onRowAction={(a, i) => handleAction('stores', a, i)}
                                            />
                                        </div>
                                    );
                                case 'subscriptions': return <SubscriptionsTab />;
                                case 'assets':
                                    return <AssetLibrary />;
                                case 'assets-hero': return <HeroAssetTab />;
                                case 'kyc':
                                    return (
                                        <div>
                                            <div className="mb-6">
                                                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">KYC Requests</h2>
                                                <p className="text-sm text-slate-500">{kycList.length} pending</p>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {kycList.map((kyc) => (
                                                    <div key={kyc.kyc_id} className="bg-white p-6 rounded-4xl border border-slate-100 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                                                        onClick={() => setSelectedKYC(kyc)}
                                                    >
                                                        <h3 className="font-bold text-slate-900 dark:text-slate-50">{kyc.business_name || kyc.owner_name}</h3>
                                                        <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">{kyc.email}</p>
                                                        <div className="flex gap-2 mt-4">
                                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending Review</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {kycList.length === 0 && <p className="col-span-full text-center text-slate-400 dark:text-slate-400">No pending KYC</p>}
                                            </div>
                                        </div>
                                    );
                                case 'kyb-verification':
                                    return <KybVerificationTab />;
                                case 'logs':
                                    return <AuditLogsTab />;
                                case 'settings':
                                    return (
                                        <AdminSettingsTab
                                            settings={settings}
                                            setSettings={setSettings}
                                            saveSettings={saveSettings}
                                            savingSettings={savingSettings}
                                            settingsTab={settingsTab}
                                            setSettingsTab={setSettingsTab}
                                            handleExport={handleExport}
                                        />
                                    );
                                case 'ads': return <AdManagementTab />;
                                case 'agent-center': return <AgentCommandCenter />;
                                case 'compliance-analytics': return <ComplianceAnalytics />;
                                default: return <div className="p-20 text-center text-slate-400 dark:text-slate-400">Select a tab</div>;
                            }
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
