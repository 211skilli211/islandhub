'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Upload, Image, Loader2 } from 'lucide-react';
import ImageComponent from 'next/image';

interface SimpleMediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export default function SimpleMediaUploader({
  value,
  onChange,
  accept = 'image/*',
  label = 'Upload',
  buttonClassName = '',
  disabled = false,
}: SimpleMediaUploaderProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Max 10MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        onChange(data.url);
      } else {
        alert('Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }, [onChange]);

  const handleRemove = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="relative">
      <input
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="sr-only"
        id="media-uploader-input"
        disabled={disabled || uploading}
      />
      <label
        htmlFor="media-uploader-input"
        className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
          buttonClassName
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        <span>{label}</span>
      </label>

      {value && (
        <div className="absolute -top-10 left-0 w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border-color">
          <ImageComponent
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
            fill
            sizes="80px"
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-1 right-1 p-1 bg-destructive/90 text-white rounded-full hover:bg-destructive transition-colors disabled:opacity-50"
            aria-label="Remove image"
          >
            <Image className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
}