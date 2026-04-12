import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MenuItem {
    id?: number;
    section_id: number;
    name: string;
    description: string;
    price: number;
    image_url: string;
    donation_suggested: boolean;
    addons?: any[];
    variants?: any;
    side_ids?: number[];
    listing_id?: number;
    duration?: string;
    availability?: any;
    faqs?: { question: string; answer: string }[];
    site_ids?: number[];
    inclusions?: string[];
    exclusions?: string[];
    gallery?: string[];
}

export default function MenuManagement({ storeId }: { storeId?: number }) {
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<any>(true); // Placeholder for now or fetch later if needed
    const [menu, setMenu] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionName, setNewSectionName] = useState('');
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<number | null>(null);

    useEffect(() => {
        if (storeId) fetchData();
    }, [storeId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [menuRes, listingsRes] = await Promise.all([
                api.get(`/menu?storeId=${storeId}`),
                api.get(`/api/stores/${storeId}/listings`)
            ]);
            setMenu(menuRes.data.sections || []);
            setListings(listingsRes.data.listings || []);
        } catch (error) {
            console.error('Failed to fetch menu data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionName) return;
        try {
            await api.post('/menu/sections', { store_id: storeId, name: newSectionName });
            setNewSectionName('');
            setIsAddingSection(false);
            fetchData();
            toast.success('Section added');
        } catch (e) {
            toast.error('Failed to add section');
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm('Are you sure? This will delete all items in this section.')) return;
        try {
            await api.delete(`/menu/sections/${id}`);
            fetchData();
            toast.success('Section deleted');
        } catch (e) {
            toast.error('Failed to delete section');
        }
    };

    const handleOpenItemModal = (sectionId: number, item: MenuItem | null = null) => {
        setActiveSectionId(sectionId);
        setEditingItem(item || {
            section_id: sectionId,
            name: '',
            description: '',
            price: 0,
            image_url: '',
            donation_suggested: false,
            addons: [],
            variants: {},
            side_ids: [],
            duration: '',
            faqs: []
        });
        setIsItemModalOpen(true);
    };

    const handleSaveItem = async () => {
        if (!editingItem) return;
        try {
            if (editingItem.id) {
                await api.patch(`/menu/items/${editingItem.id}`, editingItem);
                toast.success('Item updated');
            } else {
                await api.post('/menu/items', editingItem);
                toast.success('Item added');
            }
            setIsItemModalOpen(false);
            fetchData();
        } catch (e) {
            toast.error('Failed to save item');
        }
    };

    const handleDeleteItem = async (id: number) => {
        if (!confirm('Delete this item?')) return;
        try {
            await api.delete(`/menu/items/${id}`);
            fetchData();
            toast.success('Item deleted');
        } catch (e) {
            toast.error('Failed to delete item');
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingItem) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            toast.loading('Uploading photo...', { id: 'upload' });
            const res = await api.post('/uploads/asset', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setEditingItem({ ...editingItem, image_url: res.data.url });
            toast.success('Photo uploaded!', { id: 'upload' });
        } catch (e) {
            toast.error('Upload failed', { id: 'upload' });
        }
    };

    if (loading) return <div className="p-20 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" /></div>;
    if (!storeId) return <div className="p-20 text-center text-slate-400 font-black uppercase text-xs">Register your store to enable menu management</div>;

    return (
        <div className="space-y-12 pb-12">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Menu Management</h3>
                    <p className="text-sm font-medium text-slate-400">Organize your shop's offerings into sections</p>
                </div>
                {!isAddingSection ? (
                    <button
                        onClick={() => setIsAddingSection(true)}
                        className="px-6 py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-teal-100 w-full sm:w-auto"
                    >
                        + Add Section
                    </button>
                ) : (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <input
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            placeholder="Section Name (e.g. Lunch)"
                            className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-bold w-full sm:w-auto"
                        />
                        <div className="flex gap-2">
                            <button onClick={handleAddSection} className="px-4 py-3 bg-teal-600 text-white rounded-xl font-black uppercase text-[10px] flex-1 sm:flex-none">Add</button>
                            <button onClick={() => setIsAddingSection(false)} className="px-4 py-3 bg-slate-100 text-slate-400 rounded-xl font-black uppercase text-[10px] flex-1 sm:flex-none">✕</button>
                        </div>
                    </div>
                )}
            </header>

            <div className="space-y-10">
                {menu.length > 0 ? menu.map((section) => (
                    <div key={section.id} className="bg-slate-50/50 rounded-[3rem] border border-slate-100 p-10 relative group">
                        <button
                            onClick={() => handleDeleteSection(section.id)}
                            className="absolute top-4 right-4 sm:top-8 sm:right-8 text-slate-300 hover:text-rose-500 transition-colors bg-white/50 p-2 rounded-full sm:bg-transparent sm:p-0"
                            title="Delete Section"
                        >
                            <span className="sm:hidden text-lg font-bold">✕</span>
                            <span className="hidden sm:inline">✕ Delete Section</span>
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{section.name}</h4>
                            <div className="flex-1 h-[2px] bg-white" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {section.items?.map((item: any) => (
                                <div
                                    key={item.id}
                                    className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all"
                                >
                                    {/* Top: Image + Info */}
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-50">
                                            {item.image_url ? (
                                                <img src={getImageUrl(item.image_url)} className="w-full h-full object-cover" alt={item.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🥘</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900 uppercase text-sm truncate">{item.name}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {item.duration && (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-black uppercase tracking-widest">⏱️ {item.duration}</span>
                                                )}
                                                {item.donation_suggested && (
                                                    <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[8px] font-black uppercase tracking-widest">Donation</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Price + Actions */}
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                        <span className="font-black text-teal-600 px-3 py-1 bg-teal-50 rounded-xl text-sm">${item.price}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleOpenItemModal(section.id, item); }}
                                                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] uppercase font-black tracking-widest hover:bg-teal-600 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}
                                                className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] uppercase font-black tracking-widest hover:bg-rose-100 transition-colors"
                                            >
                                                Del
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => handleOpenItemModal(section.id)}
                                className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 hover:border-teal-300 hover:text-teal-600 transition-all gap-2 group"
                            >
                                <span className="text-2xl group-hover:scale-125 transition-transform">➕</span>
                                <p className="text-[10px] font-black uppercase tracking-widest">New Item</p>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem]">
                        <p className="text-slate-400 font-bold italic">No menu sections created yet. Add one to start building your menu!</p>
                    </div>
                )}
            </div>

            {/* Item Modal */}
            <AnimatePresence>
                {isItemModalOpen && editingItem && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                                <h4 className="text-xl font-black text-slate-900 uppercase italic">
                                    {editingItem.id ? 'Edit Menu Item' : 'New Menu Item'}
                                </h4>
                                <button onClick={() => setIsItemModalOpen(false)} className="text-slate-300 hover:text-slate-900">✕</button>
                            </div>

                            <div className="p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    {/* Link to Existing Listing */}
                                    <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-indigo-800 mb-2 block">Link to Existing Listing (Auto-fill)</label>
                                        <select
                                            onChange={(e) => {
                                                const listingId = parseInt(e.target.value);
                                                const listing = listings.find(l => l.id === listingId);
                                                if (listing) {
                                                    setEditingItem({
                                                        ...editingItem,
                                                        listing_id: listing.id,
                                                        name: listing.title,
                                                        description: listing.description,
                                                        price: Number(listing.price),
                                                        image_url: listing.image_url
                                                    });
                                                }
                                            }}
                                            className="w-full px-4 py-3 text-xs font-bold bg-white rounded-xl border border-indigo-200 focus:border-indigo-500 transition-all text-indigo-900"
                                        >
                                            <option value="">Select a listing to link...</option>
                                            {listings.map(l => (
                                                <option key={l.id} value={l.id}>{l.title} (${l.price})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex justify-center">
                                        <div className="w-40 h-40 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 relative group overflow-hidden">
                                            {editingItem.image_url ? (
                                                <img src={getImageUrl(editingItem.image_url)} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                                    <span className="text-3xl">📸</span>
                                                    <p className="text-[8px] font-black uppercase text-slate-400">Add Dish Photo</p>
                                                </div>
                                            )}
                                            <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Item Name</label>
                                            <input
                                                value={editingItem.name}
                                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 transition-all font-bold"
                                                placeholder="e.g. Ital Vital Stew"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                                            <textarea
                                                value={editingItem.description}
                                                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 transition-all font-medium text-sm h-24 resize-none"
                                                placeholder="Tell them what's in the bowl..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Price ($)</label>
                                                <input
                                                    type="number"
                                                    value={editingItem.price}
                                                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 transition-all font-black text-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Duration (e.g. 1h)</label>
                                                <input
                                                    value={editingItem.duration || ''}
                                                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                                                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-teal-500 transition-all font-bold"
                                                    placeholder="Session length"
                                                />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <label className="flex items-center gap-2 cursor-pointer pt-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={editingItem.donation_suggested}
                                                        onChange={(e) => setEditingItem({ ...editingItem, donation_suggested: e.target.checked })}
                                                        className="w-5 h-5 rounded-lg text-amber-600 focus:ring-amber-500"
                                                    />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Suggested Donation</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Site IDs */}
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Site IDs (e.g. For Specific Locations)</label>
                                            <input
                                                value={editingItem.site_ids?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const ids = value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
                                                    setEditingItem({ ...editingItem, site_ids: ids });
                                                }}
                                                placeholder="e.g. 33, 34"
                                                className="w-full px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                                            />
                                        </div>

                                        {/* Inclusions Builder */}
                                        <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-blue-600">Inclusions (What's Included)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const inclusions = [...(editingItem.inclusions || []), ''];
                                                        setEditingItem({ ...editingItem, inclusions });
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 px-2 py-1 bg-white rounded-lg shadow-sm"
                                                >
                                                    + Add Inclusion
                                                </button>
                                            </div>

                                            {(editingItem.inclusions || []).length === 0 ? (
                                                <p className="text-[10px] text-blue-400 italic text-center py-3">No inclusions added yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(editingItem.inclusions || []).map((inc: string, index: number) => (
                                                        <div key={index} className="flex gap-2 items-center relative group/inc">
                                                            <input
                                                                value={inc}
                                                                onChange={(e) => {
                                                                    const inclusions = [...(editingItem.inclusions || [])];
                                                                    inclusions[index] = e.target.value;
                                                                    setEditingItem({ ...editingItem, inclusions });
                                                                }}
                                                                placeholder="e.g. Private Guide, Lunch included"
                                                                className="flex-1 px-3 py-2 text-xs font-bold bg-white rounded-lg border border-blue-100 focus:ring-2 focus:ring-blue-300"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const inclusions = (editingItem.inclusions || []).filter((_: any, i: number) => i !== index);
                                                                    setEditingItem({ ...editingItem, inclusions });
                                                                }}
                                                                className="text-rose-500 hover:text-rose-700 p-1"
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Exclusions Builder */}
                                        <div className="p-5 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-rose-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-rose-600">Exclusions (Not Included)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const exclusions = [...(editingItem.exclusions || []), ''];
                                                        setEditingItem({ ...editingItem, exclusions });
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-800 px-2 py-1 bg-white rounded-lg shadow-sm"
                                                >
                                                    + Add Exclusion
                                                </button>
                                            </div>

                                            {(editingItem.exclusions || []).length === 0 ? (
                                                <p className="text-[10px] text-rose-400 italic text-center py-3">No exclusions added yet.</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(editingItem.exclusions || []).map((exc: string, index: number) => (
                                                        <div key={index} className="flex gap-2 items-center relative group/exc">
                                                            <input
                                                                value={exc}
                                                                onChange={(e) => {
                                                                    const exclusions = [...(editingItem.exclusions || [])];
                                                                    exclusions[index] = e.target.value;
                                                                    setEditingItem({ ...editingItem, exclusions });
                                                                }}
                                                                placeholder="e.g. Gratuities, Airport Pickup"
                                                                className="flex-1 px-3 py-2 text-xs font-bold bg-white rounded-lg border border-rose-100 focus:ring-2 focus:ring-rose-300"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const exclusions = (editingItem.exclusions || []).filter((_: any, i: number) => i !== index);
                                                                    setEditingItem({ ...editingItem, exclusions });
                                                                }}
                                                                className="text-rose-500 hover:text-rose-700 p-1"
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Variants Builder */}
                                        <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-600">Variants (e.g. Size, Spice Level)</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const variants = { ...(editingItem.variants || {}), '': [''] };
                                                        setEditingItem({ ...editingItem, variants });
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-white rounded-lg shadow-sm"
                                                >
                                                    + Add Variant Group
                                                </button>
                                            </div>

                                            {Object.entries(editingItem.variants || {}).length === 0 ? (
                                                <p className="text-[10px] text-indigo-400 italic text-center py-3">No variants. Add groups like "Size" with options "Small, Large".</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {Object.entries(editingItem.variants || {}).map(([groupName, options], groupIndex) => (
                                                        <div key={groupIndex} className="bg-white p-4 rounded-xl border border-indigo-100 relative group/variant">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const variants = { ...editingItem.variants };
                                                                    delete variants[groupName];
                                                                    setEditingItem({ ...editingItem, variants });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-sm opacity-0 group-hover/variant:opacity-100 transition-opacity"
                                                            >×</button>
                                                            <div className="flex gap-2 mb-2">
                                                                <input
                                                                    value={groupName}
                                                                    onChange={(e) => {
                                                                        const variants = { ...editingItem.variants };
                                                                        const oldOptions = variants[groupName];
                                                                        delete variants[groupName];
                                                                        variants[e.target.value] = oldOptions;
                                                                        setEditingItem({ ...editingItem, variants });
                                                                    }}
                                                                    placeholder="Group name (e.g. Size)"
                                                                    className="flex-1 px-3 py-2 text-xs font-bold bg-indigo-50 rounded-lg border-0 focus:ring-2 focus:ring-indigo-300"
                                                                />
                                                            </div>
                                                            <input
                                                                value={(options as string[]).join(', ')}
                                                                onChange={(e) => {
                                                                    const variants = { ...editingItem.variants };
                                                                    variants[groupName] = e.target.value.split(',').map(o => o.trim()).filter(o => o);
                                                                    setEditingItem({ ...editingItem, variants });
                                                                }}
                                                                placeholder="Options (comma-separated): Small, Medium, Large (+$5)"
                                                                className="w-full px-3 py-2 text-[10px] font-medium bg-slate-50 rounded-lg border-0 focus:ring-2 focus:ring-indigo-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Addons Builder */}
                                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Addons & Extras</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const addons = [...(editingItem.addons || []), { name: '', price: 0 }];
                                                        setEditingItem({ ...editingItem, addons });
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 px-2 py-1 bg-white rounded-lg shadow-sm"
                                                >
                                                    + Add Extra
                                                </button>
                                            </div>

                                            {(editingItem.addons || []).length === 0 ? (
                                                <p className="text-[10px] text-emerald-400 italic text-center py-3">No addons. Add extras like "Extra Cheese (+$2)".</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {(editingItem.addons || []).map((addon: any, index: number) => (
                                                        <div key={index} className="bg-white p-3 rounded-xl border border-emerald-100 flex gap-2 items-center relative group/addon">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const addons = (editingItem.addons || []).filter((_: any, i: number) => i !== index);
                                                                    setEditingItem({ ...editingItem, addons });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-sm opacity-0 group-hover/addon:opacity-100 transition-opacity"
                                                            >×</button>
                                                            <input
                                                                value={addon.name}
                                                                onChange={(e) => {
                                                                    const addons = [...(editingItem.addons || [])];
                                                                    addons[index].name = e.target.value;
                                                                    setEditingItem({ ...editingItem, addons });
                                                                }}
                                                                placeholder="Addon name"
                                                                className="flex-1 px-3 py-2 text-xs font-bold bg-emerald-50 rounded-lg border-0 focus:ring-2 focus:ring-emerald-300"
                                                            />
                                                            <div className="flex items-center gap-1 bg-emerald-50 rounded-lg px-2">
                                                                <span className="text-emerald-600 font-black text-xs">$</span>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={addon.price}
                                                                    onChange={(e) => {
                                                                        const addons = [...(editingItem.addons || [])];
                                                                        addons[index].price = parseFloat(e.target.value) || 0;
                                                                        setEditingItem({ ...editingItem, addons });
                                                                    }}
                                                                    className="w-16 px-2 py-2 text-xs font-bold bg-transparent border-0 focus:ring-0 text-right"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Gallery Image Upload */}
                                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Image Gallery (Professional Look)</label>
                                                <label className="text-[9px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 cursor-pointer">
                                                    + Add Images
                                                    <input
                                                        type="file"
                                                        multiple
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            if (!e.target.files) return;
                                                            const files = Array.from(e.target.files);
                                                            const urls = await Promise.all(files.map(async (file) => {
                                                                const formData = new FormData();
                                                                formData.append('image', file);
                                                                const res = await api.post('/uploads/asset', formData, {
                                                                    headers: { 'Content-Type': 'multipart/form-data' }
                                                                });
                                                                return res.data.url;
                                                            }));
                                                            const gallery = [...(editingItem.gallery || []), ...urls];
                                                            setEditingItem({ ...editingItem, gallery });
                                                        }}
                                                    />
                                                </label>
                                            </div>

                                            {(editingItem.gallery || []).length === 0 ? (
                                                <p className="text-[10px] text-slate-400 italic text-center py-3">No extra images added. Add images for a better detail page.</p>
                                            ) : (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {(editingItem.gallery || []).map((url: string, index: number) => (
                                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden group/img">
                                                            <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                                                            <button
                                                                onClick={() => {
                                                                    const gallery = (editingItem.gallery || []).filter((_: any, i: number) => i !== index);
                                                                    setEditingItem({ ...editingItem, gallery });
                                                                }}
                                                                className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover/img:opacity-100"
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* FAQ Builder */}
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Frequently Asked Questions</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const faqs = [...(editingItem.faqs || []), { question: '', answer: '' }];
                                                        setEditingItem({ ...editingItem, faqs });
                                                    }}
                                                    className="text-[9px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700"
                                                >
                                                    + Add FAQ
                                                </button>
                                            </div>

                                            {(editingItem.faqs || []).length === 0 ? (
                                                <p className="text-[10px] text-slate-400 italic text-center py-3">No FAQs added yet.</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {(editingItem.faqs || []).map((faq: any, index: number) => (
                                                        <div key={index} className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 relative group/faq">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const faqs = (editingItem.faqs || []).filter((_: any, i: number) => i !== index);
                                                                    setEditingItem({ ...editingItem, faqs });
                                                                }}
                                                                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[9px] opacity-0 group-hover/faq:opacity-100"
                                                            >×</button>
                                                            <input
                                                                value={faq.question}
                                                                onChange={(e) => {
                                                                    const faqs = [...(editingItem.faqs || [])];
                                                                    faqs[index].question = e.target.value;
                                                                    setEditingItem({ ...editingItem, faqs });
                                                                }}
                                                                placeholder="Question (e.g. Is lunch included?)"
                                                                className="w-full px-3 py-2 text-xs font-bold bg-slate-50 rounded-lg border-0 focus:ring-2 focus:ring-teal-300"
                                                            />
                                                            <textarea
                                                                value={faq.answer}
                                                                onChange={(e) => {
                                                                    const faqs = [...(editingItem.faqs || [])];
                                                                    faqs[index].answer = e.target.value;
                                                                    setEditingItem({ ...editingItem, faqs });
                                                                }}
                                                                placeholder="Answer"
                                                                className="w-full h-16 px-3 py-2 text-[10px] font-medium bg-white border border-slate-100 rounded-lg focus:ring-2 focus:ring-teal-300"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Sides Config */}
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Side IDs (Comma Separated)</label>
                                            <input
                                                value={(editingItem.side_ids || []).join(', ')}
                                                onChange={(e) => {
                                                    const ids = e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
                                                    setEditingItem({ ...editingItem, side_ids: ids });
                                                }}
                                                className="w-full px-4 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl"
                                                placeholder="e.g. 33, 34"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                                {editingItem.id && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this item?')) {
                                                handleDeleteItem(editingItem.id!);
                                                setIsItemModalOpen(false);
                                            }
                                        }}
                                        className="py-4 px-6 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-rose-100 hover:bg-rose-100 transition-colors order-3 sm:order-1"
                                    >
                                        Delete
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsItemModalOpen(false)}
                                    className="flex-1 py-4 bg-white text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-200 order-2 sm:order-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveItem}
                                    className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-100 order-1 sm:order-3"
                                >
                                    {editingItem.id ? 'Update Item' : 'Add to Menu'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
