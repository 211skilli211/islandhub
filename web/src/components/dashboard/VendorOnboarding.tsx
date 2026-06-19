'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '@/lib/toast';
import Link from 'next/link';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    completed: boolean;
}

interface VendorData {
    businessName?: string;
    category?: string;
    logo?: string;
    coverPhoto?: string;
    description?: string;
    location?: string;
    phone?: string;
}

interface ComplianceProgress {
    total: number;
    completed: number;
    percentage: number;
}

export default function VendorOnboarding() {
    const [currentStep, setCurrentStep] = useState(0);
    const [steps, setSteps] = useState<OnboardingStep[]>([
        { id: 'profile', title: 'Business Profile', description: 'Set up your business details', completed: false },
        { id: 'store', title: 'Store Setup', description: 'Customize your storefront', completed: false },
        { id: 'compliance', title: 'Compliance', description: 'Complete verification requirements', completed: false },
        { id: 'first-listing', title: 'First Listing', description: 'Create your first product or service', completed: false },
    ]);
    const [vendorData, setVendorData] = useState<VendorData>({});
    const [compliance, setCompliance] = useState<ComplianceProgress | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVendorStatus();
    }, []);

    const fetchVendorStatus = async () => {
        try {
            const [profileRes, complianceRes] = await Promise.all([
                api.get('/stores/my'),
                api.get('/compliance/vendor/1/summary').catch(() => ({ data: null }))
            ]);
            
            if (profileRes.data) {
                const store = Array.isArray(profileRes.data) ? profileRes.data[0] : profileRes.data;
                setVendorData({
                    businessName: store.business_name,
                    category: store.category,
                    logo: store.logo_url,
                    coverPhoto: store.cover_photo_url,
                    description: store.description,
                    location: store.location,
                    phone: store.phone
                });
                
                // Mark profile step as completed if business name exists
                setSteps(prev => prev.map(s => 
                    s.id === 'profile' ? { ...s, completed: !!store.business_name } : s
                ));
            }
            
            if (complianceRes.data) {
                setCompliance(complianceRes.data);
                setSteps(prev => prev.map(s => 
                    s.id === 'compliance' ? { ...s, completed: complianceRes.data.isCompliant } : s
                ));
            }
        } catch (error) {
            console.error('Failed to fetch vendor status:', error);
        } finally {
            setLoading(false);
        }
    };

    const markStepComplete = (stepId: string) => {
        setSteps(prev => prev.map(s => 
            s.id === stepId ? { ...s, completed: true } : s
        ));
    };

    const nextStep = () => {
        markStepComplete(steps[currentStep].id);
        setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const goToStep = (index: number) => {
        setCurrentStep(index);
    };

    const completedSteps = steps.filter(s => s.completed).length;
    const progress = (completedSteps / steps.length) * 100;

    if (loading) {
        return (
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-8 animate-pulse">
                <div className="h-4 bg-surface-tertiary rounded w-1/3 mb-4"></div>
                <div className="h-2 bg-surface-tertiary rounded w-full"></div>
            </div>
        );
    }

    // If already completed, show success state
    if (completedSteps === steps.length) {
        return (
            <div className="bg-surface-elevated rounded-2xl border border-border-primary p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <EmojiIcon emoji="🎉" size={28} className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-black text-ink-primary mb-2">You're All Set!</h3>
                    <p className="text-ink-tertiary mb-6">Your vendor profile is complete and ready to go.</p>
                    <div className="flex gap-3 justify-center">
                        <Link 
                            href="/create" 
                            className="px-6 py-3 bg-accent-500 text-white rounded-xl font-bold hover:bg-accent-600"
                        >
                            Add Listing
                        </Link>
                        <Link 
                            href="/dashboard?tab=overview" 
                            className="px-6 py-3 bg-surface-secondary text-ink-secondary rounded-xl font-bold hover:bg-surface-tertiary"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface-elevated rounded-2xl border border-border-primary overflow-hidden">
            
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6 text-white">
                <h2 className="text-xl font-black mb-2">Welcome to IslandHub! <EmojiIcon emoji="🌴" size={20} /></h2>
                <p className="text-accent-100 text-sm mb-4">Let's get your vendor profile set up</p>
                
                
                <div className="h-2 bg-surface-elevated/20 rounded-full overflow-hidden">
                    <motion.div 
                        className="h-full bg-surface-elevated rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                    />
                </div>
                <p className="text-xs text-accent-100 mt-2">{completedSteps} of {steps.length} steps completed</p>
            </div>

            
            <div className="border-b border-border-primary">
                <div className="flex overflow-x-auto">
                    {steps.map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => goToStep(index)}
                            className={`flex-shrink-0 px-4 py-3 border-b-2 transition-colors ${
                                currentStep === index 
                                    ? 'border-teal-500 text-accent-400' 
                                    : step.completed 
                                        ? 'border-green-500 text-green-600' 
                                        : 'border-transparent text-ink-tertiary'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    step.completed 
                                        ? 'bg-green-100 text-green-600' 
                                        : currentStep === index 
                                            ? 'bg-accent-500/15 text-accent-400' 
                                            : 'bg-surface-secondary text-ink-tertiary'
                                }`}>
                                    {step.completed ? '✓' : index + 1}
                                </span>
                                <span className="text-sm font-medium whitespace-nowrap">{step.title}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            
            <div className="p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        {currentStep === 0 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-ink-primary">Business Profile</h3>
                                <p className="text-ink-tertiary text-sm">Tell us about your business</p>
                                
                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-ink-secondary mb-1">Business Name</label>
                                        <input 
                                            type="text" 
                                            value={vendorData.businessName || ''}
                                            onChange={(e) => setVendorData({...vendorData, businessName: e.target.value})}
                                            className="w-full px-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                            placeholder="Enter your business name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ink-secondary mb-1">Category</label>
                                        <select 
                                            value={vendorData.category || ''}
                                            onChange={(e) => setVendorData({...vendorData, category: e.target.value})}
                                            className="w-full px-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                        >
                                            <option value="">Select category</option>
                                            <option value="product">Products</option>
                                            <option value="food">Food & Drinks</option>
                                            <option value="service">Services</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ink-secondary mb-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            value={vendorData.phone || ''}
                                            onChange={(e) => setVendorData({...vendorData, phone: e.target.value})}
                                            className="w-full px-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-ink-secondary mb-1">Location</label>
                                        <input 
                                            type="text" 
                                            value={vendorData.location || ''}
                                            onChange={(e) => setVendorData({...vendorData, location: e.target.value})}
                                            className="w-full px-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                            placeholder="City, Parish"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-ink-primary">Store Setup</h3>
                                <p className="text-ink-tertiary text-sm">Customize your storefront to attract customers</p>

                                <div className="grid gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-ink-secondary mb-1">Store Description</label>
                                        <textarea 
                                            value={vendorData.description || ''}
                                            onChange={(e) => setVendorData({...vendorData, description: e.target.value})}
                                            rows={4}
                                            className="w-full px-4 py-2 border border-border-primary rounded-lg focus:ring-2 focus:ring-accent-400/20 focus:border-teal-500"
                                            placeholder="Tell customers what makes your business special..."
                                        />
                                    </div>
                                </div>

                                <div className="bg-accent-500/10 p-4 rounded-xl border border-teal-100">
                                    <p className="text-sm text-accent-500">
                                        💡 Tip: Add a compelling cover photo and logo to make your store stand out!
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <button 
                                        onClick={prevStep}
                                        className="px-6 py-2 text-ink-secondary font-bold hover:text-ink-primary"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-ink-primary">Compliance Requirements</h3>
                                <p className="text-ink-tertiary text-sm">Complete verification to unlock all features</p>

                                {compliance ? (
                                    <div className="bg-surface-secondary p-4 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-medium text-ink-secondary">Progress</span>
                                            <span className="text-sm font-black text-accent-400">{compliance.percentage}%</span>
                                        </div>
                                        <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-accent-500/100 rounded-full"
                                                style={{ width: `${compliance.percentage}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-ink-tertiary mt-2">
                                            {compliance.completed} of {compliance.total} requirements completed
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-sand-500/5 p-4 rounded-xl border border-sand-500/20">
                                        <p className="text-sm text-sand-500">
                                            ⚠️ You haven't started any compliance requirements yet.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Link 
                                        href="/dashboard?tab=compliance"
                                        className="block p-4 border border-border-primary rounded-xl hover:border-teal-500 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-ink-secondary">Complete Compliance</p>
                                                <p className="text-xs text-ink-tertiary">Submit required documents</p>
                                            </div>
                                            <span className="text-accent-400">→</span>
                                        </div>
                                    </Link>
                                    <Link 
                                        href="/dashboard?tab=kyc"
                                        className="block p-4 border border-border-primary rounded-xl hover:border-teal-500 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-ink-secondary">Verify Identity (KYC)</p>
                                                <p className="text-xs text-ink-tertiary">Submit ID verification</p>
                                            </div>
                                            <span className="text-accent-400">→</span>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex justify-between">
                                    <button 
                                        onClick={prevStep}
                                        className="px-6 py-2 text-ink-secondary font-bold hover:text-ink-primary"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={nextStep}
                                        className="px-6 py-2 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-black text-ink-primary">Create Your First Listing</h3>
                                <p className="text-ink-tertiary text-sm">Start selling by adding your first product or service</p>

                                <div className="grid gap-3">
                                    <Link 
                                        href="/create"
                                        className="block p-4 bg-accent-500/10 border border-teal-200 rounded-xl hover:border-teal-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <EmojiIcon emoji="🏪" size={24} className="text-2xl" />
                                            <div>
                                                <p className="font-bold text-accent-500">Add Product Listing</p>
                                                <p className="text-xs text-accent-400">Physical items or goods</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link 
                                        href="/create?type=food"
                                        className="block p-4 bg-orange-50 border border-orange-200 rounded-xl hover:border-orange-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <EmojiIcon emoji="🍔" size={24} className="text-2xl" />
                                            <div>
                                                <p className="font-bold text-orange-700">Add Food Item</p>
                                                <p className="text-xs text-orange-600">Restaurants, snacks, catering</p>
                                            </div>
                                        </div>
                                    </Link>
                                    <Link 
                                        href="/create?type=service"
                                        className="block p-4 bg-teal-50 border border-teal-200 rounded-xl hover:border-teal-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <EmojiIcon emoji="🔧" size={24} className="text-2xl" />
                                            <div>
                                                <p className="font-bold text-teal-700">Add Service</p>
                                                <p className="text-xs text-teal-600">Professional services</p>
                                            </div>
                                        </div>
                                    </Link>
                                </div>

                                <div className="flex justify-between">
                                    <button 
                                        onClick={prevStep}
                                        className="px-6 py-2 text-ink-secondary font-bold hover:text-ink-primary"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => markStepComplete('first-listing')}
                                        className="px-6 py-2 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600"
                                    >
                                        Skip for Now
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}