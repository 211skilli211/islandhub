'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';

const CATEGORIES = [
    { id: 'community', name: 'Community', icon: '🏡' },
    { id: 'education', name: 'Education', icon: '📚' },
    { id: 'environment', name: 'Environment', icon: '🌿' },
    { id: 'arts', name: 'Arts & Culture', icon: '🎭' },
    { id: 'business', name: 'Tech & Business', icon: '🚀' },
    { id: 'disaster_relief', name: 'Disaster Relief', icon: '🆘' },
];

export default function NewCampaignPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        category: 'community',
        goal_amount: '',
        description: '',
        image_url: '', // Optional/Placeholder
        end_date: '',
    });

    // Word count for description
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login?redirect=/campaigns/new');
        }
    }, [isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/campaigns', {
                ...formData,
                user_id: user?.id,
                goal_amount: Number(formData.goal_amount),
                end_date: formData.end_date && formData.end_date.trim() !== '' ? formData.end_date : null,
            });

            // Redirect to the newly created campaign (even if pending, we'll handle the view logic there)
            router.push(`/campaigns/${response.data.campaign_id}?created=true`);
        } catch (error: any) {
            console.error('Error creating campaign:', error);
            alert(error.response?.data?.message || 'Failed to create campaign. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= s ? 'bg-teal-600 text-white shadow-lg shadow-teal-200' : 'bg-white text-slate-300 border-2 border-slate-200'
                                    }`}>
                                    {s}
                                </div>
                                <span className={`mt-2 text-xs font-semibold uppercase tracking-wider ${step >= s ? 'text-teal-700' : 'text-slate-400'
                                    }`}>
                                    {s === 1 ? 'Basics' : s === 2 ? 'The Story' : 'Launch'}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-teal-600 transition-all duration-500 ease-out"
                            style={{ width: `${(step - 1) * 50}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 sm:p-12">

                        {/* Step 1: Basics */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Let's start with the basics</h2>
                                    <p className="text-slate-500">What's the main goal of your campaign?</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Campaign Title</label>
                                        <input
                                            id="title"
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="e.g. Help rebuild the local library"
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all text-lg font-medium"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-4">Category</label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.category === cat.id
                                                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{cat.icon}</span>
                                                    <span className="text-xs font-bold uppercase">{cat.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">Goal Amount ($)</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                                                <input
                                                    id="goal_amount"
                                                    type="number"
                                                    name="goal_amount"
                                                    value={formData.goal_amount}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="0.00"
                                                    className="w-full pl-10 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all text-lg font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">End Date (Optional)</label>
                                            <input
                                                id="end_date"
                                                type="date"
                                                name="end_date"
                                                value={formData.end_date}
                                                onChange={handleChange}
                                                className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all text-lg font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!formData.title || !formData.goal_amount}
                                        className="w-full py-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-teal-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                    >
                                        Next: Tell Your Story
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Story */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Tell your story</h2>
                                    <p className="text-slate-500">Why should people support your cause?</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-widest mb-2">
                                            Description
                                            <span className={`ml-2 text-xs ${wordCount >= 300 ? 'text-teal-600' : 'text-slate-400'}`}>
                                                ({wordCount} / 300 words)
                                            </span>
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            rows={8}
                                            placeholder="Connect with your donors. Share your mission, your challenges, and how the funds will be used..."
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-teal-500 focus:ring-0 transition-all text-lg font-medium"
                                        />
                                    </div>

                                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100">
                                        <h4 className="text-teal-800 font-bold mb-2 flex items-center gap-2">
                                            <span>💡</span> Pro Tip
                                        </h4>
                                        <p className="text-teal-700 text-sm italic">
                                            Campaigns with at least 300 words and clear progress updates tend to raise 3x more funds!
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!formData.description || wordCount < 300}
                                        className="flex-[2] py-5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-teal-200 transition-all transform hover:-translate-y-1 active:translate-y-0"
                                    >
                                        Final Step
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Visuals & Launch */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">Ready to launch?</h2>
                                    <p className="text-slate-500">Review your details and prepare for liftoff.</p>
                                </div>

                                <div className="bg-slate-50 rounded-3xl p-8 space-y-4 border-2 border-slate-100">
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Title</span>
                                        <span className="font-bold text-slate-900">{formData.title}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Category</span>
                                        <span className="font-bold text-teal-600 uppercase tracking-tighter">{formData.category}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Goal</span>
                                        <span className="font-black text-slate-900 text-xl">${Number(formData.goal_amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="text-center p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                    <p className="text-amber-800 text-sm font-medium">
                                        🔔 Your campaign will be submitted for verification. It will appear on the browse page once approved by our team.
                                    </p>
                                </div>

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 py-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-lg transition-all"
                                    >
                                        Go Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-[2] py-5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 text-white rounded-2xl font-black text-xl shadow-xl shadow-emerald-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {loading ? 'Creating Campaign...' : '🚀 Launch Campaign'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
