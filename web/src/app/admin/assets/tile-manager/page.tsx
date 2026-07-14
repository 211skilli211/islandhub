'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import MediaUploader from './MediaUploader';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface TileAsset {
    id: number;
    tile_key: string;
    tile_label: string;
    asset_url: string | null;
    asset_type: string;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const DEFAULT_TILES = [
    { key: 'food', label: 'Food & Dining', emoji: '🍽️' },
    { key: 'products', label: 'Shopping', emoji: '🛍️' },
    { key: 'services', label: 'Services', emoji: '🛠️' },
    { key: 'rentals', label: 'Rentals', emoji: '🏠' },
    { key: 'tours', label: 'Tours', emoji: '🗺️' },
    { key: 'transport', label: 'Transport', emoji: '🚕' },
    { key: 'events', label: 'Events', emoji: '🎫' },
    { key: 'campaigns', label: 'Campaigns', emoji: '❤️' },
    { key: 'community', label: 'Community', emoji: '🌴' },
];

export default function TileManagerPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [assets, setAssets] = useState<TileAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) router.push('/login');
        if (user?.role !== 'admin') router.push('/dashboard');
    }, [isAuthenticated, user, router]);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/tile-assets', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAssets(data);
            }
        } catch (e) {
            console.error('Failed to fetch tile assets:', e);
        }
        setLoading(false);
    };

    const handleUpload = async (tileKey: string, url: string) => {
        setSaving(tileKey);
        try {
            const res = await fetch('/api/admin/tile-assets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ tile_key: tileKey, asset_url: url })
            });
            if (res.ok) {
                await fetchAssets();
            } else {
                console.error('Failed to save tile asset');
            }
        } catch (e) {
            console.error('Error saving tile asset:', e);
        }
        setSaving(null);
    };

    const handleDelete = async (tileKey: string) => {
        if (!confirm(`Remove image from "${DEFAULT_TILES.find(t => t.key === tileKey)?.label}"?`)) return;
        try {
            const res = await fetch(`/api/admin/tile-assets/${tileKey}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                await fetchAssets();
            }
        } catch (e) {
            console.error('Error deleting tile asset:', e);
        }
    };

    const handleDragOver = (e: React.DragEvent, tileKey: string) => {
        e.preventDefault();
        setDragOver(tileKey);
    };

    const handleDragLeave = () => setDragOver(null);

    const handleDrop = async (e: React.DragEvent, tileKey: string) => {
        e.preventDefault();
        setDragOver(null);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            // Use MediaUploader instead of custom upload
            const formData = new FormData();
            formData.append('file', file);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    await handleUpload(tileKey, data.url);
                }
            } catch (e) {
                console.error('Upload failed:', e);
            }
        }
    };

    const getAsset = (tileKey: string) => assets.find(a => a.tile_key === tileKey);

    if (loading) {
        return <div className="text-ink-tertiary text-sm py-8 text-center">Loading tile assets...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-ink-primary">Tile Manager</h2>
                    <p className="text-ink-tertiary text-sm">
                        Manage background images for homepage category tiles. Drag & drop or click to upload.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {DEFAULT_TILES.map(tile => {
                    const asset = getAsset(tile.key);
                    const hasImage = asset?.asset_url;
                    const isSaving = saving === tile.key;

                    return (
                        <div
                            key={tile.key}
                            className={`group relative rounded-xl border-2 transition-all ${
                                hasImage ? 'border-accent-500/30 bg-surface-elevated' : 'border-dashed border-border-primary bg-surface-secondary/50'
                            } ${dragOver === tile.key ? 'border-accent-500 bg-accent-500/5' : ''}`}
                            onDragOver={e => handleDragOver(e, tile.key)}
                            onDragLeave={handleDragLeave}
                            onDrop={e => handleDrop(e, tile.key)}
                        >
                            {/* Tile Preview */}
                            <div className="aspect-square relative rounded-lg overflow-hidden">
                                {hasImage ? (
                                    <img
                                        src={asset.asset_url!}
                                        alt={tile.label}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-surface-tertiary to-surface-secondary">
                                        <EmojiIcon emoji={tile.emoji} size={48} className="opacity-40" />
                                        <span className="mt-2 text-sm text-ink-tertiary font-medium text-center px-2">
                                            {tile.label}
                                        </span>
                                    </div>
                                )}

                                {/* Upload indicator overlay */}
                                {!hasImage && dragOver === tile.key && (
                                    <div className="absolute inset-0 bg-accent-500/20 flex items-center justify-center rounded-lg">
                                        <span className="text-accent-500 font-bold text-lg">Drop image here</span>
                                    </div>
                                )}

                                {/* Active badge */}
                                {asset?.is_active && (
                                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full">
                                        Active
                                    </span>
                                )}

                                {/* Loading overlay */}
                                {isSaving && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink-primary">{tile.label}</span>
                                    <EmojiIcon emoji={tile.emoji} size={20} />
                                </div>

                                {hasImage ? (
                                    <div className="flex gap-2">
                                        <MediaUploader
                                            value={asset.asset_url!}
                                            onChange={(url) => handleUpload(tile.key, url)}
                                            accept="image"
                                            label="Change"
                                            buttonClassName="flex-1 px-3 py-1.5 text-xs font-bold bg-surface-secondary hover:bg-surface-tertiary rounded-lg text-ink-primary border border-border-primary disabled:opacity-50"
                                            disabled={isSaving}
                                        />
                                        <button
                                            onClick={() => handleDelete(tile.key)}
                                            disabled={isSaving}
                                            className="px-3 py-1.5 text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg disabled:opacity-50 transition-colors"
                                            title="Remove image"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <MediaUploader
                                        value=""
                                        onChange={(url) => handleUpload(tile.key, url)}
                                        accept="image"
                                        label="Upload"
                                        buttonClassName="w-full px-3 py-2 text-xs font-bold bg-accent-500 hover:bg-accent-600 text-white rounded-lg disabled:opacity-50 transition-colors"
                                        disabled={isSaving}
                                    />
                                )}

                                <div className="flex items-center gap-2 text-[10px] text-ink-tertiary">
                                    <input
                                        type="checkbox"
                                        checked={asset?.is_active !== false}
                                        onChange={(e) => handleUpload(tile.key, asset?.asset_url || '')}
                                        disabled={isSaving}
                                        className="w-4 h-4 accent-accent-500"
                                    />
                                    <span>Active on homepage</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Instructions */}
            <div className="bg-surface-elevated rounded-xl border border-border-primary p-4">
                <h4 className="font-bold text-ink-primary mb-2">Guidelines</h4>
                <ul className="text-sm text-ink-secondary space-y-1 list-disc list-inside">
                    <li>Images should be <strong>square aspect ratio</strong> (1:1) for best results</li>
                    <li>Recommended size: <strong>400x400px</strong> or larger</li>
                    <li>Supported formats: <strong>JPG, PNG, WebP</strong></li>
                    <li>Images are displayed with a dark gradient overlay at the bottom for text readability</li>
                    <li>Toggle "Active" to show/hide tiles on the homepage without deleting</li>
                </ul>
            </div>
        </div>
    );
}