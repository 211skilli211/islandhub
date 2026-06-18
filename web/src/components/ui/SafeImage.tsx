'use client';

import { useState } from 'react';
import { getImageUrl } from '@/lib/api';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: string;
  emoji?: string;
}

export default function SafeImage({ src, fallback, emoji = '🖼️', className = '', alt = '', ...props }: SafeImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const imageUrl = getImageUrl(src);

  if (!imageUrl || error) {
    if (fallback) {
      return (
        <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ minHeight: '100px' }}>
          <img src={fallback} alt={alt} className={className} {...props} />
        </div>
      );
    }
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`} style={{ minHeight: '100px' }}>
        <span className="text-2xl opacity-30">{emoji}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {!loaded && (
        <div className={`absolute inset-0 bg-gray-100 animate-pulse ${className}`} />
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} ${loaded ? '' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        {...props}
      />
    </div>
  );
}
