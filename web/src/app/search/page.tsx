export const dynamic = 'force-dynamic';

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'listings' | 'vendors'>('all');

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

    const displayResults = activeTab === 'all'
        ? results
        : activeTab === 'listings'
            ? listings
            : vendors;

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Search Results for <span className="text-teal-600">"{query}"</span>
                    </h1>
                    <p className="mt-2 text-slate-500 font-medium">
                        Found {results.length} results across the island
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        All Results
                    </button>
                    <button
                        onClick={() => setActiveTab('listings')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'listings' ? 'bg-teal-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        Listings ({listings.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('vendors')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === 'vendors' ? 'bg-indigo-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                        Vendors ({vendors.length})
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-teal-600"></div>
                    </div>
                ) : displayResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayResults.map((result, idx) => (
                            <div key={`${result.result_type}-${result.id}-${idx}`} className="group">
                                {result.result_type === 'listing' ? (
                                    <ListingCard listing={result} />
                                ) : (
                                    <Link href={`/vendors/${result.id}`}>
                                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border border-slate-100">
                                                    {result.logo_url ? <img src={result.logo_url} className="w-full h-full object-cover" /> : '🏪'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-black text-slate-900 group-hover:text-teal-600 transition-colors uppercase tracking-tight text-lg">{result.business_name}</h3>
                                                        {result.is_featured && (
                                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Featured</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-slate-400 font-bold">{result.location || 'Island-wide'}</p>
                                                </div>
                                            </div>
                                            <p className="text-slate-500 text-sm line-clamp-2 font-medium mb-4 italic">
                                                "{result.bio || 'Crafting island experiences with passion and quality.'}"
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Storefront</span>
                                                <span className="text-indigo-600 font-black text-sm group-hover:underline">Visit Store ↗</span>
                                            </div>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <div className="text-6xl mb-4">🏝️🔍</div>
                        <h2 className="text-2xl font-black text-slate-900">No results found</h2>
                        <p className="text-slate-500 mt-2">Try adjusting your search terms or exploring a different category.</p>
                        <Link href="/" className="mt-8 inline-block px-8 py-3 bg-teal-600 text-white font-black rounded-full shadow-lg shadow-teal-500/20 hover:scale-105 transition-all">
                            Back to Discovery
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
