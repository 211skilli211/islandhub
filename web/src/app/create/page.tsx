'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import DynamicProductForm from '@/components/marketplace/DynamicProductForm';
import MediaManager, { MediaItem } from '@/components/admin/shared/MediaManager';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

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
        icon: 'ğŸ“¦',
        requires_verification: false
    },
    {
        type_key: 'digital',
        display_name: 'Digital Product',
        description: 'Downloadable files, courses, or media',
        icon: 'ğŸ’¾',
        requires_verification: false
    },
    {
        type_key: 'custom',
        display_name: 'Custom Type',
        description: 'Request a new product category (requires admin approval)',
        icon: 'âœ¨',
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
            <main className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="text-center p-12 bg-surface-elevated rounded-[3rem] shadow-2xl">
                    <EmojiIcon emoji="ğŸ”" size={48} className="text-6xl mb-6 animate-bounce" />
                    <h2 className="text-3xl font-black text-ink-primary mb-4 tracking-tight italic">Verify Your Vendor Status</h2>
                    <p className="text-ink-tertiary font-medium mb-8">Accessing the creation hub requires an active vendor subscription.</p>
                    <button onClick={() => router.push('/become-vendor')} className="px-10 py-4 bg-(--success-primary,#10b981) text-white! rounded-2xl font-black shadow-xl shadow-accent-500/10 transition-all hover:scale-105 active:scale-95">Become a Vendor <EmojiIcon emoji="ğŸš€" size={16} /></button>
                </div>
            </main>
        );
    }

    // Get current store info
    const currentStore = stores.find(s => (s.store_id || s.id) === activeStoreId);
    const storeName = currentStore?.name || (stores.length > 0 ? stores[0].name : 'Your Store');

    return (
        <main className="min-h-screen bg-surface-primary">
            
            {step === 'productType' && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-accent-500/10 px-6 py-3 rounded-full mb-8">
                            <EmojiIcon emoji="ğŸª" size={24} className="text-2xl" />
                            <span className="font-bold text-accent-500">Adding to: {storeName}</span>
                        </div>
                        <h1 className="text-5xl font-black text-ink-primary mb-6 tracking-tight italic">What type of product are you creating?</h1>
                        <p className="text-xl text-ink-tertiary max-w-2xl mx-auto font-medium">Select the type that best describes your offering. Custom types require admin verification.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PRODUCT_TYPES.filter(t => t.type_key !== 'custom').map(type => (
                            <button
                                key={type.type_key}
                                onClick={() => handleProductTypeSelect(type)}
                                className="group relative bg-surface-elevated p-8 rounded-[2.5rem] shadow-xl shadow-black/10/50 hover:shadow-2xl hover:shadow-accent-500/10/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left"
                            >
                                <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {type.icon}
                                </div>
                                <h3 className="text-xl font-black text-ink-primary mb-2 capitalize">{type.display_name}</h3>
                                <p className="text-ink-tertiary font-medium text-sm">{type.description}</p>
                            </button>
                        ))}

                        
                        <button
                            onClick={() => handleProductTypeSelect(PRODUCT_TYPES.find(t => t.type_key === 'custom')!)}
                            className="group relative bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-[2.5rem] shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:shadow-amber-100/50 transition-all hover:-translate-y-2 border-2 border-sand-500/20 hover:border-amber-300 text-left"
                        >
                            <div className="w-16 h-16 bg-sand-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                âœ¨
                            </div>
                            <h3 className="text-xl font-black text-sand-600 mb-2">Custom Type</h3>
                            <p className="text-sand-500 font-medium text-sm mb-3">Request a new product category</p>
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-sand-500/15 rounded-full text-xs font-bold text-sand-500">
                                <span>â³</span> Requires Admin Approval
                            </div>
                        </button>
                    </div>
                </div>
            )}

            
            {step === 'custom' && productType?.type_key === 'custom' && (
                <div className="max-w-2xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-ink-tertiary hover:text-ink-secondary font-bold transition-colors"
                    >
                        <span>â†</span> Back to Product Types
                    </button>

                    <div className="bg-surface-elevated rounded-[2.5rem] shadow-2xl shadow-black/10 border border-border-primary overflow-hidden">
                        <div className="p-8 md:p-12">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-sand-500/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                                    âœ¨
                                </div>
                                <h1 className="text-3xl font-black text-ink-primary tracking-tight italic">Request Custom Product Type</h1>
                                <p className="text-ink-tertiary mt-4">Tell us about the new product category you'd like to add. Our team will review your request.</p>
                            </div>

                            <form onSubmit={handleCustomTypeSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                        Custom Type Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={customTypeName}
                                        onChange={(e) => setCustomTypeName(e.target.value)}
                                        className="w-full px-8 py-5 bg-surface-primary border-transparent rounded-2xl text-ink-primary font-medium focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all"
                                        placeholder="e.g., Organic Fertilizer, Island Crafts..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                        Description / Justification *
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={customTypeDescription}
                                        onChange={(e) => setCustomTypeDescription(e.target.value)}
                                        className="w-full px-8 py-5 bg-surface-primary border-transparent rounded-2xl text-ink-primary font-medium focus:ring-2 focus:ring-amber-100 focus:border-amber-500 transition-all"
                                        placeholder="Explain why this category should be added..."
                                    />
                                </div>

                                <div className="bg-sand-500/5 p-6 rounded-2xl border border-sand-500/20">
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">â³</span>
                                        <div>
                                            <h4 className="font-bold text-sand-600 mb-1">Verification Required</h4>
                                            <p className="text-sm text-sand-500">Your custom type will be marked as "Pending Verification". You'll be notified once our team reviews your request.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={goBack}
                                        className="px-8 py-4 bg-surface-secondary text-ink-tertiary rounded-2xl font-black transition-all hover:bg-surface-tertiary hover:text-ink-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!customTypeName.trim()}
                                        className="flex-1 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-100 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Submit Request
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            
            {step === 'category' && creationType !== 'product' && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-accent-500/10 px-6 py-3 rounded-full mb-8">
                            <EmojiIcon emoji="ğŸª" size={24} className="text-2xl" />
                            <span className="font-bold text-accent-500">Adding to: {storeName}</span>
                        </div>
                        <h1 className="text-5xl font-black text-ink-primary mb-6 tracking-tight italic">What are you creating today?</h1>
                        <p className="text-xl text-ink-tertiary max-w-2xl mx-auto font-medium">Select the type of listing to add to the IslandHub ecosystem.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map(cat => (
                            <button
                                key={cat.category_id}
                                disabled={vendorData?.category_id && vendorData.category_id !== cat.category_id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`group relative bg-surface-elevated p-8 rounded-[2.5rem] shadow-xl shadow-black/10/50 hover:shadow-2xl hover:shadow-accent-500/10/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon || 'âœ¨'}
                                </div>
                                <h3 className="text-2xl font-black text-ink-primary mb-2 capitalize">{cat.display_name}</h3>
                                <p className="text-ink-tertiary font-medium">{cat.description || `Create a new ${cat.display_name} listing.`}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            
            {step === 'form' && productType && !selectedCategory && (
                <div className="max-w-7xl mx-auto px-4 py-20">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-ink-tertiary hover:text-ink-secondary font-bold transition-colors"
                    >
                        <span>â†</span> Back to Product Types
                    </button>

                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-accent-500/10 px-6 py-3 rounded-full mb-8">
                            <EmojiIcon emoji="ğŸª" size={24} className="text-2xl" />
                            <span className="font-bold text-accent-500">Adding to: {storeName}</span>
                            <span className="text-accent-400">-</span>
                            <span className="text-lg">{productType.icon}</span>
                            <span className="font-bold text-accent-500">{productType.display_name}</span>
                        </div>
                        <h1 className="text-5xl font-black text-ink-primary mb-6 tracking-tight italic">Select a Category</h1>
                        <p className="text-xl text-ink-tertiary max-w-2xl mx-auto font-medium">Choose the category that best fits your {productType.display_name.toLowerCase()}.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {categories.map(cat => (
                            <button
                                key={cat.category_id}
                                disabled={vendorData?.category_id && vendorData.category_id !== cat.category_id}
                                onClick={() => handleCategorySelect(cat)}
                                className={`group relative bg-surface-elevated p-8 rounded-[2.5rem] shadow-xl shadow-black/10/50 hover:shadow-2xl hover:shadow-accent-500/10/50 transition-all hover:-translate-y-2 border-2 border-transparent hover:border-teal-100 text-left disabled:opacity-30 disabled:cursor-not-allowed`}
                            >
                                <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                                    {cat.icon || 'âœ¨'}
                                </div>
                                <h3 className="text-2xl font-black text-ink-primary mb-2 capitalize">{cat.display_name}</h3>
                                <p className="text-ink-tertiary font-medium">{cat.description || `Create a new ${cat.display_name} listing.`}</p>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            
            {step === 'form' && selectedCategory && (
                <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in slide-in-from-bottom-8 duration-500">
                    <button
                        onClick={goBack}
                        className="mb-8 flex items-center gap-2 text-ink-tertiary hover:text-ink-secondary font-bold transition-colors"
                    >
                        <span>â†</span> Back to {productType ? 'Product Types' : 'Categories'}
                    </button>

                    <div className="bg-surface-elevated rounded-4xl md:rounded-[3rem] shadow-2xl shadow-black/10 border border-border-primary overflow-hidden">
                        <div className="p-6 md:p-12">
                            <div className="flex items-center justify-between mb-12">
                                <div>
                                    <h1 className="text-4xl font-black text-ink-primary tracking-tight italic">
                                        Create {selectedCategory.display_name}
                                    </h1>
                                    <p className="text-ink-tertiary font-bold uppercase tracking-widest text-xs mt-2">
                                        Category: {selectedCategory.display_name}
                                        {productType && (
                                            <span className="ml-2">
                                                - {productType.icon} {productType.display_name}
                                            </span>
                                        )}
                                        {formData.metadata?.custom_type_status === 'pending_verification' && (
                                            <span className="ml-2 text-sand-500">
                                                - â³ Custom Type Pending
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-accent-500/10 rounded-2xl flex items-center justify-center text-3xl">
                                    {selectedCategory.icon || 'âœ¨'}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">Listing Title</label>
                                        <input
                                            required
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-surface-primary border-transparent rounded-2xl text-ink-primary font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="e.g. Unique Island Experience"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                            Price ($)
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-surface-primary border-transparent rounded-2xl text-ink-primary font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    
                                    {stores.length > 1 && (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                Select Destination Store
                                            </label>
                                            <select
                                                name="store_id"
                                                value={formData.store_id || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, store_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                                                className="w-full px-8 py-5 bg-accent-500/10 border-2 border-teal-100 rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                required
                                            >
                                                <option value="">Which store does this belong to?</option>
                                                {stores.map(store => (
                                                    <option key={store.store_id || store.id} value={store.store_id || store.id}>
                                                        {store.name} ({store.category})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-accent-400 ml-4 font-black uppercase tracking-widest opacity-60">
                                                ğŸ“ You have multiple stores. Please select the correct one.
                                            </p>
                                        </div>
                                    )}

                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                            Specific Type
                                        </label>
                                        {vendorData?.subtype_id ? (
                                            <div className="w-full px-8 py-5 bg-surface-secondary border-transparent rounded-2xl text-ink-tertiary font-black cursor-not-allowed">
                                                {selectedCategory.subtypes?.find(s => s.subtype_id === vendorData.subtype_id)?.display_name || 'Fixed Type'}
                                            </div>
                                        ) : (
                                            <select
                                                name="subtype_id"
                                                value={formData.subtype_id || ''}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subtype_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                                                className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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

                                    
                                    {selectedCategory?.layout_type === 'service' && !selectedCategory?.category_key?.includes('food') ? (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                Service Modes
                                            </label>
                                            <select
                                                multiple
                                                value={formData.service_type}
                                                onChange={handleServiceTypeChange}
                                                className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                style={{ minHeight: '120px' }}
                                            >
                                                <option value="onsite"><EmojiIcon emoji="ğŸ " size={16} /> On-site (I travel to customer)</option>
                                                <option value="remote"><EmojiIcon emoji="ğŸ’»" size={16} /> Remote (Online/Virtual)</option>
                                                <option value="appointment"><EmojiIcon emoji="ğŸ“…" size={16} /> By Appointment Only</option>
                                                <option value="emergency"><EmojiIcon emoji="ğŸš¨" size={16} /> Emergency Service Available</option>
                                                <option value="scheduled"><EmojiIcon emoji="ğŸ“†" size={16} /> Scheduled Visits</option>
                                            </select>
                                            <p className="text-[10px] text-ink-tertiary ml-4 font-medium">
                                                Hold Ctrl/Cmd to select multiple service modes
                                            </p>
                                        </div>
                                    ) : selectedCategory?.layout_type === 'service' ? (
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                Service Modes
                                            </label>
                                            <select
                                                multiple
                                                value={formData.service_type}
                                                onChange={handleServiceTypeChange}
                                                className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                style={{ minHeight: '120px' }}
                                            >
                                                <option value="walkin"><EmojiIcon emoji="ğŸš¶" size={16} /> Walk-in (Customer walks in)</option>
                                                <option value="delivery"><EmojiIcon emoji="ğŸš—" size={16} /> Delivery (Delivery service)</option>
                                                <option value="takeout"><EmojiIcon emoji="ğŸ“¦" size={16} /> Takeout (Takeout service)</option>
                                                <option value="dining"><EmojiIcon emoji="ğŸ½ï¸" size={16} /> Dining (Dine-in service)</option>
                                                <option value="reservations"><EmojiIcon emoji="ğŸ“…" size={16} /> Reservations (Reservation-based)</option>
                                            </select>
                                            <p className="text-[10px] text-ink-tertiary ml-4 font-medium">
                                                Hold Ctrl/Cmd to select multiple service modes
                                            </p>
                                        </div>
                                    ) : null}

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">Detailed Description</label>
                                        <textarea
                                            required
                                            name="description"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleChange}
                                            className="w-full px-8 py-5 bg-surface-primary border-transparent rounded-2xl text-ink-primary font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                            placeholder="Tell your customers more about this offering..."
                                        />
                                    </div>
                                </div>

                                

                                
                                {selectedCategory?.layout_type === 'service' && !selectedCategory?.category_key?.includes('food') && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-teal-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-ink-primary tracking-tight italic">Service Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Provider Type *
                                                </label>
                                                <select
                                                    name="provider_type"
                                                    value={metadata.provider_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, provider_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select type...</option>
                                                    <option value="store">Store / Business (Established establishment)</option>
                                                    <option value="individual">Independent Provider (Individual contractor)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Service Area *
                                                </label>
                                                <select
                                                    name="service_area"
                                                    value={metadata.service_area || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, service_area: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Experience Level *
                                                </label>
                                                <select
                                                    name="experience_level"
                                                    value={metadata.experience_level || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, experience_level: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Response Time *
                                                </label>
                                                <select
                                                    name="response_time"
                                                    value={metadata.response_time || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, response_time: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Pricing Model *
                                                </label>
                                                <select
                                                    name="pricing_model"
                                                    value={metadata.pricing_model || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, pricing_model: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                    required
                                                >
                                                    <option value="">Select pricing...</option>
                                                    <option value="hourly">Hourly Rate</option>
                                                    <option value="fixed">Fixed Project Rate</option>
                                                    <option value="consultation">Consultation Fee</option>
                                                    <option value="custom">Custom Quote</option>
                                                </select>
                                            </div>
                                            
                                            {metadata.provider_type === 'individual' && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                        Provider / Business Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={metadata.provider_name || ''}
                                                        onChange={(e) => setMetadata({ ...metadata, provider_name: e.target.value })}
                                                        className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                        placeholder="Your name or business name"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                
                                {selectedCategory?.layout_type === 'service' && selectedCategory?.category_key?.includes('food') && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-orange-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-ink-primary tracking-tight italic">Food Service Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Cuisine Type *
                                                </label>
                                                <select
                                                    name="cuisine_type"
                                                    value={metadata.cuisine_type || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, cuisine_type: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Price Range
                                                </label>
                                                <select
                                                    name="price_range"
                                                    value={metadata.price_range || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, price_range: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
                                                >
                                                    <option value="">Select range...</option>
                                                    <option value="budget">Budget ($ - Under $10)</option>
                                                    <option value="moderate">Moderate ($ - $10-$25)</option>
                                                    <option value="upscale">Upscale ($$ - $25-$50)</option>
                                                    <option value="fine-dining">Fine Dining ($$ - $50+)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Dietary Options
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-surface-primary rounded-xl cursor-pointer hover:bg-accent-500/10 transition-colors">
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
                                                                className="w-4 h-4 text-accent-400 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-ink-secondary">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Seating Capacity
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={metadata.seating_capacity || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, seating_capacity: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                                    placeholder="e.g., 50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Ambiance
                                                </label>
                                                <select
                                                    name="ambiance"
                                                    value={metadata.ambiance || ''}
                                                    onChange={(e) => setMetadata({ ...metadata, ambiance: e.target.value })}
                                                    className="w-full px-8 py-5 bg-surface-primary border-2 border-transparent rounded-2xl text-ink-primary font-bold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none"
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
                                                <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                    Payment Methods
                                                </label>
                                                <div className="flex flex-wrap gap-2 px-4">
                                                    {['Cash', 'Card', 'Mobile Pay', 'Online'].map(option => (
                                                        <label key={option} className="flex items-center gap-2 px-4 py-2 bg-surface-primary rounded-xl cursor-pointer hover:bg-accent-500/10 transition-colors">
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
                                                                className="w-4 h-4 text-accent-400 rounded"
                                                            />
                                                            <span className="text-sm font-bold text-ink-secondary">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                
                                {(selectedCategory?.layout_type === 'service' && selectedCategory?.category_key?.includes('rental')) && (
                                    <div className="md:col-span-2">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-8 bg-green-500 rounded-full" />
                                            <h3 className="text-2xl font-black text-ink-primary tracking-tight italic">Rental Details</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {selectedCategory?.category_key?.includes('vehicle') && (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-ink-tertiary ml-4">
                                                        Vehicle Type *
                                                    </label>
                                                    <select
                                                        name="vehicle_type"
                                                        value={metadata.vehicle_type || ''}
                                                        onChange={(e) => setMetadat'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import toast from '@/lib/toast';
import dynamic from 'next/dynamic';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

// Dynamic Imports for Heavy Chart Components
const RevenueChart = dynamic(() => import('@/components/charts/RevenueChart'), {
    loading: () => <div className="h-full w-full bg-surface-primary animate-pulse rounded-2xl" />,
    ssr: false
});

const OrderStatusChart = dynamic(() => import('@/components/charts/OrderStatusChart'), {
    loading: () => <div className="h-full w-full bg-surface-primary animate-pulse rounded-full" />,
    ssr: false
});

interface DashboardStats {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    avg_order_value: number;
    revenue_7d: number;
    revenue_30d: number;
    orders_7d: number;
    orders_30d: number;
    pending_orders: number;
    processing_orders: number;
    completed_orders: number;
}

interface SalesData {
    date: string;
    revenue: number;
    orders: number;
    customers: number;
}

interface TopProduct {
    listing_id: number;
    product_name: string;
    units_sold: number;
    revenue: number;
    avg_rating: number;
}

interface OrderStatus {
    status: string;
    order_count: number;
    total_amount: number;
}

interface CustomerStats {
    total_customers: number;
    new_customers: number;
    returning_customers: number;
    avg_customer_value: number;
}

export default function VendorAnalyticsDashboard() {
    const { user } = useAuthStore();
    const [timeRange, setTimeRange] = useState(30);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [orderStatus, setOrderStatus] = useState<OrderStatus[]>([]);
    const [customerStats, setCustomerStats] = useState<CustomerStats | null>(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);

            const [statsRes, salesRes, productsRes, statusRes, customersRes] = await Promise.all([
                api.get('/analytics/vendor/dashboard'),
                api.get(`/analytics/vendor/sales-chart?days=${timeRange}`),
                api.get(`/analytics/vendor/top-products?days=${timeRange}&limit=10`),
                api.get('/analytics/vendor/order-status'),
                api.get(`/analytics/vendor/customers?days=${timeRange}`)
            ]);

            setStats(statsRes.data.data);
            setSalesData(salesRes.data.data);
            setTopProducts(productsRes.data.data);
            setOrderStatus(statusRes.data.data);
            setCustomerStats(customersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            toast.error('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    // Chart data preparation
    const revenueChartData = {
        labels: salesData.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Revenue',
                data: salesData.map(d => d.revenue),
                borderColor: 'rgb(13, 148, 136)',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Orders',
                data: salesData.map(d => d.orders * 10), // Scale for visibility
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                yAxisID: 'y1',
            }
        ]
    };

    const orderStatusData = {
        labels: orderStatus.map(s => s.status.replace(/_/g, ' ').toUpperCase()),
        datasets: [{
            data: orderStatus.map(s => s.order_count),
            backgroundColor: [
                'rgb(234, 179, 8)',  // yellow - pending
                'rgb(59, 130, 246)', // blue - paid/processing
                'rgb(34, 197, 94)',  // green - completed
                'rgb(239, 68, 68)',  // red - cancelled
            ],
        }]
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-primary py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-ink-primary">Analytics Dashboard</h1>
                        <p className="text-ink-secondary mt-1">Track your store performance and insights</p>
                    </div>

                    
                    <div className="flex gap-2">
                        {[7, 30, 90].map(days => (
                            <button
                                key={days}
                                onClick={() => setTimeRange(days)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${timeRange === days
                                        ? 'bg-accent-500 text-white'
                                        : 'bg-surface-elevated text-ink-secondary hover:bg-surface-secondary'
                                    }`}
                            >
                                {days} Days
                            </button>
                        ))}
                    </div>
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-ink-tertiary uppercase tracking-wider">Total Revenue</h3>
                            <EmojiIcon emoji="ğŸ’°" size={24} className="text-2xl" />
                        </div>
                        <p className="text-3xl font-bold text-ink-primary">
                            ${stats?.total_revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                        </p>
                        <p className="text-sm text-accent-400 mt-2 font-medium">
                            +${stats?.revenue_30d?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'} (30d)
                        </p>
                    </div>

                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-ink-tertiary uppercase tracking-wider">Total Orders</h3>
                            <EmojiIcon emoji="ğŸ“¦" size={24} className="text-2xl" />
                        </div>
                        <p className="text-3xl font-bold text-ink-primary">{stats?.total_orders || 0}</p>
                        <p className="text-sm text-accent-400 mt-2 font-medium">
                            +{stats?.orders_30d || 0} (30d)
                        </p>
                    </div>

                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-ink-tertiary uppercase tracking-wider">Avg Order Value</h3>
                            <EmojiIcon emoji="ğŸ“Š" size={24} className="text-2xl" />
                        </div>
                        <p className="text-3xl font-bold text-ink-primary">
                            ${stats?.avg_order_value?.toFixed(2) || '0.00'}
                        </p>
                        <p className="text-sm text-ink-tertiary mt-2">Per transaction</p>
                    </div>

                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-ink-tertiary uppercase tracking-wider">Customers</h3>
                            <EmojiIcon emoji="ğŸ‘¥" size={24} className="text-2xl" />
                        </div>
                        <p className="text-3xl font-bold text-ink-primary">{customerStats?.total_customers || 0}</p>
                        <p className="text-sm text-accent-400 mt-2 font-medium">
                            +{customerStats?.new_customers || 0} new ({timeRange}d)
                        </p>
                    </div>
                </div>

                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-yellow-700">{stats?.pending_orders || 0}</p>
                        <p className="text-sm text-yellow-600 font-medium">Pending Orders</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-blue-700">{stats?.processing_orders || 0}</p>
                        <p className="text-sm text-blue-600 font-medium">Processing</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-green-700">{stats?.completed_orders || 0}</p>
                        <p className="text-sm text-green-600 font-medium">Completed</p>
                    </div>
                    <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl">
                        <p className="text-2xl font-bold text-teal-700">
                            ${(stats?.revenue_7d || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-teal-600 font-medium">Revenue (7d)</p>
                    </div>
                </div>

                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    
                    <div className="lg:col-span-2 bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <h2 className="text-xl font-bold text-ink-primary mb-6">Revenue & Orders Trend</h2>
                        <div className="h-80 w-full">
                            <RevenueChart data={revenueChartData} />
                        </div>
                    </div>

                    
                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <h2 className="text-xl font-bold text-ink-primary mb-6">Order Status</h2>
                        <div className="h-64 w-full">
                            <OrderStatusChart data={orderStatusData} />
                        </div>
                        <div className="mt-4 space-y-2">
                            {orderStatus.map(status => (
                                <div key={status.status} className="flex justify-between text-sm">
                                    <span className="text-ink-secondary capitalize">{status.status.replace(/_/g, ' ')}</span>
                                    <span className="font-bold text-ink-primary">{status.order_count} (${status.total_amount?.toFixed(2)})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                
                <div className="bg-surface-elevated rounded-2xl shadow-sm border border-border-primary overflow-hidden mb-8">
                    <div className="p-6 border-b border-border-primary">
                        <h2 className="text-xl font-bold text-ink-primary">Top Performing Products</h2>
                        <p className="text-sm text-ink-secondary mt-1">Based on revenue (Last {timeRange} days)</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-surface-primary">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-ink-tertiary uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-ink-tertiary uppercase tracking-wider">Units Sold</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-ink-tertiary uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-ink-tertiary uppercase tracking-wider">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topProducts.map((product, index) => (
                                    <tr key={product.listing_id} className="hover:bg-surface-primary transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="w-8 h-8 rounded-full bg-accent-500/15 text-accent-400 font-bold flex items-center justify-center text-sm">
                                                    {index + 1}
                                                </span>
                                                <span className="font-semibold text-ink-primary">{product.product_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-ink-secondary">
                                            {product.units_sold}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-ink-primary">
                                            ${product.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <EmojiIcon emoji="â˜…" size={16} className="text-yellow-500" />
                                                <span className="font-bold text-ink-primary">{product.avg_rating?.toFixed(1) || '0.0'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {topProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-ink-tertiary">
                                            No sales data available for this period
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                
                {customerStats && (
                    <div className="bg-surface-elevated p-6 rounded-2xl shadow-sm border border-border-primary">
                        <h2 className="text-xl font-bold text-ink-primary mb-6">Customer Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-ink-primary">{customerStats.total_customers}</p>
                                <p className="text-sm text-ink-secondary mt-1">Total Customers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-accent-400">{customerStats.new_customers}</p>
                                <p className="text-sm text-ink-secondary mt-1">New ({timeRange}d)</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-blue-600">{customerStats.returning_customers}</p>
                                <p className="text-sm text-ink-secondary mt-1">Returning</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-teal-600">
                                    ${customerStats.avg_customer_value?.toFixed(2)}
                                </p>
                                <p className="text-sm text-ink-secondary mt-1">Avg Customer Value</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
                                                                                                                                                                                                                                                                                                                                                                                                                    ä_Ï¥.˜ÓËrÓ]BTt'p>ôĞšĞë4;ç½KHãáWOCšü×ıº’_ø]•¾vG9znÁé_£šUãB^ŞŞ›—…õúb¿7¿n]Uãı¡õ‹h†ñªÙ=WŸ×5­;ÜhòÏMKi° •Tgæ¹]vËÈ±¹Ó\É±‚PÃ7ç]u¿Š.t››„†Bîaà‚¹S»Õ5–»01a†“Üõ5ÑZÔäme•fÏÔŞi—*Tá9Æ?•]¾¾¸W™l%PşQ>b&7Û&–{†ó¥šÒÙUeÀÏ
ww¨cÓnÍÉåGaíT2µÖ«¬Ãç9Q P$iºíYÙipê³yò€
ğã¨?çùÕ»Ø-,dm:k—PåPs¿$ô÷ÿ §¦Üé1ÌÉpDJßÅÉëœÑ`+Í§‰áûL³Ï±Û!ò6”é“èG”×wºmÉ°·¹YWn#Éu$õ5±=­œvïnÌn…˜+g>ÜzW8.¬-å[2lFÅiÍïšMª—6n¬–™0QÃıª‰õ•¼äÙ2Ì#Ø˜^üşWAæöqvªZHßhr]¼õ«÷Ú«i·€#2‘µçpõ”ÊÅNCÌÀ»ÜÌ„¿ÈF[ÒŸ£Ø^ÇÙöìy€Üçÿ <V¬÷‘ÜèQİ[D’C°^T¹=ë<™à•ãš@û‚àƒÂ“ÓüûĞXë»]:v·TbâLyŒàãğ÷Á¬™ïïšòæöŞ=îÁû¿…Z/c6¥$ş[!‹Á>µ:ªInïù2v¼9æÅ”Æ©v ‹°FYŸœà{…3ûN9 ’(®ŠÊ:®	õúõé'Óí$WÓ|íò¼7d¢–Ó¬¥’İdYYŞ½ı©”KtnãÔ-â™”‰£Ú‘£|©œÔWSj/o$ºâ \sœõëIg5Åœ±É«©s·©n„Õ-½Ô²5Ì±<xpB©9üMZ4­.+X´€´íŸ™·ü³^› è>Ò<1ÔaG\oÌÆI# ?…yÅ¼oqÜä/˜éQV®ï¡k}$»Gñåû~”>+Ô¿´u7ÎÍb…“id\Ç5šofŠØÛÉb%fP‘Ì[©î?*·ªiÚ„·’î¢ ŠÙÁÇóŞŸ§XBFŠİĞEWn»~µIh6vö–×Ù¬¤oLª§;[ÕLYÛù³ùÏç(Ã3 s×üú×K¢[EêWşUÂ)Úcş3Í`_IgtÂ+—\aÆÂ¯òª*;3>şõ[Í–â)%c&SË9\cŒ×ñ¨í´æ–Ö"ˆ¹“æqF:šÕ+¦hêñ[LÒ!`?•IöÛhÚ[ÀÓ»>æ CM!•¬Í¥º¤Ú„NQFkpzõ«ºjYØÍ=ä+ˆß˜œ‘Ö«/Ú‰ÕZ!€‚y<ş=¹šâÆBÖå]•Sæác­^À©mmbò[Z¤‘Ì~pÎ}OøÖMÿ Û®@dÄBs·=êÖ±ÑVpFü	Xó¼ÿ J¬·G§Ïcg&
äœô¡—Jñ0	lnë¶IãŠ¯dáuÖy"<ƒŒ ©µMÖIÊ¡‹*‚­Ş¾õ-…™{˜Ñ'#¢ï'FE 2])æIMÄ¥å2¸ëŸÿ U"éÚ½§mwìWo]Ùïş}©—ùwR…»b3ÃQŞ¯6½f±Å'Øä2"mI	ü2GëV•‰a¯éòi±#™]HÛ¹ûŸğªê×a{x®Ì²Ä¿7Êp£>½úŠµ$?h”ß™H2óú÷ªâúI­a4’>R3¸{Õ$Ø®ÈãÕ5[û0ÒŞä…~÷¿¿JÎ{«‰ŞI¡.£ •è3éùÕKX/4ûi%·¸óòøã£5j{£l‘˜çeˆ®âTÿ Ÿzµ &Eä>Yu¶0så1u;Õİ:×M¼³›ËºF”/Ê­ÆÓéüùª¯ecw
¨9,ùÆßJ-Ö`‡a.p°<j¢Š“MÅ¥ÈÛ¸g?Ş5<0ØùnVÌÁİÑsV­4è¤tJÅ#}¾cƒ’}³LÖ´ö²²‘aƒzåGËÜç×Ö¨%3-è33FÈHTí?_ÃùÕ¸dşÔe‚LD0Ùà°õîHª÷6ó‰¾fMÃiÎÿ ëUËS§<vzm«#——‚qØQa‹a%¢ Ù‘<_.æÙş×ùëM}GP²0İÅp’upvòY>ÕşÜ÷÷7Š‘`++¾Ø¥ÕFŒ¶¾E¬B%¸P£­ZV{²+½B÷U…¥ºya>u¿©'¹¦}”ëb)ÚØD"aæ4‚À}j¹»K)G’›m¸;S¬œŸj¹ä}¦8%ºYy>Bã„Ö™F”^$6Ö£Kdxg$+€V5Œ–‹rÖŸ2DÃ .wŒÔSYÚ†i^æPcrQ¹Áë‘OĞ¦µ‚LC‚ç3š¨Üì»I,$Ôí¼Ç"U À'¸¬A-ìVæFB±óŒc×ô®›A×­ô¨eÓ¦TtùŒdşxşu‹«K:Ç=±‰fáüÆˆt=i8&FVfvq—gÆ•nè­wØ0ùe<­îJğËƒÿ ê¬M¶¶Ò¥Ô°”f8!Æ}jw¼KØYÌé´ÿ .3Ğâ­+‚;}OÅï§h¶é0²©WFÈ ô#èk1<9©]Ü‹«mÂ&`î'pzV>›o­kc·&EÕQô9ş\WL­{kYÜÜy¤*§ qUŒÊÒï7\=»<lÈH}íÊàœÿ …7Ä"}mco24L‘ÖÉ_Çüõ¦^é¶öÌÆ’üI!<¿¨5NŞuöp¢ªBÅÕ‹cƒÛÖ©+‚e;C6—
×3+	Tn9ô'Šo—ouu4º}è“ˆ‡F#ÓÛgH‚6ÙÇ˜‘ÆJÆX÷nE2-¥§É#Ÿ“aİƒÎkD®]Êv¶úÌz{ŞÙÊÑ¿ü´NËE˜1ÜHuI	ˆÕùb;äıZÑ’k=íš¢Kz÷@ŸW°]N{Ø#É.ª¼Şõh
zÁ¼‹ÍD°P’'?v²Œ·	qÄlòH
:‡®=ë¨²Óío¼<÷ÈLÑ‚†8lwúdŞÙÛÉd©æ€#l¡AÛšÖ(e«›/…ììvÊÿ 3îŒö5¯§Ù[O¡¼Ëeö]À¶8ÅdÛÜi×Zo—,’í‡ƒ“‚O­P’ãì–k¤R?›!ùcƒëZEÎ‡S¶k}:-RÍLm!ƒ¨9úÖ÷ÃÛ?šJ“T¶Ã&=Íq_ğ“_Ç$RMn±¦<ÈÃıÀLŸj¼Úşšg¹}20Áã™O8ÿ 
Ñ+Oã	´mCÄÒ`lHYpP/
ryÿ >µÌÙ›ƒ{;IIi,›¶}ÓÙ«cÃ0ıW¾SJv¡ÆIäÿ ŸZ»«Å‡¯'¸¶]Ávà0àŸñ«ìX[}†ê71¾%WeÇ¨éRkzfkcí½éYC€bİ÷¿úÕ6½â¸uË%y¢‰O“†qÁİéXIto–(¯¤Ûg_Ó¯oñ«ÅÅhmi·ÚRBÉ%†Yy9ëÔûúªC}j"5"c8ß’GÖ³ì­.Vw¹–6Š=ànÎKo¨¢ÜoÉÉ½]r©)Íj•Š;Æ7šuÑ»Ó/Œ!˜d®=O¸#z·ƒ?kÍOÃW+i."ªyŸÎ¼!„ï²y­Ä{HÎ2O?—ò§ZM,ˆ‘³O˜
Ç“½ûgŠëÃÔ)^,¸h~|ı«¡ñªO©´pºÈ7&~òÿ zÕæ½a®X¬Ö‹Àñ™ï_Ş
ñêélö­$JÀpÀ$uÇlz×½üı¢ŸÂÖ2i^ “ta‚$¦Nşù¯¢ÂãÜôŸŞl¨¼5y{©éèƒïFÇl¥pNŸ­PÕl5x5ù/µ	%ƒ $¼¿‡Jæü7ñÿ ÂV­·ámÅÇßç·zÚñ/ÄmÄ÷‹,h@úãßë^¯5ö(èl.¼øLHk¨ØÃ’¿½fjzùĞôûe—˜ÊŒ÷>hÓfÑ­l£‹H»igr3¸äsócğ¬rnîuI¯š2ĞƒóËÛwÓÒ´H_øºK5d–XçˆùÅA;Ï85¡àMJKç¸ûUÑØIXWøÀ©öæ«¬–°xaçHÆ	Á@¸Ûœô™«Ô­t"{‡…gb±àséôúÑÊ€¨×ö)¬Kchû¾o•Ëq»ıšµªøÇY¼ÓbJ²6pY«LE–ô]\Zfiõaò`‚º(-nõEòöœ»6îFsíÅ'`xFÓBkg:@Z®òÄÉ uÿ éüc ÏVW!–hc`ª9'¸?QúÖ<VwÖÚºk~í¢B±»ãuëÅuv–òêÌ_&b<ÖVÈ\Õ‹Ó>ø/HÔ­Üíw®TÉ×QÇÖ¹Ÿ‹Ğˆ-'Ğ¬pØqãŸZÚğ?Šo|/áëµ[\Ì‰±[#¹8'¼V-Î‘ªêšd,(¤#³ínùÈ?…eÍ¨-#×t•·ÒÒ¨Y[ƒHlàcëYÒYXßì‚ä"uÈ€Ôæ·<[«ÚÈ			V'ˆØzúµepš½¯Ú¢gv(ê8Rs×øªV-v7,ìôõÓLŸjfŠCµñØôëúcŞªéW¾Mì›€±B§¹S„S5+Y†€VG	¸€¼qÎO½SĞ¯Z;¡ixêæEÄrÈ¿(9âµ/jÆmJŞåXİa˜Øs´ôÈö©nµÛ]‘éw7o¸°)´cw¾{Uû½'NÒôÁki©‘€,UFæÿ ZÆMP›LK›ÅSqÁÏ3×ëš¥°L>;s¸àíqc“Rëú¡¸‰lí-Õ² ´E°Ïÿ Z™<°¾«å]N‹3.C­höPÉ+½åÇÚaËÁÜ	üøª„±º‚ÖG==Ì2íıêp{ÿ õªŸŠ4¯µòËö††Øm%Aë×4Û”¼³´k[Yİÿ GšÑ¾‡Pñ/†ÖC—_<äw?…™Úo‰
µO1â‡¸ã§ô­?kÙš*Â.Ÿ÷‹æ;ŠéóÒ¸ã¥êšÇ›ö¤Û	
è¦;×Y­éV÷Úq½¼˜1‚¨õ¥ĞCCÖ´Í\Ë´–ò¶´ç¥tÉ›ÿ gÏp]¸R ùS°Èô¬Éü?¦éKo¬Ù‰¼ÀAÜ~¦®ÇzÑ?Û €©“—YF3î1µœt¢2şğ†“ãwÒ¦ÒTxÁ¤wMª¨såOåõ±¦Ü¥®„×²D³¤¢Á ’xÈç¿5™áíeoõµš2Í÷‹±À}3PÀå|NuX®Şæ?/p3Z¾Õœ­ÃMÆ¬¤üÜç'<‘]Eî™œóËm§,£Éu<gÖ²<9¦İê1Ëwˆàµ*CÈøÎJE!Övèú}¾«hÀºÉ·n:ó•kX·Y5HVmMBŸ”nQŸJ±­C†ô{¢9–à(Ïò¨4û‘â
Iyv¸’%>QòĞ4îC¯i—2ù7úUÀ	n]‰#¹Ç¿Ö©h]ŞÚ]^^’İÛFIç¯#øæ¶|!¹·š-JeQómG<Ó9ü:U¥Ø[­êÙÅ¸vXäEêsü©»¤xVòşÁ/të`?;G&
®}zö­ß]k¬÷öM#}”m(ø?/¶8«>›I°AkrÏ+Î#&n3¤Õï?	~è¾-²¹³šèC$¸f8È'úÖ3Ÿ*%³Á¥øI¯km±jÆ'É¤ûôéV¼cğ:ƒìÆêh„1 ÆÜı+ëXşè¾Ò ³
e{qå«yc'¯5âÿ t˜n56±–i£uU•dûË†ãáX,Eİ‰<;[ıŸ…¾†u…,Ğ0L¶KŸjóõğ-§…õÇÔíïĞŒƒ…³zWÓş”Â½–ÃSËˆ¤Â™Fx'ôôükÉ>"xZÚØêW–vdâ2Èœ“‚ywşu´&c“«H×·e%¸X¾fcß üúÔ¶ÚoÚô™m·òâ ‹U>éúÅİÓ]‘¼{YIçû&£k]wN‚K·”IG úÖñwC;amm.ıÒn–4Q"Hwg=GéPIfş!½¶F³X-àÈ]Œ?úÕcGyµ›4³Ô Är2Éˆ¸eú§?Ö±5=eô­zåtÄ“n@Ôá—út¦¯Ğ}*4Öuyü;~JrR7+×=‡­høÃÂúp´‡F½y¤!"š8² aô¬®µ?øH[P¶xˆšİ%+ær pıu¹ãm~m?N‡W€ùÛUPôÆ[ßµZVB!–y¢Óÿ °#½XŞŞÛhU=\tÇ§Î¸ùş*Zé:­Æ“v~X¾EÁäã·éWõ?Qñ5ûßhÌaU@^wÈÛŠÂğ¿Ã-:úúâãÄLò˜ˆT°ËóÔıj@ë<=¬èÚ¦ŒçÏe3:ˆ¡§9ÏĞ×QñkûkÂ:M™‹N2Z´eU¥;±šÅÑ´=Eß¦^²[Çò˜Š6Hè§=kGÆŞ*µñ§†­tõ”O"HÁP?
@êZ‘œü6:MÔmŞ¶¤[É+"·ü´÷§âKÃr+ZÜÇ—Š=ªè>b3ş:u…¦¬Ø[ø~XØËkc!#å#­`kSé×w­c+m–/”³g	éÿ ×¦•ÄPKùeXí­%+µ±åã—ÔŸZ·yª¤wVòË>ÛÈ¶)`~óÄw­yílt}=M´ÃåÌß¹ÎĞ{ûzãŞ©x¶û@Õf¶“F¶dh 9Û‚GøUr»ğÿ Åş!}NÒàùšGPvc‚9ö­cüBñ.“g ¼šUìÉb«€XôïèIı*ÍÎ›6«Ñ¯‹Av¾Ğ0«Üçñª¾(·Ç†Ï‡°%W;ZAÕAïïÏó¥°?ÂOêÚ·‰ÛMÕõI‘aŒ¬iŸ•l¦k°×¡´¶‘/ï¬ZDy
§;©íƒ^5mq}áŸ‰sÙZ;:†Uâ½AuˆÛD»Ôds!%™W±éÿ ë©ØHcŸK·ŠòÂ9$·djŒõÇùÿ õOMi/mµ€müÂ
c`>¾•»ğÊå´z_C3Ë Aå³´/¶zu¨¾.xOS³ñbc€İÄ7(pİÿ Y°$ğ¢ØİÉªİÀù@¬œrG¿½|ÛûYüÓ<w®Şë0À¾{ÌJüİFãŒ~Î¾†Ñô[LÑ¡Ší„b?õ€Jç“Xš¯‚ôıCX—PºòŞİ ±Î[¨'ÓË^Œ+Òp–Æn7V>Ó|„üa‡¼Hbb.˜÷uÿ <W’üM´‘üqs£Û(/,€$ gåÓ¾}«êÛá5è×¢Õ|54r9‡
 áçœ×ÍšNªé^(¸¾×GŸ7’Ää€0|66‚Ã×”Èæ’±—¤ZYèwfàBd`r±åpzŞ¹O‰\M¨Ç©[–‘]Š¼|áq‘ş{We­Á»W‰ÕÄ¯,Ñ³aP@÷®FÙ—WÔ¥fŞg›şıÊ
õú×¨xNğ¿‡¼'¥Şj0ÅÛ…óò0Xÿ Zõï‚zdïÄ¥¼‰óo–ÜŞÀÆ?Ï¥|è4ïjö‘İ[	n#Ò H=°Îké?ÙsMº›Ã-¨^^Iö‡+æ^P“ş{÷`#|J¹QÜú†}@xŸÁz~ŸmwSÛÄWtŸİ•xÏí}âáÓDfdVJ“Ïl|W¡øGMG–ì^ÈìÊP‰A*­è=kÁl½i—Ã6~–ã3I0Ş}W=kèñ²QÂ¶ZgÇ~.Å®‹¹.eËn•ĞO¬y./eµxdµ,’NŞ‹ëŠú?ãÁÏ…Şø/eâ»+¼ê2ˆ÷İ±ÓÛ=kÀ5hÒşÔ£‘"va·”>÷<äWÇÔVfoR†›s}¶9·Äc	Ôc8äv¦xÅ®¬ØEe9BTH ŸáÏùíU/-µm8²Çc³iV äçÛ­Gm5Ô·‚ŞYYäû>æ,Ü78ÇÓÔÖĞ†š3 ¼¾»¼èÆòÀ•İ~VäõükÒ,µ/ZÍ-½şŸ™å˜èHç${ÿ +óÃ÷Z¯‡â¿Ó-öı›rÊ¨2	ê:uõ³ğc@ğİİ­Í÷Šˆ‘ŞRŸ¼|ñê}9¨z’r7péqjldDi¢˜ùJ§(}9õ¬XŸT´‘ÛÚ“¸îØŸÃæº¿‰ú-†¦&ğóÿ ¢4…Œ€ïô®gHKˆ K©¤†C–%W>`==ªA‚¼]{á¶L¶ÊEÊ‘»'§¯zÀÖå:„’êW–aæÃ°Î1ô¢ÎzÙ¢µ’^Xşëwñäÿ ŸÎªêº´“İ$Ìè‘¶X9ùIy•o/-¬ïŞÌ3yGÌRG V÷‚¯µ;/6ëK‚iãÆØÎ2zX6¶¨‘¦ ùbsõ!Oùşu·áÏŞZÛ7•l«Z!ŒõäŠ¨+ğ–ïQ¾ñOös´BAµ÷¿cœOşµ}óğgPµ×¼-oå ™¢W{Y‡|×æÿ €5GAñ$z¬¨íş<ĞIå+ôöEñ&ƒ«xZ­,Hâ?¹eû¬py¯«á¹Æ3”^ìÚš±ÑEª^e¿´™Ã‚“œ`ä`~\×g£=©µ‹ÄV&Uu .ç8úVMÇˆ¡ºÔ^ËUÑYdO”ìAÎ8>Çõ©ïüGeáèSHÑ#W2]Ñ› çĞı+ëÖ¦Éé¡ñwâf“àÒoõK&bB0ÀÆÜt¯™>-~ÖC¸´ÒïP,¤†zg4ÿ ø(wÄıcìšv–%XUÒ£dÉÅ|K®¾¥ª4ÚƒÉ&ØÈ
99ê3_7šf•èÖt©éa^Ç©OûOøÂÍgËU}³ƒùúĞëŠóËÿ ˆ:üú”×RêRII‡bOÏÎyÉ®utŸ32Ü]*Ãæg99îÆ¬&.öÊT(ù!»äõókÔš³w3l¡®ëÚÕÜ÷¾Qã ”ëœ~”Í3í÷öê¬¥İ	Ëçîã=ëFX-â¾dV)P¿:z
Ë]ZŞŞÎQgsõ@œesÔWˆ¸Ûë{ÉÊÁ¬{_s–xgüŸÆ³,Ì²êJWù˜«ÈóüªÎ¥ªÌ˜¶UÜ¬¤±Çõ¨‚„J°Ÿ•O__óŠæ‰¯D:N–Ê’#ó‚İC
ÉşÑ!•\m'•©5£,ï$bÍãŒ¡ÃÀëÁ¦I§$ÖÛÌ‘1CŸ,Ö±£Ê÷¬Áw¶Ğ¥s£Ö£GÔm$òä!ÑˆÉ'œ{Ò¤ğÃyæJíÆUHàõàÓ.®,™¼ç™Œ®C?_Ö¥€²\’ÆÍ%ÇjIâbè±¶*îì5ÂÎÉ“¹_ =é¶Ğ‰&Ü7Z†Ô–x¡xVà&H*ÊµJ·WVóÙZ3×ke—ßŞ¨ZIŒ!y>0qS¤bXüŞÛåÂ·OóŠI0Ù®|4×½²‘]woˆ¥Óµ+ƒm-¢Ã™c|¨<¼ä}i’M=Š"Ç8“)¶H•~ï?¥IµÔFâ2#ÁF'{søV°@©¿ak©–ãÄ?j–5‚uV1œn“øt¯¶´¯éßØàYZ¸œÆLFTöòGüòÙ£ğÜ–Ïcˆ§bË!èøôÿ úKM¾‡I>ÔUJIÊ98ëïüëõÓ)¼z”¼IãoìkÛ¯íhÃ2 Î†`O9¯ƒ¿knÓPñ´·it%‘šD€A#ú×ÙŸ58u?^ßé²«ƒ 88æ¿;ş&]ßßë7÷,‰.Y×œr{×'bh*VÜÇ7c¤^\ê0Øù$y²eÑFq“_WşÏÿ ³Öƒw§.­¨hò-Ì$*<Éã;½…b~Éß³êø­­õÍNàfŞ0ß¼PF ı+«øÛñ®ßá³'‡ô=ADÄ»X O>+æ0°¥E:õ6FM‹¾&i­d‹N·ns¾Wqò·çÒ¾~ø“ûLx£ÇrÜÛÚkì!`FÎ™ãœcµp>1xƒâ4“µõÃˆ÷â8Á?OÆ¸‹ÈÊîÄâ#“ßŸò9®^mZ½ã"A=Ôê÷R\	°“åÜi!q,²,VØ=œ¦¸ó!ÚŒ¸P9f¥Ó'zË¿jí3^W3Ô½á½ÇZ‘ãº¸xÌ#,ƒ‚}ş•í?±MµŒÍ´¬vIİ;×„Ë4ºUÌ’¤† nSÎ?Â¾„ı‰¯t«o® tÍÏ€†IOİ'½zÙŞeØ¯a¬$ÿ dÊ¨©Á$ıÑè=ÿ Æ¼£ö•Ô´åøky£ëÒoó—·“»$Ö½ÃJƒGÕl¥Ó§•SÍ!“lœôä×‚şØ~?‚'Õm¥•qÔ’ä:ı;1“†rŠ»°Õ­¡ğ×‰ä†k–Cİò”ãpõ5‘°"7qÆ;ÖÎªÍ¼MË¼…rkë¼”ö=?b>9B1\1M£n´ëˆmÒÕvàzLÜ‹>Jã­6\#02	}kœC¬&¹1ÄvÀ\š}æ™{mp¶Î¡SƒM€Ïo,sÇîç¥nk,:²‰¢–0¼}êLj|)Ú‹œ£jÎ›nn¤Uª(3ÔÔ¡e «7 S­$&<6Ü€÷=j@œÃNË#†%° ïSË$P Tc¸ƒ¿Z¯ —ÍÜ‰µÏ$ú})á‚ç%±Ï ë9Œ—
¤ä¯_séWbHÂ¤fsŸº^ğ>—£^¬ŸÚ£y?ãTµ‘¯-9r¡ÛŸ¼¼â€L†æhî$÷}*+KKË©ÅŸÒˆáx]ÄùW{‚*Â‚Ñ¤vñ’[Ã§^ôD/—zĞCsåƒÁvşUoH•í¦»#”9Ÿz­«é2Z^¬S¦E3ÆG§Ö¤¸Ó¡‰bDpŠØİÔ«¨ø‚âYA1|ÍÈçîõÅÄ:‰ù—qÆNN0yªR•$y9]ƒ>½ÿ 
!"ãbOÌÄ•ÏZô5í.ã‰%ÖÒƒæQÏÒºÅ÷n¦–wÑ¡Ç@pGûUÀ[¼²¾c;zrßİë]iˆ—‘Os7Ë´sPËŠĞé|q?†¨¸·‰~ĞØ®>b+Ú4»+(?g	ü³rDKc®ìñş}ëç=NêCPWvròÙÈÎ+éÿ FšÀ];JµE),±g¿Éúâ¹æİŠhğWD“VÔähî^<È×ÿ /òªiÒ	f„FT1'®3í[&	,ÓÍìw)ÛÎ9­}Â­w2µê­¯š¡øäHÍqIG5gà¿í+ĞÅ8İ–^pzOèqÙßfÂÙˆDØÛF°½2ÛÂ‹ÜÅ©!d]ÈÇ¨ö¬X¬l-æŒáğÓHS€qÆ?Æ¹äÑ¼U‘Íé^ÔÑœ«:ìÇTõ®vÿ Cºµ»w0)¿Œ{*ôÍ-RâÂK(í§W ˆÛ±öÏoş½fëš9—ı%mÆõ\tÉ¬Íc*ÆkìVÙZmà*¯ãÏçšÛÒ®µkûæÛbÀÚá{úb­&—tÊdû&CÒ?nõ» èm‹ûvmû>éîµ"ùLÖ–7…nÒeÎ7^EC«ê²Xì-K"¿Îğpx­Ûïİjn×Q†ıßÍ¿iÉ'¨¥Auá9S7…vHø*G\w'ü)=…c7M¸Ô
Â%pĞÆ¡¢É¦¾kÓ¼'swrë§ÂÈ¡TwqÇ~kƒKÂDû1i.†âíO_­tú’Ä¹²‰¤`’GÊÙãš”ì+…­ÆŸi©<Ö6gÚ¥‚çw'‘^_ñãHMgJmæ@xØùW±x_BÓü¨¯¤‘AŒfLöëÀöª?<iâ¥G½´/äÆÅœ(_SM1Xùnf²¬À™3–cÎil5!¦`ÃçÆÑüCÒ·¼K¢[é·²Ë$M;â5#<õ¬)X¬Åap¤`Ç¯½Q±£g­\NÒrHè§ñæ¥ŠæâÒÒi.Wh|0‰¸$úÿ *§¦L •¤`”ÀŞ´… –bg½2›*G?…ò›özíÃùq]:HTŒdöÁõãü÷Ö°¹½’í-®w‘xœcë\Î”Ï{#K:*"à©SƒœÕØé2BZÉ24Ì ışƒ×Úr›Wš¦™—Ö0$‚%ÚÑÿ w¯5Êøƒv§1¾»˜;oi=¹<ÎºÄöºLo§^yL²82íîÂ±|yŒ*/ôé#’9T•p:œ÷ôÿ õĞMŒ© ÚdS0p[*Áç<TKoqq)¶*§8=³š¤òÜ^¯Ú3ş§ÉÆŞ—·ìõÛ;Ec¶Y;¥b3ŒPCEk?Ä÷;g³rî PF9Íu:W†´Í!âÛNo:0.~ğ5JiîÒCk–_şZvQZ:~¢×±ysº¹ˆXwç½4CGEmk¦Ş$ÌÎ¬b Aœ“V®ü)kuaö6•XÎ UÏ_QPx94í“A9òå`	*¹Àé“]¾¥YÛ4ÛÆ¯+Í/÷¸éM2OÖ>Ş¼²[Z òäqó ÆÓéì+ãáÎ©	•®¬>H—æ•}z~5ìŞ ğ¶±i¤Ï<dÃ†XĞÿ g[£]hÁmcóÜ³î‹‰£Êãğ¦·ooä[\),TùD`îè½mè_üU©kq,¶"—Ú»AÚ>•èz_WX>cÚå÷(É\úú×´ü&Ğ4{a,äµŒ“*²tTt.§ğ—à@´Ó•µ4¥ñ”˜·„ô_¥{Ï‚üs¢é	a©XÇ"¼€7”q³ØsÏzì4ÏèKÔb¶A¹CcwF­Óo‚Ù®å=Ïçük&îÆ•Œİ/ÃÖI	>fˆr?ıoÖŸ«iš{«}–2
à‘œ{V­­´€®càåœó×µRãJŸûDI™—td}k6Ù]kÄ¸¿¶’Şâ0`hğT÷<ğzòŸü!ğÅ½äoß0À~Q×ô¯~š6–^s@ 2Eaê^[˜&Xm7³1!Ÿ)ÆB>koğÈÓÍö(‰+GÃğqQé?±õæ£nò\KöbÒemÇ'ÛÒ½¡¼8¯sçÎû9ÆÔÜÜñ[ºÅÔ–ÒÇy&ˆ¸e=:ÿ kE&+#ç¿şÈºÆ›i²¸3Ú@	—ÏSùÿ *³ğGàÎ|c¶§lÊ#q°9ã¡¯§,®#ûØ¯ã PÈÌ™ÈÏzjøC@»“íÖÚj£Âû‰pI4sHV°–¾·‚ÂŞÊÊR‚{çŸëZÑiğËfbĞYxê{ŒÒ˜<›VHP‰ ù›=}8¦éš…×ÚÅ¼ˆCGÌ±ôı*b?	iĞ­ãÎÈ‹æ)5<ç?Êµgw‚WŠÙSä\¶=j+[(ãcå–rw£ŸJXÄpÎDŒÂFLî¥a^Äm¯ÜÚÊËx‘2ìÊ•^ƒüj¼z®à¯– Ø4ÙíEË4ÊÂztª¥%µÿ Fˆ6pJÃÛŞ—)›Z}Ô®ÆEvÚ%;JµfÂÓçRwëµ‘¤Ex¥¥–L	„QÆO?ıj·¥Ëş”í}#¦8lrĞÓJÂ.]ù"=×,B¡'#ÓÒ¨éºòò{2¥ºl\íÇÿ ª´o¤d[wµF7)ÿ ?óŞ¨ŞßGk­”\îıähqëÍ\ ËñrÅyt‰¾EãÉí’3Ö«ønŞÊÜºÇ>28P9´fÓ¦¿îîî]–8ÁGTt=£ÔpHã8e’OSÔU ¶‡_£[]ˆY®åäcb:õ®ÃÃöq)Éf{šæt©Z"=È/|åG<ô½¥i÷3°	y&@šµq[Kàv’OˆRÀÇù 'ŞËvô¯iøÛ=­·ÂTƒ?¼eorqÇùö¯(ğf<~6ŠáğÓùŸ$KßÜãµoüsÔµ›ûÓïeØª¤„P@8Ï4É<ËB[èÑ”d'÷‹œúV¡(¾Bc—§Êå—Õ-&k³n²G($q¹F2=ıMl[é²Kƒ!ŞX,ÙÏ_Â³l¨ìsºÌÒc–+…^sı*Š¬dº¹cµÀì3ÉÍusø*öC+3C"ã èÈ¬›İúÎG·R¨¸À!}\×4‹Š:Ï	êšl.$Šp<¤zZé.¼L‘ÂÂâR~Eáz¿¥qˆiv^L€K#0c/L{Ußjjf{©—ùE1‘Ò±h£«Õµ8›76ÖÛ¼ÅÃúÖ\‹»Ì¥©!y…;HÔÅÍ¸]Wç==«~ÖÊÅn#¸Y™†9UÍp{ÓoiÀeJá×ÚkãPS+ÇtÅéÆ>‚º7²¹‰EÀ‰">u~Iú
äµË»8Y–fBw|»[<çŠÒ) ·P)h¥Ş›—Pr}½ªÅÄ³iÈ‹8eÆÓH?Jİ:Y•ÃvVÈZ¯qyI+Käõ<Õ% ÜJêD–ÅFŒTz¶«´j"”+ƒ“Î=ª¬¤€–ºÚéè{šÏñ©rù°@­±~ó*`lèw¬pV}¤—#^¡àZA•q!i XŒg9¯ğ·‰`/	¼µx¯@ğÿ ‰f°C5²ämù]¹éşE¹ìzN±mÙç$õª:õâ_³H ¨+’k‹Ò|S,Ñ=áó:‚ªqô«?ÛwwG/ÊçéíStÄµ ñ5…³#5´‡R:kÍ<a£ÜhĞ»ÆÀ‰%ùãQzñ^ÏceÆØîeİ‚Vè=ê—>èz•$‘FˆÜ”prAöüªJ>rºµ’i-áÄa]ø9ÏSéRÙiR>¦VXÁ"‹t'×¥t—ş½·¾]ÀæåU¶ä;Õ%§‡”:ÈmK0ÇÈzcŞ¥r¦‘¦İ¬Â+2ªÃ£½ïş}«¤ğîŸuk+‹¨Ê²ßüâµü)¤¤WŒ‹÷€+ÇÖº=)'¹em§¥å.xsDº½–$

q¹¿©ú×gÿ ¥£Y²:Ø69¬İ"Ú×MŒƒpAÎYºm³öø Mï72Iïş4Ğ¬qş"Ó-¬Q‹©Vş":÷Å`YGä¢	—6q´ó]‹u‹mBèyìÎd$uöƒo=„r¤i.N2OAš±t5!ÓlìãaK(=úô©2K#¬OÃw÷ªw”"Rñ¹v *äşµ>Ÿ$+3ÛIşîõæ‚-bK»‘a|êJ®Xu5ƒÖ/µ´2Œ3ì]%å’Ë¸<K¹ n—hmì¼òÁ	û¹tsN$ÛB»B–úTÖW’f#vç¥|óñJ+Xµ;ÆDÜûÈ/Ó#kèSPiQâvÚTŸ_zùçã½¦è÷ÓE>eç ÀQÏ9« ät3r·±ÆÑ†ùHœş•é¾Ö£²‘0ŠŸpñÛ‚kÁm¼]%Æ¢-m¦c
6GÍ9ë^—àmzy ¸rÜºıw
qÜiCü7ŸVšûs“ÉerüwàW­xyˆÓrnn2AëÖ¼#Á! @‘²“´y™nG5é'Y GÏ¸úÓiX´‘ØO<­#+Í´ Ş®Yê¬@É |Ş¸)<U{vÌ­ Î@Où­ò{¨š''´€î Ô°[dÆÓíW`¹å@ó3ßŠÆ°µ’âÓ
¼jX/g´B„Ë×¶jZ£{åÈ²yäà`µÊx‰­íí¦+(ÆFÎœõ«ZÇ‰&Ó–U`_pànÁï^_ñÇ7Ü±„n1œúÖlÎVH³¯k¶ïkq’íù8Áç½xÿ dk‹O-ÊÙ98ùqÏZÖ½Ä¯;\¤ÌÀàŠæ<A­ßI+ZÚªí##ëY4rOSÌ5y§‹S)<M½Ÿ±àÖÓÍ«ZhÉ¨Ç |A“¯|ğkEü:·—1½Ê’Å{/zêô‡0ø†,ÂÃË@cÀ8úÑË¡’WGÒeH1.Pc±íD(­«)|€»ûÕkh„H-ÚåÈS½ÏSÅ,6Òİ_¹aÔ÷ö¯²W¶§ó5ìäuı  9ù‚ÕİîB©o¯¥T´¶™•pGÊ0ÌFsW¦VÎ°ş”¡óÕÀ$`ŒúÕØ–6cF«´d}}jD!‚äõäâ¢¹,	ó7ZV} ½Åäù‹&Aã§¹¦Æco–l8‚¨Cy3"[º  p3Ö•]
¤•’:ƒ•6J]@Í.ÎFÁÔU+…Y“ØïÒ¤†¤‰‘ß-œ‚£¥C&6±ÚÙAæ„®€Šİ€2·§lsV¢îßÀİëUâŠS‘ä;s†\S¦±ÄÏ´€¸#Švc ¹‚&=	;¾_óøS¬¢Š6aŒ‘Æ	¨g’EÄ„3+ŒrAõ¤³[‰C4N	nC$“ÈX&läó– õëUî&´Ä,7§ó§İ„”Ën,9ÏcQÉI0bÀŠE'r[1&èÜ¶pÕfhÒx•X* çüÿ “Uíƒ°$öaÅ-Ä0ºò2àç ôæšÙ­ßÊpqÉÏa”Æ¿.Ûb‰=NâŞE>IWpyç¥4aT,cŒóşy¢Ì—>m¹FA‚é.ß. <† Óåˆ#/9ÚM^]ÄEq†'åRzÓ³ÿ ·‰|±Ã‚;ÔŞy‚ 'q¼vªdˆ*¹å—ßŠ“Í
„f'åÆêvZµÔ£İ†E¡íëV>Ú’Góm^:úûÕ­#,°(!zŠ½¦²É–ğòöõ¥`D
ÑC2s×Ö’{GgWÁãj“Çùÿ ºÖa¢+&[½Gä\!1¬JT¼Oİ÷ÿ >´¬Ë*ÚgxÙÀ*zŠ’XÄ„Œ–ã9^ßız[T	]Ø ‡¡Ò§4[fxc'~•Q`µ)ha÷– ÒB­Ãœ’èµy4ÉYY™y?tÈ¥­%
œ©äæ˜5Ä_eó$Ü6ğFpqUfO0í\Œqê*ëYBAWå©ïhR/5åPAé¼Ğ%~¦uµ ˜ˆ$‹å^ch¨ŒOcÁ«ÎÖøVcœö=i‚;ˆ®¤ˆœCt z³[Çiy°,r£Ş´æ·…l¾xÉbrBúûÓš=‰¿É=OzÊ;… ÜÂä( 	´Èãy<ÕsĞd•äzTòY‹†,%ŸOÊ*(¡Oİ°`G;‡SW’Ê2™Äñ´ûÓ@PNû;³ùŸ+`œœÓšÖábaŸSWßOÊ'ãŠ–ÊÆ+FShP;uÿ ëÑª+k,N\î,F	=¤ãe$ç kcì	RN8úÕg°–/‚:c4lZVC!UeU–\x#üûUƒlbŒ=ZH,X8SÛœ’jà…ŞÁŠín1I¯d_!ˆ<.GJmÊH© È‚9j!gŞwd}ÒOJ.R)bo,¯#½4M«È.Îİú“N’Ì3™²äôáºŒš»ö,gfáRXióyX• Ã`Z¥±&}®ŸNâXW‘İş”é4Œle›$}àß¥kÙè“Mw½cÆ[jèì|7mj1$#?N¦©+ˆãôO]\JÓJƒÂı+oNøy2y±&y#1]•–‘Ğ¾P~u©¥é±¤ÅJ  ùzÕYætÿ J¡bp¹äæ–ëáé–F™Õ‰ƒ­z‘£Ä«†ˆ×õ«m¢i—*AÏL‘K”>¿¸˜Ã¿L`ƒZ¶_­å„BÌçoÎÁ±šöûéñÃ‡…w»ÍhÛx6Ö{v@BäzR^@™âÿ <²!–×(°8ö­Vøm¦Ü X \É;kÔÁı<Ü±ryëòŠÕ°ğ%•ºcƒßZ›â/ğŞYY–Ä¨ÿ f«İøRÅÔtî:WĞ+áKD@zc+õ¬»ÏÛoo.>;qIH,xTQhñOf~ßQS/™ŸË’Ô4l€mÇJö9üj>êcŒã¥2ßÁ±Æ¡_$w8¦˜	âO…QÇÜÙYm‘s°sƒ\´’Ã,ğ—³Ï5ô·ˆü5Àñ(8Ç¥yˆ¼=5½Ì‰$?(l>µH›SseåÊÌèQİ8ëÖ³ç_2wU@U{Á®ßUÒZmÑPàX’xjå&,FT}*’±'9%¬F B8È àµ4ä]ÁO˜‘Ím?††Æ›$çê‰ÒÂ2FzŸïsL†MôqF!^;•J)í~ĞĞFîà^ksPÒ-¥Vó‚Fy5J=+Y¤-!æ07nçè(¡^Ræ&öAÒ¡²’x‹<’™° w­–ár¼gÉÏùéNƒLäBPö— uÿ ëÒ²)>å[û›Æ¾ÏËí;Aõì+ÔašÎcow²=Ë–(N;ôÉ®¦çMurLÇ¦Oÿ Z³õ6Òæ-÷Ï! èM;œÅÒ)³LKäãZnÜ¶ün7œv­VÓ­dµø#ÏaY·3l2DA^Ôsš,4H·!md†VÚŠ0v¯$óÍCe¨º4’3eWîdu«vÈˆQ‚3/Şaœş[P² —%›$ÒV]Fí'sq‰/İbß/½VÑešîáa6o†l¼…Î	æ¥º„@L]Ë†­xvŞÚ‡ïNHáMRV¥Òt¤ŠÚK™.Fçµ~_şÙãUÓ~=k±/ï¼Ë²s’"¿Ut„VÓİ%…@<dõé_—¿·t‘Ù|nÕà°ƒ{­ÇÊWøºZA\–}M èvŞTP3\ıâ6«r4ùe*",ÓH9¥©İÊ±°™2ª8Éà“T%ñ#eô¿%‚7‘‚ø85¼tE-ØôyDr\[¬Lwñ÷qÕˆü+ßPkHà·R‚âgaºGÎÎNsõ#­[«ÂĞ´ºr0“ÉóHbzç‘ş}k›º6ú†¼ob…›c.â0£wN?Ïj¤ô(›Äé·‘C¨%º©î	õõíYz§…®.¯…Ê…Q#3;àî*—Z¶·Şncµ1H²mm§?.zŸ¨&¤Ö®-¬í`†£·`
¬r1ê}(¡§Øè-%Œwcs¦˜ö?äV¤lá¼S!#œôçÖº+ŸÉw;5åêH%ş#ÛŸÂ©Ø¿Õ&·Ôpy,>g#‡z »§5”T€·“•]•ç u#µbêöÖ/å_Ák!,ù™Ÿ§^£ô­ÍoS°µ•çdIwËØñÁÏÓšÆµ·Ôµä†r…Jå'©'¡÷ê();}4Ú}¡·1åKÊ…9ÊúzYVÏQÒXÇ—?™Ãg¡^»ÓŞ’àˆ™±ƒ™ÏJ@on v¡…U¾yF2NÏ4Ğ¢ë-‰{Ù™g, ‹r¤vÇ¡©®¿²¡>}ÀPŞXÈ‰N3õ¦j6Ëot¡.±oÀÀÎ~¾õ/ö6¡u°$ˆ¹@HoàŞßã@\Î¼ºŠêÖÒÎÌÀàc¿éU­ä{¨ïI³I CS‘5oû&êÚâKxfTPâ³n-nïdV÷dOğ uÁäj¢Š‰5Ûüõ¹Vù¦%	uAÏZX5yäv·µ
ÑÃ€ =:+Y ¸%‘™Pç99ıhYa¸Œ%Å°Šb2ı²s×¾µEiv1ZÌ./¦”ˆÊŸ¼zæ›yml"•ô»€ò0ØUØîş#ş{ÔPë0DÑÇ~q“;‹3×Í6$ŠK*g@ÎÙv_¼q¥R@Û.ÚVÔÛt¿{÷# ëéWtÿ ±ÛZËl]”O™ Æ6“Ó?çÿ ¯VâŞÎ;f]&ä,±%‘²F=Gin×1âiš8<0?ÃéT4.©|o-cŠÎúL•wsÏ¥gDŞD/q5Â9l îyÏ9§&t°M’$‰±'n9ü÷¬¹ôÛ[4Ì%dpw•€r~Qøÿ ZjÃˆ—AdÊM·˜UñN9ïïV-¥IïKidŠ`ÙÉ^£üÿ :tÉæ‹+=¡_%Õ“gëüÿ Î*4‹û3mÍÚ³ hß<¨÷ı*Ê+êš„Ğêm,6U“dŠ’2yÇ­M§_€^Æä»†QAôéÏj&¾¹•$˜G‰îå3æ
kØÇ,ÿ h_Ş‘•VéëƒMkP·[¨ï–4$nÎì‘ŠÏÓl¦»¸œLêb+cÛvÛÃ¶¡fÚ’¾è·ÏP;ûQgedn$™ÄÎøb;àõÇ¥	µ³[¿*	NîsÁ^¸şU‘^\0–wT0O¥O}<–W3K£%²	éÇlûÕí-RâbñÚ*n`w¶HZ¤¬’éö
—ëÍĞ®ÌyÇ=	®ŸÂ×VÒöYÙÂ©Eã®ÏÖ±t2kÙL7×FS#ãÜ)õ5¡pÖIg#H§gÎÎÎGJ¤Kó25ø¡3<–v¤OÌë‚¹éœÿ *©§ZH`–7]›Ø“)°#¿¥nİÜ[ÜªXA£°c bŞIuki>˜/rQ¾|‚=*öWL·9Z¬G|>TöÜkBëËKÈdÓ¬bò•@l®Aì1š‚C&ŸáıÖá—]ÙcŒàb¦²±¿·wx¥¸ˆ<q·Lõ÷¦“N·º?lp Ë`;[Øf¢óÛÅå”·;ˆàäâ‡¸–{c5ë„t”Ï\ôãğ¨lÅßŸ-‹ÄF_tr(<g?çğªÅ­‹M¨^E[§8F  î}MCy¬êÆÊr²¨)c•ç©ÿ =ée²˜º‹I¯ÌsøÍT´–hõ'¿ó$E…Şî“œTİb+Ë{ëh’=¨"ÌÅÿ å§¿Ö¬iwš|vò]ÁÂ¿/OLR$FşùÅë:ª|şùêEW’k³gı¤A+˜÷&28ş8€İ[\¸¹hR¡„ÈnÏ$t÷ÿ ëÓ¢ÑçÖ-áNÅw”ÛéïX×V‚oº,LsŒœÿ *è4x.íçŞÇz+Æw|Ügâ¨¥±§ésCq»PU¸Øñ©ç#8>Ã¥^½š=FXÖÚà…‚LLğIöõÆ1Tá½¹…Í».[Î'vqƒÏOZ›Wm®b’Ö-›Ÿu¹ «XÒ·‚ÎY’ÎÒİY#V*òœe¿Ïz†Y“QXÚÉvËò¤Š8Èÿ õRx{K“_•ÍÄí‘·pùHç<úÖ»è†™eğÊÒ„s² ¼`úŸ\ÕÅhÿ Écj^D >	i09ÍG§éíw9¿\Êş=…tÃÃ·ş,´Kõù–Eı*(ôõÑb—J–1ec‘GVÁÿ 
Ò(ràiæ9˜7·(T>¦³á¼I¬™°«"I\tçµY}.U€\Gv‘‡%Š·†*´–—–æòŞ2ˆ®qÁ9ô5¤U€Ú‡X¶·
°H™Ã O¼sëíG›uw©=Äé$ì„–é×¥fYÅq¸g‰"w?ë1u8­Ÿ¢ØÙÏ4r‹&~Ğë÷³ÜU%p(O4ÂéÅ¸<…äßü'ÜúT1ƒ#İŞIÄ #ygˆÏ°ü+F{Ø®âº‚Ô)dm®ê;òXğ¼~fSUÓüèf“‡^Hlz~IX›(äÒÌæêB§fÕ\õÖ™¿uj‹*2á eX×ñ=ëOTmúišØ¢.À¹<‘ÏùÉ¬ØbÒ¬Ú;	îÒBà€˜õ>¿…h•†‹¶²O«Û}¶ãMŞóg»'Ù‡ø{Ó¯-u31^FÛaJô ™©<=k?‡¬Òö¾tc½Ú\©LœcÓÿ ¯QkZëê7Ï{t…âj$]wtÍ\QIÜšÃEñ$ïŸöY_4è¥&»£\hHšuÍß¿sOLŸÓ·áVôj÷Gº†êyÖ0|Øcå—Ğ‘éPë-º¿»22ï2çd{s³1ëZÅ†âK²[T!|,zÏåYW:F¹,¾qdò°éå7'ĞÖ„ĞÜ_L¢`¡6‚.3íK5¦©i‹n	9V'#¿JÒ+ ¥Ù}nË1wÎ"ÇêjÒÂ"=«*¡Ljé/apÖºÍ¹y¦!Wœ ¼äÓme”İ8XU"B^ßOÊ´JÈl„±×¯ôæyàvh2$=9õ½Mªë×2]†ˆÇ>ñsøŸz[ÛXmìŞY¦gMßu:“ÏéYÚ^•#	/â…–"~Q'B=yïMãcB6µ¸TYl£óË26àñéíV%‚hdGJp»]ˆÎÎ¿0¤ÑdˆêŠ'¶Y‹)Ãã‚Aïÿ ×­«]"%eĞÒ&¹óåÆI9=†:Ö‰X¨ìsâòæT†Şá‚ÇqOcÆ*ÍöÒt»Šà*’
9cÉÎk¤Ô|#6“­2Af#ò2®wøwÍt>ğ-Ïˆ­ã–û“è3¸7`qÛŠŞœ\¶Wgı¦ªñØ˜VYÃµ”ãØûÿ ú«¢Ñmí®ŸÌ¹€¥ò*´!åe‡¿_Ê»=à¹«Ä×çÃò‹€É‰\cîúôı+İ¾şÇÚ^¡z‡ˆãg¹T#n°¯C‚¯Wdi|Ëq¡éóoÔ™*Oµv‡yÀÿ =k¢ğ_<q­êvööºl¬FX¯'pÏö¯¯o?boù¦îê(Îğ3åq ô:ûWà…ğµ›I¥höòM
e(Èê2Gµ{TrùÇvl•–<#û=|HÔ¤0ˆ$vR¹PHÚ	úW©x7àæ»¡İFš½Óæ)3ğœóÅ{q½ÓîmæJ´	1@0¼íÇ·ôº}…Ö™!’æ]é"*¼×©N’‚[Ãú-¶šŞC*s‘Õryç¹Å:hì`–hÄ{çÇ8çüö§xÊçQÒŒz‚\yjp«ÀöÇzmlu)P{Ñ˜‹ç0LçÓõş•º-#WòÕmšÎ&ˆ¼î’yÏã[kÛÃbÚ|ÉE¾â§WlòsÓ¥eëú›¦_ûJF¼ÃÆO<ÿ >=éŞ¥ö}­Ó¥²ğ­°n`{PicN¸×ÿ ³¡ÒBäg9#Øÿ …jËk¨húµ´±ï‘šq¼ùx=±NM6ßG¹wfÏ±õp:éÍYÓ/§×/¾Ù¦Ú"¬·Ëc÷[¹ÅD•#[U}C[Ö-b‚Ë'
ß{±ük©Ó|1qá«D“\‚h–DÊ!é‚{
£ğïMÑ<9ã[VÚgi$&şÙàşzWÔºÃ¿	ø»Ãp_^NÈòÊ¸ÁÈ®YË—P<wOşÄM×@iLÓNs&e9õí]ÿ …¾Gÿ ]ı±ºWê6¶úW“Ãá…²ø¹¢ xcºE';zšú{ZŠÇ@ğã'”¢_²–
œ @íXÍØgÃ~7Ñô­âëD’tiË²ÁÎpOZÅÓ “H²yå²Œ*cÊÃ1>µ³ñ"w²ñãİj+3ÊH³ÜñM½Xõ{róÀ YPqêAÇ¼ã£*É«	,b[ÀŒÉ&_~ÕVçJ·s$—$£"…'ƒœ~µ^ãJ¸µº{Yå·I<çÚ¹d§­oè~&¶Ô576 [ã¸_˜x>™éZìY‰§ênà[ØÛ.à…d’fãozÖñ2]­¶—'”6|ñ'ÍŒt9üêIãVœ[[)·–áÁVs¿_JÙÑnôôÖBÖÌĞ’là¾Ÿç­Tvœ×õ(<ˆŠdco~™cÃº~«$)¨IæBøwÉN;ÍñÕ­§ˆÊBÒb+Æ1]·¨}†-üé6ñ`à÷OÊ˜‹6ÖB)I„§gß=¿ÏzĞÓå¶³°hPy;ˆ¶6–cĞšÁ•MğäúÜ2–ß´(%FqƒùÔÖ×7^7şB
2ç8âƒ3?Å:iÒ\j~²I#¨«´`uÍ_C©kŠêêÆ#l6$è=ÅgëäjñC0ï† ÉÀúWU¨Yiú7ƒ†‘,û˜¢ºdŒğ3Š ÅÕ`Ñ„Ïk¢&dVLcšÏÖa‰ÚÖùÇ0ùPl9ÿ =jŞ•¥Ù^ØK3^"I,d¬'¨ã¿µAqj±ÎÚ£2¼7dÔÒÙA/öÓ Q1Ş e{óšÈ»Ó[D½šhB£Ü[G@9>õ.¤«šuÊ*1É$ÿ ?JˆoÌ-¤èV¹.¼p	úÔ Ë]rñ­|ÄhBl™Ÿ à÷«ş¾ğòÚË¡ê™_:O”œã¯Ôı/ê¶7±MfHØw9şGñªôË}Jåîßæ²ÚXH¹2yı?ZA ÿ hZµŒ[Çvíh€²$G‚2xö5_á»ŞØ^é›™vá\rÏõÕêwÚ~§áé¬¾ÒÌùù²¿.r~QŞ¹İ[e—ûÆÊ8K0ípv÷ÎZŒë{K›‹µ$gß—ÚsœñŒ·w­ê~ÔŸL³Ód½&@7c1ÉÀëj !ÒuÛFŞT~ì“’ısŒş5‘'ŠN­¯M¶«„@¼í`9üÿ ­'°#©ğdW†·k«ùyÃO»	İŒ0ú}9¯¤~êĞh!M[íƒË@.Anà×„x'U°Ñ¼=>¬ñGç†`ÊrxÈí]tŞ7¹Ó<o­Ü\‚ÓÄB¢Œ`ãûu®zŠúú¿AÖ4QkÕuc Ø¥†>ß­r~+ğ•©qwjğ™º‘“^#ğ›ãæ¦I2İ4’G1ÄŞ ÿ ‡zõ|M‹[ºšçWr%º\*±p;÷®/c%°/Ä}:ÉÅ„ˆ«%Îıå±€ù~ëË¾$xGX}6à¤D>IwÍƒ^‹â½ql|Yyi}¨«Z\@]¼Ã¸DwqøW•kŞ:–çRh´˜¤”6PÏPq»ùWU$â€ó­;Âšåğ³YŒcc>Åãñ>ÿ áU^]RÇ£êB3ÀÛ.J•'¨ÏÖºOkñ¿Œ.mõk©¡!CòŸÊªø®ÇLÖüH'û+ÆİÀç#=q]qØş-ñƒøKV±Ò‚$ù*ÌñpO8#éW~1Çe¯YØê: nğ^8ñÔt8é\>±áëiõ±+]<¾WÊ¢WÉc8ô­ëmföşÊÔ¡ »Q”… p8ü1V¬4XğÖ“£Ífíq«2¼Q,RqİHÏ·õ­wOÒµô³µ¸˜4± ŒsµWßüŠçÄÿ gÍyFWÎ±*sèyôï]mÕÎ‰¤øn$µ·$øÛ•ùs‚O×î„hÿ dißğ‹\éêÈÆ1¶'İómç?\×·z-ä3&^A¶Gä$V†‰¨GªöÚÕãF‚LÈ¯ÿ ëâ±üpÖ:!-µeµ	ŸºÙ?ãõ©¥ñ µ×`KH&yWsƒrÜuV7….!Ó5Í:âÌI$lh#nyÏ'ùÖ/ƒüwkw­±míÆDd.
ç¨÷­oì‹s«›»ÛgQv$jNN}ı8¦–€jjSZÚywÚm¡J¸–XÛ¯¶ÎqUšM0½´ñhhÅSÁ‰'Ô÷¨të©¤²˜\,moqAÜÉ)s¢N·7H²'–19““éT€è4=åüš£i”	XÁ8)€zSuOìñ; Š/2XJåF?ºOcQxZïM¼–_İÚ¢Ì„"„ø÷×Şªjeøë)1'÷ŠrC¿ WĞ<E.™«‹F³vÊ+ä³uùO~Ô¾&škKÈæÓ¦|ß è{.·s¥½ÌTl uúƒÒ«i:uÕíÔPİj$JïFÎÕô÷?ãIì:ş‚ÏQ\ZIœ1‘Ú2=H#=»VÍÊêòÃmâÚ#"dQÏ_A×½tş7Ã¡€%YU(dõ'#éĞÖbéöv«èÓª$ˆ
@˜Úxç§­M€©áıSÄ:OŒ`×âİçnQå·÷GR~¼ñ]ÇÇKâ>ÂıL7N+‰·³Ôtí¼Iynrdyë×ÿ ­[şÕì<G yZû+m“+½>êc®k.‚w-Yjw:¾…§$òÄvÚpXÿ µÉëŞ"·Ó,|ÅYQ¶NÆHï[Ú·ôOhRØi"İmãS‰ÚL†<×Ç¿iRX_Ã^ŸyìÌÑºwt÷ë^n7O	·©”¤¢v¿¼¥^ı¦Úùãóã°–åF2rOs_*k~-¹¶ñmä÷÷;!ÚÌ’mùXgŒÀó[oã«-SD»“[ÔŞKÄ•ä™ˆÜ{ñøt÷¯4ñ‡ˆ!Ôî
M0]>?Z3–vÀ==Çñ˜ªòÄTsg4¥vtÚ]äÚœ‘kî°ºM”,„ëşMbj¸Ò/â–ÆçÂÅ”Dy!ºŸ§olÖrø¶|>4­:F–S ÜHT ç<õõÅ:ÓÄ—Ğ^Ç¬êÍ-•S·åE>ıë‘is;³©ğ—Šµ/Ïkawc#Å¤dgnz{vÏøWÔŸ²ş›>­=ÏöAd² ÁMË¸ãø«ãë-ş1×êêø[¢í#Ì íï_wşÊÚ^•¡|?‚ÚÖïæ1€ÎïœsÏµzYjRÄ¢ õÔôB{[.{ æ!»qã‘éø×Èß¶–º5ÄwqÜùr´€‚ƒ“œ§júÒé`[Yn&™d;UGğ~µò?í›'†¦Óä×Sİ?Ú7<ó!ç zW³˜_êm³^‡ÏOâ½XÑEÕµiÏÙÈx£'(HéœäŠê¿gŸÙ×Pø±¨Ã5åêˆrÏlÀ‚ç?kÍ¼E®Åm¤2Ö6·c6ç ıáÏjôïÙ£ö…ÿ …i¿û]Œ£€+Øgü÷¯•o¹G~Ôß¼;ğc\ŠÊNû…â%~Tò3Ïjğ¸t—·×Ìš4S°+7cßÕì_´Ä¾2ø¦/¥ÆòĞì†ËŒO~µçŞ(ğ—ÙYfs
o·ß–ô¬šÜ†ú	¤x/ìŞğ¼OÔn œÖN“%Ä—2Z8†ÉQ!±ß¯ùÍIE0ê0Ù!L?':UæÓ|%Çe1¹U³»?§jÌ“:mUYŒwàHÜ‚dçÒ¢!ÃZÈË""eQlu'Øöö«w^KûíX!!§|{.x›km3Î–ÖÑTêùÚ}éXı*Âß^æ&ûEº,Cg c§¡5Îø•uŸíCÖ…°%y%ıÎzš» ŞjZ$Ík /"S»¡Ï#•‰nï5VkÕy û­ àdú÷¢1Ü
›­ßì)§“¸‚î§vüjş†¶ºeñÔf·•Ğ´ àç¡" np’%¢¨‰€`[‡©«Uë\Ï%¡Iœñò È=yªQh¨³­ğÆ—y®kĞ[›s‡‘Y u?¥}ÕğŸø
ÎúÕ‹	
îFóÏå_|1»Õ4ßìx˜n…cRÃ‘“ÁÊ¾ûø+áù¤øim¤D…ds+rRÒ¾›‡`IIô4‹=‡Ãq[j·fÆöÀı¦Hƒy„díÇ¯çÍ`k~Ñß^im™âògEÉİJî~[G,7²]I›É°À `zsXúş½ı›lïq !ŞŞ\¬¸È' ~Õö1ÔÙl~w~Üú¾­iñ>"6•UÚ¹ù€ëŸ_ş½xÌ²ë—2}©|Ÿ5†Î QşAü+êÛFÙo|]{}YZ"‘½ÆrGâkå{[Qw«UFIÎpéŠølßLdÈ1¼W?h’"@cïúV>ì_4’0Ú¿3Ğÿ œVŸŒl–Iã°YXJ7ÏıÑß5Bî;›ViÜ¡!C0áñÔÆ¼fÉ{n5µK²)Vef\wÆ¹5CÊsº@!'xíÏÃ¥j‹‘,Øíwo»şÏøUI&”ÛÌÒ I“oÊW9®yUŠåš{«Tp¯İ¹ ¢‡ÿ E±gšM|èÿ ‡‡ùTú™kKè˜ÆË”v}ĞN;vÿ ‡F–Õd™dv!dn3Ï¥`ô&è£$/çaÉ©<W®ín¡Ò’Uk…!™7
eÜHçm”»Ào›°©¯¤µ½…-Ä.¯
dàõ#½b2†û­Ë‹ƒÀQœŸJ¥äÛÏ İ2‚_Ÿş½Z/,±´r#,$`(ôü¹¨ñ¥*“íÒ7ËèHõ¬ŞâNâj–°Í¼S°d8;{TÅeµÊ´¥É).1­\Špì0ÊÈ›@^˜úÕoæv‘FÉÃ¿©©hiX'$©…Fõlásş­,©v¶êĞwğ½I$w0Û‰DQ¾ÖI#=jo#¹Ùä,¹>½ÿ J#Ø/Ay–XÙF8lş•cKŒİBÖ’ËC©Î	Ç5BÚ6º?e[âí·®ş;Ö•e…KÍ±mnIÍm­p~ÃÚ¹ÓüšjØî‰×ãŒò@ıã^ÿ ­xjmVÌ\®ÒÁp½Çøñ_>~Çşº“ÀÃMŠùcvq&İØaÀäûWĞ::_xyeÒõi¤`È
H#ñèkõ¼Š<¹d5NÇ‘|qÖ´¿øR†K¥‘–&+	8Å|9¬ë–SË4“[y™vs1“ëßé_V~ÜWIk¥=´p÷.&^ëÎGò¯•l¼âİJ!{’òÛ»€¯#=ëÅâÏZ1@½ÎÃÀŸµ¿à&]/N·Qû°Š¨qÚ¼»ÇŞ>Ôüm¯\kœæie;œ“Ó5è:·ìñ6—¢/‰õá,hğ®cÛ´«zûñüëÊµû(ìµ	¬) E&ì“õ¯ŠÅûH>IÖ…k;Ù`Û$Å
«åU…:÷R†âG˜)ÜzìãŒúT2#U¦Ü¶v¨-Õ˜8”Ü“Ş¼şb,KåÜÊK (€pEX±¹²¶.fÛˆÛ!8¨–Vxò÷® ‘£›hèW—;â´wq˜­É(•fŠúwö'ğİ•Î‘&©¨!UÈ-€I`ZùLŒî[x;¥Ö¾ãı‘¼5cià{y`´`%µØÁø,äœ×ĞğÅ9TÌã.ˆjÑu?Ú-ä&M¡¢'ÍÛÛĞW•şÕšÔ¾ŞCh³4ŠÀ¸É9lú÷Õìß¼nr=¼åcc¸(œµá?¶Ö©wá]êÊÚÕØ°İ.à9ã×­~‹šÕ…ç=¬3â/ßÏ©Ms:¢âCÇ¬†kU÷F[*ŞéŒÕ«™#º2ÏæRy<œš ßhg+ªüÃ ƒÉæ¿ ¬ï&üÄ6]Ó¯œ²`“È¢İ£prÙç½Ii“&İ¤®ŒU|bMŠ€|¼m=5ÎÀ–æF”*©ÁQj­7Ï€§p:
’Ú÷’ÌGéšsÚJÒ´{÷ç•©¹¶·P Á©­‘;2@\0ù³Ôc½[şÈ¸´³k‰Á*@*=zÔ7¬vÛü–VÇÒÌ›í˜9 |Ç®)È²„‰ÀzŞ›áQŒÑ’@@ïïSÚİÀQ¢Õ‹:ŸÆ€V%¶ÔØnş"0Õ>q%Æº!xú.OŞª¶û/œÛD¥_ dœw«ğ8Ñu‘=Ü~w–ªpGC@’±©)ûlöòC´«à{gÖ®*âÇNYg#Û†VW?…SñäÚ† G–‘åAÂt'¥Òµ[µ’åw¨\Ô†õfÕ/V{¦ŞF2Oaş5%Î•ölFX)òßó¨æšwMmÅn	ÎA¤7s\D-X1ò¤õ¤Ö€XÓ¼5sx’İZLJ¼óÍQ}ì†Ô(fPw?§&­Xê²@e
û@^;š¥5Ó‰Ê!Áa‘ïR8î-Œ&sóŒ~ş•Ñ››Bx±\“Ò¹y'dU*Ç%¹®kn;ô¹‡cÂL~P]ÊÜæ³‘¤w;
|&ºñUÜ:—$H|Åf„Èr«šúãlºU§ÃûİJÚ•_,.0všğ_ÙcZ‘~*ÚéR9Ù-ÆÁİ@éßßíß´¾%¤ö¶pİ~êA¹Æì Fy÷8®JŒé¦´<cN‚Iµ$SnUY¾ûò½ú×Qw}o{iöG³S$q‚x ú}*´qØ[M$¾kGÁ|s´õ£¢C¡k‹«[–eüÑíÉãÒ¸Û¹Ó“hV±)‚­@Pd“yœOü÷«:„šÜjƒS·ßq(X£şï<*Ï¾†3mÓã*XüÛÉ…9<G¡°¶„Gp”™—Nyü+›Æ6F•Æ{¡é©6ñ«'8Éùkñ+èÏgå¾Zä¾vFzúf´fñ%íš5­åØq·

‚}GÖ¹íZ	eQ6™hæy!nœõ&©Y4'‘/Ä‰Y	<>•ÒÏ¡Èm ¸ÓÕ­8ó%^Üàık›ƒ6÷Â´U’/˜Hß>•×i»˜>Ûö†bŒ€3×ô¤İŠJå™tíVÖq*É‚M£%q´zŸ­cøŠÊæÔn†$s3ä9ÇÓë]=Íİ¼¶Oj,fŠ…S!Ásß­G£xRÕoÌğ¼rÁmŒ1Á?áPØùQÍ[xyu “Ù´Ep]6·µ·á½6ÛOTf‰¼²äİÎOô­McÂwšà†æ	Hqò¹*¯ô5œúœñ&•Óìí½oÿ ëÔêI½§ë¶“[Úé%Ï9îık¡Óô»¢^ó €~\O>•‰á&µf·•gmÈÄci?Î»	ÚíF†=²Û‘Ë7nÏò¤Xùãâï5}R“L¶I¥œ28^¼ñŞ¸åğü®"]5”‚UË}3øZú«Ç>·Õ™P¼$‚Wåxé^¯øKÃºl1Ú¤é$Æ™±Ëryúÿ R‘gh¿/®î±lÌFv“ÜŠµ¨ü-½Òí&»TÂ¡˜úwÅz‘vÖ’kIJ€ÃëÇ×-ôz•ı´äÙ³$L7*Œÿ úÇWdÙ;ikq<Æ=>Ã|gAÜşµ»áİ:æáìÛdI£œtü««ƒMÒôŸ|¶Ş\Ãoğ`sšÚÑ´‹;ã,¶^J³çtÌ1œĞS¹68oìE[…ºòØÈ¼²ÈNV”Š÷Ğ=¥ö˜PPØDÎl~•¹=¨‘İ]Kn“"),=G­9²­ÙeB$ò‚Cxª"ÇcáíDK¶İ|·—¸u¯ãT5++Måí²·;zwùk«¶ƒTœ¥™ãâ¾Y0^õn	\İX®§öDi\«‘z_z±çöQHef’ßÊŒ„-“ƒ]ëÚ;[¼;ƒc(İGãQê^ÔéÍÜ‰‘&>bG
ëïX×7²XKËO0®Ğuïš	Üí|1â™â¿Säˆî\åœ—oaŠõ_]İK³íŠd 0F©5áşÕİé†t $t<ÿ Jôßø“H–åŞáN8ìi™Øî>%ß\E¤Èm"*0d•TdúWe¨jZ|)™>Ğs³o*sÔúWa¨kÒêgöEàhÕ ÆK`œ+h/ÖáZÔmY&LôAÎFhÔh½Ôq3ÊHEemÈÙ9ç?Ë¿ |F7ÛcBÅ!ß©Íqú}…íÄMg2n±UNUúòqÜ
³áİ=æf¿·ra¼’pÃ·®¥ >¼ğ_Ä{í×÷ûÆ£.Ü8ÍtÛ¶öH×ŒûĞ Ò¾ï”­|«áŠ¶`iª£ÊËØÈí]-ÿ ÆıFÏM:e£ ŠVa‚yUÇ_nk4®}5¤ø³ÃÚé#M¸ÎÅäÓjŞUša|Û¦óµ<WÉŞøŸ}¡ê-orÎ~d,E{…>-ë#÷m
w&}+9cÖ~Ëks;\<‰³…p'Ö©İi××MöfMÊ0›V¢ğÿ ˆ&× .¸Ã/ÖÑQea$6Ëå;9Àõ©l“¶ğ¨²DvÃ8´ËŒÄö­á”ŸN–8£HÕã;HŒdŸJØ¤©,1|®|ÂÜgšÒ³Üéëd“írƒ8ÿ <ô„pWogfx‡gC¸eHÿ õUë9a’Óí6å‘YÓ¿$ã½Yø…áB¡‘`]¥€óñøŠÂ³¶ËWb±ã{/Aïş}i¦ÀŞ‹U¸¶Ux™]‡ÌC.AóK
ÇkªAfFóFã@ôÅSÒ¢¶d¬›²ÇåèzôúVšÁbÒ­¯ÌIù³ÓŞ¨–Cå¿Ú[}Û]ó´Gøtıi¢öæòç™÷'
GAšI/mlb%p»O*y,Oz1Â×pÚä9õÇ9 ‡±,-4Ó»3t*WƒQ_Û4`ÎÄ  ²ç=)êÚÔ~örÆU¹äø¦ß^#Z…b¸ná}}¨ ±¨¬©iƒj²®YÉíSiQİÛÎÒC2”C×?ız‚	İì÷îPLZ·¤À—óÈoe%‚®{ÓJãBê·02É,&IKO¦+îîåXÊñŒ.C28äVşµûB-¤å¢muşMsºıµÄZYTPZ3½Õ{ßÒª*ÈÏ	jq^Z„–Ø«Œª	÷¬ûÁ
êÏ$€ïÇAëíS|;†ïìŞS³G´d³ƒš«®6¢šË/aì¾ŸÖ©ÇIáÓ¶œH3,™#$û×Oá½ZuÊvY6+ğúZı%6ì¤™1Û·á»c>¬JJ.Xáæ¬[‘ğ—T´oÍª]iå^µo\äsíKñT‹XGr¾_$!_âÿ 
ƒÃãş¢Ó@˜1İØ’?•GÅºšêÂ.F^NñÎ3ŸÃ¥+‰#“KW	å¬?*ÂHuz{TşÖæ²eK…’Àò¼õè(H<ù†û“…ÏÈ£å=j=?K»[¯(Æ%PÄ”L~gßük2’¹ßézTZ7Ö‰·ÎMÙaüéº¯…àşÍ”ídÇ&¤Ğ/§[´GÆÜnlòjéi}z”™Byltƒ-$p‘ºÛÆ6g#æ®,İÉ{¨Ê²FKî<½?•z|"ÂWÈşïpƒÔœ}kŸÁv~SÅÈÛğä)'<¥dÀµáØäyû(uU íÒXÌ,Õb¶¶€ÉÉÍbX™ôôM:rÄd·®ŠÒU6ŒK(g`[*2§ÒœF[¿¿k«UX—!ô®O^ÒÚk€ÖÚZáW–^çük©·Hïdg3€¿ÂZ‚úÒe€ÇŒ£sşÆ®"8Fse!²uqƒ•OQyåm»·ôÅtÚj.v‰ O™=kñ=õ¼8[x‘D€·õ&¬
6R°`³Á˜9şTšÆ˜oØ0ÁÜ>`µdÚê0.¯öbÄG‚1 ±éš½¨I{oM£¤1A7!ÑåÆYmr! 9èk­Ğu‰,äŞ÷[÷F2sĞı=+Ó­õ+«,İF†F%~\äÖÆ!´Hãœ–!ö¾>ö)^ÄÜ~2]¢[==˜mx·4ı`Qu¹˜…É9ô®_ÃÍ–ÌÑ:î(nƒµnè°ù·»®rQÏË´qÇ5Z—‡ïongTM|×I§Û\]®7ÆÓ$k‹µ•--à”…=Bõ®ÛÂò ŠLŒÄñÖ„Í#®æ¯ğâúæøm€Ôï\.FsM°øh|¦=§øŸı«Ñ#»3D2™}â*¬€ylfqØ÷ ³‡>’ÆC	\á¸8æ­Yi0Ø+N³b>cÏ«­\ÁnËÉ·jŸSÏøW1.¾¥<‘*¢«
˜íŠ ±s­FŠ3‚«Áæ‰µá3B’aD1éjço¼TMûÙª«ÄP0yÈïVì§óSe­¦õò²Yø9ô«JÈOc7R½œH^[Ÿ‘dîG#=@—zts¥ËJXïÚ¨xkt½’çÌ8À!M`jw:’D$!‰ÈN1yªDÖ™ªèNICŒ°ÆOŠ^È|¨€‚Õæºuî¨‘+ŸŞH9'?¥tÉr\‘»u@	Î	§k¢Z;}Y‹TºnW `sŞ´uíIµ—í
¥eHàuä×	¢ß®ƒ¤4‘œ‚å=ÿ *å¾ øö;«Ï!o%±…ãŠicÆÚõ½Ì>}¥Æ×?w/µóÏÆ¨.ç’g3«’¹Û»%k´ñŠì-£yogÊîÂ®î2y÷äW•k«u¨ŞÍpŞY8ëïÓõ¦#›ğŞ–óİı¡Ë(áxÆNkØüdÖ°ñpYJãøkğÆŸ*KöipŒeW ÷Æ
ômÆÜG£{  a z'ƒ!eœI9f\„#§ã]#jão—–|ÊyÏZçü}›ƒii#Ë³uü=k¥·'Q„\EMÉó<şEUôV$´¿¸2FÒÈB“º­\±É,ÎkÏ%Õ^ÖàÂÌØQËŸ_ğ®“Â:’IåÜ@ÎK789©.Çµxa­e„H$à‘éPxšÆ-*3ğZÍğ.¨×6ì¬Û°pk¨šîíöªä(ïI±5Ôò?ê7pÙÉ!‰‹(Æãy‹&úIb#’Ãğ¯mø…g$H]óƒ€1Çzò­[O·iäÛ¦ÑÎ{òk&sÌóæG¤‰¦rz{Ó4«k[Wìóİ6Şdÿ ŸòkoU„(ShÜÖ-…¼~¨%ºb8Úvä÷î*Nf·:=ÂÑ^ŞPN Ç^ÕíŞğ¥‡ãÔa¶a .áÔWšü7ğèw[¡tÌ‡…tæ½ãÃ÷ZUˆ–×®ÅQGÊ£“øP$Ì‘ÜºÆ«‚ïëDSE4„DÃ|øª ¤s1µ- Uù‰ôÍ^²†…(±“ôÎ+ëÓ<Õ©£jûâÄ1ß{½_0*(b£vŞ¸¬ÌÜÆÆT·Nÿ ıj¹o{æÆÒÜ¶N81MrÊ¡„rqüù¤14ÈP”=z§,ŒgóY	È'üûU–±¹$PV³ò_ÌgÂ‘ÜS­ÀŒ ½ÅGÍpÛ&È g‘Å>/Üpè=hY7'ï7„ç‚|Õ{¹¾FU¸›¸íO¸¼ylÄh¿7™Óñ4Ô·‹ËÜğŞ½M ŠËbÜuÅIn£ÉÌˆI<øš–+I!Ë¡`¸àT+-Í¼l6îõş”täl˜‰#Åm¶L³Œnõbå£˜¬r ÜÃ8ô¸HÈ1C÷JÅE\t±nfdsÓ‡šKmûZ01ÆÖnÿ …+#ÄÆRp ò3Å5nÈyŒcéI-’D¯må¡XÜ)>½ê•ñmŞHœ1ÇÊqúÖ• iÜ©e8 š©y¦‚J²lÏqT2¬1¤Q¾É2Ç©õ4Ëµ(E1±Üß6ÓÒ­Gi,1î‰ñØ÷§Ló°ÁÆA4ZÂL’3d¯ajÂm dÙ³ø&¢€Éæºn8îsWíc‰ğxäâ€2¤ò.9'§Z€Æ¥UıjãÆ@€RiñÆ’n€ s@&„ÜE'ïÂ‚A9«G6Êr@úş5Yÿ y3[‰T†¯zX#[WóŒ|v4²´On?sƒŒo5VHÈS±à¸æ’9¦‘–VÆ~î*w²Ics¼àò Ç"¸h‰*[i¥\‰--£Ü#%“¾îZ©Aä†‘ˆär1R‰”ä8 ½šeY Â»7Ì{b¡ºY9…$µK¯"8‡#äÍ,ñ4K˜w¼Ğ+krÀäü¼c*ÍÍ¤RÚ	b“,ñf©YÉs}›ì‡#¦Oj¸Œó†·’2 ÁÉÿ >Ô^ŞÌäzÕ–µİ“#9y=iê[k‘Ø}i·;¤B±íàZ §0‘²Š0 Á5Q –Ü†šL×oz¸É,sâNŞôË_*áŠ¨ÁÏ?•	¬£ò£wY²XŒdqşzÖ”EØˆ£å9äÖlw
Ò›Rª ~•«¦$
Åc—ÍS¦€.iÒ$’åÁ#ŒTæ8„ä'CÓŸz!nCc;y©íäpP€öİÔRåIµˆşıÏ­K6÷ ,€©>ªvZ<òpGó©,íÊË¿‚3À¡›#[Âez^¸¦V8šF„íç+EeÎIä1Š.Sio,îB½Ïùÿ ?«Š¸\Ì²¶áKÉÆîƒ­XM:İ£U%IàƒNŠù‚¤X#t5nÒX]¶0‡·Z´¬"ôh	ï.0æ´4})˜:°ùMX²µWÈAØµ«£éÀä€«–ásT‘7BÙh*_qR=0:Öİ—†’àuÁ`Tšt·9Æ9­ëT˜ğ8â¨e[O­½¿R_äTú~”Ë8ypzVªÆV,:RZe¤(S#=: Ó°·R¼òq“Zkd–_Æ³agr æ¯Ù†pQ»ñÅ.€lZ˜Œ¯µjéÉòäŸızÇÒ¬\°(ÜwÑYÃµp{T*äğÆ¤SÄj)Qv÷¥¨,iHÆ)n¤@©h¬îĞ¨ÖŠO4d…HÇj¶PSJpyª‹'–Æ§a¾6DLä×š|F³[vbÊqß­zíÂªœšó¯Š|SN]qÏŞã5ªw!­¿°óƒ<Kœú­S}êX›2®8k¤Ö,Œ
R5Ç“¦¤æàDAaŸ›=«DF…%ĞäTRn*¥ÿ …ÙƒHñğË¶»øô¸ÑÌcîıÑĞÕMKN'+ŒvÅg™ê:Sƒp8Ï^YÉÅŞ£nÒ9=+Ôî´ˆY
•=ğkšÖ|<’»bö hâã°Š$2)ê};Uû9J#€ÙÈÏ¥;VĞÖİ7P01Å3O”Yf0y »½ …Õ´¨Âç§¡µŒQ"¸X¤fa	wÿ ?kÌæt.­¸)Ç¿5‹|·+{ç)Ú¸ÚAÏ?şªVìS{ki&{sÎ{¶GzËÔìˆÂ‘Ÿl^$‘HâhŠì8àry¬İRŞV@BªİvúşTìQŸm6Q¤ rıRğÄÄ`/Êª:~4óhVR»Ã¼E>ßJœ6ô—HÀÆN ‚{K{È<×+Ò¦Y4wirŠ…1Øw«okåÅä‚p9'85&™ÅÀuAºA@°^8³œË-İÛŞ¿1¿nk“}ñ·Rû±‡7,sœGùõ¯Ó›xŞâÆymÊÆ§¤‡§züÅı¼úëã}ú[@øII&!ËŞ´€8iT[É#:áe\õ÷¬¸Vk‰.®/^`>O»ŒÔıkr{]X²Ç<")´4xùGzÊû]•ŸúW#J´„äõÎÏÿ _]€Î°áïÚŞ41Ã2ü­'ŒŠÏŸÃ’}ªK‹	QşÎ¤:ƒÀäıkIşÙw^Ïµ•Ëä‘éíÿ ×«ºÒÙŞùÄfV#†ÁÅRw)4TÏ;j0[OeÈw9Aí­fjZzi?k–åZ%|$rI=±í^ª<gı4ë.G—û¦+–Ú¼ÿ R;<^!r‘«¤Iíïş{S†eî©e$>Ÿp¯µ†Í¼ƒğşµDÛ<Ï)¾†8¾0ôØÒ»Ñ4¨£ƒP´ˆˆ.ÑĞşÔ‰Òq,	p³áÈoáséıh~î×ìóÛ •ÀÙàœqÏ¹©4kk-ŞÖÂI<à–çı^3œ¦Ÿg%œw_K;¹å”c#¿×üií6šow-ãùD¹	>yÏ·OÎ€2¼E$woä^[˜ÎB¹õÇ ZÏ¸Ô%¦Ş®AD˜NŞÿ ızØ†Ùu˜ÌÀìv ñ¹àçµfş9§ŒmˆÍŒ‘ÎE=ŠAo¨ÉŒÊ¶”aÿ {Ü{÷Í.›wus}ä\±Vhÿ t[Øî};TK´SMi1o³¤yØù;'ñ«“ÙÛQå†b@òH¯·Ò‘Z\I%“—{O9å|<jÙ â¨ º–cn4µBä• sÇ¾¥j&˜–¦¹®	lÃ <š««ëÆë!Š7V%ŸäUÇa¢¸óí-`1\mÌ	ÛÇ'¥A%–¬¢)$o',²·òçÿ ¯fÛû»G–[Xá&p£üÿ :MCWI£k;ƒ?î¾UUèM\WRÊjÓ]“²ÔÈĞòF?Æ–ÊUÒä]J;WbÀïŒö¸õ Øµ¥€F!\É‰"SÓßëÅZµ³…ä7’HÅ3»Ä§µPK4p[˜lí÷	€Ã÷3ÜûÔ3Mgk*İŞ]5ÅÊà"…ôãŞ™ª­Í¤r÷ˆÈh”c®y5RÇvÑLÚ|l0!I	Ï_zvõãZÌ±bà•Ë ãœsŸZ¬¾m=İíR7c•´³Ïrg²CrÍ‘Ğz±y­ÏªØ;Oº’óê=ÏzqEDÎÓíã²¼šÉs¡Ø¥¸cÏ.¥c5å¢±óuº\’ u«vÚ>›¤ÙùÒ\Erp«	¨¡©ÛO³L¶_8y»[¢ı}êŠ*Û%­¢@¢XòÒa·äí•5Õ—'ÈQpŸ,m¦ÚéAÚ[Û­«;É¸&ìƒë§­Aéi{3İ[34doe<ozi\İ~ñ-'‰]£D„ ¸áãCUt»+·¹‰şĞ‚ ™pÍÉ¢Xdqoã´LC>ñõÀ¨-ÙßÌòn$vVÂ2&UWü­ZĞz‘o},‘E6Ø£ às‘‘ÅgC{qWv1åíDrå	íôÿ ½†£§‘{âHÜnr{)ï¸Í%å‘óíoJ¾Gn¬ho}i£YÇ¨ÃH`õ«¶öÒøSx—
rAçÓÒ³¥´šÖWéóDpq*]à2^Ëù‘O|šqÜnJÓ#jæ7EHÇ oo~µZIåO‘2Ü/ SéíR‹vÓæÚYñNKtcœf¨êíy¦ÜyÒ¨f$ äß5aga4ípı¦P,àŒão®.÷<ñÜLªNp;}3ZšuëYªE(Vœn2û¹ÿ ëSÖtMMb’mÈT*Ë´õé­A##UŠKÃ;‚²à‘Û5wM%mn$¼¼ò·`E!ş/z—T¿·½Ô"ˆqòdc 8¨0öSÃ}n‹Œä:œb©+M{«E‘²Ôìc•œŸåYúuµ­Ä*Ğ³’EóT¡ia–Ô['Ì7×'üñSè–†-âÀ²Œ~÷ÌÀªWM¬¤Óõy§Ò¥a—îóĞ~UªÃ¨‹Ó+D$.wH_ÌU«{:ÚâG”ÃûÌ(AÁ­/é–÷ÒºXß;ìæT¸A×ëŞ©+É7Ûnídû~D!QÀçè~µĞéW6ö¶1Ã…d6“êØéUîô›U•n6%·¿š§
\—{(Ûy•ÿ vHû˜<’}:S]‰ØÊş\*Ò¨Åºö=ÿ úõ.“o¬^J¬²Äé#eÏ=€5<¥¥ÊZ]ÎdBxcì£½z/…¤øy¤øzâíuEË(ÜœàtãÔóÍRW-­¸TGóÊI	3"„™«sjšÑ±[\ŞC#3z}{vª—0éºÔûâ˜[£æ_s×Ú§³ğí¤v+Íó3«şêdmÀ/n?:ÑG¸ÇªøƒOò®¦iW~VdrüóV-õ‘i%ŠËqÏÎï÷b\úz«_Á¨I:Aÿ ˜Wåf/Œ¯'õNÕg±i’ßTÌe¾ã§nkUÔ
ºªhË±dËI&ëyó´˜íÿ ë¥»»Ø©¦BcQ” ÿ œu½s¦A-¼I,dõÄ•oÂ§õ•W·DF'Xà®8õè?:¥¨±iğjš4WQBcUM²İ{b²l´kÄ¼uUò¡<©lŒØ«ßÚz^íÚHåB»Õ±å7<Mµ›Hã´uŒ3°Æÿ QW€Ù'¾æk»xc*dà¶?ıU©§<wºr3‚’à}Oÿ Z™Ëqe,VíùClÌİÇ±õÿ Êk»˜æXßmw_°Ân{ÿ :Ñ.À29l d0°ËíG ôæ ¨oÊÛÛ³Æyf# õÍ]¶´»Õ.¼…¸‰°¿:õçĞzšjYÃ)–ÒÑ¥Y‰èxGò«I&ké6×?i·±…B¸Àvs×ŠwŠ-âµ¼m:Pª$Ü¥?ç‡µëLı©-¤xGO¿¨5>»w6¡ÔcÓUBH'w=GcÆj’-hŒS¨k²<’"ù••rO=AS@·3 ÒÉ0ÄÈq‘øÖ‹ë:š¤	t$ÌÍÁpxõ¦gª¨+•—;I#¨<t÷­Œi® Ï©Åw+Bâ€÷ıÅjkNÂI4¸•YoÏZÎÓtènÙ‘´,X€0Bó½_¿ğÙkUºÓ­ŒrÃ=ÿ 
Ö1æô[²!Ô£*è¿»’#ß=E‹K(a3’¤³Æ2J÷ü?Æ»má–£âkO&êÒBÉ@HğìO¿?ç5¯á¯Ù›ÅWW–ó$3B“³ó•¹õÿ è…
³Ù£sŠ€ÛXé²™¤ıæÛ· z/5_J‚şòxì¤µ2¹ê¬
äôô¯§|%ûêºÆÙ',U¤ÀŞ‡æÿ k5Ğ\~Æ–ú&»´Š¬$Æé‚ü©ø÷é^Œ2ŒkWåCæá÷ˆçÔWD†Ğ„gSÁ	ÙÜÅz&…ğSÇZ£k{›$±Êù%Óæ`OÓÂ¾ºğÁOx2ÒŞ+«%¸ˆ‚­(qõéÏÿ ^»Óà+V±‚êËNŠ'’Œƒ‚=+ÔÃd‘p½W©q§mÏ™¼û*ßx·U†³§”Uİ#4\¯¦+×¼1û;xKÂ÷PØZÚF7º³å‹çü+¼ÑÖò&‚8¼´û¡‰ ¿0õ·Ş Ó,Œot¬Ì¿xÈ‡½ztpzÁŒ½#Àv·&XN„òùRã''úWwám.ËMÓ˜O¦¬r®0?7øUã+}2ÁcĞ‚1– Á¶ò2søÔŠ®52j1ËµäıÜz{óŞ»b´4:›ˆâÖ4I-!»Ã‘„hØpüş•áß>	SU¸’bW˜·{õÇùëUµ]e­mä¸´•‚°ÿ –M€Ü*¦™y%Ö¡o=äÒ,e°X•lö'9íT®¡á$‰×XÒÛ1¸…~£$ãëTo×P•ìò7š6?(÷õ­$YŸ±6Ëbãd{¸=ı¨m:æmmllË'§N†©lz­¥¦½`¶z„å$ÈÃ6ã·ãUôÍ	à¼HŞØ°Ws7÷ü¿ZĞºÑ%´Öâµ$4q¸ÎıNOş½MâOöï·´p²í‰CËZ`s­´WÚ›İ"»Ê°äN2·åÍix7şıi#Ô$Y&ŒpKr=~*„Ë¾µu §t­HÜ2:`Ó´ïÀúä·×ğ%ßj#v=ş¿ız ³­ê7:ìsD%dUùV3 ’9ü¿Z¹¦YA¢EÅË=ÍÔ &óÃdàƒUõIf…§ŠÏ$`nØ ,½€ü«EæÓa¶²¹•ü¢1*Œ‘üê^ Y´¾Õ¡ñl¥İÂAƒÙr:§½w‘ü]ñcÛÉ£iÚì¯¦Â¡gfíƒÛŸÂ¼ÛV]KW¼Š¦r¥·"ƒŒ¨÷®ÃÁöZt0tì…±¹£§<Ö2µ€õÏÙÃH´Õ¯¦ñN¥ºGŠE1g“ßšô¯ˆ^(¶ÃO&£(gŒ‘¹qòõı:W–xÆpøVÔÙ¤Q¬oÿ -@Æ@éÓ½rş<ø—¨j-uÓ´°26ÖC€yÇ8®wNì7ø•¯ÚOw2Ûiğ°·cºp0<×57Ä0Ş\ml¢'»n?á]´µ•ÜÆ¡em«€ì3\Ô^·»ñ·—Š
‡À—òÀ­â´.,è<?¬Ïwg..|« Àcø	=GøÖ·ö}¶—¤ XvHĞğBd’xçÿ ¯\ÿ ‡ôÈ¡Õáò®Bì–'<0ú˜şu«ãÜYÏöÈ§¨*»@¥RW(ål<Q©ÙjŸ¼>J«RßÆ2rEu:wº¥Õİ¤ëæ“÷Øvúõ¬ë½M¹ş[Ë$eh?sµpê8õ5FÛÛ²ÖVÆKu8¬q8=*’°‹‹ûÙEàß5»¿f@n!]'†ìå¼Ğe»ñŠÊîKF7ø¡®gÃi¨jWo½È†  ;ƒ’ÍÈî?lßÇ¬”m2ÖUH†‚ØÏ˜¦€Ë×<H.´I4ˆ#Î
»AÎş/|Uı.ÁG˜¶RÜîHÒìè4ÛûºTº6ôŒñÔ~5oÄ//ööv›”“ód¼æš Ê¼,l[RµF`Ï´eˆ_fëSévÏ©Y½Ä— Â<HÜg¾)—Vr/…şÉ{rU¨^û¹çğ«ÚE¥‹èí&–›’,0çiZ@A‡äÒõ¼s$®¤ƒI?ÇµGwic«êxƒÍ´ªt¹üªì¾ ¼¶ÿ J¾P ]»O\òØßÒ¶|+>‰<^-º£‰€¬x]§ ×Ö“Ïİjºf—­=¬Û€ (?¼9íW¼U¤,¶VªŠ¯3 s+”Î=?Æ³<X#}l¹ƒ²|ËĞ·=«¡Ö'Â ’0³D‹–¿t¼ÔØ~äÚZE4V²ˆ‘CaGÌÉ?úõ„µkŸ^\ß£³‰H_,ğ1åUït+[ıjµå0
Ä¿VÇ ~Gô®’ö_h“KèP„+1~yÆ?!ŒãŞ„o‹/å´‘aŠvŠŞíC¶ìä1'é“^{®|J“ÃºêÚ¤[¤fÒ$dv½wŞ'škVŠÎÚR"¢Çÿ È®;Ä?`Ôgº×$Wq›ãòàw¡ :OİÅâ«[±{¿Î3Eº1ÏÖ±¼£Ì—7VåÊ’AWdœÓøsmue¨/öU-‹+Ißæı9­ÃodŠP$edµúÅäñøÔô¿€åú¥æ…¬³f2,ò‚7‘?.k®Ñõ;5·†clsÇåYUî˜ş‚¡ycŒe¸É$éW|	§Ío$:Ï«1ó70=‡çŠ‹éøs¥iz»ÜD§Ì‚<<0®ÈÏò­bâÇMkh$mÏœ T‹(Î?Ç5…à¿KqªÜkşjÈ Œ$ªÏ_Ë<sôª^5ñ%·¨%õ¡’9cŸs7ÏôüeËfoèöÚ†©q2êÇ@Én¹Éï\wš~%ólö«?ÈKo­mA®°°kÍjê0²JBÉÎO^Ç½sÚ†»£i–w–ÒÜíi¿AÀÉ•j s:d6¼÷v±àMpwyªœç«77·sê·[mV‰v‡Ær;:ÊĞ/•õôk•ÉBÌò6'5-…Ş¡¦k