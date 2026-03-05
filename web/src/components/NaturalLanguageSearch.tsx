'use client';

import { useState, useCallback } from 'react';
import { Search, Mic, Sparkles } from 'lucide-react';

interface SearchResult {
    type: 'product' | 'store' | 'tour' | 'listing';
    id: string;
    title: string;
    price?: number;
    location?: string;
    image?: string;
    url: string;
}

interface ParsedQuery {
    maxPrice?: number;
    location?: string;
    category?: string;
    date?: string;
    query: string;
}

export function NaturalLanguageSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [parsed, setParsed] = useState<ParsedQuery | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parseQuery = useCallback((input: string): ParsedQuery => {
        const patterns = {
            price: /under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|cheaper\s*than\s*\$?(\d+)/i,
            location: /in\s+([A-Za-z\s]+?)(?:\s+(?:for|under|near|available|$))/i,
            category: /(tours?|products?|restaurants?|rentals?|stores?|activities?)/i,
            date: /(today|tomorrow|this\s+weekend|next\s+week|this\s+month)/i,
        };

        const priceMatch = input.match(patterns.price);
        const locationMatch = input.match(patterns.location);
        const categoryMatch = input.match(patterns.category);
        const dateMatch = input.match(patterns.date);

        return {
            query: input,
            maxPrice: priceMatch ? parseInt(priceMatch[1] || priceMatch[2] || priceMatch[3]) : undefined,
            location: locationMatch ? locationMatch[1].trim() : undefined,
            category: categoryMatch ? categoryMatch[1].toLowerCase() : undefined,
            date: dateMatch ? dateMatch[1] : undefined,
        };
    }, []);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const parsedQuery = parseQuery(query);
            setParsed(parsedQuery);

            // Call the agent-search API
            const response = await fetch('/api/agent-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: parsedQuery }),
            });

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setResults(data.results || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Search failed');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, [query, parseQuery]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const quickSearches = [
        { label: 'Products under $50 in St. Kitts', query: 'products under $50 in St. Kitts' },
        { label: 'Tours this weekend in Nevis', query: 'tours this weekend in Nevis' },
        { label: 'Vegan restaurants near me', query: 'vegan restaurants near me' },
        { label: 'Beach equipment rentals', query: 'beach equipment rentals' },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Try: Show me products under $50 in St. Kitts..."
                    className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-2">
                    <button
                        onClick={() => { }}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        title="Voice search"
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </div>

            {/* Quick Searches */}
            <div className="mt-4 flex flex-wrap gap-2">
                {quickSearches.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => {
                            setQuery(item.query);
                            setTimeout(handleSearch, 100);
                        }}
                        className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors flex items-center gap-1"
                    >
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Parsed Query Display */}
            {parsed && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Understanding:</span>{' '}
                        {parsed.category && `Looking for ${parsed.category}`}
                        {parsed.location && ` in ${parsed.location}`}
                        {parsed.maxPrice && ` under $${parsed.maxPrice}`}
                        {parsed.date && ` ${parsed.date}`}
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Found {results.length} results
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((result) => (
                            <a
                                key={result.id}
                                href={result.url}
                                className="block p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-shadow"
                            >
                                {result.image && (
                                    <img
                                        src={result.image}
                                        alt={result.title}
                                        className="w-full h-40 object-cover rounded-lg mb-3"
                                    />
                                )}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                            {result.type}
                                        </span>
                                        <h4 className="font-semibold text-gray-900 mt-1">{result.title}</h4>
                                        {result.location && (
                                            <p className="text-sm text-gray-500">{result.location}</p>
                                        )}
                                    </div>
                                    {result.price && (
                                        <span className="font-bold text-green-600">
                                            ${result.price}
                                        </span>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            )}

            {/* No Results */}
            {!loading && results.length === 0 && query && !error && (
                <div className="mt-8 text-center">
                    <p className="text-gray-500">No results found. Try a different search.</p>
                </div>
            )}
        </div>
    );
}
