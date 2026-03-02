'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import DynamicProductForm from '@/components/marketplace/DynamicProductForm';
import MediaManager, { MediaItem } from '@/components/admin/shared/MediaManager';

interface Category {
    category_id: number;
    category_key: string;
    display_name: string;
    description: string;
    icon: string;
    layout_type?: string;
    subtypes?: Subtype[];
}

interface Subtype {
    subtype_id: number;
    subtype_key: string;
    display_name: string;
}

// Product type definitions
interface ProductType {
    type_key: string;
    display_name: string;
    description: string;
    icon: string;
    requires_verification: boolean;
}

const PRODUCT_TYPES: ProductType[] = [
    {
        type_key: 'physical',
        display_name: 'Physical Product',
        description: 'Tangible items that ship to customers',
        icon: '📦',
        requires_verification: false
    },
    {
        type_key: 'digital',
        display_name: 'Digital Product',
        description: 'Downloadable files, courses, or media',
        icon: '💾',
        requires_verification: false
    },
    {
        type_key: 'custom',
        display_name: 'Custom Type',
        description: 'Request a new product category (requires admin approval)',
        icon: '✨',
        requires_verification: true
    }
];

// Step type using string literals
type Step = 'category' | 'productType' | 'custom' | 'form';

interface FormData {
    title: string;
    description: string;
    price: string;
    category_id?: number;
    subtype_id?: number;
    store_id?: number;
    service_type: string[];
    pickup_location: string;
    dropoff_location: string;
    vehicle_category: string;
    scheduled_time: string;
    metadata?: {
        custom_product_type?: string;
        custom_type_description?: string;
        custom_type_status?: string;
    };
}

export default function CreatePage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState<Step>('category');
    const [loading, setLoading] = useState(false);
    const [vendorData, setVendorData] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [creationType, setCreationType] = useState<string | null>(null);
    const [productType, setProductType] = useState<ProductType | null>(null);
    const [customTypeName, setCustomTypeName] = useState('');
    const [customTypeDescription, setCustomTypeDescription] = useState('');
    const [stores, setStores] = useState<any[]>([]);
    const [activeStoreId, setActiveStoreId] = useState<number | null>(null);

    // Core form fields
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        category_id: undefined,
        subtype_id: undefined,
        store_id: undefined,
        service_type: [],
        pickup_location: '',
        dropoff_location: '',
        vehicle_category: 'car',
        scheduled_time: '',
        metadata: {}
    });

    // JSONB Metadata (separate from form metadata)
    const [metadata, setMetadata] = useState<any>({});
    const [files, setFiles] = useState<MediaItem[]>([]);

    useEffect(() => {
        if (isAuthenticated === false) {
            router.push('/login');
            return;
        }

        const loadData = async () => {
            try {
                // First, verify vendor status - this is the critical check
                const vendorRes = await api.get('/vendors/me');
                setVendorData(vendorRes.data);

                // Load categories (non-critical, can still proceed if fails)
                let catData = [];
                try {
                    const catRes = await api.get('/categories?withSubtypes=true');
                    catData = catRes.data;
                } catch (catErr) {
                    console.warn('Failed to load categories', catErr);
                    catData = [];
                }

                // Load stores - if no stores, still allow the flow but show prompt
                let vendorStores = [];
                try {
                    const storesRes = await api.get('/stores/my');
                    vendorStores = Array.isArray(storesRes.data) ? storesRes.data : [storesRes.data];
                } catch (storesErr: any) {
                    // If stores returns 404, user has no stores yet - that's OK
                    if (storesErr.response?.status === 404) {
                        vendorStores = [];
                    } else {
                        console.warn('Failed to load stores', storesErr);
                        vendorStores = [];
                    }
                }
                setStores(vendorStores);

                // Auto-detect store - use the only store or first store
                if (vendorStores.length > 0) {
                    const sid = vendorStores[0].store_id || vendorStores[0].id;
                    setFormData(prev => ({ ...prev, store_id: sid }));
                    setActiveStoreId(sid);
                }

                // Filter categories based on URL type
                const searchParams = new URLSearchParams(window.location.search);
                const type = searchParams.get('type');
                setCreationType(type);

                // Filter categories based on URL type and layout_type
                // LOGICAL STRUCTURE:
                // - Products: Physical/Digital items you purchase and own
                // - Services: Everything else a vendor provides (including rentals, tours, food)
                let filteredCats = catData;

                if (type === 'service') {
                    // Services include: service layout, rental layout, tours
                    filteredCats = catData.filter((c: Category) =>
                        c.layout_type === 'service' ||
                        c.layout_type === 'rental' ||
                        c.category_key?.includes('tour')
                    );
                } else if (type === 'product') {
                    // Products: only product and digital layout categories
                    filteredCats = catData.filter((c: Category) =>
                        c.layout_type === 'product' || c.layout_type === 'digital'
                    );
                }

                setCategories(filteredCats);

                // Set initial step based on creation type
                if (type === 'product') {
                    setStep('productType');
                } else {
                    // Services go directly to category selection
                    setStep('category');
                }

                // Pre-select category if vendor is restricted and has only one allowed category
                if (vendorRes.data.category_id && filteredCats.length === 1) {
                    const vendorCat = filteredCats.find((c: Category) => c.category_id === vendorRes.data.category_id);
                    if (vendorCat) {
                        setFormData(prev => ({ ...prev, category_id: vendorCat.category_id }));
                        setSelectedCategory(vendorCat);
                        // If vendor also has a subtype, set it
                        if (vendorRes.data.subtype_id) {
                            setFormData(prev => ({ ...prev, subtype_id: vendorRes.data.subtype_id }));
                        }
                        setStep('form');
                    }
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    // Only redirect if vendor record doesn't exist
                    router.push('/become-vendor');
                } else {
                    console.error('Failed to load initial data', err);
                }
            }
        };

        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated, router]);

    const handleProductTypeSelect = (type: ProductType) => {
        if (type.type_key === 'custom') {
            setProductType(type);
            setStep('custom');
        } else {
            setProductType(type);
            setStep('form');
        }
    };

    const handleCustomTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (customTypeName.trim()) {
            // Store custom type in metadata for backend
            setFormData(prev => ({
                ...prev,
                metadata: {
                    custom_product_type: customTypeName,
                    custom_type_description: customTypeDescription,
                    custom_type_status: 'pending_verification'
                }
            }));
            setStep('form');
        }
    };

    const handleCategorySelect = (category: Category) => {
        setFormData(prev => ({ ...prev, category_id: category.category_id, subtype_id: undefined }));
        setSelectedCategory(category);
        setStep('form');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Multi-select handler for service types
    const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions);
        const values = options.map(option => option.value);
        setFormData(prev => ({ ...prev, service_type: values }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory || !user) return;

        setLoading(true);
        try {
            const payload: any = {
                title: formData.title,
                description: formData.description,
                type: productType?.type_key || 'product',
                category_id: formData.category_id,
                subtype_id: formData.subtype_id,
                store_id: formData.store_id,
                photos: files,
                service_type: formData.service_type.join(','),
                metadata: {
                    ...metadata,
                    pickup_location: formData.pickup_location,
                    dropoff_location: formData.dropoff_location,
                    custom_product_type: formData.metadata?.custom_product_type,
                    custom_type_status: formData.metadata?.custom_type_status
                }
            };

            if (formData.price) {
                payload.price = parseFloat(formData.price);
            }

            const res = await api.post('/listings', payload);
            router.push(`/listings/${res.data.id}`);

        } catch (error: any) {
            console.error("Failed to create listing", error);
            if (error.response?.status === 403) {
                alert("Subscription required! Please check your plan.");
                router.push('/become-vendor');
            } else {
                alert("Failed to create listing. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Step navigation helper
    const goBack = () => {
        if (step === 'custom') {
            setStep('productType');
            setProductType(null);
        } else if (step === 'form' && creationType === 'product') {
            setStep('productType');
            setSelectedCategory(null);
        } else if (step === 'form') {
            setStep('category');
            setSelectedCategory(null);
        }
    };

    if (!isAuthenticated || (user?.role !== 'vendor' && user?.role !== 'admin' && !vendorData)) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl">
                    <div className="text-6xl mb-6 animate-bounce">🔐</div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight italic">Verify Your Vendor Status</h2>
                    <p className="text-slate-500 font-medium mb-8">Accessing the creation hub requires an active vendor subscription.</p>
                    <button onClick={() => router.push('/become-vendor')} className="px-10 py-4 bg-(--success-primary,#10b981) text-white! rounded-2xl font-black shadow-xl shadow-teal-100 transition-all hover:scale-105 active:scale-95">Become a Vendor 🚀</button>
                </div>
            </main>
        );
    }

    // Get current store info
    const currentStore = stores.find(s => (s.store_id || s.id) === activeStoreId);
    const storeName = currentStore?.name || (stores.length > 0 ? stores[0].name : 'Your Store');

    return (
        <main className="min-h-screen bg-slate-50">
            {/* Step 1: Product Type Selection (for type=product) */}
            {step === 'productType' && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-teal-50 px-6 py-3 rounded-full mb-8">
                            <span className="text-2xl">🏪</span>
                            <span className="font-bold text-teal-700">Adding to: {storeName}</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight italic">What type of product are you creating?</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Select the type that best describes your offering. Custom types require admin verification.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PRODUCT_TYPES.filter(t => t.type_key !== 'custom').map(type => (
                            <button
                                key={type.type_key}
                                onClick={() => handleProductTypeSelect(type)}
                                className="group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-100/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left"
                            >
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {type.icon}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-2 capitalize">{type.display_name}</h3>
                                <p className="text-slate-500 font-medium text-sm">{type.description}</p>
                            </button>
                        ))}

                        {/* Custom Type Option */}
                        <button
                            onClick={() => handleProductTypeSelect(PRODUCT_TYPES.find(t => t.type_key === 'custom')!)}
                            className="group relative bg-linear-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:shadow-amber-100/50 transition-all hover:-translate-y-2 border-2 border-amber-200 hover:border-amber-300 text-left"
                        >
                            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                ✨
                            </div>
                            <h3 className="text-xl font-black text-amber-800 mb-2">Custom Type</h3>
                            <p className="text-amber-600 font-medium text-sm mb-3">Request a new product category</p>
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-200 rounded-full text-xs font-bold text-amber-700">
                                <span>⏳</span> Requires Admin Approval
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Custom Type Form */}
            {step === 'custom' && productType?.type_key === 'custom' && (
                <div className="max-w-2xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                    >
                        <span>←</span> Back to Product Types
                    </button>

                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                                    ✨
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">Request Custom Product Type</h1>
                                <p className="text-slate-500 mt-4">Tell us about the new product category you'd like to add. Our team will review your request.</p>
                            </div>

                            <form onSubmit={handleCustomTypeSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                        Custom Type Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={customTypeName}
                                        onChange={(e) => setCustomTypeName(e.target.value)}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all"
                                        placeholder="e.g., Organic Fertilizer, Island Crafts..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                        Description / Justification *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={customTypeDescription}
                                        onChange={(e) => setCustomTypeDescription(e.target.value)}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all"
                                        placeholder="Explain why this category should be added..."
                                    />
                                </div>

                                <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">⏳</span>
                                        <div>
                                            <h4 className="font-bold text-amber-800 mb-1">Verification Required</h4>
                                            <p className="text-sm text-amber-700">Your custom type will be marked as "Pending Verification". You'll be notified once our team reviews your request.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black transition-all hover:bg-slate-200 hover:text-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!customTypeName.trim()}
                                        className="flex-1 px-8 py-4 bg-linear-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1: Generic Category Selection (when not product type flow) */}
            {step === 'category' && creationType !== 'product' && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-teal-50 px-6 py-3 rounded-full mb-8">
                            <span className="text-2xl">🏪</span>
                            <span className="font-bold text-teal-700">Adding to: {storeName}</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight italic">What are you creating today?</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Select the type of listing to add to the IslandHub ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map(cat => (
                            <button
                                key={cat.category_id}
                                disabled={vendorData?.category_id && vendorData.category_id !== cat.category_id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-100/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon || '✨'}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 capitalize">{cat.display_name}</h3>
                                <p className="text-slate-500 font-medium">{cat.description || `Create a new ${cat.display_name} listing.`}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Category Selection (after product type) */}
            {step === 'form' && productType && !selectedCategory && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                    >
                        <span>←</span> Back to Product Types
                    </button>

                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-teal-50 px-6 py-3 rounded-full mb-8">
                            <span className="text-2xl">🏪</span>
                            <span className="font-bold text-teal-700">Adding to: {storeName}</span>
                            <span className="text-teal-400">•</span>
                            <span className="text-lg">{productType.icon}</span>
                            <span className="font-bold text-teal-700">{productType.display_name}</span>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight italic">Select a Category</h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">Choose the category that best fits your {productType.display_name.toLowerCase()}.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map(cat => (
                            <button
                                key={cat.category_id}
                                disabled={vendorData?.category_id && vendorData.category_id !== cat.category_id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`group relative bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-teal-100/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon || '✨'}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 capitalize">{cat.display_name}</h3>
                                <p className="text-slate-500 font-medium">{cat.description || `Create a new ${cat.display_name} listing.`}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 4: Details Form */}
            {step === 'form' && selectedCategory && (
                <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
                    >
                        <span>←</span> Back to {productType ? 'Product Types' : 'Categories'}
                    </button>

                    <div className="bg-white rounded-4xl md:rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
                        <div className="p-6 md:p-12">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">
                                        Create {selectedCategory.display_name}
                                    </h1>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">
                                        Category: {selectedCategory.display_name}
                                        {productType && (
                                            <span className="ml-2">
                                                • {productType.icon} {productType.display_name}
                                            </span>
                                        )}
                                        {formData.metadata?.custom_type_status === 'pending_verification' && (
                                            <span className="ml-2 text-amber-600">
                                                • ⏳ Custom Type Pending
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-3xl">
                                    {selectedCategory.icon || '✨'}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Base Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Listing Title</label>
                                        <input
                                            required
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="e.g. Unique Island Experience"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                            Price ($)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    {/* Store Selection (Only if multiple stores exist) */}
                                    {stores.length > 1 && (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                Select Destination Store
                                            </label>
                                            <select
                                                name="store_id"
                                                value={formData.store_id || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                                                className="w-full px-8 py-5 bg-teal-50 border-2 border-teal-100 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                required
                                            >
                                                <option value="">Which store does this belong to?</option>
                                                {stores.map(store => (
                                                    <option key={store.store_id || store.id} value={store.store_id || store.id}>
                                                        {store.name} ({store.category})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-teal-600 ml-4 font-black uppercase tracking-widest opacity-60">
                                                📍 You have multiple stores. Please select the correct one.
                                            </p>
                                        </div>
                                    )}

                                    {/* Subtype Selection */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                            Specific Type
                                        </label>
                                        {vendorData?.subtype_id ? (
                                            <div className="w-full px-8 py-5 bg-slate-100 border-transparent rounded-2xl text-slate-400 font-black cursor-not-allowed">
                                                {selectedCategory.subtypes?.find(s => s.subtype_id === vendorData.subtype_id)?.display_name || 'Fixed Type'}
                                            </div>
                                        ) : (
                                            <select
                                                name="subtype_id"
                                                value={formData.subtype_id || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subtype_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                                                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                required
                                            >
                                                <option value="">Select a specific type...</option>
                                                {selectedCategory.subtypes?.map(subtype => (
                                                    <option key={subtype.subtype_id} value={subtype.subtype_id}>
                                                        {subtype.display_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Service Type Multi-Select */}
                                    {selectedCategory?.layout_type === 'service' && !selectedCategory?.category_key?.includes('food') ? (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                Service Modes
                                            </label>
                                            <select
                                                multiple
                                                value={formData.service_type}
                                                onChange={handleServiceTypeChange}
                                                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                style={{ minHeight: '120px' }}
                                            >
                                                <option value="onsite">🏠 On-site (I travel to customer)</option>
                                                <option value="remote">💻 Remote (Online/Virtual)</option>
                                                <option value="appointment">📅 By Appointment Only</option>
                                                <option value="emergency">🚨 Emergency Service Available</option>
                                                <option value="scheduled">📆 Scheduled Visits</option>
                                            </select>
                                            <p className="text-[10px] text-slate-400 ml-4 font-medium">
                                                Hold Ctrl/Cmd to select multiple service modes
                                            </p>
                                        </div>
                                    ) : selectedCategory?.layout_type === 'service' ? (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                Service Modes
                                            </label>
                                            <select
                                                multiple
                                                value={formData.service_type}
                                                onChange={handleServiceTypeChange}
                                                className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                style={{ minHeight: '120px' }}
                                            >
                                                <option value="walkin">🚶 Walk-in (Customer walks in)</option>
                                                <option value="delivery">🚗 Delivery (Delivery service)</option>
                                                <option value="takeout">📦 Takeout (Takeout service)</option>
                                                <option value="dining">🍽️ Dining (Dine-in service)</option>
                                                <option value="reservations">📅 Reservations (Reservation-based)</option>
                                            </select>
                                            <p className="text-[10px] text-slate-400 ml-4 font-medium">
                                                Hold Ctrl/Cmd to select multiple service modes
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Description</label>
                                        <textarea
                                            required
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="Tell your customers more about this offering..."
                                        />
                                    </div>
                                </div>

                                {/* ============================================
                                    TYPE-SPECIFIC FIELDS
                                    ============================================ */}

                                {/* PROFESSIONAL SERVICES FIELDS */}
                                {selectedCategory?.layout_type === 'service' && !selectedCategory?.category_key?.includes('food') && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-purple-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Service Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Provider Type *
                                                </label>
                                                <select
                                                    name="provider_type"
                                                    value={metadata.provider_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, provider_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select type...</option>
                                                    <option value="store">Store / Business (Established establishment)</option>
                                                    <option value="individual">Independent Provider (Individual contractor)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Service Area *
                                                </label>
                                                <select
                                                    name="service_area"
                                                    value={metadata.service_area || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, service_area: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select service area...</option>
                                                    <option value="local">Local (Within my area)</option>
                                                    <option value="regional">Regional (Nearby towns)</option>
                                                    <option value="island-wide">Island-wide</option>
                                                    <option value="remote">Remote/Online Only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Experience Level *
                                                </label>
                                                <select
                                                    name="experience_level"
                                                    value={metadata.experience_level || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, experience_level: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select experience...</option>
                                                    <option value="entry">Entry Level (0-2 years)</option>
                                                    <option value="intermediate">Intermediate (2-5 years)</option>
                                                    <option value="experienced">Experienced (5-10 years)</option>
                                                    <option value="expert">Expert (10+ years)</option>
                                                    <option value="certified">Certified Professional</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Response Time *
                                                </label>
                                                <select
                                                    name="response_time"
                                                    value={metadata.response_time || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, response_time: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select response time...</option>
                                                    <option value="immediate">Within 1 hour</option>
                                                    <option value="fast">Within 4 hours</option>
                                                    <option value="standard">Within 24 hours</option>
                                                    <option value="slow">Within 48 hours</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Pricing Model *
                                                </label>
                                                <select
                                                    name="pricing_model"
                                                    value={metadata.pricing_model || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, pricing_model: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select pricing...</option>
                                                    <option value="hourly">Hourly Rate</option>
                                                    <option value="fixed">Fixed Project Rate</option>
                                                    <option value="consultation">Consultation Fee</option>
                                                    <option value="custom">Custom Quote</option>
                                                </select>
                                            </div>
                                            {/* Show provider name field only for individual providers */}
                                            {metadata.provider_type === 'individual' && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                        Provider / Business Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={metadata.provider_name || ''}
                                                        onChange={(e) => setMetadata({ ...metadata, provider_name: e.target.value })}
                                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                        placeholder="Your name or business name"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* FOOD SERVICE FIELDS */}
                                {selectedCategory?.layout_type === 'service' && selectedCategory?.category_key?.includes('food') && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-orange-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Food Service Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Cuisine Type *
                                                </label>
                                                <select
                                                    name="cuisine_type"
                                                    value={metadata.cuisine_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, cuisine_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select cuisine...</option>
                                                    <option value="caribbean">Caribbean</option>
                                                    <option value="american">American</option>
                                                    <option value="mexican">Mexican</option>
                                                    <option value="asian">Asian</option>
                                                    <option value="italian">Italian</option>
                                                    <option value="mediterranean">Mediterranean</option>
                                                    <option value="vegan">Vegan/Vegetarian</option>
                                                    <option value="fusion">Fusion</option>
                                                    <option value="seafood">Seafood</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Price Range
                                                </label>
                                                <select
                                                    name="price_range"
                                                    value={metadata.price_range || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, price_range: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select range...</option>
                                                    <option value="budget">Budget ($ - Under $10)</option>
                                                    <option value="moderate">Moderate ($ - $10-$25)</option>
                                                    <option value="upscale">Upscale ($$ - $25-$50)</option>
                                                    <option value="fine-dining">Fine Dining ($$ - $50+)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Dietary Options
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={metadata.dietary_options?.includes(option) || false}
                                                                onChange={(e) => {
                                                                    const current = metadata.dietary_options || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, option]
                                                                        : current.filter((d: string) => d !== option);
                                                                    setMetadata({ ...metadata, dietary_options: updated });
                                                                }}
                                                                className="w-4 h-4 text-teal-600 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-slate-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Seating Capacity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={metadata.seating_capacity || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, seating_capacity: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Ambiance
                                                </label>
                                                <select
                                                    name="ambiance"
                                                    value={metadata.ambiance || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, ambiance: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select ambiance...</option>
                                                    <option value="casual">Casual / Family-Friendly</option>
                                                    <option value="cozy">Cozy / Intimate</option>
                                                    <option value="upscale">Upscale / Elegant</option>
                                                    <option value="outdoor">Outdoor / Patio</option>
                                                    <option value="fast-casual">Fast Casual</option>
                                                    <option value="food-court">Food Court / Counter Service</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Payment Methods
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Cash', 'Card', 'Mobile Pay', 'Online'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-teal-50 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={metadata.payment_methods?.includes(option) || false}
                                                                onChange={(e) => {
                                                                    const current = metadata.payment_methods || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, option]
                                                                        : current.filter((d: string) => d !== option);
                                                                    setMetadata({ ...metadata, payment_methods: updated });
                                                                }}
                                                                className="w-4 h-4 text-teal-600 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-slate-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* RENTAL FIELDS (rentals have layout_type=service but rental category_key) */}
                                {(selectedCategory?.layout_type === 'service' && selectedCategory?.category_key?.includes('rental')) && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-green-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Rental Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Vehicle-specific for vehicle rentals */}
                                            {selectedCategory?.category_key?.includes('vehicle') && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                        Vehicle Type *
                                                    </label>
                                                    <select
                                                        name="vehicle_type"
                                                        value={metadata.vehicle_type || ''}
                                                        onChange={(e) => setMetadata({ ...metadata, vehicle_type: e.target.value })}
                                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    >
                                                        <option value="">Select type...</option>
                                                        <option value="car">Car / Sedan</option>
                                                        <option value="suv">SUV</option>
                                                        <option value="truck">Truck</option>
                                                        <option value="motorcycle">Motorcycle</option>
                                                        <option value="scooter">Scooter / Moped</option>
                                                        <option value="bicycle">Bicycle</option>
                                                        <option value="rv">RV / Camper</option>
                                                        <option value="van">Van</option>
                                                    </select>
                                                </div>
                                            )}
                                            {/* Property-specific for property rentals */}
                                            {selectedCategory?.category_key?.includes('property') && (
                                                <>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                            Property Type *
                                                        </label>
                                                        <select
                                                            name="property_type"
                                                            value={metadata.property_type || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, property_type: e.target.value })}
                                                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                        >
                                                            <option value="">Select type...</option>
                                                            <option value="apartment">Apartment</option>
                                                            <option value="house">House</option>
                                                            <option value="villa">Villa</option>
                                                            <option value="cottage">Cottage</option>
                                                            <option value="studio">Studio</option>
                                                            <option value="room">Private Room</option>
                                                            <option value="guesthouse">Guesthouse</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                            Bedrooms
                                                        </label>
                                                        <select
                                                            name="bedrooms"
                                                            value={metadata.bedrooms || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, bedrooms: e.target.value })}
                                                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                        >
                                                            <option value="">Select...</option>
                                                            <option value="studio">Studio</option>
                                                            <option value="1">1 Bedroom</option>
                                                            <option value="2">2 Bedrooms</option>
                                                            <option value="3">3 Bedrooms</option>
                                                            <option value="4">4+ Bedrooms</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                            Bathrooms
                                                        </label>
                                                        <select
                                                            name="bathrooms"
                                                            value={metadata.bathrooms || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, bathrooms: e.target.value })}
                                                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                        >
                                                            <option value="">Select...</option>
                                                            <option value="1">1 Bathroom</option>
                                                            <option value="2">2 Bathrooms</option>
                                                            <option value="3">3+ Bathrooms</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                            Max Guests
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={metadata.max_guests || ''}
                                                            onChange={(e) => setMetadata({ ...metadata, max_guests: e.target.value })}
                                                            className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                            placeholder="e.g., 4"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                            {/* Equipment-specific for equipment rentals */}
                                            {selectedCategory?.category_key?.includes('equipment') && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                        Equipment Category *
                                                    </label>
                                                    <select
                                                        name="equipment_category"
                                                        value={metadata.equipment_category || ''}
                                                        onChange={(e) => setMetadata({ ...metadata, equipment_category: e.target.value })}
                                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    >
                                                        <option value="">Select category...</option>
                                                        <option value="power-tools">Power Tools</option>
                                                        <option value="hand-tools">Hand Tools</option>
                                                        <option value="gardening">Gardening Equipment</option>
                                                        <option value="construction">Construction Equipment</option>
                                                        <option value="party">Party & Event Equipment</option>
                                                        <option value="sports">Sports Equipment</option>
                                                        <option value="audio">Audio/Visual Equipment</option>
                                                    </select>
                                                </div>
                                            )}
                                            {/* Boat-specific for boat rentals */}
                                            {selectedCategory?.category_key?.includes('boat') && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                        Watercraft Type *
                                                    </label>
                                                    <select
                                                        name="watercraft_type"
                                                        value={metadata.watercraft_type || ''}
                                                        onChange={(e) => setMetadata({ ...metadata, watercraft_type: e.target.value })}
                                                        className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    >
                                                        <option value="">Select type...</option>
                                                        <option value="speedboat">Speedboat</option>
                                                        <option value="sailboat">Sailboat</option>
                                                        <option value="catamaran">Catamaran</option>
                                                        <option value="yacht">Yacht</option>
                                                        <option value="jetski">Jet Ski</option>
                                                        <option value="kayak">Kayak / Canoe</option>
                                                        <option value="paddleboard">Paddleboard</option>
                                                        <option value="fishing">Fishing Boat</option>
                                                    </select>
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Rental Duration *
                                                </label>
                                                <select
                                                    name="rental_duration"
                                                    value={metadata.rental_duration || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, rental_duration: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select duration...</option>
                                                    <option value="hourly">Hourly</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Min. Rental Period
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={metadata.min_rental_period || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, min_rental_period: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 1"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Max. Rental Period
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={metadata.max_rental_period || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, max_rental_period: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 30"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Security Deposit
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={metadata.security_deposit || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, security_deposit: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 100.00"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Mileage / Usage Limit
                                                </label>
                                                <input
                                                    type="text"
                                                    value={metadata.usage_limit || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, usage_limit: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 100 miles/day"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TOUR FIELDS (tours have layout_type=service but tour category_key) */}
                                {(selectedCategory?.layout_type === 'service' && selectedCategory?.category_key?.includes('tour')) && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-cyan-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Tour Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Tour Type *
                                                </label>
                                                <select
                                                    name="tour_type"
                                                    value={metadata.tour_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, tour_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select type...</option>
                                                    <option value="general">General / Shared (Group tour with other participants)</option>
                                                    <option value="private">Private (Exclusive experience for your group)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Tour Duration *
                                                </label>
                                                <select
                                                    name="tour_duration"
                                                    value={metadata.tour_duration || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, tour_duration: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select duration...</option>
                                                    <option value="short">Short (1-2 hours)</option>
                                                    <option value="half-day">Half Day (3-5 hours)</option>
                                                    <option value="full-day">Full Day (6-8 hours)</option>
                                                    <option value="multi-day">Multi-Day</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Group Size
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={metadata.max_group_size || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, max_group_size: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 10"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Difficulty Level
                                                </label>
                                                <select
                                                    name="difficulty_level"
                                                    value={metadata.difficulty_level || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, difficulty_level: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select level...</option>
                                                    <option value="easy">Easy - All fitness levels</option>
                                                    <option value="moderate">Moderate - Some walking</option>
                                                    <option value="strenuous">Strenuous - Physical activity</option>
                                                    <option value="expert">Expert - High fitness required</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Inclusions (What's Included)
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Meals', 'Drinks', 'Equipment', 'Guide', 'Transportation', 'Photos/Video', 'Entrance Fees', 'Insurance'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-xl cursor-pointer hover:bg-teal-100 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={metadata.tour_inclusions?.includes(option) || false}
                                                                onChange={(e) => {
                                                                    const current = metadata.tour_inclusions || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, option]
                                                                        : current.filter((d: string) => d !== option);
                                                                    setMetadata({ ...metadata, tour_inclusions: updated });
                                                                }}
                                                                className="w-4 h-4 text-teal-600 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-slate-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Non-Inclusions (What's NOT Included)
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Gratuities/Tips', 'Personal Expenses', 'Souvenirs', 'Alcoholic Drinks', 'Optional Activities', 'Travel Insurance'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-colors">
                                                            <input
                                                                type="checkbox"
                                                                checked={metadata.tour_non_inclusions?.includes(option) || false}
                                                                onChange={(e) => {
                                                                    const current = metadata.tour_non_inclusions || [];
                                                                    const updated = e.target.checked
                                                                        ? [...current, option]
                                                                        : current.filter((d: string) => d !== option);
                                                                    setMetadata({ ...metadata, tour_non_inclusions: updated });
                                                                }}
                                                                className="w-4 h-4 text-amber-600 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-slate-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Pickup Location
                                                </label>
                                                <input
                                                    type="text"
                                                    value={metadata.tour_pickup || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, tour_pickup: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., Hotel lobby or specified address"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Schedule
                                                </label>
                                                <select
                                                    name="tour_schedule"
                                                    value={metadata.tour_schedule || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, tour_schedule: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select schedule...</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="bi-weekly">Bi-Weekly</option>
                                                    <option value="weekends">Weekends Only</option>
                                                    <option value="custom">Custom Schedule</option>
                                                    <option value="on-demand">On Demand (Book anytime)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* DIGITAL PRODUCT FIELDS */}
                                {selectedCategory?.layout_type === 'digital' && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Digital Product Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Download Type *
                                                </label>
                                                <select
                                                    name="download_type"
                                                    value={metadata.download_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, download_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select type...</option>
                                                    <option value="permanent">Permanent Download</option>
                                                    <option value="subscription">Subscription Access</option>
                                                    <option value="time-limited">Time-Limited Access</option>
                                                    <option value="stream">Streaming Only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    File Format
                                                </label>
                                                <select
                                                    name="file_format"
                                                    value={metadata.file_format || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, file_format: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select format...</option>
                                                    <option value="pdf">PDF</option>
                                                    <option value="video">Video (MP4)</option>
                                                    <option value="audio">Audio (MP3)</option>
                                                    <option value="ebook">eBook (EPUB)</option>
                                                    <option value="software">Software</option>
                                                    <option value="bundle">Bundle/Multiple</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Access Duration
                                                </label>
                                                <input
                                                    type="text"
                                                    value={metadata.access_duration || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, access_duration: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., Lifetime, 30 days"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    File Size
                                                </label>
                                                <input
                                                    type="text"
                                                    value={metadata.file_size || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, file_size: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 50MB"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* PHYSICAL PRODUCT FIELDS */}
                                {selectedCategory?.layout_type === 'product' && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-amber-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Product Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Brand / Manufacturer
                                                </label>
                                                <input
                                                    type="text"
                                                    value={metadata.brand || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, brand: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., Nike, Samsung, Local Craft"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Condition *
                                                </label>
                                                <select
                                                    name="condition"
                                                    value={metadata.condition || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, condition: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select condition...</option>
                                                    <option value="new">New - Never Used</option>
                                                    <option value="like-new">Like New - Minimal Signs of Use</option>
                                                    <option value="good">Good - Minor Wear</option>
                                                    <option value="fair">Fair - Visible Wear</option>
                                                    <option value="vintage">Vintage / Antique</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Target Age Group
                                                </label>
                                                <select
                                                    name="age_group"
                                                    value={metadata.age_group || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, age_group: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select age group...</option>
                                                    <option value="all">All Ages</option>
                                                    <option value="infant">Infant (0-12 months)"</option>
                                                    <option value="toddler">Toddler (1-3 years)"</option>
                                                    <option value="child">Child (4-12 years)"</option>
                                                    <option value="teen">Teen (13-19 years)"</option>
                                                    <option value="adult">Adult (20-59 years)"</option>
                                                    <option value="senior">Senior (60+ years)"</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Shipping Available
                                                </label>
                                                <select
                                                    name="shipping_available"
                                                    value={metadata.shipping_available || 'yes'}
                                                    onChange={(e) => setMetadata({ ...metadata, shipping_available: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="yes">Yes - Shipping Available</option>
                                                    <option value="no">No - Local Pickup Only</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Stock Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={metadata.stock_quantity || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, stock_quantity: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                                    Weight (kg)
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={metadata.weight_kg || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, weight_kg: e.target.value })}
                                                    className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 0.5"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {formData.subtype_id && (
                                    <DynamicProductForm
                                        subtypeId={formData.subtype_id}
                                        metadata={metadata}
                                        onChange={setMetadata}
                                    />
                                )}

                                {/* Media Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-2 h-8 bg-blue-500 rounded-full" />
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Gallery</h3>
                                    </div>
                                    <MediaManager initialMedia={files} onChange={setFiles} maxFiles={15} />
                                </div>

                                <div className="flex gap-6 pt-10">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="px-10 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black transition-all hover:bg-slate-200 hover:text-slate-600"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 px-12 py-5 bg-teal-600 text-white rounded-2xl font-black text-xl shadow-2xl shadow-teal-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        {loading ? 'Publishing...' : '🚀 Publish Now'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
