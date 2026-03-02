'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import MediaManager, { MediaItem } from '@/components/admin/shared/MediaManager';
import DynamicProductForm from '@/components/marketplace/DynamicProductForm';

interface Category {
    category_id: number;
    category_key: string;
    display_name: string;
    description: string;
    icon: string;
    subtypes?: Subtype[];
}

interface Subtype {
    subtype_id: number;
    subtype_key: string;
    display_name: string;
}

export default function EditListingPage() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        price: '',
        category_id: undefined as number | undefined,
        subtype_id: undefined as number | undefined,
        slug: ''
    });
    const [metadata, setMetadata] = useState<any>({});
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [listingRes, catRes] = await Promise.all([
                    api.get(`/listings/${id}`),
                    api.get('/categories?withSubtypes=true')
                ]);

                const data = listingRes.data;
                const cats = catRes.data;
                setCategories(cats);

                // Security check
                if (data.user_id !== user?.id && user?.role !== 'admin') {
                    alert('Not authorized to edit this listing');
                    router.push(`/listings/${id}`);
                    return;
                }

                // Hydrate Form
                setFormData({
                    title: data.title,
                    description: data.description,
                    price: data.price || '',
                    category_id: data.category_id,
                    subtype_id: data.subtype_id,
                    slug: data.slug || ''
                });

                // Normalize photos
                const normalizedPhotos = (data.photos || []).map((p: any, idx: number) => ({
                    id: p.id || `legacy-${idx}`,
                    url: p.url || p,
                    is_primary: typeof p === 'object' ? p.is_primary : idx === 0,
                    order_index: typeof p === 'object' ? p.order_index : idx
                }));
                setFiles(normalizedPhotos);

                setMetadata(data.metadata || {});

                // Resolve Category/Subtype for UI
                if (data.category_id) {
                    const foundCat = cats.find((c: Category) => c.category_id === data.category_id);
                    if (foundCat) setSelectedCategory(foundCat);
                } else if (data.category) {
                    // Legacy Fallback: Try to map text category to ID
                    // This is optional if we assume data migration, but good for robustness
                    const foundCat = cats.find((c: Category) => c.category_key === data.category || c.display_name === data.category);
                    if (foundCat) {
                        setSelectedCategory(foundCat);
                        setFormData((prev: any) => ({ ...prev, category_id: foundCat.category_id }));

                        // Try to map subtype too
                        if (data.sub_category) {
                            const foundSub = foundCat.subtypes?.find((s: Subtype) => s.display_name === data.sub_category);
                            if (foundSub) {
                                setFormData((prev: any) => ({ ...prev, subtype_id: foundSub.subtype_id }));
                            }
                        }
                    }
                }

            } catch (error) {
                console.error('Failed to fetch listing details', error);
                router.push('/listings');
            } finally {
                setLoading(false);
            }
        };

        if (id && user) loadData();
    }, [id, user, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const catId = parseInt(e.target.value);
        const cat = categories.find(c => c.category_id === catId);
        setSelectedCategory(cat || null);
        setFormData((prev: any) => ({ ...prev, category_id: catId, subtype_id: undefined }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: any = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category_id: formData.category_id,
                subtype_id: formData.subtype_id,
                photos: files,
                metadata: metadata,
                slug: formData.slug
            };

            await api.put(`/listings/${id}`, payload);
            router.push(`/listings/${id}`);
        } catch (error) {
            console.error('Failed to update listing', error);
            alert('Failed to update listing');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) return <div className="p-10 text-center font-bold">Please log in to edit listings.</div>;
    if (loading) return <div className="p-10 text-center font-bold text-slate-400">Loading Listing Details...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <div className="px-8 py-10 md:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">Edit Listing</h1>
                            <p className="text-slate-500 font-medium mt-2">Update your listing details and configuration.</p>
                        </div>
                        {selectedCategory && (
                            <span className="bg-teal-50 text-teal-700 text-3xl p-4 rounded-2xl">
                                {selectedCategory.icon}
                            </span>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Core Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Title</label>
                                <input
                                    required
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Listing Slug (URL Path)</label>
                                <div className="relative">
                                    <input
                                        name="slug"
                                        value={formData.slug}
                                        onChange={(e) => setFormData((prev: any) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all pr-32"
                                        placeholder="e.g. delicious-ital-stew"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                                        /listings/
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 ml-4 font-medium italic">
                                    Public Link: <span className="text-teal-600 font-bold">https://islandhub.com/listings/{formData.slug || id}</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                                <select
                                    value={formData.category_id || ''}
                                    onChange={handleCategoryChange}
                                    className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>{cat.display_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Price ($)</label>
                                <input
                                    required
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                />
                            </div>

                            {/* Subtype Selection */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                    Specific Type
                                </label>
                                <select
                                    name="subtype_id"
                                    value={formData.subtype_id || ''}
                                    onChange={(e) => setFormData((prev: any) => ({ ...prev, subtype_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                    required={!!selectedCategory?.subtypes?.length}
                                    disabled={!selectedCategory?.subtypes?.length}
                                >
                                    <option value="">Select a specific type...</option>
                                    {selectedCategory?.subtypes?.map(subtype => (
                                        <option key={subtype.subtype_id} value={subtype.subtype_id}>
                                            {subtype.display_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                                <textarea
                                    required
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Dynamic Fields */}
                        {formData.subtype_id && (
                            <DynamicProductForm
                                subtypeId={formData.subtype_id}
                                metadata={metadata}
                                onChange={setMetadata}
                            />
                        )}

                        <div className="border-t border-slate-100 pt-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Gallery</h3>
                            </div>
                            <MediaManager initialMedia={files} onChange={setFiles} maxFiles={15} />
                        </div>

                        <div className="flex gap-6 pt-6">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-10 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black transition-all hover:bg-slate-200 hover:text-slate-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 px-12 py-5 bg-teal-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-teal-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
