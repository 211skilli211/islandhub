'use client';

import { useState, useEffect, Suspense } from 'react';
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

function BecomeVendorContent() {
    const { user, setUser, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTier = searchParams.get('tier') || 'basic';
    const [step, setStep] = useState(1);
    const [existingStores, setExistingStores] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [checkingAccess, setCheckingAccess] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/become-vendor');
            return;
        }

        const checkStoreAccess = async () => {
            try {
                const storesRes = await api.get('/stores/my').catch(() => ({ data: [] }));
                const stores = Array.isArray(storesRes.data) ? storesRes.data : (storesRes.data ? [storesRes.data] : []);
                setExistingStores(stores);

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

    const canCreateMultipleStores = subscription?.tier_name === 'premium' ||
        subscription?.tier_name === 'vip' ||
        subscription?.tier_name === 'enterprise';
    const hasExistingStore = existingStores.length > 0;
    const showRestriction = !canCreateMultipleStores && hasExistingStore;
    const [formData, setFormData] = useState({
        business_name: '',
        category: '',
        sub_type: '',
        type: 'product',
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'license' | 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const uploadPath = type === 'logo' || type === 'banner' ? '/uploads/stores' : '/uploads/kyc';
            const res = await api.post(uploadPath, uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
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
            await api.post('/vendors', formData);
            await api.post('/subscriptions', {
                tier: formData.subscription_tier,
                provider: 'mock',
                transaction_id: `mock_${Date.now()}`
            });

            if (user?.role === 'user' || user?.role === 'buyer') {
                await api.post('/auth/role', { role: 'vendor' });
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
                        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Multi-Store Access Restricted</h1>
                        <p className="text-slate-500 font-medium text-lg mb-8">
                            Your current <strong>{subscription?.tier_name || 'Basic'}</strong> subscription only allows one store.
                        </p>
                        <Link href="/dashboard" className="block w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
                            ← Back to Dashboard
                        </Link>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-20">
                <div className="mb-12 flex justify-between items-center relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
                    <div className="absolute top-1/2 left-0 h-1 bg-teal-500 -translate-y-1/2 z-0 transition-all duration-500" style={{ width: `${((step - 1) / 5) * 100}%` }} />
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm relative z-10 transition-all shadow-lg ${step >= i ? 'bg-teal-600 text-white scale-110' : 'bg-white text-slate-400 border-4 border-slate-100'}`}>
                            {i}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center">
                            <span className="text-6xl mb-8 block">🚀</span>
                            <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic">Ready to make waves?</h1>
                            <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto mb-12">Join hundreds of island entrepreneurs who are growing their business with IslandHub.</p>
                            <button onClick={nextStep} className="px-12 py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-teal-100 transition-all">Let's Get Started ⚡</button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tight">What's your specialty?</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Choose your primary category</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {CATEGORIES.map(cat => (
                                    <button key={cat.id} onClick={() => {
                                        const isService = cat.id === 'services';
                                        setFormData({ ...formData, category: cat.id, sub_type: '', type: isService ? 'service' : 'product' });
                                    }} className={`p-8 rounded-[2.5rem] text-left transition-all border-4 ${formData.category === cat.id ? 'bg-teal-50 border-teal-500 shadow-xl' : 'bg-white border-transparent hover:border-slate-100 hover:bg-slate-50/50'}`}>
                                        <div className="text-4xl mb-4">{cat.icon}</div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">{cat.name}</h3>
                                        <p className="text-slate-500 text-sm font-medium">Connect with buyers looking for {cat.name.toLowerCase()}.</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex justify-between pt-8">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button disabled={!formData.sub_type} onClick={nextStep} className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all">Next: Brand Identity</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100">
                            <h2 className="text-3xl font-black text-slate-900 mb-8 italic tracking-tight">Tell us about your brand</h2>
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Business Name</label>
                                    <input type="text" placeholder="e.g. Island Adventures" value={formData.business_name}
                                        onChange={e => setFormData({ ...formData, business_name: e.target.value, slug: e.target.value.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })}
                                        className="w-full px-8 py-5 bg-slate-50 border-transparent rounded-2xl text-slate-900 font-medium focus:ring-2 focus:ring-teal-100 focus:border-teal-500 transition-all" />
                                </div>
                                <div className="flex justify-between pt-12">
                                    <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                    <button disabled={!formData.business_name} onClick={nextStep} className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all">Next</button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">Visual Identity</h2>
                            <p className="text-slate-500 mb-8 max-w-lg">Let's make your store stand out with custom branding.</p>
                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button onClick={nextStep} className="px-12 py-5 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all">Next</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-slate-100">
                            <h2 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">Verify Identity</h2>
                            <p className="text-slate-500 mb-8 max-w-lg">To maintain trust in our marketplace, we require a valid government ID.</p>
                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button disabled={!kycDocs.id_card} onClick={nextStep} className="px-12 py-5 bg-teal-600 disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100 transition-all">Next: Choose Plan</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                            <div className="text-center">
                                <h1 className="text-4xl font-black text-slate-900 mb-2 italic tracking-tight">Elevate your storefront</h1>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs text-center">Select a plan to launch your vendor profile</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {SUBSCRIPTIONS.map(sub => (
                                    <div key={sub.id} className={`p-10 rounded-[3rem] border-4 transition-all ${formData.subscription_tier === sub.id ? 'bg-white border-teal-500 shadow-2xl scale-105' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}
                                        onClick={() => setFormData({ ...formData, subscription_tier: sub.id })}>
                                        <h3 className="text-2xl font-black text-slate-900 mb-2">{sub.name}</h3>
                                        <div className="flex items-baseline gap-2 mb-8">
                                            <span className="text-4xl font-black text-teal-600">{sub.price}</span>
                                            <span className="text-slate-400 text-sm font-bold">billed monthly</span>
                                        </div>
                                        <ul className="space-y-4 mb-10">
                                            {sub.features.map(f => (
                                                <li key={f} className="flex items-center gap-3 text-slate-600 font-medium"><span className="text-teal-500">✓</span> {f}</li>
                                            ))}
                                        </ul>
                                        <button className={`w-full py-5 rounded-2xl font-black transition-all ${formData.subscription_tier === sub.id ? 'bg-teal-600 text-white shadow-xl shadow-teal-100' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                                            {formData.subscription_tier === sub.id ? 'Selected Plan' : 'Choose Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between pt-12">
                                <button onClick={prevStep} className="px-10 py-4 font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-xs transition-colors">← Back</button>
                                <button onClick={handleComplete} disabled={loading} className="px-16 py-6 bg-teal-600 text-white rounded-4xl font-black text-xl shadow-2xl shadow-teal-200 transition-all">
                                    {loading ? 'Confirming...' : 'Launch Storefront 🏁'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

export default function BecomeVendorPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading...</p>
                </div>
            </main>
        }>
            <BecomeVendorContent />
        </Suspense>
    );
}
