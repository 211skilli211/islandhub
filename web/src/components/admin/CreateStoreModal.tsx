import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from '@/lib/toast';
import BadgeSelector from '../marketplace/BadgeSelector';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Category {
    category_id: number;
    category_key: string;
    display_name: string;
    layout_type: string;
    subtypes?: Subtype[];
    icon?: string;
}

interface Subtype {
    subtype_id: number;
    subtype_key: string;
    display_name: string;
}

interface CreateStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateStoreModal({ isOpen, onClose, onSuccess }: CreateStoreModalProps) {
    const [formData, setFormData] = useState({
        vendor_id: '',
        name: '',
        slug: '',
        description: '',
        category_id: '',
        subtype_id: '',
        status: 'active',
        subscription_type: 'basic',
        branding_color: '#14b8a6'
    });
    const [users, setUsers] = useState<User[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subtypes, setSubtypes] = useState<Subtype[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        setFetchingUsers(true);
        try {
            const [usersRes, catsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/categories?withSubtypes=true')
            ]);
            // Filter users or just show all for admin to pick
            setUsers(usersRes.data.users || usersRes.data);
            setCategories(catsRes.data);
        } catch (error) {
            console.error('Failed to fetch initial data', error);
            toast.error('Failed to load users or categories');
        } finally {
            setFetchingUsers(false);
        }
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = parseInt(e.target.value);
        const selectedCat = categories.find(c => c.category_id === catId);

        if (selectedCat) {
            setFormData({
                ...formData,
                category_id: catId.toString(),
                subtype_id: ''
            });
            setSubtypes(selectedCat.subtypes || []);
        } else {
            setFormData({ ...formData, category_id: '', subtype_id: '' });
            setSubtypes([]);
        }
    };

    const handleSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subId = parseInt(e.target.value);
        setFormData({
            ...formData,
            subtype_id: subId.toString()
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.vendor_id || !formData.name || !formData.category_id) {
            toast.error('Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            await api.post('/stores', {
                ...formData,
                vendor_id: parseInt(formData.vendor_id)
            });
            toast.success('Store created successfully');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                vendor_id: '',
                name: '',
                slug: '',
                description: '',
                category_id: '',
                subtype_id: '',
                status: 'active',
                subscription_type: 'basic',
                branding_color: '#14b8a6'
            });
        } catch (error: any) {
            console.error('Create store failed', error);
            toast.error(error.response?.data?.message || 'Failed to create store');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-ink-primary/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-surface-elevated rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-border-primary max-h-[90vh] flex flex-col"
            >
                <div className="p-8 border-b border-border-primary flex justify-between items-center bg-surface-secondary/50">
                    <div>
                        <h2 className="text-2xl font-black text-ink-primary tracking-tight italic">Provision New Store</h2>
                        <p className="text-[10px] font-black text-ink-tertiary uppercase tracking-widest mt-1">Admin Dashboard | Multi-Store Control</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-surface-elevated shadow-sm flex items-center justify-center text-ink-tertiary hover:text-ink-secondary transition-all border border-border-primary">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto">
                    {/* Vendor Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest px-1 text-accent-400">Step 1: Assign to Vendor</label>
                        <select
                            value={formData.vendor_id}
                            onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                            className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none appearance-none"
                            required
                        >
                            <option value="">Select a Vendor / User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email}) - {u.role}</option>
                            ))}
                        </select>
                        {fetchingUsers && <p className="text-[10px] text-ink-tertiary animate-pulse px-1">Refreshing vendor list...</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-1">Step 2: Store Identity</label>
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                placeholder="Store Name (e.g. Island Grill #2)"
                                value={formData.name}
                                onChange={(e) => {
                                    const name = e.target.value;
                                    setFormData({
                                        ...formData,
                                        name,
                                        slug: formData.slug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                    });
                                }}
                                className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none"
                                required
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="store-slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                    className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none pr-32"
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-ink-tertiary uppercase">/store/</div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-1">Category</label>
                            <select
                                value={formData.category_id}
                                onChange={handleCategoryChange}
                                className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none appearance-none"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>{cat.icon} {cat.display_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-1">Subtype</label>
                            <select
                                value={formData.subtype_id}
                                onChange={handleSubtypeChange}
                                className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none appearance-none"
                                disabled={!subtypes.length}
                                required
                            >
                                <option value="">Select Subtype</option>
                                {subtypes.map(sub => (
                                    <option key={sub.subtype_id} value={sub.subtype_id}>{sub.display_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-1">Subscription Plan</label>
                            <select
                                value={formData.subscription_type}
                                onChange={(e) => setFormData({ ...formData, subscription_type: e.target.value })}
                                className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none appearance-none"
                            >
                                <option value="basic">Basic ($29/mo)</option>
                                <option value="pro">Pro ($59/mo)</option>
                                <option value="premium">Premium ($99/mo)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-ink-tertiary px-1">Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-4 bg-surface-secondary border-2 border-transparent rounded-2xl focus:bg-surface-elevated focus:border-teal-500 font-bold text-ink-secondary transition-all outline-none appearance-none"
                            >
                                <option value="active">Active (Instant Launch)</option>
                                <option value="pending">Pending Review</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border-primary flex gap-4 mt-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-surface-secondary text-ink-secondary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface-tertiary transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.vendor_id || !formData.name}
                            className="flex-2 py-4 bg-ink-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-500 disabled:bg-surface-tertiary disabled:text-ink-tertiary transition-all shadow-xl shadow-black/10"
                        >
                            {loading ? 'Creating Store...' : 'Launch Store 🚀'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
