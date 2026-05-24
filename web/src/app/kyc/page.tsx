'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import KYCReviewModal from '@/components/admin/KYCReviewModal';

interface KYCSubmission {
    kyc_id: number;
    vendor_id: number;
    business_name: string;
    owner_name: string;
    email: string;
    documents: Record<string, string>;
    status: string;
    submitted_at: string;
    rejection_reason?: string;
}

export default function AdminKYCPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [kycList, setKycList] = useState<KYCSubmission[]>([]);
    const [selectedKYC, setSelectedKYC] = useState<KYCSubmission | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        const fetchKYC = async () => {
            try {
                const res = await api.get('/kyc/admin/pending');
                setKycList(res.data || []);
            } catch (err) {
                console.error('Failed to fetch KYC');
            } finally {
                setLoading(false);
            }
        };
        fetchKYC();
    }, []);

    const handleKycAction = async (id: number, action: string, reason?: string) => {
        try {
            if (action === 'reject' && reason) {
                await api.post(`/kyc/admin/${id}/reject`, { reason });
            } else {
                await api.post(`/kyc/admin/${id}/${action}`);
            }
            toast.success(`KYC ${action}d`);
            setKycList(prev => prev.filter(k => k.kyc_id !== id));
            setSelectedKYC(null);
        } catch (err) {
            toast.error('KYC action failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Modal */}
            {selectedKYC && (
                <KYCReviewModal 
                    submission={selectedKYC} 
                    onClose={() => setSelectedKYC(null)} 
                    onAction={handleKycAction}
                />
            )}

            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">KYC Requests</h2>
                <p className="text-slate-500 dark:text-slate-400">{kycList.length} pending verifications</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center p-12">
                    <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
                </div>
            ) : kycList.length === 0 ? (
                <div className="text-center p-12 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <p className="text-slate-500 dark:text-slate-400">No pending KYC requests</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {kycList.map((kyc) => (
                        <div 
                            key={kyc.kyc_id} 
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            onClick={() => setSelectedKYC(kyc)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{kyc.business_name || kyc.owner_name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{kyc.email}</p>
                                </div>
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                    Pending
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                                Submitted: {new Date(kyc.submitted_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}