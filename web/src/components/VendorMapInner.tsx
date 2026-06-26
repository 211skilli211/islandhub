'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface VendorLocation {
  id: number;
  name: string;
  lat: number;
  lng: number;
  category: string;
}

export default function VendorMapInner() {
  const [vendors, setVendors] = useState<VendorLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await api.get('/vendors/locations');
        setVendors(res.data.vendors || res.data || []);
      } catch {
        // Silent fail — map is decorative
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-ink-tertiary text-sm">Loading map...</div>;
  }

  return (
    <div className="w-full h-full bg-surface-secondary rounded-2xl border border-white/10 flex items-center justify-center">
      <p className="text-ink-tertiary text-sm">Map loading ({vendors.length} vendors)</p>
    </div>
  );
}
