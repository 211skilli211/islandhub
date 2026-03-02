'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/auth';
import api, { getImageUrl } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: '🍲', subTypes: ['Restaurant', 'Ghost Kitchen', 'Catering', 'Street Food', 'Juice Bar & Smoothies', 'Ital & Vegan', 'Dessert & Treats', 'Snackette', 'Bakery'] },
    { id: 'products', name: 'Products & Retail', icon: '🎨', subTypes: ['Artisan', 'Electronics', 'Clothing', 'Furniture', 'Groceries', 'Agro Produce', 'Souvenirs'] },
    { id: 'rentals', name: 'Rentals & Vehicles', icon: '🏠', subTypes: ['Car', 'Apartment', 'Boat', 'Jet Ski', 'Equipment'] },
    { id: 'services', name: 'Services & Tours', icon: '🛠️', subTypes: ['Professional Services', 'Tour Guide', 'Taxi / Transport', 'Pickup Services', 'Delivery Services', 'Experiences'] },
];

const COUNTRIES = [
    { code: 'KN', name: 'Saint Kitts & Nevis' },
    { code: 'AG', name: 'Antigua & Barbuda' },
    { code: 'BB', name: 'Barbados' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'TT', name: 'Trinidad & Tobago' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'DM', name: 'Dominica' },
    { code: 'GD', name: 'Grenada' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent & Grenadines' },
    { code: 'VG', name: 'British Virgin Islands' },
    { code: 'VI', name: 'US Virgin Islands' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'CA', name: 'Canada' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'OTHER', name: 'Other' },
];

const SUBSCRIPTIONS = [
    { id: 'basic', name: 'Basic Tier', price: '$29/mo', features: ['Core Storefront', 'Unlimited Listings', 'Basic Reviews'] },
    { id: 'premium', name: 'Premium Tier', price: '$99/mo', features: ['Custom Branding', 'Advanced Analytics', 'Priority Support', 'Featured Badges'] },
];

export default function BecomeVendorPage() {
    const { user, setUser, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTier = searchParams.get('tier') || 'basic';
    const [step, setStep] = useState(1);
    const [existingStores, setExistingStores] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);

    // Check if user can create additional stores
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/become-vendor');
            return;
        }

        const checkStoreAccess = async () => {
            try {
                // Fetch existing stores
                const storesRes = await api.get('/stores/my').catch(() => ({ data: [] }));
                const stores = Array.isArray(storesRes.data) ? storesRes.data : (storesRes.data ? [storesRes.data] : []);
                setExistingStores(stores);

                // Fetch vendor subscription
                const subRes = await api.get('/vendor-subscriptions/').catch(() => ({ data: null }));
                setSubscription(subRes.data);
            } catch (error) {
                console.error('Error checking store access:', error);
            } finally {
                setCheckingAccess(false);
            }
        };

        checkStoreAccess();
    }, [isAuthenticated, router]);

    // Determine if user can create additional stores
    const canCreateMultipleStores = subscription?.tier_name === 'premium' ||
        subscription?.tier_name === 'vip' ||
        subscription?.tier_name === 'enterprise';
    const hasExistingStore = existingStores.length > 0;
    const showRestriction = !canCreateMultipleStores && hasExistingStore;
    const [formData, setFormData] = useState({
        business_name: '',
        category: '',
        sub_type: '',
        type: 'product', // product or service based on category
        bio: '',
        location: '',
        country: '',
        contact_email: user?.email || '',
        contact_phone: '',
        theme_color: 'teal-600',
        branding_color: '#0d9488',
        logo_url: '',
        banner_url: '',
        slug: '',
        subscription_tier: initialTier
    });
    const [kycDocs, setKycDocs] = useState({ id_card: '', business_license: '' });
    const [uploading, setUploading] = useState({ id: false, license: false, logo: false, banner: false });
    const [loading, setLoading] = useState(false);

    // Helper for file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'license' | 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) {
            console.warn('[Upload] No file selected');
            return;
        }

        console.log('[Upload] Starting upload:', { type, fileName: file.name, fileSize: file.size, fileType: file.type });

        setUploading(prev => ({ ...prev, [type]: true }));
        const uploadData = new FormData();
        uploadData.append('file', file);

        // Debug: Check FormData contents
        console.log('[Upload] FormData created, entries:');
        for (const [key, value] of uploadData.entries()) {
            console.log(`  - ${key}:`, value instanceof File ? { name: (value as File).name, size: (value as File).size, type: (value as File).type } : value);
        }

        try {
            const uploadPath = type === 'logo' || type === 'banner' ? '/uploads/stores' : '/uploads/kyc';
            console.log('[Upload] Sending request to:', uploadPath);
            const res = await api.post(uploadPath, uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (type === 'logo') setFormData(prev => ({ ...prev, logo_url: res.data.url }));
            else if (type === 'banner') setFormData(prev => ({ ...prev, banner_url: res.data.url }));
            else setKycDocs(prev => ({ ...prev, [type === 'id' ? 'id_card' : 'business_license']: res.data.url }));
        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleComplete = async () => {
        setLoading(true);
        try {
            // 1. Create/Update vendor profile
            const vendorRes = await api.post('/vendors', formData);

            // 2. Submit KYC - documents already uploaded via handleFileUpload
            // KYC document URLs are stored in kycDocs state

            // 3. Activate Subscription
            await api.post('/subscriptions', {
                tier: formData.subscription_tier,
                provider: 'mock',
                transaction_id: `mock_${Date.now()}`
            });

            // 4. Update User Role (If not already a privileged user)
            if (user?.role === 'user' || user?.role === 'buyer') {
                await api.post('/auth/role', { role: 'vendor' });
                // 5. Update local auth state
                setUser({ ...user, role: 'vendor' });
            }

            router.push('/dashboard/vendor/branding');
        } catch (error) {
            console.error('Failed to complete onboarding', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Show loading while checking access
    if (checkingAccess) {
        return (
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Checking access...</p>
                </div>
            </main>
        );
    }

    // Show restriction message if user already has a store and can't create more
    if (showRestriction) {
        return (
            <main className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100"
                    >
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <span className="text-5xl">🔒</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                            Multi-Store Access Restricted
                        </h1>
                        <p className="text-slate-500 font-medium text-lg mb-8">
                            Your current <strong>{subscription?.tier_name || 'Basic'}</strong> subscription only allows one store.
                            You already have <strong>{existingStores.length}</strong> store(s) on IslandHub.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-4">Your existing stores:</h3>
                            <div className="space-y-3">
                                {existingStores.map((store: any) => (
                                    <div key={store.id} className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                                            🏪
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-slate-800">{store.name}</p>
                                            <p className="text-xs text-slate-400">/store/{store.slug}</p>
                                        </div>
                                        <Link
                                            href={`/store/${store.slug}`}
                                            className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-teal-100 transition-all"
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/dashboard"
                                className="block w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                            >
                                ← Back to Dashboard
                            </Link>
                            <button
                                onClick={() => router.push('/dashboard?tab=overview')}
                                className="block w-full py-4 bg-linear-to-r from-indigo-600 to-teal-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 hover:shadow-xl transition-all"
                            >
                                Upgrade to Premium+ for Multi-Store
                            </button>
                        </div>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">

            <div className="max-w-4xl mx-auto px-4 py-20">
                {/* Progress Bar */}
                <div className="mb-12 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{ width: `${((step - 1) / 5) * 100}%` }}
                    />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm relative z-10 transition-all shadow-lg ${step >= i ? 'bg-teal-600 text-white scale-110' : 'bg-white text-slate-400 border-4 border-slate-100'}`}
                        >
                            {i}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Role & Intent */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center"
                        >
                            <span className="text-6xl mb-8 block">🚀</span>
                            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic">Ready to make waves?</h1>
                            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto mb-12">
                                Join hundreds of island entrepreneurs who are growing their business with IslandHub.
                                From artisanal products to adventure gear rentals, we provide the platform for you to succeed.
                            </p>
                            <button
                                onClick={nextStep}
                                className="px-12 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-teal-100 transition-all transform hover:-translate-y-1 active:scale-95"
                            >
                                Let's Get Started ⚡
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Category & Sub-type */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tight">What's your specialty?</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Choose your primary category</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            const isService = cat.id === 'services';
                                            setFormData({
                                                ...formData,
                                                category: cat.id,
                                                sub_type: '',
                                                type: isService ? 'service' : 'product'
                                            });
                                        }}
                                        className={`p-8 rounded-[2.5rem] text-left transition-all border-4 ${formData.category === cat.id ? 'bg-teal-50 border-teal-500 shadow-xl' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50'}`}
                                    >
                                        <div className="text-4xl mb-4">{cat.icon}</div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{cat.name}</h3>
                                        <p className="text-slate-500 text-sm font-medium">Connect with buyers looking for {cat.name.toLowerCase()}.</p>
                                    </button>
                                ))}
                            </div>

                            {formData.category && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-teal-100"
                                >
                                    <p className="font-black text-slate-900 mb-4 tracking-tight">Specifically, which sub-type?</p>
                                    <div className="flex flex-wrap gap-3">
                                        {CATEGORIES.find(c => c.id === formData.category)?.subTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFormData({ ...formData, sub_type: type })}
                                                className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${formData.sub_type === type ? 'bg-teal-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div className="flex justify-between pt-8">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button
                                    disabled={!formData.sub_type}
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all hover:scale-105"
                                >
                                    Next: Brand Identity
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Brand Identity */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100"
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tight">Tell us about your brand</h2>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Business Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Island Adventures"
                                        value={formData.business_name}
                                        onChange={e => {
                                            const name = e.target.value;
                                            setFormData({
                                                ...formData,
                                                business_name: name,
                                                slug: formData.slug || name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                                            });
                                        }}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Store Slug (Custom URL)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="your-store-name"
                                            value={formData.slug}
                                            onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all pr-32"
                                        />
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                                            /store/
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 ml-4 font-medium">
                                        Public URL: <span className="text-teal-600 font-bold">islandhub.com/store/{formData.slug || '...'}</span>
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Short Bio</label>
                                    <textarea
                                        rows={3}
                                        placeholder="What makes your business unique?"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Contact Phone</label>
                                        <input
                                            type="tel"
                                            placeholder="+1 (869) 555-0123"
                                            value={formData.contact_phone}
                                            onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Country</label>
                                        <select
                                            value={formData.country}
                                            onChange={e => setFormData({ ...formData, country: e.target.value })}
                                            className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                        >
                                            <option value="">Select Country</option>
                                            {COUNTRIES.map(c => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Location / Island Area</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Frigate Bay, St. Kitts"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button
                                    disabled={!formData.business_name || !formData.bio || !formData.location || !formData.country}
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all hover:scale-105"
                                >
                                    Next: Brand Visuals
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* New Step: Branding & Visuals */}
                    {step === 4 && (
                        <motion.div
                            key="stepBranding"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100"
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">Visual Identity</h2>
                            <p className="text-slate-500 mb-8 max-w-lg">Let's make your store stand out with custom branding.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Store Logo</label>
                                    <div
                                        className="h-40 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-teal-400 transition-all"
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                    >
                                        {formData.logo_url ? (
                                            <img src={getImageUrl(formData.logo_url)} className="w-full h-full object-contain p-4" alt="Preview" />
                                        ) : (
                                            <>
                                                <span className="text-4xl mb-2">🖼️</span>
                                                <span className="text-xs font-bold text-slate-400">Upload Square Logo</span>
                                            </>
                                        )}
                                        {uploading.logo && <div className="absolute inset-0 bg-white/80 flex items-center justify-center animate-pulse">Uploading...</div>}
                                    </div>
                                    <input id="logo-upload" type="file" hidden onChange={(e) => handleFileUpload(e, 'logo')} />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Banner Image</label>
                                    <div
                                        className="h-40 bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-teal-400 transition-all"
                                        onClick={() => document.getElementById('banner-upload')?.click()}
                                    >
                                        {formData.banner_url ? (
                                            <img src={getImageUrl(formData.banner_url)} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <>
                                                <span className="text-4xl mb-2">🌊</span>
                                                <span className="text-xs font-bold text-slate-400">Upload Wide Banner</span>
                                            </>
                                        )}
                                        {uploading.banner && <div className="absolute inset-0 bg-white/80 flex items-center justify-center animate-pulse">Uploading...</div>}
                                    </div>
                                    <input id="banner-upload" type="file" hidden onChange={(e) => handleFileUpload(e, 'banner')} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Brand Color Palette</label>
                                <div className="flex flex-wrap gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    {[
                                        { name: 'Island Teal', val: '#0d9488', class: 'bg-teal-600' },
                                        { name: 'Deep Indigo', val: '#4f46e5', class: 'bg-indigo-600' },
                                        { name: 'Sunset Rose', val: '#e11d48', class: 'bg-rose-600' },
                                        { name: 'Tropical Emerald', val: '#059669', class: 'bg-emerald-600' },
                                        { name: 'Golden Amber', val: '#d97706', class: 'bg-amber-600' },
                                        { name: 'Ocean Blue', val: '#0284c7', class: 'bg-sky-600' },
                                        { name: 'Volcanic Slate', val: '#475569', class: 'bg-slate-600' }
                                    ].map(color => (
                                        <button
                                            key={color.val}
                                            onClick={() => setFormData({ ...formData, branding_color: color.val })}
                                            className={`group relative flex flex-col items-center gap-2 transition-all ${formData.branding_color === color.val ? 'scale-110' : 'hover:scale-105'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-2xl ${color.class} shadow-lg ring-offset-2 ${formData.branding_color === color.val ? 'ring-4 ring-teal-500' : ''}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all hover:scale-105"
                                >
                                    Next: Verify Identity
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Verification (KYC) */}
                    {step === 5 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100"
                        >
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">Verify Identity</h2>
                            <p className="text-slate-500 mb-8 max-w-lg">To maintain trust in our marketplace, we require a valid government ID. Your data is encrypted and secure.</p>

                            <div className="space-y-8">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Government ID (Required)</label>
                                    <div className="flex items-center gap-4">
                                        <input type="file" onChange={(e) => handleFileUpload(e, 'id')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                        {uploading.id && <div className="text-teal-600 animate-spin">⟳</div>}
                                        {kycDocs.id_card && <div className="text-green-500 text-xl">✓</div>}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Accepted: JPG, PNG, PDF</p>
                                </div>

                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                    <label className="block text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Business License (Optional)</label>
                                    <div className="flex items-center gap-4">
                                        <input type="file" onChange={(e) => handleFileUpload(e, 'license')} className="block w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300" />
                                        {uploading.license && <div className="text-slate-600 animate-spin">⟳</div>}
                                        {kycDocs.business_license && <div className="text-green-500 text-xl">✓</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button
                                    disabled={!kycDocs.id_card}
                                    onClick={nextStep}
                                    className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all hover:scale-105"
                                >
                                    Next: Choose Plan
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Subscriptions */}
                    {step === 6 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center">
                                <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tight">Elevate your storefront</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center">Select a plan to launch your vendor profile</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {SUBSCRIPTIONS.map(sub => (
                                    <div
                                        key={sub.id}
                                        className={`p-10 rounded-[3rem] border-4 transition-all relative overflow-hidden ${formData.subscription_tier === sub.id ? 'bg-white border-teal-500 shadow-2xl scale-105' : 'bg-slate-50 border-transparent hover:border-slate-100 opacity-80'}`}
                                        onClick={() => setFormData({ ...formData, subscription_tier: sub.id })}
                                    >
                                        {sub.id === 'premium' && (
                                            <div className="absolute top-0 right-0 bg-teal-500 px-6 py-2 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-bl-3xl">Recommended</div>
                                        )}
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">{sub.name}</h3>
                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-4xl font-black text-teal-600">{sub.price}</span>
                                            <span className="text-slate-400 text-sm font-bold"> billed monthly</span>
                                        </div>
                                        <ul className="space-y-4 mb-10">
                                            {sub.features.map(f => (
                                                <li key={f} className="flex items-center gap-3 text-slate-600 font-medium">
                                                    <span className="text-teal-500">✓</span> {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            className={`w-full py-5 rounded-2xl font-black transition-all ${formData.subscription_tier === sub.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-100' : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-teal-200 hover:text-teal-600'}`}
                                        >
                                            {formData.subscription_tier === sub.id ? 'Selected Plan' : 'Choose Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button
                                    onClick={handleComplete}
                                    disabled={loading}
                                    className="px-16 py-6 bg-teal-600 text-white rounded-4xl font-black text-xl shadow-2xl shadow-teal-200 transition-all hover:scale-110 active:scale-95 flex items-center gap-4"
                                >
                                    {loading ? 'Confirming Channel...' : 'Launch Storefront 🏁'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
