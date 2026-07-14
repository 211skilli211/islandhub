'use client';

import { useState, useCallback, ChangeEvent, DragEvent } from 'react';
import { Upload, X, Image, Loader2, Trash2 } from 'lucide-react';
import ImageComponent from 'next/image';

interface MediaUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSizeMB?: number;
  existingFiles?: string[];
  onRemove?: (url: string) => Promise<void>;
  disabled?: boolean;
}

export default function MediaUploader({
  onUpload,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxFiles = 10,
  maxSizeMB = 10,
  existingFiles = [],
  onRemove,
  disabled = false,
}: MediaUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = useCallback((files: File[]): File[] => {
    const valid: File[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        newErrors.push(`${file.name}: Invalid file type. Allowed: ${acceptedTypes.join(', ')}`);
        continue;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        newErrors.push(`${file.name}: File too large. Max ${maxSizeMB}MB.`);
        continue;
      }
      valid.push(file);
    }

    setErrors(newErrors);
    return valid;
  }, [acceptedTypes, maxSizeMB]);

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = validateFiles(files);
    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews]);

    setUploading(true);
    try {
      await onUpload(validFiles);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(['Upload failed. Please try again.']);
      newPreviews.forEach(url => URL.revokeObjectURL(url));
      setPreviews(prev => prev.slice(0, -validFiles.length));
    } finally {
      setUploading(false);
    }
  }, [validateFiles, onUpload]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    if (!disabled && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  }, [handleFiles]);

  const handleRemove = useCallback(async (url: string) => {
    setPreviews(prev => prev.filter(p => p !== url));
    URL.revokeObjectURL(url);
    if (onRemove) {
      await onRemove(url);
    }
  }, [onRemove]);

  const allFiles = [...existingFiles, ...previews];
  const canAddMore = allFiles.length < maxFiles && !disabled;

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {errors.map((e, i) => <p key={i}>{e}</p>)}
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 transition-colors ${
          dragging ? 'border-primary bg-primary/5' : 'border-border-color'
        }`}
      >
        <input
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled || !canAddMore}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {allFiles.map((url, index) => (
            <div key={index} className="relative aspect-square group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                {url.startsWith('blob:') || url.startsWith('data:') ? (
                  <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <ImageComponent
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                )}
                {uploading && index >= existingFiles.length && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                onClick={() => handleRemove(url)}
                disabled={uploading}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full bg-destructive/90 text-white hover:bg-destructive disabled:opacity-0"
                aria-label="Remove image"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {canAddMore && (
            <label className="relative aspect-square rounded-lg border-2 border-dashed border-border-color flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <input
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </label>
          )}
        </div>

        {!canAddMore && allFiles.length >= maxFiles && (
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Maximum {maxFiles} files reached
          </p>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Image className="h-4 w-4" />
          {allFiles.length}/{maxFiles} images
        </span>
        <span className="flex items-center gap-1">
          <span role="img" aria-label="size">📏</span>
          Max {maxSizeMB}MB each
        </span>
        <span className="flex items-center gap-1">
          <span role="img" aria-label="format">🎨</span>
          {acceptedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}
        </span>
      </div>
    </div>
  );
}
