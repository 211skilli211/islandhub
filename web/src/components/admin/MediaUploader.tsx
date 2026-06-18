'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image, Film, Check, Loader2, FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import ImageCropper from './ImageCropper';
import MediaLibrary from './MediaLibrary';

type MediaUploaderProps = {
  value?: string;
  onChange: (url: string) => void;
  accept?: 'image' | 'video' | 'all';
  label?: string;
};

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';

export default function MediaUploader({
  value,
  onChange,
  accept = 'all',
  label = 'Media',
}: MediaUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes =
    accept === 'image' ? 'image/*' :
    accept === 'video' ? 'video/*' :
    'image/*,video/*';

  const handleFile = useCallback((file: File) => {
    if (accept === 'image' && !file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    if (accept === 'video' && !file.type.startsWith('video/')) {
      setError('Please select a video file');
      return;
    }
    setError('');
    setStatus('uploading');
    setProgress(0);

    // If image, open cropper first
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCropImageSrc(e.target?.result as string);
        setShowCropper(true);
        setStatus('idle');
      };
      reader.readAsDataURL(file);
      return;
    }

    // Video — upload directly
    uploadFile(file);
  }, [accept]);

  const uploadFile = async (file: File, cropped?: boolean) => {
    setStatus('uploading');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const isAdmin = typeof window !== 'undefined' &&
        (window as any).__userRole === 'admin';
      const endpoint = isAdmin ? '/admin/upload' : '/uploads/asset';

      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });

      const url = res.data?.url || res.data?.data?.url || '';
      if (url) {
        onChange(url);
        setStatus('done');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        throw new Error('No URL returned');
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setStatus('error');
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setShowCropper(false);
    const file = new File([croppedBlob], 'cropped-image.jpg', { type: 'image/jpeg' });
    uploadFile(file, true);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setStatus('idle');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onChange('');
    setStatus('idle');
    setProgress(0);
  };

  const handleLibrarySelect = (url: string) => {
    onChange(url);
    setShowLibrary(false);
    setStatus('done');
    setTimeout(() => setStatus('idle'), 2000);
  };

  const isImage = value && !value.match(/\.(mp4|webm|mov|avi|mkv)/i);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[10px] font-bold text-ink-tertiary uppercase tracking-wider">{label}</label>
      )}

      {/* Current value preview */}
      {value && (
        <div className="relative rounded-xl overflow-hidden border border-border-primary bg-surface-secondary">
          {isImage ? (
            <img src={value} alt="Media" className="w-full h-40 object-cover" />
          ) : (
            <video src={value} className="w-full h-40 object-cover" muted loop />
          )}
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => setShowLibrary(true)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-colors"
              title="Change"
            >
              <FolderOpen className="h-4 w-4" />
            </button>
            <button
              onClick={handleRemove}
              className="p-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600 transition-colors"
              title="Remove"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {status === 'done' && (
            <div className="absolute top-2 right-2 p-1 bg-emerald-500 rounded-full">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Upload area */}
      {!value && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-accent-500 bg-accent-500/5'
              : status === 'error'
              ? 'border-red-400 bg-red-50'
              : 'border-border-primary bg-surface-secondary hover:border-accent-500/50 hover:bg-surface-tertiary'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleSelect}
            className="hidden"
          />

          {status === 'uploading' ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 text-accent-500 animate-spin mx-auto" />
              <div className="w-full bg-surface-tertiary rounded-full h-2">
                <div
                  className="bg-accent-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-ink-tertiary">{progress}% uploaded</p>
            </div>
          ) : (
            <>
              <Upload className={`h-8 w-8 mx-auto mb-2 ${dragOver ? 'text-accent-500' : 'text-ink-tertiary'}`} />
              <p className="text-sm font-medium text-ink-secondary">
                Drop file here or <span className="text-accent-500">browse</span>
              </p>
              <p className="text-[10px] text-ink-tertiary mt-1">
                Images & Videos • Max 100MB
              </p>
              {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
            </>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!value && status !== 'uploading' && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-accent-500 text-white text-xs font-bold rounded-lg hover:bg-accent-600 transition-colors"
          >
            <Upload className="h-3 w-3" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setShowLibrary(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-surface-secondary border border-border-primary text-ink-secondary text-xs font-bold rounded-lg hover:border-accent-500/30 transition-colors"
          >
            <FolderOpen className="h-3 w-3" />
            Media Library
          </button>
        </div>
      )}

      {/* Cropper Modal */}
      {showCropper && cropImageSrc && (
        <ImageCropper
          src={cropImageSrc}
          onComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Media Library Modal */}
      {showLibrary && (
        <MediaLibrary
          onSelect={handleLibrarySelect}
          onClose={() => setShowLibrary(false)}
          accept={accept}
        />
      )}
    </div>
  );
}
