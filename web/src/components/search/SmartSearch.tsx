'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface SearchSuggestion {
    id: string;
    type: 'product' | 'category' | 'vendor' | 'service';
    title: string;
    subtitle?: string;
    image?: string;
    url: string;
}

export default function SmartSearch() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const debouncedQuery = useDebounce(query, 300);

    // Fetch suggestions when query changes
    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`);
                const data = await response.json();
                setSuggestions(data.suggestions);
                setShowDropdown(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSuggestions();
    }, [debouncedQuery]);

    const handleSearch = useCallback((searchQuery?: string) => {
        const queryToUse = searchQuery || query;
        if (queryToUse.trim()) {
            router.push(`/listings?search=${encodeURIComponent(queryToUse)}`);
            setShowDropdown(false);
            setQuery('');
        }
    }, [query, router]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const totalItems = suggestions.length;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    window.location.href = suggestions[selectedIndex].url;
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    }, [suggestions, selectedIndex, handleSearch]);

    // Group suggestions by type
    const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
        if (!acc[suggestion.type]) acc[suggestion.type] = [];
        acc[suggestion.type].push(suggestion);
        return acc;
    }, {} as Record<string, SearchSuggestion[]>);

    return (
        <div className="relative max-w-3xl mx-auto w-full">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Search for restaurants, items, services, or rentals..."
                    className="w-full px-6 py-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-4xl text-slate-800 text-lg placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-400/10 shadow-lg shadow-teal-500/5 transition-all"
                />

                <button
                    onClick={() => handleSearch()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-teal-700 transition-all shadow-md shadow-teal-200"
                >
                    Search
                </button>

                {isLoading && (
                    <div className="absolute right-28 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-teal-500 border-t-transparent rounded-full" />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {showDropdown && suggestions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
                    >
                        {/* Quick Actions */}
                        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Suggestions
                            </span>
                        </div>

                        {/* Type Suggestions */}
                        {Object.entries(groupedSuggestions).map(([type, items]) => (
                            <div key={type} className="border-b border-slate-100 last:border-0">
                                <div className="px-4 py-2 bg-slate-50/50">
                                    <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
                                        {type}s
                                    </span>
                                </div>
                                {items.map((suggestion, idx) => {
                                    const globalIndex = suggestions.indexOf(suggestion);
                                    const isSelected = globalIndex === selectedIndex;

                                    return (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => window.location.href = suggestion.url}
                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                            className={`w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-slate-50 transition-colors ${isSelected ? 'bg-teal-50' : ''
                                                }`}
                                        >
                                            {suggestion.image ? (
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                                                    <img
                                                        src={suggestion.image}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">?</div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 truncate">
                                                    {suggestion.title}
                                                </p>
                                                {suggestion.subtitle && (
                                                    <p className="text-sm text-slate-400 truncate">
                                                        {suggestion.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                                {type}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        ))}

                        {/* Search All Results */}
                        <button
                            onClick={() => handleSearch()}
                            className="w-full p-4 bg-slate-50 text-teal-700 font-bold text-center hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 border-t border-slate-100"
                        >
                            <span>Search all results for "{query}"</span>
                            <span className="text-sm opacity-75">→</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
