import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import BadgeSelector from '../marketplace/BadgeSelector';

interface Store {
    store_id: number;
    name: string;
    category_id?: number;
    subtype_id?: number;
    subscription_type: string;
    status: string;
    owner_name?: string;
    slug: string;
    badges?: string[];
    rating?: number;
}

interface Category {
    category_id: number;
    category_key: string;
    display_name: string;
    layout_type: string;
    icon?: string;
    subtypes?: Subtype[];
}

interface Subtype {
    subtype_id: number;
    subtype_key: string;
    display_name: string;
}

interface EditStoreModalProps {
    store: Store;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditStoreModal({ store, isOpen, onClose, onSuccess }: EditStoreModalProps) {
    const [formData, setFormData] = useState<Partial<Store>>({
        name: '',
        category_id: undefined,
        subtype_id: undefined,
        subscription_type: '',
        status: '',
        slug: '',
        badges: [],
        rating: 5
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subtypes, setSubtypes] = useState<Subtype[]>([]);

    useEffect(() => {
        // Fetch categories with subtypes
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories?withSubtypes=true');
                setCategories(res.data);
            } catch (error) {
                console.error('Failed to fetch categories', error);
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.name,
                category_id: store.category_id,
                subtype_id: store.subtype_id,
                subscription_type: store.subscription_type,
                status: store.status,
                slug: store.slug || '',
                badges: store.badges || [],
                rating: store.rating || 5
            });

            // Set subtypes if category is already selected
            if (store.category_id && categories.length > 0) {
                const selectedCat = categories.find(c => c.category_id === store.category_id);
                if (selectedCat && selectedCat.subtypes) {
                    setSubtypes(selectedCat.subtypes);
                }
            }
        }
    }, [store, categories]);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = parseInt(e.target.value);
        const selectedCat = categories.find(c => c.category_id === catId);

        if (selectedCat) {
            setFormData({
                ...formData,
                category_id: catId,
                subtype_id: undefined // Reset subtype
            });
            setSubtypes(selectedCat.subtypes || []);
        } else {
            setFormData({ ...formData, category_id: undefined, subtype_id: undefined });
            setSubtypes([]);
        }
    };

    const handleSubtypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const subId = parseInt(e.target.value);
        setFormData({
            ...formData,
            subtype_id: subId
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put(`/stores/${store.store_id}`, {
                ...formData,
                admin_rating: formData.rating,
                badges: formData.badges
            });
            toast.success('Store updated successfully');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Update store failed', error);
            toast.error('Failed to update store');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100"
            >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight italic">Store Configuration</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Editing: <span className="text-teal-600">{store.name}</span> (ID: {store.store_id})
                        </p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all border border-slate-100">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Store Slug (Custom URL)</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none pr-32"
                                placeholder="your-store-name"
                                required
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                                /store/
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-1 px-1">
                            Public URL: <span className="text-teal-600 font-bold">islandhub.com/store/{formData.slug || '...'}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category (Primary)</label>
                            <select
                                value={formData.category_id || ''}
                                onChange={handleCategoryChange}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none appearance-none capitalize"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.category_id} value={cat.category_id}>
                                        {cat.icon} {cat.display_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subtype (Specific)</label>
                            <select
                                value={formData.subtype_id || ''}
                                onChange={handleSubtypeChange}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none appearance-none capitalize"
                                required
                                disabled={!subtypes.length}
                            >
                                <option value="">Select Subtype</option>
                                {subtypes.map(sub => (
                                    <option key={sub.subtype_id} value={sub.subtype_id}>
                                        {sub.display_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none appearance-none"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Subscription Plan</label>
                            <select
                                value={formData.subscription_type}
                                onChange={(e) => setFormData({ ...formData, subscription_type: e.target.value })}
                                className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none appearance-none"
                            >
                                <option value="basic">Basic</option>
                                <option value="pro">Pro</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Admin Rating (Stars)</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={formData.rating}
                            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 font-bold text-slate-700 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50">
                        <BadgeSelector
                            selectedBadges={formData.badges || []}
                            onChange={(badges) => setFormData({ ...formData, badges })}
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.category_id}
                            className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-teal-600 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-slate-200"
                        >
                            {loading ? 'Processing...' : 'Save Configuration'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
