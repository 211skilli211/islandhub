'use client';

import { useState, useRef, useCallback } from 'react';
import { Search, Upload, Camera, X, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';

interface VisualHit {
  source: string;
  id?: string;
  listing_id?: number;
  title: string;
  image_url: string;
  score: number;
  text?: string;
}

interface VisualSearchResponse {
  hits: VisualHit[];
  total: number;
}

export default function VisualSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VisualHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const searchByText = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/visual/search/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k: 12 }),
      });
      const data: VisualSearchResponse = await res.json();
      setResults(data.hits || []);
      if (data.hits.length === 0) {
        setError('No results found. Try a different query.');
      }
    } catch (err) {
      setError('Search service unavailable. Please try again later.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const searchByImage = async () => {
    if (!imagePreview) return;
    setLoading(true);
    setError('');

    try {
      // Convert base64 to blob
      const base64Data = imagePreview.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays: Uint8Array[] = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('image', blob, 'search.jpg');
      formData.append('top_k', '12');

      const res = await fetch('/api/visual/search/image', {
        method: 'POST',
        body: formData,
      });
      const data: VisualSearchResponse = await res.json();
      setResults(data.hits || []);
      if (data.hits.length === 0) {
        setError('No similar products found. Try a different image.');
      }
    } catch (err) {
      setError('Image search service unavailable. Please try again later.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-teal-400">
          <Camera className="w-6 h-6" />
          <h2 className="text-2xl font-bold text-white">Visual Product Search</h2>
        </div>
        <p className="text-sm text-ink-tertiary">
          Search products by description or upload a photo to find similar items
        </p>
      </div>

      {/* Search Mode Toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => setSearchMode('text')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            searchMode === 'text'
              ? 'bg-teal-500 text-white'
              : 'bg-surface-secondary text-ink-tertiary hover:text-white'
          }`}
        >
          <Search className="w-3 h-3 inline mr-1" /> Text Search
        </button>
        <button
          onClick={() => setSearchMode('image')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            searchMode === 'image'
              ? 'bg-teal-500 text-white'
              : 'bg-surface-secondary text-ink-tertiary hover:text-white'
          }`}
        >
          <Camera className="w-3 h-3 inline mr-1" /> Image Search
        </button>
      </div>

      {/* Text Search Input */}
      {searchMode === 'text' && (
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchByText()}
            placeholder="Describe what you're looking for... (e.g., 'Caribbean beach resort sunset')"
            className="flex-1 px-4 py-3 bg-surface-secondary border border-border-primary rounded-xl text-white placeholder-ink-tertiary focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            onClick={searchByText}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      )}

      {/* Image Search Input */}
      {searchMode === 'image' && (
        <div className="space-y-4">
          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border-primary rounded-2xl p-12 text-center cursor-pointer hover:border-teal-500/50 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-ink-tertiary" />
              <p className="text-white font-medium mb-2">Upload a photo to search</p>
              <p className="text-xs text-ink-tertiary">
                Drag & drop or click to select. Works with product photos, screenshots, or any image.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Search query"
                className="w-full max-h-64 object-contain rounded-2xl bg-surface-secondary"
              />
              <button
                onClick={clearImage}
                className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={searchByImage}
                disabled={loading}
                className="mt-4 w-full px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                Find Similar Products
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {results.length} Results Found
            </h3>
            <span className="text-xs text-ink-tertiary">
              Powered by PixelRAG
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map((hit, i) => (
              <div
                key={i}
                className="bg-surface-secondary border border-border-primary rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all group"
              >
                <div className="aspect-square relative overflow-hidden">
                  {hit.image_url ? (
                    <img
                      src={hit.image_url}
                      alt={hit.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-tertiary">
                      <ImageIcon className="w-8 h-8 text-ink-tertiary" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 rounded-full text-[10px] text-white font-medium">
                    {Math.round(hit.score * 100)}% match
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-bold text-white truncate">{hit.title}</h4>
                  {hit.text && (
                    <p className="text-[10px] text-ink-tertiary mt-1 line-clamp-2">{hit.text}</p>
                  )}
                  {hit.source === 'local' && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-[9px] font-bold rounded-full">
                      Marketplace
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-ink-tertiary/50" />
          <p className="text-ink-tertiary text-sm">
            Upload a product photo or describe what you're looking for to search visually
          </p>
        </div>
      )}
    </div>
  );
}
