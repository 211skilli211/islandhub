'use client';

import React from 'react';
import api from '@/lib/api';

interface Listing {
    id: number;
    title: string;
    type: string;
    price?: number;
    goal_amount?: number;
    category: string;
    creator_id: number;
    created_at: string;
    featured?: boolean;
}

interface ListingTableProps {
    listings: Listing[];
    onEdit: (listing: Listing) => void;
    onRefresh: () => void;
    viewMode: 'list' | 'grid';
    onVerify?: (listing: Listing) => void;
}

export default function ListingTable({ listings, onEdit, onRefresh, viewMode }: ListingTableProps) {
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this listing? This cannot be undone.')) return;
        try {
            await api.delete(`/listings/${id}`);
            onRefresh();
        } catch (error) {
            console.error('Failed to delete listing', error);
            alert('Failed to delete listing');
        }
    };

    if (viewMode === 'grid') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                    <div
                        key={listing.id}
                        className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col"
                        onClick={() => window.location.href = `/admin/listings/${listing.id}`}
                        style={{ boxShadow: 'var(--shadow)' }}
                    >
                        <div className="h-48 bg-surface-secondary relative">
                            {/* Placeholder or Image if available */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl text-ink-tertiary">
                                {listing.type === 'campaign' ? '❤️' : listing.type === 'product' ? '🛍️' : listing.type === 'rental' ? '🏠' : '📅'}
                            </div>
                            {/* Badge */}
                            <div className="absolute top-4 left-4">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg uppercase shadow-sm ${listing.type === 'campaign' ? 'bg-surface-elevated/90 text-pink-700' :
                                    listing.type === 'product' ? 'bg-surface-elevated/90 text-blue-700' :
                                        listing.type === 'rental' ? 'bg-surface-elevated/90 text-orange-700' :
                                            'bg-surface-elevated/90 text-accent-500'
                                    }`}>
                                    {listing.type}
                                </span>
                                {listing.featured && (
                                    <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-black rounded-lg uppercase shadow-sm">
                                        Featured
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-ink-primary group-hover:text-accent-400 transition-colors line-clamp-1">{listing.title}</h3>
                            </div>
                            <p className="text-sm text-ink-tertiary mb-4">{listing.category}</p>

                            <div className="mt-auto flex items-center justify-between border-t border-border-primary pt-4">
                                <span className="font-bold text-ink-secondary">
                                    {listing.type === 'campaign'
                                        ? `$${Number(listing.goal_amount).toLocaleString()}`
                                        : `$${Number(listing.price).toLocaleString()}`}
                                </span>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit(listing); }}
                                        className="p-2 text-ink-tertiary hover:text-accent-400 hover:bg-accent-500/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                                        className="p-2 text-ink-tertiary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="overflow-hidden bg-surface-elevated shadow-sm sm:rounded-lg border border-border-primary">
            {/* Desktop Table (List View) */}
            <table className="min-w-full divide-y divide-slate-200 hidden md:table">
                <thead className="bg-surface-secondary">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-ink-tertiary uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-ink-tertiary uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-surface-elevated divide-y divide-slate-200">
                    {listings.map((listing) => (
                        <tr
                            key={listing.id}
                            onClick={() => window.location.href = `/admin/listings/${listing.id}`}
                            className="hover:bg-surface-secondary cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded bg-surface-secondary flex items-center justify-center text-lg">
                                        {listing.type === 'campaign' ? '❤️' : listing.type === 'product' ? '🛍️' : listing.type === 'rental' ? '🏠' : '📅'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-ink-primary">{listing.title}</div>
                                        <div className="text-xs text-ink-tertiary">ID: {listing.id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${listing.type === 'campaign' ? 'bg-pink-100 text-pink-800' :
                                    listing.type === 'product' ? 'bg-blue-100 text-blue-800' :
                                        listing.type === 'rental' ? 'bg-orange-100 text-orange-800' :
                                            'bg-accent-500/15 text-accent-600'
                                    }`}>
                                    {listing.type}
                                </span>
                                {listing.featured && (
                                    <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded uppercase shadow-sm">
                                        Featured
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-tertiary">
                                {listing.type === 'campaign'
                                    ? `Goal: $${Number(listing.goal_amount).toLocaleString()}`
                                    : `$${Number(listing.price).toLocaleString()}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-tertiary">
                                {listing.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-tertiary">
                                {new Date(listing.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEdit(listing); }}
                                    className="text-[#14b8a6] hover:text-teal-900"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(listing.id); }}
                                    className="text-red-600 hover:text-red-900"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Cards (Default fallback for small screens regardless of viewMode, or could respect viewMode if desired) */}
            <div className="md:hidden space-y-4 p-4">
                {/* Reusing Grid-like structure for Mobile since table is hidden */}
                {listings.map((listing) => (
                    <div key={listing.id} className="bg-surface-elevated p-4 rounded-xl border border-border-primary shadow-sm flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded bg-surface-secondary flex items-center justify-center text-lg">
                                    {listing.type === 'campaign' ? '❤️' : listing.type === 'product' ? '🛍️' : listing.type === 'rental' ? '🏠' : '📅'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-ink-primary line-clamp-1">{listing.title}</h3>
                                    <span className="text-xs text-ink-tertiary">{listing.category}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-border-primary pt-3 mt-2">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full uppercase ${listing.type === 'campaign' ? 'bg-pink-100 text-pink-800' :
                                listing.type === 'product' ? 'bg-blue-100 text-blue-800' :
                                    listing.type === 'rental' ? 'bg-orange-100 text-orange-800' :
                                        'bg-accent-500/15 text-accent-600'
                                }`}>
                                {listing.type}
                            </span>
                            <span className="font-bold text-ink-primary">
                                {listing.type === 'campaign'
                                    ? `$${Number(listing.goal_amount).toLocaleString()}`
                                    : `$${Number(listing.price).toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => onEdit(listing)}
                                className="flex-1 px-3 py-2 bg-surface-secondary hover:bg-surface-tertiary text-ink-secondary rounded-lg text-sm font-bold"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(listing.id)}
                                className="flex-1 px-3 py-2 bg-[#e11d48]/5 hover:bg-[#e11d48]/10 text-[#e11d48] rounded-lg text-sm font-bold"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
