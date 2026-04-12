'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface VerificationStatus {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'not_started';
    date?: string;
    notes?: string;
}

export default function DriverVerification() {
    const [verifications] = useState<VerificationStatus[]>([
        {
            id: 'license',
            name: 'Driver\'s License',
            status: 'approved',
            date: '2024-01-15',
            notes: 'Verified - Class B Commercial License'
        },
        {
            id: 'background',
            name: 'Background Check',
            status: 'approved',
            date: '2024-01-16',
            notes: 'No criminal record found'
        },
        {
            id: 'insurance',
            name: 'Vehicle Insurance',
            status: 'pending',
            date: '2024-01-20',
            notes: 'Under review - Additional documentation required'
        },
        {
            id: 'vehicle',
            name: 'Vehicle Inspection',
            status: 'not_started',
            notes: 'Schedule your vehicle inspection appointment'
        },
    ]);

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'rejected': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return '✓';
            case 'pending': return '⏳';
            case 'rejected': return '✗';
            default: return '○';
        }
    };

    const getOverallStatus = () => {
        const allApproved = verifications.every(v => v.status === 'approved');
        const anyRejected = verifications.some(v => v.status === 'rejected');
        const pending = verifications.filter(v => v.status === 'pending' || v.status === 'not_started').length;

        if (allApproved) return { status: 'verified', text: 'Fully Verified', color: 'text-emerald-600' };
        if (anyRejected) return { status: 'rejected', text: 'Issues Found', color: 'text-red-600' };
        if (pending > 0) return { status: 'pending', text: `${pending} Items Pending`, color: 'text-amber-600' };
        return { status: 'incomplete', text: 'Incomplete', color: 'text-gray-600' };
    };

    const overallStatus = getOverallStatus();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Driver Verification</h2>
                    <p className="text-gray-600">Manage your verification documents and status</p>
                </div>
            </div>

            {/* Overall Status Card */}
            <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold opacity-90">Verification Status</h3>
                        <p className={`text-3xl font-bold mt-1 ${overallStatus.color.replace('text-', 'text-white ')}`}>
                            {overallStatus.text}
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur rounded-full p-4">
                        <span className="text-4xl">🪪</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                            {verifications.filter(v => v.status === 'approved').length} Approved
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                            {verifications.filter(v => v.status === 'pending').length} Pending
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                            {verifications.filter(v => v.status === 'not_started').length} Not Started
                        </span>
                    </div>
                </div>
            </div>

            {/* Verification Items */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Verification Documents</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {verifications.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                        item.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                            item.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        {getStatusIcon(item.status)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">{item.name}</div>
                                        {item.date && (
                                            <div className="text-sm text-gray-500">Last updated: {item.date}</div>
                                        )}
                                        {item.notes && (
                                            <div className="text-sm text-gray-600 mt-1">{item.notes}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                    {item.status === 'not_started' && (
                                        <button
                                            onClick={() => {
                                                setUploadingDoc(item.id);
                                                setShowUploadModal(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                                        >
                                            Upload
                                        </button>
                                    )}
                                    {item.status === 'pending' && (
                                        <button className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors text-sm">
                                            View Details
                                        </button>
                                    )}
                                    {item.status === 'approved' && (
                                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm">
                                            Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Verification Timeline</h3>
                <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="space-y-6">
                        <div className="relative pl-10">
                            <div className="absolute left-2.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-500">Jan 15, 2024</div>
                                <div className="font-medium text-gray-900">Driver's License Verified</div>
                                <div className="text-sm text-gray-600">Your driver's license has been approved.</div>
                            </div>
                        </div>
                        <div className="relative pl-10">
                            <div className="absolute left-2.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-sm text-gray-500">Jan 16, 2024</div>
                                <div className="font-medium text-gray-900">Background Check Cleared</div>
                                <div className="text-sm text-gray-600">No issues found in background verification.</div>
                            </div>
                        </div>
                        <div className="relative pl-10">
                            <div className="absolute left-2.5 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse"></div>
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <div className="text-sm text-amber-600">In Progress</div>
                                <div className="font-medium text-gray-900">Vehicle Insurance Review</div>
                                <div className="text-sm text-gray-600">Additional documentation under review.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Common Questions</h3>
                <div className="space-y-4">
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">How long does verification take?</span>
                            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 px-4 text-gray-600">
                            Most verifications are completed within 2-3 business days. Background checks may take 5-7 business days depending on the complexity.
                        </div>
                    </details>
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">What if my verification is rejected?</span>
                            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 px-4 text-gray-600">
                            If your verification is rejected, you'll receive an email explaining the reason. You can resubmit with the correct documentation.
                        </div>
                    </details>
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">Can I start delivering while verification is pending?</span>
                            <span className="text-gray-500 group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="mt-2 px-4 text-gray-600">
                            You can complete some tasks but will be limited until all verifications are approved. Fully verified drivers get priority on high-paying orders.
                        </div>
                    </details>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
                    >
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            Upload {verifications.find(v => v.id === uploadingDoc)?.name}
                        </h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                            <div className="text-4xl mb-4">📁</div>
                            <p className="text-gray-600 mb-2">Drag and drop your file here, or</p>
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                                Browse Files
                            </button>
                            <p className="text-sm text-gray-500 mt-4">PDF, JPG, PNG up to 5MB</p>
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowUploadModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    alert('Document uploaded successfully!');
                                }}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Upload
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
