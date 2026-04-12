'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Plus, Tag, Clock, CheckCircle, XCircle, Trash2, Edit2, Info } from 'lucide-react';

interface Promotion {
    promo_id: number;
    title: string;
    subtitle: string;
    description: string;
    discount_percent: number;
    promo_code: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    approval_status: 'pending' | 'approved' | 'rejected' | 'draft';
    rejection_reason?: string;
    branding_color?: string;
}

interface VendorPromotionsProps {
    storeId?: number;
}

export default function VendorPromotions({ storeId }: VendorPromotionsProps) {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        discount_percent: 0,
        promo_code: '',
        start_date: '',
        end_date: '',
        branding_color: '#14b8a6'
    });

    const fetchPromotions = async () => {
        try {
            const res = await api.get('/advertisements/vendor/promotions');
            setPromotions(res.data);
        } catch (error) {
            console.error('Failed to fetch promotions:', error);
            toast.error('Could not load promotions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) {
            toast.error('No active store selected');
            return;
        }

        try {
            await api.post('/advertisements/vendor/promotions', {
                ...formData,
                store_id: storeId
            });
            toast.success('Promotion submitted for approval!');
            setIsCreateModalOpen(false);
            fetchPromotions();
        } catch (error) {
            toast.error('Failed to create promotion');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return;
        try {
            await api.delete(`/advertisements/vendor/promotions/${id}`);
            toast.success('Promotion deleted');
            fetchPromotions();
        } catch (error) {
            toast.error('Failed to delete promotion');
        }
    };

    const getStatusBadge = (status: Promotion['approval_status']) => {
        switch (status) {
            case 'approved':
                return <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest"><CheckCircle size={12} /> Approved</span>;
            case 'pending':
                return <span className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black uppercase tracking-widest"><Clock size={12} /> Pending</span>;
            case 'rejected':
                return <span className="flex items-center gap-1 px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest"><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">Draft</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Promotions & Offers</h2>
                    <p className="text-slate-500 font-medium">Create and manage discounts for your storefront</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-slate-200"
                >
                    <Plus size={16} /> New Promotion
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-teal-600 mx-auto" />
                </div>
            ) : promotions.length === 0 ? (
                <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                    <Tag size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-black text-slate-800">No Promotions Yet</h3>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">Offer special discounts or coupon codes to boost your sales.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-teal-100"
                    >
                        Create Your First Offer
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {promotions.map((promo) => (
                        <motion.div
                            key={promo.promo_id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                        >
                            <div
                                className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-10 blur-xl transition-transform group-hover:scale-150"
                                style={{ backgroundColor: promo.branding_color || '#14b8a6' }}
                            />

                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1">
                                    {getStatusBadge(promo.approval_status)}
                                    <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter">{promo.title}</h3>
                                    <p className="text-slate-500 font-medium text-sm">{promo.subtitle}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleDelete(promo.promo_id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Discount</p>
                                    <p className="text-xl font-black text-teal-600">{promo.discount_percent}% OFF</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Code</p>
                                    <p className="text-xl font-black text-slate-900">{promo.promo_code || 'None'}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}</span>
                                {promo.rejection_reason && promo.approval_status === 'rejected' && (
                                    <div className="flex items-center gap-1 text-rose-500 cursor-help" title={promo.rejection_reason}>
                                        <Info size={12} /> View Reason
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase italic">New Promotion</h3>
                                    <p className="text-slate-500 text-xs font-medium">All promotions require admin approval</p>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate} className="p-10 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Promo Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Summer Blowout"
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtitle</label>
                                        <input
                                            type="text"
                                            value={formData.subtitle}
                                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                            placeholder="e.g. Limited time offer"
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Add more details about this offer..."
                                        className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount %</label>
                                        <input
                                            type="number"
                                            required
                                            value={formData.discount_percent}
                                            onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Promo Code (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.promo_code}
                                            onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                                            placeholder="SUMMER20"
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold uppercase"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.start_date}
                                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.end_date}
                                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 outline-none transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[12px] tracking-widest shadow-2xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Submit for Approval
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
