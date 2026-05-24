'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';

// Layout template previews with category-specific designs
const LAYOUT_TEMPLATES = {
    // Food & Dining templates
    food: [
        {
            key: 'restaurant',
            name: 'Restaurant',
            description: 'Full-service dining with menu sections',
            icon: '🍽️',
            preview: '/templates/food-restaurant.png',
            features: ['Menu Sections', 'Table Ordering', 'Reservations']
        },
        {
            key: 'cafe',
            name: 'Cafe',
            description: 'Coffee shop with quick bites',
            icon: '☕',
            preview: '/templates/food-cafe.png',
            features: ['Quick Menu', 'Drinks Focus', 'Cozy Vibe']
        },
        {
            key: 'fast_food',
            name: 'Fast Food',
            description: 'Quick service counter',
            icon: '🍔',
            preview: '/templates/food-fastfood.png',
            features: ['Quick Order', 'Combo Meals', 'Takeout']
        },
        {
            key: 'ghost_kitchen',
            name: 'Ghost Kitchen',
            description: 'Delivery-only restaurant',
            icon: '📦',
            preview: '/templates/food-ghost.png',
            features: ['Delivery Focus', 'No Seating', 'Pickup Area']
        },
        {
            key: 'food_truck',
            name: 'Food Truck',
            description: 'Mobile food vendor',
            icon: '🚚',
            preview: '/templates/food-truck.png',
            features: ['Mobile Menu', 'Location Map', 'Daily Specials']
        },
    ],
    // Service templates
    service: [
        {
            key: 'professional',
            name: 'Professional',
            description: 'Consulting & business services',
            icon: '💼',
            preview: '/templates/service-pro.png',
            features: ['Service List', 'Booking', 'Credentials']
        },
        {
            key: 'booking',
            name: 'Booking',
            description: 'Appointment-based services',
            icon: '📅',
            preview: '/templates/service-booking.png',
            features: ['Calendar', 'Time Slots', 'Confirmation']
        },
        {
            key: 'portfolio',
            name: 'Portfolio',
            description: 'Showcase your work',
            icon: '🎨',
            preview: '/templates/service-portfolio.png',
            features: ['Gallery', 'Projects', 'Testimonials']
        },
    ],
    // Rental templates
    rental: [
        {
            key: 'property',
            name: 'Property',
            description: 'Real estate & accommodations',
            icon: '🏠',
            preview: '/templates/rental-property.png',
            features: ['Listings', 'Gallery', 'Inquiries']
        },
        {
            key: 'vehicle',
            name: 'Vehicle',
            description: 'Car & transport rentals',
            icon: '🚗',
            preview: '/templates/rental-vehicle.png',
            features: ['Fleet', 'Availability', 'Booking']
        },
        {
            key: 'equipment',
            name: 'Equipment',
            description: 'Tools & gear rentals',
            icon: '🔧',
            preview: '/templates/rental-equipment.png',
            features: ['Categories', 'Rates', 'Availability']
        },
        {
            key: 'vacation',
            name: 'Vacation',
            description: 'Holiday rentals',
            icon: '🏖️',
            preview: '/templates/rental-vacation.png',
            features: ['Amenities', 'Location', 'Reviews']
        },
    ],
    // Retail templates
    retail: [
        {
            key: 'gallery',
            name: 'Gallery',
            description: 'Visual product showcase',
            icon: '🖼️',
            preview: '/templates/retail-gallery.png',
            features: ['Large Images', 'Quick View', 'Featured']
        },
        {
            key: 'catalog',
            name: 'Catalog',
            description: 'Detailed product listings',
            icon: '📋',
            preview: '/templates/retail-catalog.png',
            features: ['Filters', 'Categories', 'Compare']
        },
        {
            key: 'standard',
            name: 'Standard',
            description: 'Classic online store',
            icon: '🏪',
            preview: '/templates/retail-standard.png',
            features: ['Grid View', 'Cart', 'Checkout']
        },
        {
            key: 'artisan',
            name: 'Artisan',
            description: 'Handcrafted goods',
            icon: '🎁',
            preview: '/templates/retail-artisan.png',
            features: ['Story', 'Craft', 'Limited Edition']
        },
    ],
    // Default templates
    default: [
        {
            key: 'standard',
            name: 'Standard',
            description: 'Classic layout',
            icon: '🏪',
            preview: '/templates/default-standard.png',
            features: ['Basic Store', 'Products', 'Contact']
        },
        {
            key: 'gallery',
            name: 'Gallery',
            description: 'Visual showcase',
            icon: '🖼️',
            preview: '/templates/default-gallery.png',
            features: ['Images', 'Showcase', 'Featured']
        },
        {
            key: 'catalog',
            name: 'Catalog',
            description: 'Product listings',
            icon: '📋',
            preview: '/templates/default-catalog.png',
            features: ['List View', 'Filters', 'Search']
        },
    ]
};

const COLOR_OPTIONS = [
    { name: 'Teal', value: 'teal-600', class: 'bg-teal-600', hex: '#0d9488' },
    { name: 'Indigo', value: 'indigo-600', class: 'bg-indigo-600', hex: '#4f46e5' },
    { name: 'Rose', value: 'rose-500', class: 'bg-rose-500', hex: '#f43f5e' },
    { name: 'Amber', value: 'amber-400', class: 'bg-amber-400', hex: '#fbbf24' },
    { name: 'Emerald', value: 'emerald-500', class: 'bg-emerald-500', hex: '#10b981' },
    { name: 'Blue', value: 'blue-600', class: 'bg-blue-600', hex: '#2563eb' },
];

// Get templates based on category
const getTemplatesForCategory = (category: string, subtype: string = '') => {
    const categoryLower = category?.toLowerCase() || '';
    const subtypeLower = subtype?.toLowerCase() || '';

    if (categoryLower.includes('food') || subtypeLower.includes('restaurant') ||
        subtypeLower.includes('cafe') || subtypeLower.includes('dining')) {
        return LAYOUT_TEMPLATES.food;
    }

    if (categoryLower.includes('service') || subtypeLower.includes('professional') ||
        subtypeLower.includes('consulting')) {
        return LAYOUT_TEMPLATES.service;
    }

    if (categoryLower.includes('rental') || subtypeLower.includes('property') ||
        subtypeLower.includes('host') || subtypeLower.includes('accommodation')) {
        return LAYOUT_TEMPLATES.rental;
    }

    if (categoryLower.includes('retail') || categoryLower.includes('product') ||
        subtypeLower.includes('shop') || subtypeLower.includes('store')) {
        return LAYOUT_TEMPLATES.retail;
    }

    return LAYOUT_TEMPLATES.default;
};

export default function VendorBrandingPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [uploadProgress, setUploadProgress] = useState<{ logo?: number; banner?: number }>({});
    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const [vendor, setVendor] = useState<any>({
        business_name: '',
        bio: '',
        slug: '',
        status: 'pending',
        theme_color: 'teal-600',
        logo_url: '',
        banner_url: '',
        website_url: '',
        business_address: '',
        template_id: null,
        category: 'Retail',
        sub_type: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch vendor profile
                const res = await api.get('/vendors/me');
                const cleanedData = Object.fromEntries(
                    Object.entries(res.data).map(([k, v]) => [k, v ?? ''])
                );
                setVendor((prev: any) => ({ ...prev, ...cleanedData }));

                // Fetch store info for templates
                const storeRes = await api.get('/stores/my');
                if (storeRes.data?.length > 0) {
                    const store = storeRes.data[0];
                    setVendor((prev: any) => ({
                        ...prev,
                        template_id: store.template_id,
                        category: store.category || 'Retail',
                        sub_type: store.subtype || cleanedData.sub_type || '',
                        logo_url: store.logo_url || cleanedData.logo_url,
                        banner_url: store.banner_url || cleanedData.banner_url,
                    }));

                    // Set dynamic templates based on store category/subtype
                    setTemplates(getTemplatesForCategory(store.category, store.subtype));
                } else {
                    setTemplates(getTemplatesForCategory('Retail'));
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/vendors/me`, {
                website_url: vendor.website_url,
                business_address: vendor.business_address,
                theme_color: vendor.theme_color,
            });
            alert('Branding settings saved! 🌴');
        } catch (error) {
            console.error('Failed to update branding', error);
            alert('Update failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleTemplateSelect = async (templateId: any) => {
        try {
            await api.put(`/stores/my/templates/${templateId}`);
            setVendor((prev: any) => ({ ...prev, template_id: templateId }));
            alert('Layout updated! 🎨');
        } catch (error) {
            console.error('Failed to update template', error);
            alert('Failed to update layout. Please try again.');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading('logo');
        setUploadProgress(prev => ({ ...prev, logo: 0 }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload to store assets endpoint
            const res = await api.post('/uploads/stores', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.url) {
                // Update vendor with new logo URL
                await api.put(`/vendors/me`, { logo_url: res.data.url });
                setVendor((prev: any) => ({ ...prev, logo_url: res.data.url }));
                alert('Logo uploaded successfully! ✨');
            }
        } catch (error) {
            console.error('Logo upload failed:', error);
            alert('Failed to upload logo. Please try again.');
        } finally {
            setUploading(null);
            setUploadProgress(prev => ({ ...prev, logo: undefined }));
        }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading('banner');
        setUploadProgress(prev => ({ ...prev, banner: 0 }));

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Upload to store assets endpoint
            const res = await api.post('/uploads/stores', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.data.url) {
                // Update vendor with new banner URL
                await api.put(`/vendors/me`, { banner_url: res.data.url });
                setVendor((prev: any) => ({ ...prev, banner_url: res.data.url }));
                alert('Banner uploaded successfully! 🖼️');
            }
        } catch (error) {
            console.error('Banner upload failed:', error);
            alert('Failed to upload banner. Please try again.');
        } finally {
            setUploading(null);
            setUploadProgress(prev => ({ ...prev, banner: undefined }));
        }
    };

    const getStatusBadge = () => {
        switch (vendor.status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Your store is live!
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                        <span>❌</span>
                        Your store was rejected. Contact support.
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                        Your store is pending admin verification
                    </span>
                );
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 font-bold">Loading Branding Studio...</p>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-slate-50 py-20">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Vendor Branding Studio</h1>
                            <p className="text-slate-500 font-medium">Customize your store layout, logo, and branding</p>
                        </div>
                        {getStatusBadge()}
                    </div>

                    {/* Store Info with Editable Logo */}
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-200/50">
                        <div className="flex items-center gap-6">
                            {/* Logo Upload */}
                            <div className="relative group">
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploading === 'logo'}
                                />
                                <button
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={uploading === 'logo'}
                                    className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 hover:border-indigo-400 transition-all group-hover:shadow-lg"
                                >
                                    {vendor.logo_url ? (
                                        <img
                                            src={getImageUrl(vendor.logo_url)}
                                            alt="Store Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-3xl">🏪</span>
                                        </div>
                                    )}
                                    {/* Upload overlay */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploading === 'logo' ? (
                                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="text-white text-xs font-bold">📷</span>
                                        )}
                                    </div>
                                </button>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap">Change Logo</span>
                            </div>

                            <div className="flex-1">
                                <h2 className="font-black text-slate-900 text-xl">{vendor.business_name || 'Your Store'}</h2>
                                <p className="text-sm text-slate-500 font-medium">/store/{vendor.slug || 'preview'}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLOR_OPTIONS.find(c => c.value === vendor.theme_color)?.hex || '#0d9488' }}></span>
                                        {vendor.category || 'Retail'}
                                    </span>
                                </div>
                            </div>

                            {/* Banner Preview with Upload */}
                            <div className="relative">
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    onChange={handleBannerUpload}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploading === 'banner'}
                                />
                                <button
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={uploading === 'banner'}
                                    className="relative w-40 h-16 rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-400 transition-all group"
                                >
                                    {vendor.banner_url ? (
                                        <img
                                            src={getImageUrl(vendor.banner_url)}
                                            alt="Store Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-linear-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                                            <span className="text-xs text-slate-400">No Banner</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {uploading === 'banner' ? (
                                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <span className="text-white text-xs font-bold">Change Banner</span>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-8">
                    {/* Layout Selection with Visual Previews */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                            <span className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center text-sm">🎨</span>
                            Choose Your Store Layout
                        </h2>
                        <p className="text-slate-500 font-medium mb-8">Select a template that best fits your {vendor.category?.toLowerCase() || 'business'} type</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map((template) => (
                                <button
                                    key={template.key}
                                    type="button"
                                    onClick={() => handleTemplateSelect(template.key)}
                                    className={`relative p-4 rounded-2xl border-2 transition-all text-left ${vendor.template_id === template.key
                                        ? 'border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-200'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {/* Template Preview Image */}
                                    <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden relative">
                                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
                                            <span className="text-4xl">{template.icon}</span>
                                        </div>
                                        {/* Simulated layout preview overlay */}
                                        <div className="absolute inset-0 bg-linear-to-brom-transparent to-black/30"></div>
                                        {/* Layout mock elements */}
                                        <div className="absolute top-2 left-2 right-2 h-3 bg-white/70 rounded-sm"></div>
                                        <div className="absolute bottom-2 left-2 right-10 h-2 bg-white/50 rounded-sm"></div>
                                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-white/70 rounded-full"></div>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-black text-slate-900">{template.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium mt-1">{template.description}</p>
                                        </div>
                                        {vendor.template_id === template.key && (
                                            <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">✓</span>
                                        )}
                                    </div>

                                    {/* Feature tags */}
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {template.features?.slice(0, 3).map((feature: string, idx: number) => (
                                            <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-medium">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Store Assets Upload Section */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                        <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-3">
                            <span className="w-8 h-8 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center text-sm">🖼️</span>
                            Store Assets
                        </h2>
                        <p className="text-slate-500 font-medium mb-8">Upload your store logo and hero banner</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Logo Upload */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    onChange={handleLogoUpload}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploading === 'logo'}
                                />
                                <button
                                    type="button"
                                    onClick={() => logoInputRef.current?.click()}
                                    disabled={uploading === 'logo'}
                                    className="w-full"
                                >
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                                        {vendor.logo_url ? (
                                            <img
                                                src={getImageUrl(vendor.logo_url)}
                                                alt="Current Logo"
                                                className="w-16 h-16 object-contain rounded-lg"
                                            />
                                        ) : (
                                            <span className="text-3xl">🏪</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Store Logo</h3>
                                    <p className="text-sm text-slate-500 mb-4">PNG, JPG up to 5MB</p>
                                    {uploading === 'logo' ? (
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Uploading...</span>
                                        </div>
                                    ) : (
                                        <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors">
                                            {vendor.logo_url ? 'Change Logo' : 'Upload Logo'}
                                        </span>
                                    )}
                                </button>
                            </div>

                            {/* Banner Upload */}
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    onChange={handleBannerUpload}
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploading === 'banner'}
                                />
                                <button
                                    type="button"
                                    onClick={() => bannerInputRef.current?.click()}
                                    disabled={uploading === 'banner'}
                                    className="w-full"
                                >
                                    <div className="w-full h-20 mx-auto mb-4 rounded-xl overflow-hidden bg-slate-100">
                                        {vendor.banner_url ? (
                                            <img
                                                src={getImageUrl(vendor.banner_url)}
                                                alt="Current Banner"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-linear-to-r from-slate-100 to-slate-200">
                                                <span className="text-slate-400">No banner uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900 mb-1">Store Banner / Hero Image</h3>
                                    <p className="text-sm text-slate-500 mb-4">Recommended: 1200x400px, JPG/PNG up to 10MB</p>
                                    {uploading === 'banner' ? (
                                        <div className="flex items-center justify-center gap-2 text-indigo-600">
                                            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium">Uploading...</span>
                                        </div>
                                    ) : (
                                        <span className="inline-block px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors">
                                            {vendor.banner_url ? 'Change Banner' : 'Upload Banner'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4">
                        <Link href={`/dashboard`} className="px-8 py-5 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 transition-all">
                            Back to Dashboard
                        </Link>
                        <Link href={`/store/${vendor.slug || 'preview'}`} className="px-8 py-5 bg-white text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs border border-slate-200 hover:bg-slate-50 transition-all">
                            Preview Storefront
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
