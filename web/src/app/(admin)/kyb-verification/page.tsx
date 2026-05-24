'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Vendor {
    id: number;
    user_id: number;
    business_name: string;
    description: string;
    logo_url: string;
    banner_url: string;
    contact_email: string;
    contact_phone: string;
    location: string;
    bio: string;
    slug: string;
    sub_type: string;
    status: string;
    kyb_verified: boolean;
    admin_notes: string;
    created_at: string;
    verified_at?: string;
    owner_name: string;
    owner_email: string;
    store_name: string;
    store_category: string;
    store_logo: string;
}

export default function KYBVerificationPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchVendors();
    }, [statusFilter, pagination.page]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/vendors/pending?status=${statusFilter}&page=${pagination.page}&limit=${pagination.limit}`);
            setVendors(res.data.vendors);
            setPagination(prev => ({ ...prev, ...res.data.pagination }));
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vendor: Vendor) => {
        try {
            const res = await api.patch(`/admin/vendors/${vendor.id}/approve`, {
                notes: `Approved by admin on ${new Date().toLocaleDateString()}`
            });
            toast.success('Vendor approved successfully!');
            fetchVendors();
            setSelectedVendor(null);
        } catch (error) {
            console.error('Error approving vendor:', error);
            toast.error('Failed to approve vendor');
        }
    };

    const handleReject = async () => {
        if (!selectedVendor || !rejectReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        try {
            await api.patch(`/admin/vendors/${selectedVendor.id}/reject`, {
                reason: rejectReason
            });
            toast.success('Vendor rejected');
            fetchVendors();
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedVendor(null);
        } catch (error) {
            console.error('Error rejecting vendor:', error);
            toast.error('Failed to reject vendor');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            active: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Vendor KYB Verification</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setStatusFilter('pending')}
                        className={`px-4 py-2 rounded-lg ${statusFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    >
                        Pending ({pagination.total})
                    </button>
                    <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-4 py-2 rounded-lg ${statusFilter === 'active' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setStatusFilter('rejected')}
                        className={`px-4 py-2 rounded-lg ${statusFilter === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading vendors...</p>
                </div>
            ) : vendors.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No {statusFilter} vendors</h3>
                    <p className="text-gray-500">
                        {statusFilter === 'pending'
                            ? 'All vendors have been reviewed!'
                            : `No ${statusFilter} vendors found`}
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex">
                                {/* Store Logo */}
                                <div className="w-48 h-48 shrink-0 bg-gray-100 relative">
                                    {vendor.store_logo ? (
                                        <Image
                                            src={vendor.store_logo}
                                            alt={vendor.store_name || vendor.business_name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">🏪</span>
                                        </div>
                                    )}
                                </div>

                                {/* Vendor Details */}
                                <div className="flex-1 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {vendor.store_name || vendor.business_name}
                                            </h3>
                                            <p className="text-gray-500">{vendor.owner_name} ({vendor.owner_email})</p>
                                            <p className="text-sm text-gray-400 mt-1">
                                                Category: <span className="font-medium">{vendor.store_category || vendor.sub_type}</span>
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(vendor.status)}`}>
                                            {vendor.status}
                                        </span>
                                    </div>

                                    <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description || vendor.bio}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span>📍 {vendor.location || 'Not specified'}</span>
                                        <span>📧 {vendor.contact_email}</span>
                                        {vendor.contact_phone && <span>📞 {vendor.contact_phone}</span>}
                                    </div>

                                    {vendor.admin_notes && (
                                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                                            <p className="text-sm font-medium text-yellow-800">Admin Notes:</p>
                                            <p className="text-sm text-yellow-700">{vendor.admin_notes}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        {vendor.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(vendor)}
                                                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                                >
                                                    ✅ Approve Vendor
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedVendor(vendor);
                                                        setShowRejectModal(true);
                                                    }}
                                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                                >
                                                    ❌ Reject
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => setSelectedVendor(vendor)}
                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                        >
                                            View Details
                                        </button>
                                        {vendor.status === 'active' && (
                                            <button
                                                onClick={async () => {
                                                    await api.patch(`/admin/vendors/${vendor.id}/toggle`, { status: 'suspended' });
                                                    fetchVendors();
                                                    toast.success('Vendor suspended');
                                                }}
                                                className="px-4 py-2 bg-orange rounded-lg hover:bg-500 text-white-orange-600 transition-colors font-medium"
                                            >
                                                Suspend
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Reject Vendor</h3>
                        <p className="text-gray-600 mb-4">
                            Please provide a reason for rejecting <strong>{selectedVendor?.store_name || selectedVendor?.business_name}</strong>
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            className="w-full p-3 border border-gray-300 rounded-lg h-32 resize-none"
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                                Confirm Reject
                            </button>
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedVendor(null);
                                }}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Vendor Detail Modal */}
            {selectedVendor && !showRejectModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold">{selectedVendor.store_name || selectedVendor.business_name}</h2>
                                <button
                                    onClick={() => setSelectedVendor(null)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Business Info</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="text-gray-500">Owner:</span> {selectedVendor.owner_name}</p>
                                        <p><span className="text-gray-500">Email:</span> {selectedVendor.owner_email}</p>
                                        <p><span className="text-gray-500">Category:</span> {selectedVendor.store_category || selectedVendor.sub_type}</p>
                                        <p><span className="text-gray-500">Location:</span> {selectedVendor.location || 'N/A'}</p>
                                        <p><span className="text-gray-500">Phone:</span> {selectedVendor.contact_phone || 'N/A'}</p>
                                        <p><span className="text-gray-500">Status:</span>
                                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusBadge(selectedVendor.status)}`}>
                                                {selectedVendor.status}
                                            </span>
                                        </p>
                                        <p><span className="text-gray-500">KYC Verified:</span>
                                            <span className={`ml-1 ${selectedVendor.kyb_verified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {selectedVendor.kyb_verified ? '✓ Yes' : 'Pending'}
                                            </span>
                                        </p>
                                        <p><span className="text-gray-500">Applied:</span> {new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                                    <p className="text-sm text-gray-600">{selectedVendor.description || selectedVendor.bio || 'No description provided'}</p>
                                </div>
                            </div>

                            {selectedVendor.logo_url && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Store Logo</h3>
                                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={selectedVendor.logo_url}
                                            alt="Logo"
                                            width={96}
                                            height={96}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}

                            {selectedVendor.banner_url && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-700 mb-2">Banner Image</h3>
                                    <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                                        <Image
                                            src={selectedVendor.banner_url}
                                            alt="Banner"
                                            width={800}
                                            height={160}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
