'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    Plus,
    Monitor,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    ExternalLink,
    Edit2,
    Trash2,
    Layout,
    Clock,
    Tag,
    BarChart2,
    Settings
} from 'lucide-react';
import { AdminTable, Column } from './shared/AdminTable';
import AdVisualManager from './AdVisualManager';

interface AdSpace {
    space_id: number;
    name: string;
    display_name: string;
    location: string;
    dimensions: string;
}

interface Advertisement {
    ad_id: number;
    title: string;
    target_url: string;
    image_url: string;
    status: 'active' | 'scheduled' | 'expired' | 'inactive' | 'draft';
    is_active: boolean;
    space_name: string;
    impressions: number;
    clicks: number;
}

interface PendingPromotion {
    promo_id: number;
    title: string;
    subtitle: string;
    description: string;
    discount_percent: number;
    promo_code: string;
    store_name: string;
    vendor_email: string;
    created_at: string;
}

export default function AdManagementTab() {
    const [subTab, setSubTab] = useState<'site_ads' | 'promotions' | 'visual_manager'>('site_ads');
    const [adSpaces, setAdSpaces] = useState<AdSpace[]>([]);
    const [isAdModalOpen, setIsAdModalOpen] = useState(false);
    const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            // Summary stats for the landing page
            const res = await api.get('/admin/stats');
            // In a real scenario we'd have a specific ads analytics endpoint
            // setStats(res.data.ad_stats);
        } catch (e) { }
    };

    useEffect(() => {
        const fetchSpaces = async () => {
            try {
                const res = await api.get('/advertisements/spaces');
                setAdSpaces(res.data);
            } catch (error) {
                toast.error('Failed to load ad spaces');
            }
        };
        fetchSpaces();
        fetchAnalytics();
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleApprovePromo = async (id: number) => {
        try {
            await api.patch(`/advertisements/admin/promotions/${id}/approve`);
            toast.success('Promotion approved! It is now live on the store page.');
            // Table will refresh via AdminTable's internal state mechanism if we trigger a re-render
        } catch (e) {
            toast.error('Approval failed');
        }
    };

    const handleRejectPromo = async (id: number) => {
        const reason = prompt('Reject this promotion? Please provide a reason:');
        if (reason === null) return; // User cancelled prompt

        try {
            await api.patch(`/advertisements/admin/promotions/${id}/reject`, { rejection_reason: reason || 'Does not meet site standards' });
            toast.success('Promotion rejected');
        } catch (e) {
            toast.error('Rejection failed');
        }
    };

    // Columns for Ad Table
    const adColumns: Column<Advertisement>[] = [
        {
            header: 'Preview',
            accessor: (ad) => (
                <div className="w-20 h-10 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img src={getImageUrl(ad.image_url)} className="w-full h-full object-cover" alt="" />
                </div>
            )
        },
        { header: 'Title', accessor: 'title', className: 'font-bold text-slate-900' },
        { header: 'Space', accessor: 'space_name', className: 'text-[10px] font-black uppercase tracking-widest text-teal-600' },
        {
            header: 'Analytics',
            accessor: (ad) => (
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="text-slate-400">👁 {ad.impressions || 0}</div>
                    <div className="text-indigo-500">🖱 {ad.clicks || 0}</div>
                    <div className="text-emerald-500">📈 {ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : 0}%</div>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (ad) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${ad.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { header: 'Link', accessor: (ad) => <a href={ad.target_url} target="_blank" className="text-slate-400 hover:text-teal-600 transition-colors"><ExternalLink size={14} /></a> }
    ];

    // Columns for Promotions Table
    const promoColumns: Column<PendingPromotion>[] = [
        {
            header: 'Vendor / Store',
            accessor: (p) => (
                <div>
                    <div className="font-bold text-slate-900">{p.store_name}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{p.vendor_email}</div>
                </div>
            )
        },
        { header: 'Offer', accessor: (p) => <span className="font-black text-rose-500">{p.discount_percent}% OFF</span> },
        { header: 'Promo Code', accessor: (p) => <span className="font-mono text-[10px] bg-slate-100 px-2 py-1 rounded">{p.promo_code || 'AUTOPLY'}</span> },
        { header: 'Title', accessor: 'title', className: 'italic font-medium text-slate-700' },
        { header: 'Submitted', accessor: (p) => <span className="text-xs text-slate-400">{new Date(p.created_at).toLocaleDateString()}</span> }
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">Advertising Hub</h2>
                    <p className="text-slate-500 font-medium">Control site-wide visibility and approve merchant offers</p>
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => setSubTab('site_ads')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'site_ads' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Site Advertisements
                    </button>
                    <button
                        onClick={() => setSubTab('promotions')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'promotions' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Vendor Promotions
                    </button>
                    <button
                        onClick={() => setSubTab('visual_manager')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'visual_manager' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        Visual Manager
                    </button>
                </div>
            </header>

            {subTab === 'site_ads' ? (
                <div className="space-y-8">
                    {/* Activity Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl"><Monitor size={24} /></div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Ad Spaces</h3>
                            </div>
                            <p className="text-4xl font-black text-slate-900">{adSpaces.length}</p>
                        </div>
                        <div className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><BarChart2 size={24} /></div>
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Global Reach</h3>
                            </div>
                            <p className="text-4xl font-black text-slate-900">24.5k</p>
                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2">↑ 12% This month</p>
                        </div>
                        <div className="p-8 bg-slate-950 rounded-[2.5rem] shadow-xl text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/10 text-white rounded-2xl"><Plus size={24} /></div>
                                <h3 className="text-sm font-black text-white/50 uppercase tracking-widest">Quick Deploy</h3>
                            </div>
                            <button
                                onClick={() => setIsAdModalOpen(true)}
                                className="w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                Launch New Campaign
                            </button>
                        </div>
                    </div>

                    {/* Spaces Breakdown */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden">
                        <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 italic uppercase">Site Ads Management</h3>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400"><Filter size={18} /></button>
                                <button className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400"><Search size={18} /></button>
                            </div>
                        </div>
                        <AdminTable<Advertisement>
                            endpoint="/advertisements/admin/advertisements"
                            keyName="advertisements"
                            columns={adColumns}
                            rowActions={[
                                { label: 'Edit Asset', action: 'edit' },
                                { label: 'Toggle State', action: 'toggle' },
                                { label: 'Delete', action: 'delete', className: 'text-rose-500' }
                            ]}
                            onRowAction={(action, item) => {
                                if (action === 'edit') { setSelectedAd(item); setIsAdModalOpen(true); }
                                if (action === 'delete') { /* Handle delete */ }
                            }}
                        />
                    </div>
                </div>
            ) : subTab === 'promotions' ? (
                <div className="space-y-8">
                    {/* Pending Promotions interface */}
                    <div className="bg-white rounded-[3rem] border border-slate-100 overflow-hidden">
                        <div className="p-10 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-rose-900 italic uppercase">Pending Approval Queue</h3>
                                <p className="text-rose-600 text-xs font-medium mt-1">Review and verify vendor promotions before they go live</p>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-rose-100">⚖️</div>
                        </div>
                        <AdminTable<PendingPromotion>
                            endpoint="/advertisements/admin/promotions/pending"
                            keyName="promotions"
                            columns={promoColumns}
                            rowActions={[
                                { label: 'Approve & Deploy', action: 'approve', className: 'text-emerald-600' },
                                { label: 'Reject / Feedback', action: 'reject', className: 'text-rose-600' }
                            ]}
                            onRowAction={(action, item) => {
                                if (action === 'approve') handleApprovePromo(item.promo_id);
                                if (action === 'reject') handleRejectPromo(item.promo_id);
                            }}
                        />
                    </div>
                </div>
            ) : (
                <AdVisualManager />
            )}

            {/* Campaign Launch Modal */}
            <AnimatePresence>
                {isAdModalOpen && (
                    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic">Creative Campaign Deploy</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Global Site Visibility</p>
                                </div>
                                <button onClick={() => { setIsAdModalOpen(false); setSelectedAd(null); }} className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <XCircle size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <form className="p-10 overflow-y-auto space-y-8" onSubmit={async (e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                const data = Object.fromEntries(formData.entries());
                                try {
                                    if (selectedAd) {
                                        await api.patch(`/advertisements/admin/advertisements/${selectedAd.ad_id}`, data);
                                        toast.success('Campaign updated!');
                                    } else {
                                        await api.post('/advertisements/admin/advertisements', {
                                            ...data,
                                            advertiser_type: 'platform',
                                            status: 'active',
                                            is_active: true
                                        });
                                        toast.success('New campaign launched!');
                                    }
                                    setIsAdModalOpen(false);
                                    setSelectedAd(null);
                                } catch (e) {
                                    toast.error('Deployment failed');
                                }
                            }}>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Campaign Title</label>
                                        <input
                                            name="title"
                                            defaultValue={selectedAd?.title}
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                            placeholder="e.g. Summer Festival 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Space</label>
                                        <select
                                            name="ad_space_id"
                                            defaultValue={selectedAd?.space_name}
                                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        >
                                            {adSpaces.map(s => <option key={s.space_id} value={s.space_id}>{s.display_name} ({s.location})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Creative Asset URL</label>
                                    <input
                                        name="image_url"
                                        defaultValue={selectedAd?.image_url}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[9px] text-slate-400 font-medium">Recommended: High Resolution PNG or WebP</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Destination URL</label>
                                    <input
                                        name="target_url"
                                        defaultValue={selectedAd?.target_url}
                                        required
                                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                                        <input type="date" name="start_date" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                                        <input type="date" name="end_date" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-slate-200 hover:scale-[1.02] transition-all"
                                >
                                    {selectedAd ? 'Update Campaign' : 'Deploy Campaign Now'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
