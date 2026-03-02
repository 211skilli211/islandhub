'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/auth';
import EditListingModal from '@/components/admin/EditListingModal';
import { CATEGORY_SCHEMAS, FormField } from '@/lib/schemas';

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
                                <h4 className="text-sm font-black text-slate-900 border-l-4 border-teal-500 pl-3 uppercase">
                                    {field.label}
                                </h4>
                                <div className="space-y-3">
                                    {value.map((item, idx) => (
                                        <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                            {renderMetadata(item, field.schema || [])}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={field.name} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</span>
                            <span className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
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
        if (!confirm('Are you sure you want to permanentely remove this listing?')) return;
        try {
            await api.delete(`/listings/${id}`);
            router.push('/admin');
        } catch (err) {
            alert('Failed to delete listing');
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!listing) return <div className="p-10 text-center">Listing not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <EditListingModal
                listing={isEditing ? listing : null}
                onClose={() => setIsEditing(false)}
                onSuccess={() => { setIsEditing(false); fetchListing(); }}
            />
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-6">
                    <h1 className="text-2xl font-bold">{listing.title}</h1>
                    <div className="flex justify-between items-start mt-1">
                        <div className="text-sm text-slate-400">ID: {listing.id} • Type: {listing.type}</div>
                        <a href={`/listings/${listing.id}`} className="text-xs text-teal-400 hover:text-teal-300 underline bg-white/10 px-3 py-1 rounded-full">
                            View Public Page ↗
                        </a>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">Price/Goal</label>
                            <div className="text-lg font-bold text-slate-900">
                                {listing.type === 'campaign' ? `Goal: $${listing.goal_amount}` : `$${listing.price}`}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase">Category</label>
                            <div className="text-lg font-bold text-slate-900">{listing.category}</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase">Description</label>
                        <p className="text-slate-700 mt-1">{listing.description}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-4 tracking-[0.2em]">Listing Specifications</label>
                        {(() => {
                            // Find schema
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
                                            <div key={key} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                                                <span className="text-sm font-bold text-slate-900 truncate max-w-[150px]">
                                                    {typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : String(value)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>

                    <div className="border-t border-slate-100 pt-6 flex gap-4">
                        <button
                            onClick={() => {
                                if (window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push('/admin');
                                }
                            }}
                            className="text-slate-500 font-bold hover:text-slate-800"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 ml-auto"
                        >
                            Edit Listing
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-rose-50 text-rose-600 px-6 py-2 rounded-lg font-bold hover:bg-rose-100"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
