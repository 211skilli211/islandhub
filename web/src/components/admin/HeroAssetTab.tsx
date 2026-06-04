'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface HeroAsset {
  id: number;
  page_key: string;
  asset_url: string;
  asset_type: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  overlay_color: string;
  overlay_opacity: number;
  particles_enabled: boolean;
}

export default function HeroAssetTab() {
  const [assets, setAssets] = useState<HeroAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/hero-assets')
      .then(res => { setAssets(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-ink-tertiary text-sm py-8 text-center">Loading hero assets...</div>;
  if (!assets.length) return <div className="text-ink-tertiary text-sm py-8 text-center">No hero assets configured.</div>;

  return (
    <div className="space-y-4">
      {assets.map(asset => (
        <div key={asset.id} className="flex items-center gap-4 p-4 bg-surface-elevated rounded-xl border border-border-primary">
          {asset.asset_url && (
            <img src={asset.asset_url} alt={asset.page_key} className="w-24 h-16 object-cover rounded-lg" />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink-primary text-sm">{asset.page_key}</p>
            <p className="text-xs text-ink-tertiary">{asset.asset_type} · {asset.title || 'Untitled'}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${
            asset.asset_type === 'video' ? 'bg-violet-100 text-violet-700' :
            asset.asset_type === 'shader' ? 'bg-cyan-100 text-cyan-700' :
            asset.asset_type === 'particle' ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {asset.asset_type}
          </span>
        </div>
      ))}
    </div>
  );
}
