import React from 'react';
import ListingTable from './ListingTable';

interface SearchResultComponentProps {
    results: any[];
    onEditListing: (listing: any) => void;
    onRefresh: () => void;
}

export default function AdminSearchResults({ results, onEditListing, onRefresh }: SearchResultComponentProps) {
    const listings = results.filter(r => r.result_type === 'listing');
    const vendors = results.filter(r => r.result_type === 'vendor');

    const [activeTab, setActiveTab] = React.useState<'listings' | 'vendors'>(listings.length > 0 ? 'listings' : 'vendors');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'listings' ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]'}`}
                    >
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'vendors' ? 'bg-[var(--accent)] text-[var(--bg-primary)]' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border)]'}`}
                    >
                        Vendors ({vendors.length})
                    </button>
                </div>
                <div className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest bg-[var(--bg-tertiary)] px-3 py-1 rounded-full">
                    Global FTS Search
                </div>
            </div>

            {activeTab === 'listings' && (
                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                    {listings.length > 0 ? (
                        <ListingTable
                            listings={listings}
                            onEdit={onEditListing}
                            onRefresh={onRefresh}
                            viewMode="list"
                            onVerify={async (l) => { /* logic */ }}
                        />
                    ) : (
                        <div className="p-12 text-center text-[var(--text-muted)]">No matching listings found</div>
                    )}
                </div>
            )}

            {activeTab === 'vendors' && (
                <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm p-6">
                    {vendors.length > 0 ? (
                        <div className="grid gap-4">
                            {vendors.map(vendor => (
                                <div key={vendor.id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-all cursor-pointer group" onClick={() => window.location.href = `/vendors/${vendor.id}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center text-xl overflow-hidden">
                                            {vendor.logo_url ? <img src={vendor.logo_url} className="w-full h-full object-cover" /> : '🏪'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{vendor.business_name}</h4>
                                            <p className="text-xs text-[var(--text-muted)]">{vendor.location || 'No location'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-xs font-bold text-[var(--text-secondary)] hover:border-[var(--accent)] transition-all">View Profile</button>
                                        <button className="px-3 py-1.5 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg text-xs font-bold shadow-sm">Manage</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-[var(--text-muted)]">No matching vendors found</div>
                    )}
                </div>
            )}
        </div>
    );
}
