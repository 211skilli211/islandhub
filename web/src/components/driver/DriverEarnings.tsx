'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

interface EarningsSummary {
  total_trips: number;
  total_gross: string;
  total_fees: string;
  total_net: string;
  avg_per_trip: string;
}

interface EarningsTrip {
  trip_id: string;
  pickup_address: string;
  dropoff_address: string;
  fare_amount: number;
  status: string;
  created_at: string;
}

export default function DriverEarnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [trips, setTrips] = useState<EarningsTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/dispatch/earnings?period=${period}`);
      setSummary(res.data.summary);
      setTrips(res.data.trips || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const netEarnings = parseFloat(summary?.total_net || '0');
  const grossEarnings = parseFloat(summary?.total_gross || '0');
  const fees = parseFloat(summary?.total_fees || '0');
  const avgTrip = parseFloat(summary?.avg_per_trip || '0');
  const totalTrips = summary?.total_trips || 0;

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      
      <div className="flex gap-2">
        {(['day', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              period === p ? 'bg-teal-500 text-white' : 'bg-ink-900/60 text-ink-400 border border-white/5'
            }`}>
            {p === 'day' ? 'Today' : p === 'week' ? 'This Week' : 'This Month'}
          </button>
        ))}
      </div>

      
      <div className="bg-gradient-to-br from-teal-600/20 to-teal-700/20 border border-teal-500/20 rounded-2xl p-5">
        <p className="text-xs text-teal-400 uppercase tracking-wider font-bold mb-1">Net Earnings</p>
        <p className="text-4xl font-black text-white">${netEarnings.toFixed(2)} <span className="text-lg text-ink-400">XCD</span></p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-white">{totalTrips}</p>
            <p className="text-[10px] text-ink-500 uppercase">Trips</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-teal-400">${avgTrip.toFixed(2)}</p>
            <p className="text-[10px] text-ink-500 uppercase">Avg/Trip</p>
          </div>
          <div className="bg-black/30 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-red-400">-${fees.toFixed(2)}</p>
            <p className="text-[10px] text-ink-500 uppercase">Fees (15%)</p>
          </div>
        </div>
      </div>

      
      <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs text-ink-500 uppercase tracking-wider font-bold mb-3">Breakdown</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-400">Gross earnings</span>
            <span className="text-sm font-bold text-white">${grossEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-ink-400">Platform fee (15%)</span>
            <span className="text-sm font-bold text-red-400">-${fees.toFixed(2)}</span>
          </div>
          <div className="h-px bg-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-white">Net earnings</span>
            <span className="text-sm font-black text-teal-400">${netEarnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      
      <div className="bg-ink-900/60 border border-white/5 rounded-2xl p-4">
        <h3 className="text-xs text-ink-500 uppercase tracking-wider font-bold mb-3">Recent Trips</h3>
        {trips.length === 0 ? (
          <p className="text-sm text-ink-500 text-center py-8">No trips in this period</p>
        ) : (
          <div className="space-y-2">
            {trips.slice(0, 10).map((trip, i) => (
              <motion.div key={trip.trip_id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-black/30 rounded-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-mono text-ink-500">#{trip.trip_id.slice(-8)}</span>
                  <span className="text-sm font-bold text-teal-400">${trip.fare_amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ink-400">
                  <span className="text-green-400">●</span>
                  <span className="truncate max-w-[40%]">{trip.pickup_address}</span>
                  <span className="text-ink-600">→</span>
                  <span className="text-red-400">●</span>
                  <span className="truncate max-w-[40%]">{trip.dropoff_address}</span>
                </div>
                <p className="text-[10px] text-ink-600 mt-1">
                  {trip.created_at ? new Date(trip.created_at).toLocaleString() : ''}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      
      <button onClick={loadEarnings}
        className="w-full py-3 bg-ink-900/60 border border-white/5 rounded-xl text-sm text-ink-400 hover:text-white transition-colors">
        ↻ Refresh
      </button>
    </div>
  );
}
