'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface CombinedApplicationData {
    licenseNumber: string;
    licenseExpiry: string;
    documents: {
        licenseFront?: string;
        licenseBack?: string;
        insurance?: string;
    };
    vehicle: {
        make: string;
        model: string;
        year: number;
        plateNumber: string;
        color: string;
        category: string;
    };
}

export default function DriverOnboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<any>(null);

    const [formData, setFormData] = useState<CombinedApplicationData>({
        licenseNumber: '',
        licenseExpiry: '',
        documents: {},
        vehicle: {
            make: '',
            model: '',
            year: new Date().getFullYear(),
            plateNumber: '',
            color: '',
            category: ''
        }
    });

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await api.get('/logistics/profile');
            if (res.data?.profile) {
                setStatus(res.data.profile);
            }
        } catch (error) {
            console.error('Failed to fetch verification status');
        } finally {
            setLoading(false);
        }
    };

    const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            vehicle: { ...prev.vehicle, [name]: name === 'year' ? parseInt(value) : value }
        }));
    };

    const handleKYCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/logistics/kyc', formData);
            toast.success('Documents submitted for review! 🛡️');
            fetchStatus();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-teal-600" />
        </div>
    );

    if (status) {
        return (
            <div className="max-w-xl mx-auto p-10 bg-surface-elevated border border-border-primary rounded-[3rem] text-center shadow-xl">
                <div className="text-6xl mb-6">
                    {status.verification_status === 'pending' ? '⏳' : status.verification_status === 'approved' ? '✅' : '<EmojiIcon emoji="❌" size=16 />'}
                </div>
                <h2 className="text-2xl font-black text-ink-primary uppercase italic tracking-tighter mb-2">
                    Verification {status.verification_status}
                </h2>
                <p className="text-ink-tertiary font-medium mb-8">
                    {status.verification_status === 'pending'
                        ? "Our team is reviewing your documents. This usually takes 24-48 hours."
                        : status.verification_status === 'approved'
                            ? "You're all set! You can now start accepting jobs on the island."
                            : status.rejection_reason || "Authentication failed. Please re-submit your documents."}
                </p>
                <div className="p-4 bg-surface-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest text-ink-tertiary">
                    Application ID: #{status.id} - Last Updated: {new Date(status.updated_at).toLocaleDateString()}
                </div>
                {status.verification_status === 'rejected' && (
                    <button onClick={() => setStatus(null)} className="mt-8 px-8 py-4 bg-ink-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest">
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <header className="text-center mb-12">
                <h2 className="text-4xl font-black text-ink-primary italic uppercase tracking-tighter mb-2">Driver Verification Hub</h2>
                <p className="text-ink-tertiary font-medium">Complete your profile to unlock high-standard logistics jobs.</p>
            </header>

            <div className="flex gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                {[
                    { s: 1, label: 'Vehicle Select' },
                    { s: 2, label: 'Machine Specs' },
                    { s: 3, label: 'Legal Verification' }
                ].map(item => (
                    <div key={item.s} className={`flex-1 min-w-[150px] p-4 rounded-2xl border-2 transition-all ${step === item.s ? 'border-teal-600 bg-accent-500/10' : 'border-border-primary bg-surface-elevated'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${step === item.s ? 'text-accent-400' : 'text-ink-tertiary'}`}>Step 0{item.s}</p>
                        <p className={`font-black text-sm uppercase italic ${step === item.s ? 'text-accent-700' : 'text-ink-tertiary'}`}>{item.label}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="bg-surface-elevated p-10 rounded-[3rem] border border-border-primary shadow-2xl relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {step === 1 && (
                            <div className="space-y-8">
                                <h3 className="text-2xl font-black text-ink-primary italic uppercase tracking-tighter">Choose Your Vessel</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { id: 'scooter', label: 'Scooter', icon: '🛵' },
                                        { id: 'economy', label: 'Economy', icon: '🚗' },
                                        { id: 'premium', label: 'Premium', icon: '✨' },
                                        { id: 'van', label: 'Van/Hatch', icon: '🚐' }
                                    ].map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, vehicle: { ...p.vehicle, category: cat.id } }))}
                                            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${formData.vehicle.category === cat.id ? 'border-teal-600 bg-accent-500/10 ring-4 ring-teal-100' : 'border-border-primary hover:border-border-primary'}`}
                                        >
                                            <span className="text-4xl">{cat.icon}</span>
                                            <span className="font-black text-[10px] uppercase tracking-widest text-ink-primary">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-ink-primary italic uppercase tracking-tighter">Machine Specifications</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">Make / Brand</label>
                                        <input required name="make" value={formData.vehicle.make} onChange={handleVehicleChange} placeholder="e.g. Toyota" className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">Model</label>
                                        <input required name="model" value={formData.vehicle.model} onChange={handleVehicleChange} placeholder="e.g. RAV4" className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">Plate Number</label>
                                        <input required name="plateNumber" value={formData.vehicle.plateNumber} onChange={handleVehicleChange} placeholder="e.g. PN-442-G" className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">Color</label>
                                        <input required name="color" value={formData.vehicle.color} onChange={handleVehicleChange} placeholder="e.g. Midnight Blue" className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-ink-primary italic uppercase tracking-tighter">Legal & Identity</h3>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">Driving License Number</label>
                                        <input required name="licenseNumber" value={formData.licenseNumber} onChange={handleKYCChange} className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-ink-tertiary tracking-widest">License Expiry Date</label>
                                        <input required type="date" name="licenseExpiry" value={formData.licenseExpiry} onChange={handleKYCChange} className="w-full p-4 bg-surface-secondary rounded-2xl border-none focus:ring-2 focus:ring-accent-400 font-bold" />
                                    </div>
                                    <div className="bg-sand-500/5 p-6 rounded-3xl border border-sand-500/20 flex items-start gap-4">
                                        <EmojiIcon emoji="📋" size=24 className="text-2xl" />
                                        <p className="text-xs font-medium text-sand-500 leading-relaxed">
                                            By submitting, you agree to a background check and certify that all vehicle maintenance is up to date. You will be required to upload ID photos shortly after initial review.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-12 flex justify-between gap-4">
                    {step > 1 && (
                        <button type="button" onClick={() => setStep(s => s - 1)} className="px-10 py-5 bg-surface-secondary text-ink-secondary rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-surface-tertiary transition-all">
                            Back
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            type="button"
                            disabled={step === 1 && !formData.vehicle.category}
                            onClick={() => setStep(s => s + 1)}
                            className="flex-1 py-5 bg-accent-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-accent-600 disabled:opacity-50 transition-all shadow-xl shadow-accent-500/10"
                        >
                            Continue Mission ➔
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-5 bg-ink-primary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-surface-tertiary disabled:opacity-50 transition-all shadow-xl"
                        >
                            {submitting ? 'Authenticating...' : 'Submit Verification'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
