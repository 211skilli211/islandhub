'use client';
import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/canvasUtils';
import { IMAGE_PRESETS, getPresetForCategory, type ImagePreset } from '@/lib/imagePresets';
import type { Point, Area } from 'react-easy-crop';

interface ImageCropperProps {
    imageSrc: string;
    onCropComplete: (croppedImage: Blob) => void;
    onCancel: () => void;
    category?: string;
}

export default function ImageCropper({ 
    imageSrc, 
    onCropComplete, 
    onCancel,
    category = 'listing' 
}: ImageCropperProps) {
    const preset: ImagePreset = getPresetForCategory(category);
    const presetConfig = IMAGE_PRESETS[preset];
    const aspectRatio = presetConfig.aspectRatio;
    
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => setCrop(crop);
    const onZoomChange = (zoom: number) => setZoom(zoom);

    const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        try {
            if (!croppedAreaPixels) return;
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center p-6">
            <div className="mb-4 text-center">
                <h3 className="text-white font-bold text-lg">{presetConfig.label}</h3>
                <p className="text-slate-400 text-sm">
                    {presetConfig.width} x {presetConfig.height}px • Max {presetConfig.maxSizeMB}MB
                </p>
            </div>
            <div className="relative w-full max-w-2xl h-[400px] bg-slate-900 rounded-2xl overflow-hidden mb-6">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspectRatio}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="flex items-center gap-4 w-full max-w-xs mb-8">
                <span className="text-white text-xs font-bold">Zoom</span>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                />
            </div>

            <div className="flex gap-4">
                <button onClick={onCancel} className="px-6 py-3 bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-600">
                    Cancel
                </button>
                <button onClick={showCroppedImage} className="px-6 py-3 bg-rose-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-rose-600 shadow-lg shadow-rose-500/20">
                    Apply Crop
                </button>
            </div>
        </div>
    );
}
