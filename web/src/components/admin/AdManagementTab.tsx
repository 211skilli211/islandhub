'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '@/lib/toast';
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
import { EmojiIcon } from '@/components/ui/EmojiIcon';
import MediaUploader from './MediaUploader';

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
    const [adFormImage, setAdFormImage] = useState('');
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
                <div className="w-20 h-10 rounded-lg overflow-hidden bg-surface-secondary border border-border-primary shadow-sm">
                    <img src={getImageUrl(ad.image_url)} className="w-full h-full object-cover" alt="" />
                </div>
            )
        },
        { header: 'Title', accessor: 'title', className: 'font-bold text-ink-primary' },
        { header: 'Space', accessor: 'space_name', className: 'text-[10px] font-black uppercase tracking-widest text-accent-400' },
        {
            header: 'Analytics',
            accessor: (ad) => (
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <EmojiIcon emoji="👁" size={16} className="text-ink-tertiary" />
                    <EmojiIcon emoji="🖱" size={16} className="text-[#a5b4fc]0" />
                    <EmojiIcon emoji="📈" size={16} className="text-emerald-400" />
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (ad) => (
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${ad.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-surface-secondary text-ink-tertiary'
                    }`}>
                    {ad.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { header: 'Link', accessor: (ad) => <a href={ad.target_url} target="_blank" className="text-ink-tertiary hover:text-accent-400 transition-colors"><ExternalLink size={14} /></a> }
    ];

    // Columns for Promotions Table
    const promoColumns: Column<PendingPromotion>[] = [
        {
            header: 'Vendor / Store',
            accessor: (p) => (
                <div>
                    <div className="font-bold text-ink-primary">{p.store_name}</div>
                    <div className="text-[10px] text-ink-tertiary font-medium">{p.vendor_email}</div>
                </div>
            )
        },
        { header: 'Offer', accessor: (p) => <span className="font-black text-[#e11d48]">{p.discount_percent}% OFF</span> },
        { header: 'Promo Code', accessor: (p) => <span className="font-mono text-[10px] bg-surface-secondary px-2 py-1 rounded">{p.promo_code || 'AUTOPLY'}</span> },
        { header: 'Title', accessor: 'title', className: 'italic font-medium text-ink-secondary' },
        { header: 'Submitted', accessor: (p) => <span className="text-xs text-ink-tertiary">{new Date(p.created_at).toLocaleDateString()}</span> }
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-ink-primary tracking-tight uppercase italic">Advertising Hub</h2>
                    <p className="text-ink-tertiary font-medium">Control site-wide visibility and approve merchant offers</p>
                </div>
                <div className="flex gap-2 p-1 bg-surface-secondary rounded-2xl border border-border-primary">
                    <button
                        onClick={() => setSubTab('site_ads')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'site_ads' ? 'bg-surface-elevated shadow-sm text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                            }`}
                    >
                        Site Advertisements
                    </button>
                    <button
                        onClick={() => setSubTab('promotions')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'promotions' ? 'bg-surface-elevated shadow-sm text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                            }`}
                    >
                        Vendor Promotions
                    </button>
                    <button
                        onClick={() => setSubTab('visual_manager')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'visual_manager' ? 'bg-surface-elevated shadow-sm text-ink-primary' : 'text-ink-tertiary hover:text-ink-secondary'
                            }`}
                    >
                        Visual Manager
                    </button>
                </div>
            </header>

            {subTab === 'site_ads' ? (
                <div className="space-y-8">
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-surface-elevated border border-border-primary rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-accent-500/10 text-accent-400 rounded-2xl"><Monitor size={24} /></div>
                                <h3 className="text-sm font-black text-ink-tertiary uppercase tracking-widest">Active Ad Spaces</h3>
                            </div>
                            <p className="text-4xl font-black text-ink-primary">{adSpaces.length}</p>
                        </div>
                        <div className="p-8 bg-surface-elevated border border-border-primary rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-[#14b8a6]/10 text-[#14b8a6] rounded-2xl"><BarChart2 size={24} /></div>
                                <h3 className="text-sm font-black text-ink-tertiary uppercase tracking-widest">Global Reach</h3>
                            </div>
                            <p className="text-4xl font-black text-ink-primary">24.5k</p>
                            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-2">↑ 12% This month</p>
                        </div>
                        <div className="p-8 bg-ink-950 rounded-[2.5rem] shadow-xl text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-surface-elevated/10 text-white rounded-2xl"><Plus size={24} /></div>
                                <h3 className="text-sm font-black text-white/50 uppercase tracking-widest">Quick Deploy</h3>
                            </div>
                            <button
                                onClick={() => { setIsAdModalOpen(true); setAdFormImage(''); }}
                                className="w-full py-3 bg-surface-elevated text-ink-900 dark:text-ink-50 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5"
                            >
                                Launch New Campaign
                            </button>
                        </div>
                    </div>

                    
                    <div className="bg-surface-elevated rounded-[3rem] border border-border-primary overflow-hidden">
                        <div className="p-8 bg-surface-secondary border-b border-border-primary flex items-center justify-between">
                            <h3 className="text-xl font-black text-ink-primary italic uppercase">Site Ads Management</h3>
                            <div className="flex gap-2">
                                <button className="p-2 bg-surface-elevated rounded-xl border border-border-primary text-ink-tertiary"><Filter size={18} /></button>
                                <button className="p-2 bg-surface-elevated rounded-xl border border-border-primary text-ink-tertiary"><Search size={18} /></button>
                            </div>
                        </div>
                        <AdminTable<Advertisement>
                            endpoint="/advertisements/admin/advertisements"
                            keyName="advertisements"
                            columns={adColumns}
                            rowActions={[
                                { label: 'Edit Asset', action: 'edit' },
                                { label: 'Toggle State', action: 'toggle' },
                                { label: 'Delete', action: 'delete', className: 'text-[#e11d48]' }
                            ]}
                            onRowAction={(action, item) => {
                                if (action === 'edit') { setSelectedAd(item); setAdFormImage(item.image_url || ''); setIsAdModalOpen(true); }
                                if (action === 'delete') { /* Handle delete */ }
                            }}
                        />
                    </div>
                </div>
            ) : subTab === 'promotions' ? (
                <div className="space-y-8">
                    
                    <div className="bg-surface-elevated rounded-[3rem] border border-border-primary overflow-hidden">
                        <div className="p-10 bg-[#e11d48]/5 border-b border-[#e11d48]/20 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-rose-900 italic uppercase">Pending Approval Queue</h3>
                                <p className="text-[#e11d48] text-xs font-medium mt-1">Review and verify vendor promotions before they go live</p>
                            </div>
                            <EmojiIcon emoji="⚖️" size={28} className="w-16 h-16 bg-surface-elevated rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-rose-100" />
                        </div>
                        <AdminTable<PendingPromotion>
                            endpoint="/advertisements/admin/promotions/pending"
                            keyName="promotions"
                            columns={promoColumns}
                            rowActions={[
                                { label: 'Approve & Deploy', action: 'approve', className: 'text-emerald-400' },
                                { label: 'Reject / Feedback', action: 'reject', className: 'text-[#e11d48]' }
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

            
            <AnimatePresence>
                {isAdModalOpen && (
                    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface-elevated w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-border-primary flex justify-between items-center bg-surface-secondary">
                                <div>
                                    <h3 className="text-2xl font-black text-ink-primary uppercase italic">Creative Campaign Deploy</h3>
                                    <p className="text-xs text-ink-tertiary font-bold uppercase tracking-widest">Global Site Visibility</p>
                                </div>
                                <button onClick={() => { setIsAdModalOpen(false); setSelectedAd(null); setAdFormImage(''); }} className="p-3 bg-surface-elevated border border-border-primary rounded-2xl hover:bg-surface-secondary transition-colors">
                                    <XCircle size={20} className="text-ink-tertiary" />
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
                                    setAdFormImage('');
                                } catch (e) {
                                    toast.error('Deployment failed');
                                }
                            }}>
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Campaign Title</label>
                                        <input
                                            name="title"
                                            defaultValue={selectedAd?.title}
                                            required
                                            className="w-full px-6 py-4 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                            placeholder="e.g. Summer Festival 2024"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Target Space</label>
                                        <select
                                            name="ad_space_id"
                                            defaultValue={selectedAd?.space_name}
                                            className="w-full px-6 py-4 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        >
                                            {adSpaces.map(s => <option key={s.space_id} value={s.space_id}>{s.display_name} ({s.location})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <MediaUploader
                                    value={adFormImage || ''}
                                    onChange={(url) => setAdFormImage(url)}
                                    accept="image"
                                    label="Creative Asset"
                                />
                                <input type="hidden" name="image_url" value={adFormImage || ''} />

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Destination URL</label>
                                    <input
                                        name="target_url"
                                        defaultValue={selectedAd?.target_url}
                                        required
                                        className="w-full px-6 py-4 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        placeholder="https://..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">Start Date</label>
                                        <input type="date" name="start_date" className="w-full px-6 py-4 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary">End Date</label>
                                        <input type="date" name="end_date" className="w-full px-6 py-4 bg-surface-secondary rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold" />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-ink-primary text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-black/10 hover:scale-[1.02] transition-all"
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
