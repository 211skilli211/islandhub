'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser, useAuthStore } from '@/lib/auth';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
    { id: 'buyer', label: 'Buyer', icon: '🛒', desc: 'Shop products and services' },
    { id: 'vendor', label: 'Vendor', icon: '🏪', desc: 'Sell products or services' },
    { id: 'driver', label: 'Driver', icon: '🚗', desc: 'Offer ride or delivery services' },
    { id: 'creator', label: 'Creator', icon: '🎨', desc: 'Fundraise for causes' },
    { id: 'sponsor', label: 'Sponsor', icon: '💼', desc: 'Support events and campaigns' },
];

const VENDOR_CATEGORIES = [
    { id: 'product', label: 'Product', icon: '📦', desc: 'Physical goods (clothing, electronics, etc.)' },
    { id: 'food', label: 'Food', icon: '🍽️', desc: 'Restaurant, catering, food delivery' },
    { id: 'service', label: 'Service', icon: '🔧', desc: 'Repairs, consulting, professional services' },
    { id: 'other', label: 'Other', icon: '✨', desc: 'Something else (specify)' },
];

const DRIVER_CATEGORIES = [
    { id: 'taxi', label: 'Taxi', icon: '🚕', desc: 'On-demand rides - links to dispatch system' },
    { id: 'delivery', label: 'Delivery', icon: '📦', desc: 'Package/food delivery - links to pickup system' },
    { id: 'tour', label: 'Tour', icon: '🗺️', desc: 'Island tours, sightseeing' },
    { id: 'service', label: 'Driving Service', icon: '🚗', desc: 'Driving school, private driver, other services' },
];

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    
    // Multi-step registration
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState('');
    const [vendorCategory, setVendorCategory] = useState('');
    const [driverCategory, setDriverCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    
    const router = useRouter();
    const { logout, isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (isAuthenticated) {
            logout();
            toast.success('You have been logged out to create a new account.');
        }
    }, [isAuthenticated, logout]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Build the role based on selections
            let finalRole = 'buyer';
            let roleCategory = selectedRole;
            
            if (selectedRole === 'vendor') {
                finalRole = vendorCategory === 'other' && customCategory 
                    ? `vendor_${customCategory.toLowerCase().replace(/\s+/g, '_')}`
                    : `vendor_${vendorCategory}`;
            } else if (selectedRole === 'driver') {
                finalRole = `driver_${driverCategory}`;
            } else if (selectedRole === 'creator') {
                finalRole = 'creator';
            } else if (selectedRole === 'sponsor') {
                finalRole = 'sponsor';
            }

            const data = await registerUser({ 
                name, 
                email, 
                password,
                role: finalRole,
                role_category: selectedRole || 'buyer',
                vendor_category: vendorCategory || undefined,
                driver_category: driverCategory || undefined,
                custom_category: customCategory || undefined
            });
            
            setRegistrationSuccess(true);
            toast.success('Registration successful! Please check your email.');
        } catch (error: any) {
            console.error(error);
            const details = error.response?.data?.details;
            const message = error.response?.data?.message;

            if (details && Array.isArray(details) && details.length > 0) {
                const firstError = details[0];
                const detailMsg = firstError.field
                    ? `${firstError.field}: ${firstError.message}`
                    : firstError.message;
                toast.error(detailMsg, { duration: 5000, style: { maxWidth: '400px' } });
            } else if (message) {
                toast.error(message, { duration: 4000, style: { maxWidth: '400px' } });
            } else {
                toast.error('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const canProceedToStep2 = () => {
        if (step === 1) return selectedRole !== '';
        if (step === 2 && selectedRole === 'vendor') return vendorCategory !== '';
        if (step === 2 && selectedRole === 'driver') return driverCategory !== '';
        return true;
    };

    if (registrationSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-3xl sm:px-10 text-center space-y-6">
                        <div className="w-20 h-20 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto text-4xl shadow-inner">
                            📧
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">Check Your Email</h2>
                        <p className="text-slate-500 text-sm">
                            We've sent a verification link to <strong>{email}</strong>.
                            <br />Please verify your account to continue.
                        </p>
                        <div className="pt-4">
                            <Link href="/login" className="text-teal-600 font-bold hover:underline">
                                Skip to Login (Limited Access)
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="text-center mb-8">
                    <span className="inline-block px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                        Step {step} of 2
                    </span>
                    <h2 className="text-3xl font-black text-slate-900">
                        {step === 1 ? 'Create your account' : 'Tell us more'}
                    </h2>
                    <p className="mt-2 text-slate-600">
                        {step === 1 ? 'Choose how you want to use IslandHub' : 
                         selectedRole === 'vendor' ? 'What type of vendor are you?' :
                         selectedRole === 'driver' ? 'What type of driving service?' :
                         'Almost done!'}
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-10">
                    
                    {step === 1 ? (
                        <div className="space-y-4">
                            {ROLE_OPTIONS.map((role) => (
                                <button
                                    key={role.id}
                                    onClick={() => setSelectedRole(role.id)}
                                    className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                                        selectedRole === role.id
                                            ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100'
                                            : 'border-slate-100 hover:border-teal-200'
                                    }`}
                                >
                                    <span className="text-3xl">{role.icon}</span>
                                    <div>
                                        <p className="font-black text-slate-900">{role.label}</p>
                                        <p className="text-xs text-slate-500">{role.desc}</p>
                                    </div>
                                    {selectedRole === role.id && (
                                        <span className="ml-auto text-teal-600 text-xl">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {selectedRole === 'vendor' && (
                                <>
                                    {VENDOR_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setVendorCategory(cat.id)}
                                            className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                                                vendorCategory === cat.id
                                                    ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100'
                                                    : 'border-slate-100 hover:border-teal-200'
                                            }`}
                                        >
                                            <span className="text-3xl">{cat.icon}</span>
                                            <div>
                                                <p className="font-black text-slate-900">{cat.label}</p>
                                                <p className="text-xs text-slate-500">{cat.desc}</p>
                                            </div>
                                            {vendorCategory === cat.id && (
                                                <span className="ml-auto text-teal-600 text-xl">✓</span>
                                            )}
                                        </button>
                                    ))}
                                    {vendorCategory === 'other' && (
                                        <div className="mt-4">
                                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                                Describe your category
                                            </label>
                                            <input
                                                type="text"
                                                value={customCategory}
                                                onChange={(e) => setCustomCategory(e.target.value)}
                                                placeholder="e.g., Photographer, Event Planner..."
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {selectedRole === 'driver' && (
                                <>
                                    {DRIVER_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setDriverCategory(cat.id)}
                                            className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${
                                                driverCategory === cat.id
                                                    ? 'border-teal-500 bg-teal-50 shadow-lg shadow-teal-100'
                                                    : 'border-slate-100 hover:border-teal-200'
                                            }`}
                                        >
                                            <span className="text-3xl">{cat.icon}</span>
                                            <div>
                                                <p className="font-black text-slate-900">{cat.label}</p>
                                                <p className="text-xs text-slate-500">{cat.desc}</p>
                                            </div>
                                            {driverCategory === cat.id && (
                                                <span className="ml-auto text-teal-600 text-xl">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </>
                            )}

                            {(selectedRole === 'creator' || selectedRole === 'sponsor') && (
                                <div className="text-center py-8">
                                    <p className="text-slate-600">
                                        You'll be able to {selectedRole === 'creator' ? 'create fundraising campaigns' : 'sponsor campaigns'} after verification.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex gap-4">
                        {step === 2 && (
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-4 border-2 border-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-50 transition-all"
                            >
                                Back
                            </button>
                        )}
                        
                        {step === 1 ? (
                            <button
                                onClick={() => canProceedToStep2() && setStep(2)}
                                disabled={!canProceedToStep2()}
                                className="flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-teal-100 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continue
                            </button>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex-1">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                            Email
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-0"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-teal-100 hover:bg-teal-700 disabled:opacity-50 transition-all"
                                    >
                                        {loading ? 'Creating...' : 'Create Account'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-teal-600 font-bold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
