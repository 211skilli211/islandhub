'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { EmojiIcon } from '@/components/ui/EmojiIcon';

interface ComplianceData {
  totalUsers?: number | string;
  activeStores?: number | string;
  complianceRate?: number | string;
}

export default function ComplianceAnalyticsPage() {
  const [data, setData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics/overview').then((res: { data?: ComplianceData }) => {
      setData(res.data || []);
    }).catch(() => {
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-ink-primary">Compliance Analytics</h1>
        <p className="text-sm text-ink-tertiary mt-1">Overview of compliance metrics and system health</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary p-6">
          <div className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Total Users</div>
          <div className="text-3xl font-black text-ink-primary mt-2">{loading ? '...' : data?.totalUsers || '—'}</div>
        </div>
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary p-6">
          <div className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Active Stores</div>
          <div className="text-3xl font-black text-ink-primary mt-2">{loading ? '...' : data?.activeStores || '—'}</div>
        </div>
        <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary p-6">
          <div className="text-xs font-bold text-ink-tertiary uppercase tracking-widest">Compliance Rate</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{loading ? '...' : data?.complianceRate || '—'}</div>
        </div>
      </div>

      <div className="bg-surface-elevated dark:bg-ocean-800 rounded-2xl border border-border-primary p-8 text-center">
        <EmojiIcon emoji="📊" size={40} className="text-4xl mb-4" />
        <h3 className="text-lg font-bold text-ink-secondary">Compliance Dashboard</h3>
        <p className="text-sm text-ink-tertiary mt-2">Detailed compliance analytics coming soon.</p>
      </div>
    </div>
  );
}
