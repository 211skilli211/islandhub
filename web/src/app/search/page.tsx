'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-surface-elevated flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-border-primary border-t-accent-400 rounded-full"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'listings' | 'vendors'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 12;

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
            setResults(res.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const listings = results.filter(r => r.result_type === 'listing');
    const vendors = results.filter(r => r.result_type === 'vendor');
    const providers = results.filter(r => r.result_type === 'provider');

    // Reset pagination when tab changes
    useEffect(() => { setCurrentPage(1); }, [activeTab]);

    const displayResults = activeTab === 'all'
        ? results
        : activeTab === 'listings'
            ? listings
            : vendors;

    return (
        <div className="min-h-screen bg-surface-elevated">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-ink-primary tracking-tight">
                        Search Results for <span className="text-accent-400">"{query}"</span>
                    </h1>
                    <p className="mt-2 text-ink-tertiary font-medium">
                        Found {results.length} results across the island
                    </p>
                </div>

                
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'all' ? 'bg-surface-tertiary text-white shadow-xl scale-105' : 'bg-surface-primary text-ink-tertiary hover:bg-surface-secondary'}`}
                    >
                        All Results
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'listings' ? 'bg-accent-500 text-white shadow-xl scale-105' : 'bg-surface-primary text-ink-tertiary hover:bg-surface-secondary'}`}
                    >
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'vendors' ? 'bg-[#14b8a6] text-white shadow-xl scale-105' : 'bg-surface-primary text-ink-tertiary hover:bg-surface-secondary'}`}
                    >
                        Vendors ({vendors.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-border-primary border-t-accent-400"></div>
                    </div>
                ) : displayResults.length > 0 ? (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayResults.slice((currentPage - 1) * 12, currentPage * 12).map((result, idx) => (
                            <div key={`${result.result_type}-${result.id}-${idx}`} className="group">
                                {result.result_type === 'listing' ? (
                                    <ListingCard listing={result} />
                                ) : (
                                    <Link href={`/vendors/${result.id}`}>
                                        <div className="bg-surface-elevated rounded-3xl border border-border-primary p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-surface-primary rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-border-primary">
                                                    {result.logo_url ? <img src={result.logo_url} className="w-full h-full object-cover" /> : '🏪'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-ink-primary group-hover:text-accent-400 transition-colors uppercase tracking-tight text-lg">{result.business_name}</h3>
                                                        {result.is_featured && (
                                                            <span className="bg-sand-500/10 text-sand-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Featured</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-ink-tertiary font-bold">{result.location || 'Island-wide'}</p>
                                                </div>
                                            </div>
                                            <p className="text-ink-tertiary text-sm line-clamp-2 font-medium mb-4 italic">
                                                "{result.bio || 'Crafting island experiences with passion and quality.'}"
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-border-primary">
                                                <span className="text-xs font-black text-ink-tertiary uppercase tracking-widest">Storefront</span>
                                                <span className="text-[#14b8a6] font-black text-sm group-hover:underline">Visit Store ↗</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {displayResults.length > perPage && (
                        <div className="flex items-center justify-center gap-2 mt-12">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-surface-primary text-ink-secondary font-bold disabled:opacity-30 hover:bg-surface-secondary transition-colors"
                            >← Prev</button>
                            {Array.from({ length: Math.ceil(displayResults.length / perPage) }, (_, i) => i + 1).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === p ? 'bg-accent-500 text-white shadow-lg' : 'bg-surface-primary text-ink-secondary hover:bg-surface-secondary'}`}
                                >{p}</button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage >= Math.ceil(displayResults.length / perPage)}
                                className="px-4 py-2 rounded-xl bg-surface-primary text-ink-secondary font-bold disabled:opacity-30 hover:bg-surface-secondary transition-colors"
                            >Next →</button>
                        </div>
                    )}
                </>
                ) : (
                    <div className="text-center py-20 bg-surface-primary rounded-3xl border-2 border-dashed border-border-primary">
                        <div className="text-6xl mb-4">🏝️🔍</div>
                        <h2 className="text-2xl font-black text-ink-primary">No results found</h2>
                        <p className="text-ink-tertiary mt-2">Try adjusting your search terms or exploring a different category.</p>
                        <Link href="/" className="mt-8 inline-block px-8 py-3 bg-accent-500 text-white font-black rounded-full shadow-lg shadow-accent-500/20 hover:scale-105 transition-all">
                            Back to Discovery
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
