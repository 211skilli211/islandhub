'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import VisualSearch from '@/components/search/VisualSearch';

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface-0/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, services, experiences..."
                className="w-full pl-12 pr-4 py-3 bg-surface-secondary border border-border-primary rounded-2xl text-white placeholder-ink-tertiary focus:outline-none focus:border-teal-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-teal-500 border-teal-500 text-white'
                  : 'bg-surface-secondary border-border-primary text-ink-tertiary hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Visual Search Section */}
        <section className="mb-12">
          <VisualSearch />
        </section>

        {/* Traditional search results would go here */}
        {searchQuery && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4">
              Text results for &quot;{searchQuery}&quot;
            </h2>
            <div className="text-center py-12 text-ink-tertiary">
              <p className="text-sm">Text search powered by marketplace catalog.</p>
              <p className="text-xs mt-2">Use visual search above for image-based discovery.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
