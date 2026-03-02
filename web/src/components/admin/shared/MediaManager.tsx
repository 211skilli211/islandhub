import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api, { getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';

export interface MediaItem {
    id: string;
    url: string;
    is_primary: boolean;
    order_index: number;
    file?: File; // Only present for new uploads not yet saved
}

interface MediaManagerProps {
    initialMedia?: MediaItem[];
    onChange: (media: MediaItem[]) => void;
    maxFiles?: number;
}

const SortablePhoto = ({ photo, onRemove, onSetPrimary, isOverlay = false }: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`relative group aspect-square rounded-xl overflow-hidden border-2 ${photo.is_primary ? 'border-teal-500 ring-2 ring-teal-500 ring-offset-2' : 'border-slate-200'} bg-slate-50 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isOverlay ? 'z-50 shadow-xl scale-105' : ''}`}
        >
            <img
                src={getImageUrl(photo.url)}
                alt=""
                className="w-full h-full object-cover"
            />

            {/* Primary Badge */}
            {photo.is_primary && (
                <div className="absolute top-2 left-2 bg-teal-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                    Primary
                </div>
            )}

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex justify-end">
                    <button
                        onPointerDown={(e) => { e.stopPropagation(); onRemove(photo.id); }}
                        className="p-1.5 bg-white/20 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors"
                        title="Remove Image"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex justify-center">
                    {!photo.is_primary && (
                        <button
                            onPointerDown={(e) => { e.stopPropagation(); onSetPrimary(photo.id); }}
                            className="px-3 py-1.5 bg-white text-slate-900 text-[10px] font-black uppercase rounded-lg shadow-sm hover:bg-teal-50 hover:text-teal-600 transition-colors"
                        >
                            Set Primary
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function MediaManager({ initialMedia = [], onChange, maxFiles = 10 }: MediaManagerProps) {
    const [media, setMedia] = useState<MediaItem[]>(initialMedia);
    const [uploading, setUploading] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        // Ensure standard fields if missing
        const stabilized = initialMedia.map((m, i) => ({
            ...m,
            id: m.id || `temp-${i}-${Math.random()}`,
            order_index: i
        }));
        // Only update if length differs significantly/initially to avoid loops, 
        // real sync handled by onChange. 
        // NOTE: In a real app we'd deep compare. For now trust parent's initial data only on mount.
        if (media.length === 0 && stabilized.length > 0) {
            setMedia(stabilized);
        }
    }, [initialMedia]); // careful with dependency loops

    useEffect(() => {
        onChange(media);
    }, [media]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);
        if (media.length + files.length > maxFiles) {
            toast.error(`Max ${maxFiles} images allowed`);
            return;
        }

        setUploading(true);
        const newMedia: MediaItem[] = [];

        try {
            // Upload sequentially or parallel
            for (const file of files) {
                const formData = new FormData();
                formData.append('image', file);

                const res = await api.post('/uploads/asset', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                newMedia.push({
                    id: res.data.media?.id || res.data.id || `new-${Date.now()}-${Math.random()}`,
                    url: res.data.url,
                    is_primary: media.length === 0 && newMedia.length === 0, // First ever image is primary
                    order_index: media.length + newMedia.length
                });
            }

            setMedia(prev => {
                const updated = [...prev, ...newMedia];
                // Ensure at least one primary if exists
                if (updated.length > 0 && !updated.some(m => m.is_primary)) {
                    updated[0].is_primary = true;
                }
                return updated;
            });
            toast.success('Images uploaded');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        setActiveId(null);

        if (active.id !== over.id) {
            setMedia((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);
                // Update order_index
                return reordered.map((item, idx) => ({ ...item, order_index: idx }));
            });
        }
    };

    const removePhoto = (id: string) => {
        setMedia(prev => {
            const remains = prev.filter(m => m.id !== id);
            // If primary removed, make first item primary
            if (prev.find(m => m.id === id)?.is_primary && remains.length > 0) {
                remains[0].is_primary = true;
            }
            return remains.map((m, i) => ({ ...m, order_index: i }));
        });
    };

    const setPrimary = (id: string) => {
        setMedia(prev => prev.map(m => ({
            ...m,
            is_primary: m.id === id
        })));
        toast.success('Primary photo updated');
    };

    const activeItem = media.find(m => m.id === activeId);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-700">Gallery ({media.length}/{maxFiles})</label>
                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploading}
                    />
                    <button disabled={uploading} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50">
                        {uploading ? 'Uploading...' : '+ Add Photos'}
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={(e) => setActiveId(e.active.id as string)}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={media} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {media.map((photo) => (
                            <SortablePhoto
                                key={photo.id}
                                photo={photo}
                                onRemove={removePhoto}
                                onSetPrimary={setPrimary}
                            />
                        ))}
                    </div>
                </SortableContext>
                <DragOverlay>
                    {activeItem ? <SortablePhoto photo={activeItem} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {media.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
                    <span className="text-4xl block mb-2">📷</span>
                    <p className="text-slate-400 text-sm font-medium">No images yet. Upload some to get started.</p>
                </div>
            )}
        </div>
    );
}
