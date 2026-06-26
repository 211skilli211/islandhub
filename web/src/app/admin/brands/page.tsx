'use client';

import { useEffect, useState } from 'react';

interface BrandLogo {
    id: number;
    name: string;
    image_url: string;
    link_url?: string;
    sort_order?: number;
    is_active?: boolean;
}

export default function AdminBrandsPage() {
    const [brands, setBrands] = useState<BrandLogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newName, setNewName] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newLink, setNewLink] = useState('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/brands', {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const data = await res.json();
            setBrands(data);
        } catch (err) {
            console.error('Failed to fetch brands:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBrands(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        setUploading(true);

        for (const file of Array.from(files)) {
            // Convert to base64 for demo (in production, upload to S3/Cloudinary)
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64 = ev.target?.result as string;
                try {
                    await fetch('/api/admin/brands', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        },
                        body: JSON.stringify({
                            name: file.name.replace(/\.[^.]+$/, ''),
                            image_url: base64,
                            sort_order: brands.length,
                        }),
                    });
                    fetchBrands();
                } catch (err) {
                    console.error('Upload failed:', err);
                }
            };
            reader.readAsDataURL(file);
        }
        setUploading(false);
        e.target.value = '';
    };

    const handleAddUrl = async () => {
        if (!newUrl.trim()) return;
        try {
            await fetch('/api/admin/brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    name: newName || 'Brand',
                    image_url: newUrl,
                    link_url: newLink,
                    sort_order: brands.length,
                }),
            });
            setNewName('');
            setNewUrl('');
            setNewLink('');
            fetchBrands();
        } catch (err) {
            console.error('Add failed:', err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this brand logo?')) return;
        try {
            await fetch(`/api/admin/brands/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            fetchBrands();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleToggle = async (id: number, current: boolean) => {
        try {
            await fetch(`/api/admin/brands/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ is_active: !current }),
            });
            fetchBrands();
        } catch (err) {
            console.error('Toggle failed:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-ink-primary">Brand Marquee</h1>
                <p className="text-sm text-ink-secondary mt-1">
                    Manage partner logos displayed in the homepage marquee slider.
                </p>
            </div>

            
            <div className="bg-surface-elevated rounded-xl border border-border-primary p-6">
                <h2 className="text-lg font-semibold mb-4">Upload Brand Logos</h2>
                <div className="border-2 border-dashed border-border-primary rounded-lg p-8 text-center hover:border-accent-500 transition-colors">
                    <p className="text-ink-secondary mb-3">
                        Drag & drop transparent PNG/SVG logos here
                    </p>
                    <label className="inline-block px-5 py-2.5 bg-accent-500 text-white rounded-lg font-medium cursor-pointer hover:bg-accent-600 transition-colors">
                        {uploading ? 'Uploading...' : 'Choose Files'}
                        <input
                            type="file"
                            accept="image/png,image/svg+xml"
                            multiple
                            className="hidden"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                </div>
            </div>

            
            <div className="bg-surface-elevated rounded-xl border border-border-primary p-6">
                <h2 className="text-lg font-semibold mb-4">Add by URL</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                        type="text"
                        placeholder="Brand name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border-primary bg-surface-secondary text-sm"
                    />
                    <input
                        type="url"
                        placeholder="Image URL (https://...)"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border-primary bg-surface-secondary text-sm"
                    />
                    <input
                        type="url"
                        placeholder="Link URL (optional)"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="px-3 py-2 rounded-lg border border-border-primary bg-surface-secondary text-sm"
                    />
                    <button
                        onClick={handleAddUrl}
                        className="px-4 py-2 bg-accent-500 text-white rounded-lg font-medium hover:bg-accent-600 transition-colors"
                    >
                        Add Brand
                    </button>
                </div>
            </div>

            
            <div className="bg-surface-elevated rounded-xl border border-border-primary p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Active Brands ({brands.length})
                </h2>
                {loading ? (
                    <p className="text-ink-tertiary">Loading...</p>
                ) : brands.length === 0 ? (
                    <p className="text-ink-tertiary">No brands yet. Upload some logos above.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {brands.map((brand) => (
                            <div
                                key={brand.id}
                                className={`relative bg-white border rounded-lg p-3 flex items-center justify-center h-20 group ${
                                    brand.is_active !== false
                                        ? 'border-border-primary'
                                        : 'border-red-300 opacity-50'
                                }`}
                            >
                                <img
                                    src={brand.image_url}
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => handleToggle(brand.id, brand.is_active !== false)}
                                        className="px-2 py-1 text-xs bg-surface-secondary rounded hover:bg-surface-elevated"
                                    >
                                        {brand.is_active !== false ? 'Hide' : 'Show'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand.id)}
                                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <span className="absolute bottom-1 left-2 text-[9px] text-ink-tertiary truncate max-w-[90%]">
                                    {brand.name}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            
            <div className="bg-surface-elevated rounded-xl border border-border-primary p-6">
                <h2 className="text-lg font-semibold mb-4">Live Preview</h2>
                <div className="bg-white rounded-lg overflow-hidden">
                    <div className="overflow-hidden w-full">
                        <div
                            className="flex items-center gap-10 py-6"
                            style={{
                                animation: 'marquee-scroll 25s linear infinite',
                                width: 'max-content',
                            }}
                        >
                            {[...brands, ...brands].map((brand, i) => (
                                <div key={`${brand.id}-${i}`} className="h-11 flex items-center justify-center shrink-0">
                                    <img
                                        src={brand.image_url}
                                        alt={brand.name}
                                        className="h-full w-auto object-contain opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes marquee-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                `}</style>
            </div>
        </div>
    );
}
