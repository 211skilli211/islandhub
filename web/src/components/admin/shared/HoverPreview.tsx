'use client';

import { useState, useRef } from 'react';
import { getImageUrl } from '@/lib/api';

interface PreviewData {
    // Common fields
    id?: number;
    created_at?: string;
    
    // User specific
    name?: string;
    email?: string;
    avatar_url?: string;
    profile_photo_url?: string;
    role?: string;
    is_active?: boolean;
    email_verified?: boolean;
    
    // Listing specific  
    title?: string;
    price?: string;
    image_url?: string;
    images?: string[];
    photos?: string[];
    status?: string;
    category?: string;
    owner_name?: string;
    
    // Store specific
    business_name?: string;
    store_name?: string;
    cover_photo_url?: string;
    
    // Order specific
    total?: string;
    order_status?: string;
}

interface HoverPreviewProps {
    data: PreviewData;
    type: 'user' | 'listing' | 'store' | 'order' | 'media';
    children: React.ReactNode;
}

export default function HoverPreview({ data, type, children }: HoverPreviewProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (e: React.MouseEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        setPosition({ x: rect.left, y: rect.bottom + 8 });
        timeoutRef.current = setTimeout(() => setShowPreview(true), 500);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShowPreview(false);
    };

    const getImage = () => {
        if (data.avatar_url || data.profile_photo_url) {
            return getImageUrl(data.avatar_url || data.profile_photo_url);
        }
        if (data.image_url) return getImageUrl(data.image_url);
        if (data.images?.[0]) return getImageUrl(data.images[0]);
        if (data.photos?.[0]) return getImageUrl(data.photos[0]);
        if (data.cover_photo_url) return getImageUrl(data.cover_photo_url);
        return null;
    };

    const renderContent = () => {
        const image = getImage();

        switch (type) {
            case 'user':
                return (
                    <div className="space-y-3">
                        {image && (
                            <div className="w-16 h-16 rounded-xl overflow-hidden mx-auto">
                                <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="font-black text-slate-800">{data.name}</p>
                            <p className="text-xs text-slate-500">{data.email}</p>
                            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                                data.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                data.role?.startsWith('vendor') ? 'bg-teal-100 text-teal-700' :
                                data.role?.startsWith('driver') ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {data.role}
                            </span>
                        </div>
                        <div className="flex gap-2 text-xs">
                            <span className={`flex items-center gap-1 ${data.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                {data.is_active ? '● Active' : '○ Inactive'}
                            </span>
                            <span className={data.email_verified ? 'text-green-600' : 'text-amber-600'}>
                                {data.email_verified ? '✓ Verified' : '⚠ Unverified'}
                            </span>
                        </div>
                    </div>
                );

            case 'listing':
                return (
                    <div className="space-y-3">
                        {image && (
                            <div className="w-full h-24 rounded-lg overflow-hidden">
                                <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-slate-800 text-sm line-clamp-2">{data.title}</p>
                            <p className="text-lg font-black text-teal-600">{data.price ? `$${data.price}` : ''}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{data.category}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                                data.status === 'active' ? 'bg-green-100 text-green-700' :
                                data.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {data.status}
                            </span>
                        </div>
                        {data.owner_name && (
                            <p className="text-xs text-slate-500">By {data.owner_name}</p>
                        )}
                    </div>
                );

            case 'store':
                return (
                    <div className="space-y-3">
                        {image && (
                            <div className="w-full h-20 rounded-lg overflow-hidden">
                                <img src={image} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="text-center">
                            <p className="font-black text-slate-800">{data.business_name || data.store_name}</p>
                            <span className="text-xs text-slate-500">Vendor Store</span>
                        </div>
                        <p className="text-xs text-slate-400">
                            Created: {data.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                );

            case 'order':
                return (
                    <div className="space-y-3">
                        <div className="text-center">
                            <p className="font-black text-slate-800">Order #{data.id}</p>
                            <p className="text-xl font-black text-teal-600">{data.total ? `$${data.total}` : ''}</p>
                        </div>
                        <span className={`block text-center text-xs px-2 py-1 rounded-full ${
                            data.order_status === 'completed' ? 'bg-green-100 text-green-700' :
                            data.order_status === 'pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                            {data.order_status}
                        </span>
                        <p className="text-xs text-slate-400 text-center">
                            {data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}
                        </p>
                    </div>
                );

            case 'media':
                return (
                    <div className="space-y-3">
                        {image && (
                            <div className="w-full h-24 rounded-lg overflow-hidden flex items-center justify-center bg-slate-50">
                                <img src={image} alt="" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <p className="text-xs text-slate-500 text-center">ID: {data.id}</p>
                    </div>
                );

            default:
                return <p className="text-sm text-slate-600">Preview</p>;
        }
    };

    return (
        <div 
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            {showPreview && (
                <div 
                    className="fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 w-64 animate-in fade-in slide-in-from-top-1"
                    style={{ 
                        left: Math.min(position.x, window.innerWidth - 280),
                        top: position.y 
                    }}
                >
                    {renderContent()}
                </div>
            )}
        </div>
    );
}
