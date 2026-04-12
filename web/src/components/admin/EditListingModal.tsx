'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import DynamicForm from '@/components/marketplace/DynamicForm';
import { CATEGORY_SCHEMAS } from '@/lib/schemas';
import { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import MediaManager, { MediaItem } from './shared/MediaManager';

interface EditListingModalProps {
    listing: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditListingModal({ listing, onClose, onSuccess }: EditListingModalProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<any>({});
    const [subType, setSubType] = useState<string>('');
    const [files, setFiles] = useState<MediaItem[]>([]);

    // Map category names to schema keys
    const getSchemaKey = (category: string): string => {
        const rentalsCategories = ['Car', 'Apartment', 'Boat', 'Jet Ski', 'Equipment'];
        const servicesCategories = ['Professional', 'Tour', 'Taxi', 'Pickup', 'Delivery'];

        if (rentalsCategories.includes(category)) return 'rentals';
        if (servicesCategories.includes(category)) return 'services';
        return category.toLowerCase();
    };

    useEffect(() => {
        if (listing) {
            setFormData({
                title: listing.title,
                description: listing.description,
                price: listing.price,
                goal_amount: listing.goal_amount,
                category: listing.category,
                type: listing.type,
            });

            // Normalize photos for MediaManager
            const normalizedPhotos = (listing.photos || []).map((p: any, idx: number) => ({
                id: p.id || `legacy-${idx}`,
                url: p.url || p, // Handle both object and legacy string array
                is_primary: typeof p === 'object' ? p.is_primary : idx === 0,
                order_index: typeof p === 'object' ? p.order_index : idx
            }));
            setFiles(normalizedPhotos);

            setMetadata(listing.metadata || {});
            setSubType(listing.metadata?.sub_type || '');
        }
    }, [listing]);

    // Calculate available sub-types based on category
    const normalizedCategory = formData.category?.toLowerCase() || '';
    const schemaKey = getSchemaKey(formData.category);
    const availableSubTypes = CATEGORY_SCHEMAS[schemaKey] ? Object.keys(CATEGORY_SCHEMAS[schemaKey]) : [];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const finalMetadata = { ...metadata, sub_type: subType };
            // Pass the structured files array directly
            await api.put(`/listings/${listing.id}`, {
                ...formData,
                photos: files,
                metadata: finalMetadata
            });
            toast.success('Listing updated — changes live');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update listing', error);
            toast.error('Failed to update listing');
        } finally {
            setLoading(false);
        }
    };

    if (!listing) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-(--bg-primary) w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow)' }}>
                <div className="p-4 sm:p-6 border-b border-(--border) flex justify-between items-center bg-(--bg-secondary)">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-(--text-primary)">Edit Listing</h2>
                        <p className="text-(--text-secondary) text-xs sm:text-sm font-medium">Modify details for <span className="text-(--accent)">#{listing.id}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-(--bg-tertiary) rounded-full transition-colors text-(--text-muted) hover:text-(--text-secondary)">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2 px-2">Title</label>
                            <input
                                name="title"
                                value={formData.title || ''}
                                onChange={handleChange}
                                className="w-full px-6 py-4 bg-(--bg-secondary) border-2 border-transparent rounded-2xl focus:bg-(--bg-primary) focus:border-(--accent) transition-all font-bold text-(--text-primary)eholder-[var(--text-muted)] text-lg"
                                placeholder="Listing Title"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2 px-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-6 py-4 bg-(--bg-secondary) border-2 border-transparent rounded-2xl focus:bg-(--bg-primary)s:border-[var(--accent)] transition-all font-medium text-(--text-primary) placeholder-(--text-muted) resize-none"
                                placeholder="Describe what you're offering..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2 px-2">Category</label>
                                <select
                                    name="category"
                                    value={formData.category || ''}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setSubType(''); // Reset sub-type on category change
                                    }}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-(--bg-secondary)er-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-(--bg-primary)sfocus:border-(--accent)sition-all font-bold text-(--text-primary) text-sm sm:text-base"
                                >
                                    <option value="">Select Category</option>
                                    <option value="rentals">Rentals</option>
                                    <option value="services">Services</option>
                                    <option value="food">Food</option>
                                    <option value="products">Products</option>
                                </select>
                            </div>

                            {/* Price / Goal */}
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2 px-2">
                                    {listing.type === 'campaign' ? 'Goal ($)' : 'Price ($)'}
                                </label>
                                <input
                                    type="number"
                                    name={listing.type === 'campaign' ? 'goal_amount' : 'price'}
                                    value={listing.type === 'campaign' ? (formData.goal_amount ?? '') : (formData.price ?? '')}
                                    onChange={handleChange}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-(--bg-secondary) border-2 border-transparent rounded-xl sm:rounded-2xl focus:bg-(--bg-primary)s:border-[var(--accent)] transition-all font-bold text-(--text-primary)-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Sub-Type Selection */}
                        {availableSubTypes.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-(--text-muted) mb-2 px-2">Listing Type</label>
                                <select
                                    value={subType}
                                    onChange={(e) => setSubType(e.target.value)}
                                    className="w-full px-6 py-4 bg-(--bg-secondary) border-2 border-transparent rounded-2xl focus:bg-(--bg-primary)s:border-[var(--accent)] transition-all font-bold text-(--text-primary)"
                                >
                                    <option value="">Select Type...</option>
                                    {availableSubTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Photos Section */}
                        <div className="pt-6 border-t border-slate-100">
                            <MediaManager
                                initialMedia={files}
                                onChange={setFiles}
                                maxFiles={15}
                            />
                        </div>
                    </div>

                    {/* Metadata Dynamic Section */}
                    {subType && (
                        <div className="pt-4 border-t border-slate-100 mt-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xl">🛠️</span>
                                <h3 className="text-sm font-bold text-(--text-primary)">Specific Details ({subType})</h3>
                            </div>
                            <DynamicForm
                                category={schemaKey}
                                subType={subType}
                                metadata={metadata}
                                onChange={setMetadata}
                            />
                        </div>
                    )}

                    <div className="pt-8 flex gap-4 bg-(--bg-primary) sticky bottom-0 border-t border-(--border) mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 bg-(--bg-tertiary) text-(--text-secondary) font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-(--bg-secondary) transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-8 py-4 bg-(--accent) text-(--bg-primary) font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-(--accent-hover) shadow-xl transition-all"
                            style={{ boxShadow: 'var(--shadow)' }}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
