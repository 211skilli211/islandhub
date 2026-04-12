'use client';

import { useState, useEffect } from 'react';
import { getImageUrl, api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Media {
    id: number;
    filename: string;
    url: string;
    file_type: string;
    file_size: number;
    user_id?: number;
    user_name?: string;
    listing_id?: number;
    store_id?: number;
    created_at: string;
}

type ViewMode = 'grid' | 'list';
type DateFilter = 'all' | 'today' | 'week' | 'month';

export default function AssetLibrary() {
    const [assets, setAssets] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<Media | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        fetchAssets();
    }, [dateFilter]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateFilter !== 'all') params.append('date', dateFilter);
            if (searchQuery) params.append('search', searchQuery);
            params.append('limit', '50');
            
            const res = await api.get(`/admin/assets?${params.toString()}`);
            setAssets(res.data?.assets || res.data || []);
        } catch (error) {
            console.error('Failed to fetch assets:', error);
            setAssets([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = !searchQuery || 
            asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileTypeIcon = (fileType: string) => {
        if (fileType?.startsWith('image/')) return '🖼️';
        if (fileType?.includes('pdf') || fileType?.includes('document')) return '📄';
        if (fileType?.includes('font')) return '🔤';
        if (fileType?.startsWith('video/')) return '🎬';
        return '📁';
    };

    const isImage = (fileType: string) => fileType?.startsWith('image/');
    const isVideo = (fileType: string) => fileType?.startsWith('video/');

    const handleDelete = async (asset: Media) => {
        if (!confirm(`Delete "${asset.filename}"?`)) return;
        
        try {
            await api.delete(`/uploads/${asset.filename}`);
            toast.success('Asset deleted');
            fetchAssets();
        } catch (error) {
            toast.error('Failed to delete asset');
        }
    };

    const openPreview = (asset: Media) => {
        setSelectedAsset(asset);
        setIsPreviewOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-xl font-black text-slate-800">Media Library</h2>
                    <p className="text-sm text-slate-500">{filteredAssets.length} assets</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-48"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold ${viewMode === 'grid' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold ${viewMode === 'list' ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-500'}`}
                        >
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {(['all', 'today', 'week', 'month'] as DateFilter[]).map(date => (
                        <button
                            key={date}
                            onClick={() => setDateFilter(date)}
                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                dateFilter === date 
                                    ? 'bg-teal-600 text-white' 
                                    : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-300'
                            }`}
                        >
                            {date === 'all' ? 'All Time' : date === 'today' ? 'Today' : date === 'week' ? 'This Week' : 'This Month'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset Display */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                    <div className="text-5xl mb-4">📂</div>
                    <p className="text-slate-500 font-medium">No assets found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredAssets.map(asset => (
                        <div 
                            key={asset.id}
                            className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                            onClick={() => openPreview(asset)}
                        >
                            <div className="aspect-square bg-slate-50 flex items-center justify-center">
                                {isImage(asset.file_type) ? (
                                    <img 
                                        src={getImageUrl(asset.url)} 
                                        alt={asset.filename}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span className="text-4xl">{getFileTypeIcon(asset.file_type)}</span>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs font-bold text-slate-700 truncate">{asset.filename}</p>
                                <p className="text-[10px] text-slate-400">{formatFileSize(asset.file_size)}</p>
                            </div>
                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openPreview(asset); }}
                                    className="p-2 bg-white rounded-full hover:bg-teal-50"
                                >
                                    👁️
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(asset); }}
                                    className="p-2 bg-white rounded-full hover:bg-red-50"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Preview</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Filename</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Size</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Uploaded By</th>
                                <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase">Date</th>
                                <th className="px-4 py-3 text-right text-xs font-black text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredAssets.map(asset => (
                                <tr key={asset.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                                            {isImage(asset.file_type) ? (
                                                <img src={getImageUrl(asset.url)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{getFileTypeIcon(asset.file_type)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{asset.filename}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500 uppercase">{asset.file_type || 'unknown'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{formatFileSize(asset.file_size)}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{asset.user_name || 'System'}</td>
                                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(asset.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => openPreview(asset)} className="text-teal-600 hover:underline text-xs font-bold">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewOpen && selectedAsset && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100">
                            <h3 className="font-black text-slate-800">{selectedAsset.filename}</h3>
                            <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg">✕</button>
                        </div>
                        <div className="p-6 overflow-auto">
                            <div className="bg-slate-50 rounded-2xl flex items-center justify-center min-h-[300px] mb-6">
                                {isImage(selectedAsset.file_type) ? (
                                    <img src={getImageUrl(selectedAsset.url)} alt="" className="max-w-full max-h-[400px] object-contain" />
                                ) : isVideo(selectedAsset.file_type) ? (
                                    <video src={getImageUrl(selectedAsset.url)} controls className="max-w-full max-h-[400px]" />
                                ) : (
                                    <div className="text-center p-12">
                                        <span className="text-6xl mb-4 block">{getFileTypeIcon(selectedAsset.file_type)}</span>
                                        <p className="text-slate-500">Preview not available for this file type</p>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">File Type</p>
                                    <p className="font-bold text-slate-700">{selectedAsset.file_type || 'Unknown'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                                    <p className="font-bold text-slate-700">{formatFileSize(selectedAsset.file_size)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Uploaded By</p>
                                    <p className="font-bold text-slate-700">{selectedAsset.user_name || 'System'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Upload Date</p>
                                    <p className="font-bold text-slate-700">{new Date(selectedAsset.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-between">
                            <a 
                                href={getImageUrl(selectedAsset.url)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200"
                            >
                                Open in New Tab
                            </a>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => { handleDelete(selectedAsset); setIsPreviewOpen(false); }}
                                    className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100"
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => setIsPreviewOpen(false)}
                                    className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
