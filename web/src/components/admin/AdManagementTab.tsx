'use client';

import { useState } from 'react';

export default function AdManagementTab() {
  const [ads, setAds] = useState<Array<{ id: number; title: string; status: string; impressions: number }>>([]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink-primary">Active Ads</h3>
        <button className="px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600">
          + New Ad
        </button>
      </div>
      {ads.length === 0 ? (
        <div className="bg-surface-elevated rounded-2xl border border-white/10 p-8 text-center">
          <p className="text-ink-tertiary text-sm">No ads configured yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-surface-elevated rounded-xl border border-white/10 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink-primary">{ad.title}</p>
                <p className="text-xs text-ink-tertiary">{ad.impressions} impressions</p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                {ad.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
