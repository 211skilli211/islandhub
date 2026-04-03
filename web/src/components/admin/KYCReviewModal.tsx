'use client';

import { useState } from 'react';
import { getImageUrl, api } from '@/lib/api';
import toast from 'react-hot-toast';

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

interface KYCReviewModalProps {
    submission: KYCSubmission;
    onClose: () => void;
    onAction: (kycId: number, action: 'approve' | 'reject', reason?: string) => Promise<void>;
}

export default function KYCReviewModal({ submission, onClose, onAction }: KYCReviewModalProps) {
    const [loading, setLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const documents = submission.documents ? JSON.parse(submission.documents) : {};

    const handleApprove = async () => {
        setLoading(true);
        try {
            await onAction(submission.kyc_id, 'approve');
            toast.success('KYC approved');
            onClose();
        } catch (error) {
            toast.error('Failed to approve');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        setLoading(true);
        try {
            await onAction(submission.kyc_id, 'reject', rejectReason);
            toast.success('KYC rejected');
            onClose();
        } catch (error) {
            toast.error('Failed to reject');
        } finally {
            setLoading(false);
        }
    };

    const documentEntries = Object.entries(documents);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-slate-800">KYC Review</h3>
                        <p className="text-sm text-slate-500">{submission.business_name}</p>
                        <p className="text-xs text-slate-400">{submission.email}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-auto max-h-[50vh]">
                    {/* Submitted Info */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Submitted</p>
                            <p className="font-bold text-slate-700">{new Date(submission.submitted_at).toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <p className="font-bold text-amber-600 uppercase">{submission.status}</p>
                        </div>
                    </div>

                    {/* Documents */}
                    <div className="mb-4">
                        <h4 className="font-black text-slate-700 mb-3 uppercase text-xs tracking-widest">Submitted Documents</h4>
                        {documentEntries.length === 0 ? (
                            <p className="text-slate-400 text-sm">No documents submitted</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {documentEntries.map(([key, url]) => (
                                    <div key={key} className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-2">{key.replace(/_/g, ' ')}</p>
                                        {url && (String(url).startsWith('http') || String(url).includes('uploads')) ? (
                                            <a 
                                                href={getImageUrl(url as string)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="block aspect-video bg-white rounded-lg border border-slate-200 overflow-hidden hover:opacity-90 transition-opacity"
                                            >
                                                <img 
                                                    src={getImageUrl(url as string)} 
                                                    alt={key}
                                                    className="w-full h-full object-contain"
                                                />
                                            </a>
                                        ) : (
                                            <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                No preview
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rejection Reason Input */}
                    {showRejectForm && (
                        <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                            <label className="block text-xs font-black text-red-600 uppercase tracking-widest mb-2">
                                Rejection Reason (Required)
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Explain why this KYC was rejected..."
                                className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl text-sm focus:border-red-400 focus:ring-0"
                                rows={3}
                            />
                            <p className="text-xs text-red-500 mt-2">
                                This reason will be shown to the vendor.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex justify-between gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        {!showRejectForm ? (
                            <>
                                <button 
                                    onClick={() => setShowRejectForm(true)}
                                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100"
                                >
                                    Reject
                                </button>
                                <button 
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 disabled:opacity-50"
                                >
                                    Approve
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => { setShowRejectForm(false); setRejectReason(''); }}
                                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm"
                                >
                                    Back
                                </button>
                                <button 
                                    onClick={handleReject}
                                    disabled={loading || !rejectReason.trim()}
                                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 disabled:opacity-50"
                                >
                                    Confirm Rejection
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
