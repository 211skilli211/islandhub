'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import EditListingModal from '@/components/admin/EditListingModal';
import { CATEGORY_SCHEMAS, FormField } from '@/lib/schemas';
import toast from 'react-hot-toast';

export default function ListingDetailPage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const renderMetadata = (data: any, fields: FormField[]) => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fields.map(field => {
                    const value = data[field.name];
                    if (value === undefined || value === null || value === '') return null;

                    if (field.type === 'repeatable_section' && Array.isArray(value)) {
                        return (
                            <div key={field.name} className="md:col-span-2 space-y-4 mt-4">
                                <h4 className="text-sm font-black text-slate-900 dark:text-white border-l-4 border-teal-500 pl-3 uppercase">
                                    {field.label}
                                </h4>
                                <div className="space-y-3">
                                    {value.map((item: any, idx: number) => (
                                        <div key={idx} className="p-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl shadow-sm">
                                            {renderMetadata(item, field.schema || [])}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={field.name} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{field.label}</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                                {Array.isArray(value)
                                    ? value.join(', ')
                                    : typeof value === 'boolean'
                                        ? (value ? '✅ Yes' : '❌ No')
                                        : String(value)}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const fetchListing = async () => {
        try {
            const res = await api.get(`/listings/${id}`);
            setListing(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        if (user?.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchListing();
    }, [id, isAuthenticated, user]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently remove this listing?')) return;
        try {
            await api.delete(`/listings/${id}`);
            toast.success('Listing deleted successfully');
            router.push('/admin');
        } catch (err) {
            toast.error('Failed to delete listing');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
        </div>
    );
    if (!listing) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="text-4xl mb-4">📦</div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Listing not found</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">The listing ID may be invalid or deleted.</p>
                <button 
                    onClick={() => router.push('/admin')}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                >
                    Back to Admin
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <EditListingModal
                listing={isEditing ? listing : null}
                onClose={() => setIsEditing(false)}
                onSuccess={() => { setIsEditing(false); fetchListing(); }}
            />
            
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/admin')}
                    className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold mb-6 transition-colors"
                >
                    <span className="text-xl">←</span>
                    <span>Back to Admin</span>
                </button>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold">{listing.title}</h1>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="text-sm text-slate-400">ID: {listing.id}</span>
                                    <span className="px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-bold rounded-full uppercase border border-teal-500/30">
                                        {listing.type}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs font-bold rounded-full uppercase">
                                        {listing.status || 'active'}
                                    </span>
                                </div>
                            </div>
                            <a href={`/listings/${listing.id}`} className="text-xs text-teal-400 hover:text-teal-300 underline bg-white/10 px-4 py-2 rounded-full font-bold">
                                View Public Page ↗
                            </a>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Price & Category */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                    {listing.type === 'campaign' ? 'Goal' : 'Price'}
                                </label>
                                <div className="text-xl font-bold text-slate-900 dark:text-white">
                                    {listing.type === 'campaign' ? `$${listing.goal_amount?.toLocaleString()}` : `$${listing.price?.toLocaleString()}`}
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">{listing.category}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Vendor</label>
                                <div className="text-lg font-bold text-slate-900 dark:text-white truncate">{listing.vendor_name || 'N/A'}</div>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Created</label>
                                <div className="text-lg font-bold text-slate-900 dark:text-white">
                                    {listing.created_at ? new Date(listing.created_at).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Description</label>
                            <p className="text-slate-700 dark:text-slate-300">{listing.description || 'No description provided.'}</p>
                        </div>

                        {/* Specifications */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Listing Specifications</label>
                            {(() => {
                                const categoryKey = listing.type === 'campaign' ? 'campaigns' : (listing.category?.toLowerCase() || '');
                                const subTypeKey = listing.metadata?.sub_type || listing.metadata?.type || '';
                                const fields = CATEGORY_SCHEMAS[categoryKey]?.[subTypeKey]?.fields || [];

                                if (fields.length > 0) {
                                    return renderMetadata(listing.metadata, fields);
                                }

                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(listing.metadata || {}).map(([key, value]: [string, any]) => {
                                            if (key === 'sub_type') return null;
                                            const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                            return (
                                                <div key={key} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                                                        {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : String(value)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6 flex flex-wrap gap-4">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20"
                            >
                                ✏️ Edit Listing
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-6 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-all"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}