'use client';

import { useState, useEffect } from 'react';
import api, { getImageUrl } from '@/lib/api';

export default function FounderPhoto({ className = '' }: { className?: string }) {
  const [hasError, setHasError] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await api.get('/site-settings/public');
        if (res.data && res.data.founder_photo_url) {
          const url = getImageUrl(res.data.founder_photo_url);
          if (url) setPhotoUrl(url);
          setLoading(false);
          return;
        }
      } catch {
        // silent fail — use fallback
      }
      setLoading(false);
    };
    fetchPhoto();
  }, []);

  if (hasError || (!photoUrl && !loading)) {
    return (
      <div className={`bg-gradient-to-br from-teal-100 to-amber-50 flex items-center justify-center ${className}`}>
        <span className="text-4xl">👨‍💻</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      {loading ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
        </div>
      ) : (
        <img
          src={photoUrl || '/founder.jpg'}
          alt="N. J. Robin — Founder"
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
