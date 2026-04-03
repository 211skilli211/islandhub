'use client';

import { useState, useRef, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';
import ImageCropper from '@/components/ui/ImageCropper';
import { IMAGE_PRESETS, CATEGORY_PRESET_MAP, getPresetForCategory, getPresetDimensions, ImagePreset } from '@/lib/imagePresets';

interface ImageUploadProps {
    currentImage?: string;
    onUpload: (url: string) => void;
    aspectRatio?: '1:1' | '16:9' | 'free';
    maxSizeMB?: number;
    label?: string;
    type: 'avatar' | 'banner' | 'listing';
    className?: string;
    baseUrl?: string;
    preset?: ImagePreset;
}

export default function ImageUpload({
    currentImage,
    onUpload,
    aspectRatio = '1:1',
    maxSizeMB = 5,
    label,
    type,
    className = '',
    baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '',
    preset
}: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cropImage, setCropImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resolvedPreset = preset || (type in CATEGORY_PRESET_MAP ? getPresetForCategory(type) : 'listing');
    const presetConfig = getPresetDimensions(resolvedPreset);
    const effectiveMaxSize = presetConfig?.maxSizeMB || maxSizeMB;
    const effectiveAspectRatio = presetConfig?.aspectRatio || (aspectRatio === '1:1' ? 1 : aspectRatio === '16:9' ? 16 / 9 : 0);

    const numericAspect = aspectRatio === '1:1' ? 1 : aspectRatio === '16:9' ? 16 / 9 : 0;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > effectiveMaxSize * 1024 * 1024) {
            setError(`File size exceeds ${effectiveMaxSize}MB`);
            return;
        }

        // Read file to data URL for cropping
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setCropImage(reader.result as string);
        });
        reader.readAsDataURL(file);

        // Reset input
        e.target.value = '';
        setError(null);
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setCropImage(null);
        setUploading(true);

        // Preview
        const readerPreview = new FileReader();
        readerPreview.onloadend = () => {
            setPreview(readerPreview.result as string);
        };
        readerPreview.readAsDataURL(croppedBlob);

        // Upload
        const formData = new FormData();
        const fileName = `crop_${Date.now()}.jpg`;
        const file = new File([croppedBlob], fileName, { type: 'image/jpeg' });
        formData.append(type === 'listing' ? 'images' : 'image', file);

        try {
            const endpoint = `/uploads/${type}`;
            const res = await api.post(endpoint, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUpload(res.data.url);
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const containerClasses = aspectRatio === '1:1'
        ? 'w-32 h-32 rounded-full'
        : 'w-full aspect-video rounded-xl';

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-bold text-slate-700">{label}</label>

            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed border-slate-200 transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-slate-50/50 hover:bg-slate-100 hover:border-indigo-400 group ${containerClasses}`}
            >
                {preview ? (
                    <>
                        <img
                            src={preview.startsWith('data:') || preview.startsWith('blob:') ? preview : (preview.startsWith('http') ? preview : getImageUrl(preview))}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest">Update Photo</span>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-4">
                        <span className="text-3xl mb-2 block animate-bounce">📸</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Add Image</span>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {cropImage && (
                <ImageCropper
                    imageSrc={cropImage}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setCropImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    category={resolvedPreset}
                />
            )}

            <p className="text-[10px] text-slate-400 text-center font-bold tracking-tighter">
                {presetConfig ? `${presetConfig.label} • ` : ''}Optimized Upload • Max {effectiveMaxSize}MB
            </p>
        </div>
    );
}
