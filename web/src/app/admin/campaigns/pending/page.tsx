'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

// Modal Component
const RequestChangesModal = ({ isOpen, onClose, onSubmit, campaignId, campaignTitle }: { isOpen: boolean; onClose: () => void; onSubmit: (feedback: string) => void; campaignId: number; campaignTitle: string }) => {
    const [feedback, setFeedback] = useState('');

    const handleSubmit = () => {
        if (feedback.trim()) {
            onSubmit(feedback);
            setFeedback('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
                <h3 className="text-xl font-black text-slate-900 mb-4">Request Changes for "{campaignTitle}"</h3>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Please provide specific feedback on what changes are needed..."
                    className="w-full p-3 border border-slate-200 rounded-xl mb-4 min-h-[120px] resize-none"
                    required
                />
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl transition-all"
                    >
                        Send Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function PendingCampaignsPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            fetchPendingCampaigns();
        }
    }, [isAuthenticated, user]);

    const fetchPendingCampaigns = async () => {
        setLoading(true);
        try {
            const res = await api.get('/listings?type=campaign&admin=true');
            const allCampaigns = res.data;
            // Filter for unverified campaigns
            const pending = allCampaigns.filter((c: any) => !c.verified);
            setCampaigns(pending);
        } catch (error) {
            console.error('Failed to fetch pending campaigns:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (campaignId: number) => {
        try {
            await api.put(`/listings/${campaignId}`, { verified: true });
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
            alert('Campaign approved successfully!');
        } catch (error) {
            console.error('Failed to approve campaign:', error);
            alert('Failed to approve campaign');
        }
    };

    const handleReject = async (campaignId: number) => {
        if (!confirm('Are you sure you want to reject this campaign? This action cannot be undone.')) {
            return;
        }
        try {
            await api.delete(`/listings/${campaignId}`);
            setCampaigns(prev => prev.filter(c => c.id !== campaignId));
            alert('Campaign rejected and removed.');
        } catch (error) {
            console.error('Failed to reject campaign:', error);
            alert('Failed to reject campaign');
        }
    };

    const handleRequestChanges = (campaign: any) => {
        setSelectedCampaign(campaign);
        setModalOpen(true);
    };

    const handleSubmitChanges = async (feedback: string) => {
        try {
            await api.post(`/admin/campaigns/${selectedCampaign.id}/request-changes`, { listingId: selectedCampaign.id, feedback });
            alert('Change request sent successfully!');
        } catch (error) {
            console.error('Failed to request changes:', error);
            alert('Failed to send change request');
        }
    };

    if (!isAuthenticated) return null;

    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen pt-20 text-center">
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.push('/admin')}
                            className="text-teal-600 hover:text-teal-700 font-bold mb-2 flex items-center gap-2"
                        >
                            ← Back to Admin Dashboard
                        </button>
                        <h1 className="text-3xl font-black text-slate-900">Pending Campaigns</h1>
                        <p className="text-slate-500">Review and approve community campaigns</p>
                    </div>
                    <div className="bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">
                        <span className="block text-xs text-amber-500 font-bold uppercase">Pending Review</span>
                        <span className="text-2xl font-black text-amber-600">{campaigns.length}</span>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-teal-600"></div>
                        <p className="mt-4 text-slate-500 font-medium">Loading campaigns...</p>
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
                        <div className="text-4xl mb-4">✨</div>
                        <p className="text-slate-500 font-medium">All caught up! No pending campaigns to review.</p>
                        <button
                            onClick={() => router.push('/admin')}
                            className="mt-4 text-teal-600 hover:text-teal-700 font-bold"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {campaigns.map(campaign => (
                            <div key={campaign.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                <div className="flex flex-col lg:flex-row gap-6">
                                    {/* Campaign Image */}
                                    <div className="w-full lg:w-64 h-48 flex-shrink-0 bg-slate-100 rounded-xl overflow-hidden">
                                        {campaign.image_url ? (
                                            <img src={campaign.image_url} alt={campaign.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <span className="text-6xl">🏝️</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Campaign Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-black text-slate-900 mb-2">{campaign.title}</h2>
                                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <span>📅</span>
                                                        {new Date(campaign.created_at).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span>🆔</span>
                                                        ID: {campaign.id}
                                                    </span>
                                                    {campaign.category && (
                                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold">
                                                            {campaign.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-slate-700 mb-4 leading-relaxed">{campaign.description}</p>

                                        {/* Campaign Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-xl">
                                            <div>
                                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Goal Amount</div>
                                                <div className="text-lg font-black text-teal-600">${campaign.goal_amount?.toLocaleString() || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Current Amount</div>
                                                <div className="text-lg font-black text-slate-900">${campaign.current_amount?.toLocaleString() || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Creator ID</div>
                                                <div className="text-lg font-black text-slate-900">{campaign.creator_id}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-400 font-bold uppercase mb-1">Status</div>
                                                <div className="text-lg font-black text-amber-600">Pending</div>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        {campaign.metadata && Object.keys(campaign.metadata).length > 0 && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                                <h3 className="text-xs font-black uppercase text-blue-600 mb-2">Additional Details</h3>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    {Object.entries(campaign.metadata).map(([key, value]) => (
                                                        <div key={key}>
                                                            <span className="text-slate-500 font-medium">{key}: </span>
                                                            <span className="text-slate-900 font-bold">{String(value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleApprove(campaign.id)}
                                                className="flex-1 px-6 py-4 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl shadow-lg shadow-teal-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                <span>✓</span> Approve Campaign
                                            </button>
                                            <button
                                                onClick={() => handleRequestChanges(campaign)}
                                                className="flex-1 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl shadow-lg shadow-amber-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                <span>📝</span> Request Changes
                                            </button>
                                            <button
                                                onClick={() => handleReject(campaign.id)}
                                                className="flex-1 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-xl border-2 border-red-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>✕</span> Reject & Remove
                                            </button>
                                            <button
                                                onClick={() => router.push(`/listings/${campaign.id}`)}
                                                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>👁️</span> View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Request Changes Modal */}
                <RequestChangesModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmitChanges}
                    campaignId={selectedCampaign?.id}
                    campaignTitle={selectedCampaign?.title}
                />
            </div>
        </div>
    );
}
